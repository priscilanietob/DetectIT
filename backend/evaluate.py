"""
evaluate.py
Evaluacion completa del modelo sobre el set de test.
Genera:
  - Accuracy global
  - Precision, Recall y F1 por clase
  - Matriz de confusion
  - Ejemplos de errores guardados como imagenes

Uso:
    python evaluate.py --model checkpoints/best_model.pt --data_dir ./data
"""

import argparse
from pathlib import Path
import numpy as np
import torch
import torch.nn.functional as F
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image
from torch.utils.data import DataLoader

from model import XRayDenseNet, CLASSES, NUM_CLASSES
from dataset import XRayDataset, get_transforms


# Cargar modelo
def load_model(checkpoint_path: str, device: str) -> XRayDenseNet:
    checkpoint = torch.load(checkpoint_path, map_location=device)
    model = XRayDenseNet(num_classes=NUM_CLASSES, pretrained=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()
    print(f"Modelo cargado — val_acc en entrenamiento: {checkpoint.get('val_acc', '?'):.4f}")
    return model


# Evaluacion completa
@torch.no_grad()
def evaluate(model, loader, device):
    all_preds = []
    all_labels = []
    all_probs = []

    for images, labels in loader:
        images = images.to(device)
        logits = model(images)
        probs = F.softmax(logits, dim=1)
        preds = probs.argmax(dim=1)

        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.numpy())
        all_probs.extend(probs.cpu().numpy())

    return (
        np.array(all_preds),
        np.array(all_labels),
        np.array(all_probs),
    )


# Metricas por clase
def compute_metrics(preds, labels):
    metrics = {}
    for i, cls in enumerate(CLASSES):
        tp = ((preds == i) & (labels == i)).sum()
        fp = ((preds == i) & (labels != i)).sum()
        fn = ((preds != i) & (labels == i)).sum()
        tn = ((preds != i) & (labels != i)).sum()

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall    = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1        = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
        accuracy  = (tp + tn) / len(labels)

        metrics[cls] = {
            "precision": round(float(precision), 4),
            "recall":    round(float(recall), 4),
            "f1":        round(float(f1), 4),
            "accuracy":  round(float(accuracy), 4),
            "tp": int(tp), "fp": int(fp),
            "fn": int(fn), "tn": int(tn),
        }
    return metrics


# Matriz de confusion
def plot_confusion_matrix(preds, labels, output_path):
    matrix = np.zeros((NUM_CLASSES, NUM_CLASSES), dtype=int)
    for t, p in zip(labels, preds):
        matrix[t][p] += 1

    fig, ax = plt.subplots(figsize=(7, 6))
    im = ax.imshow(matrix, interpolation="nearest", cmap="Blues")
    plt.colorbar(im, ax=ax)

    ax.set_xticks(range(NUM_CLASSES))
    ax.set_yticks(range(NUM_CLASSES))
    ax.set_xticklabels(CLASSES, fontsize=12)
    ax.set_yticklabels(CLASSES, fontsize=12)
    ax.set_xlabel("Predicción", fontsize=13)
    ax.set_ylabel("Real", fontsize=13)
    ax.set_title("Matriz de confusión — Test set", fontsize=14)

    # Valores dentro de cada celda
    thresh = matrix.max() / 2.0
    for i in range(NUM_CLASSES):
        for j in range(NUM_CLASSES):
            ax.text(j, i, str(matrix[i][j]),
                    ha="center", va="center", fontsize=14,
                    color="white" if matrix[i][j] > thresh else "black")

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Matriz de confusion guardada en: {output_path}")
    return matrix


# Grafica de confianza por clase
def plot_confidence(probs, labels, output_path):
    fig, axes = plt.subplots(1, NUM_CLASSES, figsize=(14, 4))
    for i, cls in enumerate(CLASSES):
        mask = labels == i
        conf = probs[mask, i]
        axes[i].hist(conf, bins=20, range=(0, 1), color="#2E75B6", edgecolor="white")
        axes[i].set_title(f"{cls}\nmedia={conf.mean():.2f}", fontsize=12)
        axes[i].set_xlabel("Confianza")
        axes[i].set_ylabel("Cantidad de imágenes")
        axes[i].set_xlim(0, 1)
    plt.suptitle("Distribución de confianza por clase (imágenes correctas)", fontsize=13)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Grafica de confianza guardada en: {output_path}")


