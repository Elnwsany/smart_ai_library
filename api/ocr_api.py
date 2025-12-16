from PIL import Image
import numpy as np
from io import BytesIO
import easyocr
import os

# Setting up the custom track for the models
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # كدا طلعنا لفوق خطوة
MODEL_DIR = os.path.join(BASE_DIR, "models", "ocr_models")

# Download models only once
reader = easyocr.Reader(
    ['ar', 'en'],
    gpu=True,
    model_storage_directory=MODEL_DIR,
    download_enabled=True
)
# function of Processing images
def process_images(files):

    results = []

    for f in files:
        img_bytes = f.read()
        pil_img = Image.open(BytesIO(img_bytes))
        np_img = np.array(pil_img)

        ocr_output = reader.readtext(np_img)
        extracted_text = [text for (_, text, _) in ocr_output]

        results.append({
            "filename": f.filename,
            "text": extracted_text
        })

    return results
