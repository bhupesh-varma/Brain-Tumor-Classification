from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import os

app = FastAPI()

# Load model
MODEL = tf.keras.models.load_model("../saved_models/1.keras")
CLASS_NAMES = ['glioma', 'healthy', 'meningioma', 'pituitary']

# Template rendering
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "../frontend"))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "../static")), name="static")

@app.get("/ping")
async def ping():
    return "hello"

@app.get("/", response_class=HTMLResponse)
async def serve_homepage(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)).resize((224, 224)))
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)

    predictions = MODEL.predict(img_batch)
    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])

    return {
        'class': predicted_class,
        'confidence': float(confidence)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
