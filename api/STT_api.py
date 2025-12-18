import os
import sys
import tempfile
import whisper
import zipfile
import urllib.request
import platform
import shutil

# -----------------------------
# Setting up FFmpeg if it's not installed on the system
# -----------------------------

import os
import platform
import urllib.request
import zipfile
import shutil
import subprocess

# مسار ffmpeg
FFMPEG_DIR = os.path.join(os.getcwd(), "models", "ffmpeg_bin")
os.makedirs(FFMPEG_DIR, exist_ok=True)

# -----------------------------
# Download ffmpeg if it's not already available
# -----------------------------
def download_ffmpeg():
    """
    تحميل ffmpeg لو مش موجود، أو استخدام الموجود بالفعل.
    """
    ffmpeg_exe = os.path.join(FFMPEG_DIR, "ffmpeg.exe")  # الملف الرئيسي اللي هنشيك عليه

    # لو موجود، نوقف العملية ونستخدم الموجود
    if os.path.exists(ffmpeg_exe):
        print("✅ ffmpeg is already installed. Using existing files.")
        return

    print("Downloading ffmpeg...")
    system = platform.system().lower()
    if system == "windows":
        url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
        zip_path = os.path.join(FFMPEG_DIR, "ffmpeg.zip")
        urllib.request.urlretrieve(url, zip_path)
        print("Extracting ffmpeg...")
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(FFMPEG_DIR)
        os.remove(zip_path)

        # البحث عن ffmpeg.exe داخل المجلدات الفرعية ونقله للمجلد الرئيسي
        for root, dirs, files in os.walk(FFMPEG_DIR):
            if "ffmpeg.exe" in files:
                ffmpeg_bin_path = root
                for f in os.listdir(ffmpeg_bin_path):
                    src = os.path.join(ffmpeg_bin_path, f)
                    dest = os.path.join(FFMPEG_DIR, f)
                    if not os.path.exists(dest):
                        shutil.move(src, dest)
                break

# استدعاء الدالة
download_ffmpeg()

# إضافة ffmpeg للـ PATH
os.environ["PATH"] = FFMPEG_DIR + os.pathsep + os.environ["PATH"]

# اختبار سريع للتأكد من جاهزية ffmpeg
try:
    subprocess.run(["ffmpeg", "-version"], check=True)
    print("✅ ffmpeg ready!")
except Exception as e:
    print("❌ ffmpeg error:", e)


# -----------------------------
# Download Whisper model
# -----------------------------
MODEL_DIR = "models/whisper_models"
os.makedirs(MODEL_DIR, exist_ok=True)

model = whisper.load_model(
    "base",
    download_root=MODEL_DIR
)

print("Model loaded successfully!")
# -----------------------------
# Function to convert audio to text
# -----------------------------
def transcribe_audio(file_bytes: bytes, temperature: float = 0.0) -> str:
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(file_bytes)
        temp_path = tmp.name  # خزن المسار
        tmp.close()   

    try:
        result = model.transcribe(temp_path,language="en", temperature=temperature)
        return result["text"]
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)