# Ejemplos de errores
def save_error_examples(dataset, preds, labels, probs, output_dir, max_examples=9):
    errors = [(i, preds[i], labels[i], probs[i]) 
              for i in range(len(preds)) if preds[i] != labels[i]]
    
    if not errors:
        print("No hubo errores en el set de test.")
        return

    errors_sorted = sorted(errors, key=lambda x: -x[3][x[1]])
    examples = errors_sorted[:max_examples]
    
    cols = 3
    rows = (len(examples) + cols - 1) // cols
    fig, axes = plt.subplots(rows, cols, figsize=(14, rows * 4))
    axes = axes.flatten() if rows > 1 else [axes] if cols == 1 else axes.flatten()

    for idx, (i, pred, true, prob) in enumerate(examples):
        img_path, _ = dataset.samples[i]
        img = Image.open(img_path).convert("L")
        axes[idx].imshow(img, cmap="gray")
        axes[idx].set_title(
            f"Real: {CLASSES[true]}\nPredicho: {CLASSES[pred]} ({prob[pred]*100:.1f}%)",
            fontsize=10, color="red"
        )
        axes[idx].axis("off")

    for idx in range(len(examples), len(axes)):
        axes[idx].axis("off")

    plt.suptitle("Ejemplos de clasificaciones incorrectas", fontsize=13)
    plt.tight_layout()
    out = Path(output_dir) / "errores_test.png"
    plt.savefig(out, dpi=120, bbox_inches="tight")
    plt.close()
    print(f"Ejemplos de errores guardados en: {out}")


# Main
def main(args):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Dispositivo: {device}\n")

    model = load_model(args.model, device)

    # Dataset de test
    test_dataset = XRayDataset(
        root_dir=args.data_dir,
        split="test",
        image_size=224,
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=32,
        shuffle=False,
        num_workers=0,
        pin_memory=torch.cuda.is_available(),
    )

    print("Evaluando sobre el set de test...")
    preds, labels, probs = evaluate(model, test_loader, device)

    # Accuracy global
    global_acc = (preds == labels).mean()
    print(f"\n{'='*50}")
    print(f"  ACCURACY GLOBAL: {global_acc*100:.2f}%  ({(preds==labels).sum()}/{len(labels)} correctas)")
    print(f"{'='*50}\n")

    #  Metricas por clase 
    metrics = compute_metrics(preds, labels)
    print(f"{'Clase':<10} {'Precision':>10} {'Recall':>10} {'F1':>10} {'TP':>6} {'FP':>6} {'FN':>6}")
    print("-" * 58)
    for cls, m in metrics.items():
        print(f"{cls:<10} {m['precision']:>10.4f} {m['recall']:>10.4f} {m['f1']:>10.4f} {m['tp']:>6} {m['fp']:>6} {m['fn']:>6}")

    #  Graficas 
    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    matrix = plot_confusion_matrix(preds, labels, out_dir / "confusion_matrix.png")
    plot_confidence(probs, labels, out_dir / "confianza_por_clase.png")
    save_error_examples(test_dataset, preds, labels, probs, out_dir)

    # Analisis de confusion entre clases 
    print(f"\nMatriz de confusion:")
    print(f"{'':>10}", end="")
    for cls in CLASSES:
        print(f"{cls:>10}", end="")
    print()
    for i, cls in enumerate(CLASSES):
        print(f"{cls:>10}", end="")
        for j in range(NUM_CLASSES):
            print(f"{matrix[i][j]:>10}", end="")
        print()

    print(f"\nResultados guardados en: {out_dir}/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluar XRayDenseNet en el set de test")
    parser.add_argument("--model",      required=True,           help="Ruta al checkpoint")
    parser.add_argument("--data_dir",   default="./data",        help="Ruta raiz del dataset")
    parser.add_argument("--output_dir", default="./resultados",  help="Carpeta de salida")
    args = parser.parse_args()
    main(args)
