"""
server.py — FastAPI wrapper para el modelo CNN DetectIT
Expone:
  POST /predict  ← multipart/form-data con campo 'file' (imagen)
  GET  /health   ← estado del servidor

Uso:
  uvicorn server:app --host 0.0.0.0 --port 8000 --reload

Variables de entorno opcionales:
  MODEL_PATH   ruta al checkpoint .pt  (default: checkpoints/best_model.pt)
  IMAGE_SIZE   tamaño de entrada       (default: 224)
"""

import io
import os
import sys
from pathlib import Path

import torch
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

sys.path.insert(0, str(Path(__file__).parent))

from model import XRayDenseNet, CLASSES, NUM_CLASSES, predict_with_gradcam
from dataset import get_transforms

# ─── Config ────────────────────────────────────────────────────────────────
MODEL_PATH = os.environ.get("MODEL_PATH", "checkpoints/best_model.pt")
IMAGE_SIZE = int(os.environ.get("IMAGE_SIZE", "224"))
DEVICE     = "cuda" if torch.cuda.is_available() else "cpu"

# ─── App ───────────────────────────────────────────────────────────────────
app = FastAPI(title="DetectIT CNN API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

_model: XRayDenseNet | None = None


@app.on_event("startup")
async def load_model():
    global _model
    path = Path(MODEL_PATH)
    if not path.exists():
        print(f"[WARN] Checkpoint no encontrado: '{MODEL_PATH}'. /predict retornará 503.")
        return
    checkpoint = torch.load(path, map_location=DEVICE, weights_only=False)
    m = XRayDenseNet(num_classes=NUM_CLASSES, pretrained=False)
    m.load_state_dict(checkpoint["model_state_dict"])
    m.to(DEVICE).eval()
    _model = m
    print(f"[OK] Modelo cargado desde '{MODEL_PATH}' — device={DEVICE}")


def _to_tensor(pil_image: Image.Image) -> torch.Tensor:
    """PIL Image → tensor (1, 2, IMAGE_SIZE, IMAGE_SIZE)."""
    transform = get_transforms("val", IMAGE_SIZE)
    gray = pil_image.convert("L")
    img_t  = transform(gray)                              # (1, H, W)
    mask_t = torch.zeros(1, IMAGE_SIZE, IMAGE_SIZE)
    two_ch = torch.cat([img_t, mask_t], dim=0)            # (2, H, W)
    return two_ch.unsqueeze(0)                            # (1, 2, H, W)


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": _model is not None, "device": DEVICE}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if _model is None:
        raise HTTPException(status_code=503, detail="Modelo no cargado. Verifica MODEL_PATH.")

    try:
        contents = await file.read()
        pil_img  = Image.open(io.BytesIO(contents))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Imagen inválida: {exc}")

    tensor = _to_tensor(pil_img)
    result = predict_with_gradcam(_model, tensor, DEVICE)

    cls          = result["class_name"]
    probs        = result["probabilities"]
    confidence   = probs[cls]
    sorted_probs = sorted(probs.items(), key=lambda x: x[1], reverse=True)

    cnn_summary = (
        f"El modelo CNN (DenseNet-121 entrenado con ~18,344 radiografías) analizó la imagen "
        f"y detectó una región compatible con '{cls}' con una confianza del {confidence*100:.1f}%. "
        "Distribución de probabilidades: "
        + ", ".join(f"{c}: {p*100:.1f}%" for c, p in sorted_probs)
        + ". El análisis se realizó usando Grad-CAM para identificar las regiones anatómicas relevantes."
    )

    return {
        "class_name":    cls,
        "confidence":    round(confidence, 4),
        "probabilities": probs,
        "cnn_summary":   cnn_summary,
    }


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
