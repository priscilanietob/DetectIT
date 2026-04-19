"""
dataset.py
DataLoader para el dataset de rayos X con carpetas: nodule / mass / normal

El DataLoader devuelve tensores de 2 canales:
    Canal 0 → imagen en escala de grises normalizada
    Canal 1 → ROI mask o canal cero
              El canal cero es útil: el modelo aprende a ignorarlo cuando no hay mask,
              y a usarlo cuando el médico quiera una región de interés.
"""

import os
from pathlib import Path
from typing import Optional, Tuple

import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import numpy as np

from model import CLASSES  # ["nodule", "mass", "normal"]


# Transforms
def get_transforms(split: str, image_size: int = 224):
    """
    Devuelve las transformaciones adecuadas para cada split.
    Las imágenes se convierten a escala de grises
    y luego se duplican a 2 canales dentro del Dataset. Para el Grad Map.
    """
    if split == "train":
        return transforms.Compose([
            transforms.Grayscale(num_output_channels=1),
            transforms.Resize((image_size + 20, image_size + 20)),
            transforms.RandomCrop(image_size),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(10),
            transforms.ColorJitter(brightness=0.2, contrast=0.2),
            transforms.ToTensor(),                   # (1, H, W) en [0, 1]
            transforms.Normalize(mean=[0.5], std=[0.5]),  # → [-1, 1]
            transforms.RandomVerticalFlip(),
            transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 1.0)),
            transforms.RandomAffine(degrees=15, translate=(0.1, 0.1), scale=(0.9, 1.1)),
        ])
    else:  # val / test
        return transforms.Compose([
            transforms.Grayscale(num_output_channels=1),
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5], std=[0.5]),
        ])


# Dataset
class XRayDataset(Dataset):
    """
    Dataset de rayos X con 3 clases.
    Soporta ROI masks opcionales: si existe una máscara con el mismo nombre
    en una carpeta paralela '<split>_masks/', se carga como canal 2.
    Si no existe, el canal 2 es ceros.
    """

    CLASS_TO_IDX = {cls: i for i, cls in enumerate(CLASSES)}

    def __init__(
        self,
        root_dir: str,
        split: str = "train",       # "train" | "val" | "test"
        image_size: int = 224,
        mask_dir: Optional[str] = None,  # carpeta raíz de máscaras (opcional)
    ):
        super().__init__()
        self.root = Path(root_dir) / split
        self.split = split
        self.image_size = image_size
        self.mask_dir = Path(mask_dir) / split if mask_dir else None
        self.transform = get_transforms(split, image_size)

        self.samples: list[Tuple[Path, int]] = []
        self._load_samples()

    def _load_samples(self):
        extensions = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"}
        for class_name in CLASSES:
            class_path = self.root / class_name
            if not class_path.exists():
                print(f"[WARN] No se encontró la carpeta: {class_path}")
                continue
            label = self.CLASS_TO_IDX[class_name]
            for img_path in sorted(class_path.iterdir()):
                if img_path.suffix.lower() in extensions:
                    self.samples.append((img_path, label))

        print(f"[{self.split.upper()}] {len(self.samples)} imágenes cargadas.")

    def _load_mask(self, img_path: Path) -> torch.Tensor:
        """
        Carga máscara ROI si existe, sino devuelve tensor de ceros.
        """
        if self.mask_dir is None:
            return torch.zeros(1, self.image_size, self.image_size)

        class_name = img_path.parent.name
        mask_path = self.mask_dir / class_name / img_path.name

        if mask_path.exists():
            mask = Image.open(mask_path).convert("L")
            mask = mask.resize((self.image_size, self.image_size), Image.NEAREST)
            mask_tensor = torch.from_numpy(np.array(mask)).float() / 255.0
            return mask_tensor.unsqueeze(0)  # (1, H, W)
        else:
            return torch.zeros(1, self.image_size, self.image_size)

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        img_path, label = self.samples[idx]

        # Canal 0: imagen en escala de grises normalizada
        image = Image.open(img_path).convert("L")
        img_tensor = self.transform(image)  # (1, H, W)

        # Canal 1: máscara ROI o ceros
        mask_tensor = self._load_mask(img_path)  # (1, H, W)

        # Concatenar → (2, H, W)
        two_channel = torch.cat([img_tensor, mask_tensor], dim=0)

        return two_channel, label


# Factory de DataLoaders
def get_dataloaders(
    data_dir: str,
    batch_size: int = 32,
    image_size: int = 224,
    num_workers: int = 4,
    mask_dir: Optional[str] = None,
) -> dict:
    """
    Crea los DataLoaders para train, val y test.

    Args:
        data_dir:    ruta raíz del dataset (contiene train/ val/ test/)
        batch_size:  tamaño de batch
        image_size:  resolución cuadrada de las imágenes
        num_workers: hilos para carga de datos
        mask_dir:    ruta a máscaras ROI (opcional)

    Returns:
        dict con claves 'train', 'val', 'test'
    """
    loaders = {}
    for split in ("train", "val", "test"):
        dataset = XRayDataset(
            root_dir=data_dir,
            split=split,
            image_size=image_size,
            mask_dir=mask_dir,
        )
        shuffle = split == "train"
        loaders[split] = DataLoader(
            dataset,
            batch_size=batch_size,
            shuffle=shuffle,
            num_workers=num_workers,
            pin_memory=torch.cuda.is_available(),
        )
    return loaders


# Smoke test
if __name__ == "__main__":
    loaders = get_dataloaders(data_dir="data", batch_size=4, num_workers=0)
    for split, loader in loaders.items():
        batch, labels = next(iter(loader))
        print(f"{split}: batch shape={batch.shape}, labels={labels}")