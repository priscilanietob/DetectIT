"""
inference.py
Carga un modelo entrenado, procesa una imagen y devuelve:
  - Clase predicha + probabilidades
  - Imagen con Grad-CAM superpuesto (guardada como PNG)
  - Diccionario listo para pasarse al módulo de chat/LLM

  python inference.py --model checkpoints/best_model.pt --image data/test/nodule/00000061_000.png
"""

import argparse
from pathlib import Path

import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.cm as cm

from model import XRayDenseNet, CLASSES, NUM_CLASSES, predict_with_gradcam
from dataset import get_transforms


# Cargar modelo desde checkpoint
def load_model(checkpoint_path: str, device: str = "cpu") -> XRayDenseNet:
    checkpoint = torch.load(checkpoint_path, map_location=device)
    model = XRayDenseNet(num_classes=NUM_CLASSES, pretrained=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()
    print(f"Modelo cargado. Entrenado hasta epoch {checkpoint.get('epoch', '?')}")
    return model


# Preparar imagen → tensor de 2 canales
def prepare_image(
    image_path: str,
    image_size: int = 224,
    roi_mask_path: str = None,
) -> torch.Tensor:
    """
    Carga una imagen y la convierte en tensor (1, 2, H, W).

    Args:
        image_path:    ruta a la radiografía
        image_size:    tamaño al que se redimensiona
        roi_mask_path: ruta a máscara ROI opcional 

    Returns:
        tensor (1, 2, H, W)
    """
    transform = get_transforms("val", image_size)

    # Canal 0: imagen gris normalizada
    img = Image.open(image_path).convert("L")
    img_tensor = transform(img)  # (1, H, W)

    # Canal 1: ROI mask o ceros
    if roi_mask_path and Path(roi_mask_path).exists():
        mask = Image.open(roi_mask_path).convert("L").resize((image_size, image_size))
        mask_tensor = torch.from_numpy(np.array(mask)).float() / 255.0
        mask_tensor = mask_tensor.unsqueeze(0)  # (1, H, W)
    else:
        mask_tensor = torch.zeros(1, image_size, image_size)

    two_channel = torch.cat([img_tensor, mask_tensor], dim=0)  # (2, H, W)
    return two_channel.unsqueeze(0)  # (1, 2, H, W)


# Superponer Grad-CAM sobre la imagen original
def overlay_heatmap(
    image_path: str,
    heatmap: torch.Tensor,
    output_path: str,
    alpha: float = 0.5,
):
    img = Image.open(image_path).convert("RGB")
    orig_w, orig_h = img.size

    # Redimensionar heatmap a la resolución original de la imagen
    import torch.nn.functional as F2
    heatmap_up = F2.interpolate(
        heatmap.unsqueeze(0).unsqueeze(0),
        size=(orig_h, orig_w),
        mode="bilinear",
        align_corners=False,
    ).squeeze().numpy()

    img_np = np.array(img).astype(np.float32) / 255.0

    colormap = matplotlib.colormaps["jet"]
    heatmap_colored = colormap(heatmap_up)[:, :, :3]

    overlay = (1 - alpha) * img_np + alpha * heatmap_colored
    overlay = np.clip(overlay, 0, 1)

    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    axes[0].imshow(img, cmap="gray");        axes[0].set_title("Radiografía original"); axes[0].axis("off")
    axes[1].imshow(heatmap_up, cmap="jet"); axes[1].set_title("Grad-CAM");             axes[1].axis("off")
    axes[2].imshow(overlay);                axes[2].set_title("Superposición");         axes[2].axis("off")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Imagen guardada en: {output_path}")

# Construir contexto para el chatbot/LLM
def build_llm_context(result: dict, image_path: str) -> dict:
    """
    Transforma la salida del CNN en un contexto estructurado
    que el módulo de chat enviará al LLM.

    Returns:
        dict con toda la información relevante para que el LLM genere
        una explicación clínica comprensible.
    """
    probs = result["probabilities"]
    confidence = probs[result["class_name"]]
    sorted_probs = sorted(probs.items(), key=lambda x: x[1], reverse=True)

    context = {
        "image_file": str(image_path),
        "primary_finding": result["class_name"],          # "nodule" | "mass" | "normal"
        "confidence": confidence,                          # 0.0 – 1.0
        "all_probabilities": sorted_probs,                 # lista ordenada
        "heatmap_available": True,
        # Descripción para el prompt del LLM
        "cnn_summary": (
            f"El modelo de IA analizó la radiografía y detectó una región compatible con "
            f"'{result['class_name']}' con una confianza del {confidence*100:.1f}%. "
            f"Las probabilidades por clase son: "
            + ", ".join(f"{cls}: {p*100:.1f}%" for cls, p in sorted_probs)
            + ". Se generó un mapa de calor Grad-CAM indicando las regiones anatómicas "
            f"que influyeron en esta sugerencia diagnóstica."
        ),
    }
    return context


# Script principal
def run_inference(args):
    device = "cuda" if torch.cuda.is_available() else "cpu"

    model = load_model(args.model, device)

    image_tensor = prepare_image(
        image_path=args.image,
        image_size=args.image_size,
        roi_mask_path=args.mask,
    )

    result = predict_with_gradcam(model, image_tensor, device)

    print("\n── Resultado ──────────────────────────")
    print(f"Clase predicha : {result['class_name']}")
    print(f"Probabilidades : {result['probabilities']}")

    # Guardar visualización Grad-CAM
    output_img = args.output or str(Path(args.image).stem) + "_gradcam.png"
    overlay_heatmap(args.image, result["heatmap"], output_img)

    # Contexto para el LLM
    llm_ctx = build_llm_context(result, args.image)
    print("\n── Contexto para el LLM ───────────────")
    print(llm_ctx["cnn_summary"])

    return result, llm_ctx


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inferencia XRayDenseNet + Grad-CAM")
    parser.add_argument("--model",      required=True,       help="Ruta al checkpoint (.pt)")
    parser.add_argument("--image",      required=True,       help="Ruta a la radiografía")
    parser.add_argument("--mask",       default=None,        help="Ruta a máscara ROI (opcional)")
    parser.add_argument("--output",     default=None,        help="Ruta de salida imagen Grad-CAM")
    parser.add_argument("--image_size", type=int, default=224)
    args = parser.parse_args()

    run_inference(args)
