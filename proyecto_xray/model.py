"""
model.py
CNN de diagnóstico basado en DenseNet-121 para clasificación de rayos X.
Clases: nodule | mass | normal
Entrada: imágenes de 2 canales (canal 1 = imagen en escala de grises, canal 2 = ROI mask / cero)
Salida: logits para 3 clases + mapa de activación Grad-CAM
"""

import torch
import torch.nn as nn
import torchvision.models as models
import torch.nn.functional as F


# Etiquetas del dataset
CLASSES = ["nodule", "mass", "normal"]
NUM_CLASSES = len(CLASSES)

# Modelo principal
class XRayDenseNet(nn.Module):
    """
    DenseNet-121 adaptado para:
      - Entrada de 2 canales (gris + ROI opcional)
      - Salida de NUM_CLASSES clases
      - Hook interno para Grad-CAM sobre la última capa convolucional
    """

    def __init__(self, num_classes: int = NUM_CLASSES, pretrained: bool = True):
        super().__init__()

        # 1. Cargar DenseNet-121 preentrenado en ImageNet
        weights = models.DenseNet121_Weights.IMAGENET1K_V1 if pretrained else None
        backbone = models.densenet121(weights=weights)

        # 2. Reemplazar la primera conv para aceptar 2 canales en lugar de 3
        original_conv = backbone.features.conv0 
        new_conv = nn.Conv2d(
            in_channels=2,
            out_channels=original_conv.out_channels,
            kernel_size=original_conv.kernel_size,
            stride=original_conv.stride,
            padding=original_conv.padding,
            bias=False,
        )

        with torch.no_grad():
            # Inicializar canal 1 (gris) con el promedio de los 3 canales RGB
            new_conv.weight[:, 0, :, :] = original_conv.weight[:, :3, :, :].mean(dim=1)
            # Inicializar canal 2 (ROI mask) con el mismo promedio
            new_conv.weight[:, 1, :, :] = original_conv.weight[:, :3, :, :].mean(dim=1)

        backbone.features.conv0 = new_conv

        # 3. Separar features y clasificador
        self.features = backbone.features  # extractor de características

        # 4. Clasificador propio 
        in_features = backbone.classifier.in_features  # 1024
        self.classifier = nn.Sequential(
            nn.Dropout(p=0.5),
            nn.Linear(in_features, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.3),
            nn.Linear(256, num_classes),
        )

        # 5. Variables internas para Grad-CAM
        self._gradients = None   # guardará gradientes del backward
        self._activations = None  # guardará activaciones del forward

        # Registrar hooks en la última norma del bloque denso final
        self._register_hooks()

    # Hooks para Grad-CAM 
    def _register_hooks(self):
        """Registra forward y backward hooks en la última capa del extractor."""
        target_layer = self.features.norm5  

        def forward_hook(module, input, output):
            self._activations = output.detach()

        def backward_hook(module, grad_input, grad_output):
            self._gradients = grad_output[0].detach()

        target_layer.register_forward_hook(forward_hook)
        target_layer.register_full_backward_hook(backward_hook)

    # Forward 
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        x: (batch, 2, H, W)
        returns: logits (batch, num_classes)
        """
        feat = self.features(x)
        feat = F.relu(feat, inplace=False)
        feat = F.adaptive_avg_pool2d(feat, (1, 1))  # Global Average Pooling
        feat = torch.flatten(feat, 1)               # (batch, 1024)
        logits = self.classifier(feat)
        return logits

    #  Grad-CAM 
    def get_gradcam(self, logits: torch.Tensor, class_idx: int = None) -> torch.Tensor:
        """
        Calcula el mapa de calor Grad-CAM para la clase indicada.

        Args:
            logits:    tensor de salida del forward (batch=1, num_classes)
            class_idx: índice de la clase objetivo; si None usa la predicha

        Returns:
            heatmap: tensor (H, W) normalizado en [0, 1]
        """
        if class_idx is None:
            class_idx = logits.argmax(dim=1).item()

        # Backward sobre la clase objetivo
        self.zero_grad()
        logits[0, class_idx].backward(retain_graph=True)

        # Gradientes: (1, C, H, W)
        weights = self._gradients.mean(dim=(2, 3), keepdim=True)  # (1, C, 1, 1)

        # Mapa de calor combinación lineal de activaciones ponderadas
        heatmap = (weights * self._activations).sum(dim=1, keepdim=True)  # (1, 1, H, W)
        heatmap = F.relu(heatmap)

        # Normalizar al rango [0, 1]
        heatmap -= heatmap.min()
        if heatmap.max() > 0:
            heatmap /= heatmap.max()

        return heatmap.squeeze()  


# Función de inferencia completa
def predict_with_gradcam(
    model: XRayDenseNet,
    image_tensor: torch.Tensor,
    device: str = "cpu",
) -> dict:
    """
    Ejecuta forward + Grad-CAM sobre una sola imagen.

    Args:
        model:        XRayDenseNet instanciado
        image_tensor: (1, 2, H, W) ya normalizado
        device:       'cpu' o 'cuda'

    Returns:
        dict con:
          - 'class_name'  : etiqueta predicha (str)
          - 'class_idx'   : índice de la clase (int)
          - 'probabilities': dict {clase: probabilidad}
          - 'heatmap'     : tensor (H, W) Grad-CAM normalizado
    """
    model.eval()
    model.to(device)
    image_tensor = image_tensor.to(device)
    image_tensor.requires_grad_(True)

    logits = model(image_tensor)          
    probs = F.softmax(logits, dim=1)[0] 
    class_idx = probs.argmax().item()

    heatmap = model.get_gradcam(logits, class_idx)

    return {
        "class_name": CLASSES[class_idx],
        "class_idx": class_idx,
        "probabilities": {cls: round(probs[i].item(), 4) for i, cls in enumerate(CLASSES)},
        "heatmap": heatmap.cpu(),
    }


# test rápido

if __name__ == "__main__":
    model = XRayDenseNet(num_classes=3, pretrained=False)
    dummy = torch.randn(1, 2, 224, 224)
    result = predict_with_gradcam(model, dummy)
    print("Clase predicha:", result["class_name"])
    print("Probabilidades:", result["probabilities"])
    print("Heatmap shape:", result["heatmap"].shape)
