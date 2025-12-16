import os
import sys
import tempfile
import whisper

# -----------------------------
# Setting up FFmpeg if it's not installed on the system
# -----------------------------
ffmpeg_path = os.path.join(sys.prefix, "ffmpeg", "bin")
os.environ["PATH"] = ffmpeg_path + os.pathsep + os.environ["PATH"]

# -----------------------------
# Download Whisper model
# -----------------------------
MODEL_DIR = "models/whisper_models"
os.makedirs(MODEL_DIR, exist_ok=True)

model = whisper.load_model(
    "small",
    download_root=MODEL_DIR
)

print("Model loaded successfully!")
# -----------------------------
# Function to convert audio to text
# -----------------------------
def transcribe_audio(file_bytes: bytes, temperature: float = 0.0) -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(file_bytes)
        temp_path = tmp.name  # خزن المسار
        tmp.close()   

    try:
        result = model.transcribe(temp_path,language="en", temperature=temperature)
        return result["text"]
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)