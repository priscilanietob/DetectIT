"""
train.py
Loop de entrenamiento.
Uso:
    python train.py --data_dir ./data --epochs 30 --batch_size 32
    python train.py --data_dir ./data --epochs 20 --batch_size 32 --resume checkpoints/best_model.pt
"""

import argparse
import time
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import CosineAnnealingLR

from model import XRayDenseNet, CLASSES, NUM_CLASSES
from dataset import get_dataloaders

from sklearn.metrics import classification_report

# Entrenamiento de una época
def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss, correct, total = 0.0, 0, 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        logits = model(images)
        loss = criterion(logits, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * images.size(0)
        preds = logits.argmax(dim=1)
        correct += (preds == labels).sum().item()
        total += images.size(0)

    return total_loss / total, correct / total


# Evaluación
@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0.0, 0, 0

    all_preds = []
    all_labels = []

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        logits = model(images)
        loss = criterion(logits, labels)

        total_loss += loss.item() * images.size(0)
        preds = logits.argmax(dim=1)
        correct += (preds == labels).sum().item()
        total += images.size(0)

        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, target_names=CLASSES))

    return total_loss / total, correct / total


# Loop principal
def train(args):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Dispositivo: {device}")

    # Datos
    loaders = get_dataloaders(
        data_dir=args.data_dir,
        batch_size=args.batch_size,
        image_size=args.image_size,
        num_workers=args.num_workers,
    )

    # Modelo
    model = XRayDenseNet(num_classes=NUM_CLASSES, pretrained=True).to(device)

    # Pérdida sin pesos para recuperar accuracy base
    # Una vez que superes 72% puedes cambiar a:
    # class_weights = torch.tensor([1.3, 1.2, 0.9], device=device)
    # criterion = nn.CrossEntropyLoss(weight=class_weights)
    # Pesos inversamente proporcionales a la frecuencia de cada clase
    # nodule: 3797, mass: 4047, normal: 10500  →  total: 18344
    total = 18344
    class_weights = torch.tensor([
        total / (3 * 3797),   # nodule  → 1.609
        total / (3 * 4047),   # mass    → 1.510
        total / (3 * 10500),  # normal  → 0.582
    ], device = torch.device(device))

    class_weights = torch.tensor([1.2, 1.1, 0.8], device=device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    # Inicializar best_val_acc y optimizador según si hay resume o no
    save_path = Path(args.save_dir)
    save_path.mkdir(parents=True, exist_ok=True)

    if args.resume and Path(args.resume).exists():
        # Cargar pesos y val_acc del checkpoint
        checkpoint = torch.load(args.resume, map_location=device)
        model.load_state_dict(checkpoint["model_state_dict"])
        best_val_acc = checkpoint.get("val_acc", 0.0)
        print(f"Reanudando desde checkpoint (val_acc={best_val_acc:.4f})")

        # Fine-tuning completo desde el inicio, LR correcto
        for param in model.features.parameters():
            param.requires_grad = True
        optimizer = optim.AdamW(model.parameters(), lr=5e-5, weight_decay=1e-4)
        scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs)

    else:
        # Entrenamiento desde cero con warm-up
        best_val_acc = 0.0

        for param in model.features.parameters():
            param.requires_grad = False
        optimizer = optim.AdamW(
            filter(lambda p: p.requires_grad, model.parameters()),
            lr=5e-5,
            weight_decay=1e-4,
        )
        scheduler = CosineAnnealingLR(optimizer, T_max=args.warmup_epochs)

    # Loop de épocas
    for epoch in range(1, args.epochs + 1):

        # Solo en entrenamiento desde cero: descongelar en warmup_epochs
        if not args.resume and epoch == args.warmup_epochs + 1:
            print("\n[INFO] Descongelando todas las capas (fine-tuning completo)")
            for param in model.features.parameters():
                param.requires_grad = True
            optimizer = optim.AdamW(
                model.parameters(),
                lr=5e-5,
                weight_decay=1e-4,
            )
            scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs - args.warmup_epochs)

        t0 = time.time()
        train_loss, train_acc = train_epoch(model, loaders["train"], criterion, optimizer, device)
        val_loss, val_acc = evaluate(model, loaders["val"], criterion, device)
        scheduler.step()
        elapsed = time.time() - t0

        print(
            f"Epoch {epoch:03d}/{args.epochs} | "
            f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | "
            f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f} | "
            f"Tiempo: {elapsed:.1f}s"
        )

        # Guardar solo si supera el mejor valor previo
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            ckpt = {
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "val_acc": val_acc,
                "classes": CLASSES,
            }
            torch.save(ckpt, save_path / "best_model.pt")
            torch.save(ckpt, save_path / f"model_epoch{epoch}_acc{val_acc:.4f}.pt")
            print(f"  ✓ Mejor modelo guardado (val_acc={val_acc:.4f})")

    print(f"\nEntrenamiento completo. Mejor val_acc: {best_val_acc:.4f}")
    return model


# CLI
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Entrenar XRayDenseNet")
    parser.add_argument("--data_dir",      default="./data",        help="Ruta raíz del dataset")
    parser.add_argument("--save_dir",      default="./checkpoints", help="Carpeta para guardar modelos")
    parser.add_argument("--epochs",        type=int, default=30)
    parser.add_argument("--warmup_epochs", type=int, default=5,     help="Épocas con features congeladas")
    parser.add_argument("--batch_size",    type=int, default=32)
    parser.add_argument("--image_size",    type=int, default=224)
    parser.add_argument("--lr",            type=float, default=1e-3)
    parser.add_argument("--num_workers",   type=int, default=0)
    parser.add_argument("--resume",        default=None,            help="Ruta a checkpoint para reanudar")
    args = parser.parse_args()

    train(args)