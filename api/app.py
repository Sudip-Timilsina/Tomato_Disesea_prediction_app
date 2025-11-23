from fastapi import FastAPI, File, UploadFile

from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from keras.layers import TFSMLayer

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or add your specific allowed origins here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the SavedModel using TFSMLayer with serving_default
# MODEL = TFSMLayer(
#     r"C:\Users\user\OneDrive\Desktop\potato\api\saved_model\2",
#     call_endpoint="serving_default"
# )
MODEL = TFSMLayer(
    "saved_model/2",
    call_endpoint="serving_default"
)




CLASS_NAMES = [
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

IMG_SIZE = 256  # Must match the input shape expected by the model

@app.get("/ping")
async def ping():
    return {"message": "Model is running!"}

def read_file_as_image(data: bytes) -> np.ndarray:
    try:
        image = Image.open(BytesIO(data)).convert("RGB").resize((IMG_SIZE, IMG_SIZE))
        image = np.array(image).astype('float32')  # No rescaling (i.e., no /255.0)
        return image
    except Exception as e:
        print("Image processing error:", e)
        return None

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    data = await file.read()
    image = read_file_as_image(data)

    if image is None:
        return {"error": "Invalid image"}

    image_batch = np.expand_dims(image, axis=0)  # Add batch dimension

    # Run inference
    result = MODEL(image_batch, training=False)
    prediction = list(result.values())[0].numpy()[0]

    predicted_index = int(np.argmax(prediction))
    predicted_class = CLASS_NAMES[predicted_index]
    confidence = float(np.max(prediction))

    return {
        "class": predicted_class,
        "confidence": round(confidence, 4)
    }

if __name__ == "__main__":
    # uvicorn.run(app, host="localhost", port=8000)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

