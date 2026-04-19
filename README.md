## Checkpoint
El mejor modelo entrenado (val_acc=71.99%) está disponible en:
https://drive.google.com/file/d/1Wdm6NLg700oCcIXpJSrMmiyhkOLukCN4/view?usp=sharing 

Descargarlo y colocarlo dentro de la carpeta checkpoints/

Para ejecutarlo es: python inference.py --model checkpoints/model_epoch3_acc0.7199.pt --image data/test/nodule/00000061_000.png //Aqui escoges que imagen deseas analizar
