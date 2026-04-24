## Instalación y configuración

### Requisitos previos
- Python 3.11 ([descargar aquí](https://www.python.org/downloads/release/python-3119/))
- Git
- NVIDIA GPU con drivers actualizados (opcional pero recomendado)

### 1. Clonar el repositorio
```bash
git clone https://github.com/priscilanietob/DetectIT.git
cd DetectIT/proyecto_xray
```

### 2. Crear entorno virtual
```bash
py -3.11 -m venv venv
```

### 3. Activar el entorno virtual
Windows:
```bash
venv\Scripts\activate
```
Mac/Linux:
```bash
source venv/bin/activate
```

### 4. Instalar PyTorch con soporte GPU 
```bash
pip install torch==2.1.0+cu118 torchvision==0.16.0+cu118 --index-url https://download.pytorch.org/whl/cu118
```
Sin GPU (solo CPU):
```bash
pip install torch torchvision
```

### 5. Instalar el resto de dependencias
```bash
pip install "numpy<2" Pillow matplotlib
```

### 6. Verificar instalación
```bash
python -c "import torch; print('torch:', torch.__version__); print('CUDA:', torch.cuda.is_available())"
```

### 7. Descargar el modelo entrenado
Descargar `best_model.pt` desde [Google Drive] https://drive.google.com/file/d/1Wdm6NLg700oCcIXpJSrMmiyhkOLukCN4/view?usp=sharing  y colocarlo en:
```
proyecto_xray/checkpoints/
```

### 8. Analizar una radiografía
```bash
python inference.py --model checkpoints/model_epoch3_acc0.7199.pt --image data/test/nodule/00000061_000.png      //Aqui escoges que imagen deseas analizar
```

### 9. Evaluar sobre el set de test completo
```bash
python evaluate.py --model checkpoints/best_model.pt --data_dir ./data
```

### 10. Entrenar desde cero
```bash
python train.py --data_dir ./data --epochs 30 --batch_size 32 --num_workers 0
```

### 11. Reanudar entrenamiento desde checkpoint
```bash
python train.py --data_dir ./data --epochs 15 --batch_size 32 --num_workers 0 --resume checkpoints/best_model.pt
```
