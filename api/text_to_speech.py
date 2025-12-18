# tts_engine.py
import os
import tempfile
from flask import jsonify, send_file, after_this_request
from TTS.api import TTS
import shutil

# Load TTS model once
BASE_MODEL_DIR = os.path.join(os.getcwd(), "models")
os.environ["TTS_HOME"] = BASE_MODEL_DIR

MODEL_NAME = "tts_models/en/ljspeech/tacotron2-DDC"
MODEL_FOLDER = "tts_models--en--ljspeech--tacotron2-DDC"
MODEL_PATH = os.path.join(BASE_MODEL_DIR, MODEL_FOLDER)

def load_tts_safely():
    try:
        # المحاولة الطبيعية
        return TTS(model_name=MODEL_NAME)

    except ValueError as e:
        if "Model file not found" in str(e):
            print("[TTS] Corrupted model detected. Re-downloading...")

            # امسح الموديل البايظ بس
            if os.path.exists(MODEL_PATH):
                shutil.rmtree(MODEL_PATH)

            return TTS(model_name=MODEL_NAME)

        else:
            raise e

# تحميل مرة واحدة
tts = load_tts_safely()

print("[TTS] Model ready")

def handle_tts_request(request):

    try:
        data = request.get_json()
        text = data.get("text", "").strip()

        if not text:    
            return jsonify({"error": "Text is empty"}), 400
        if not text.endswith((".", "!", "?")):
            text += "."


        # Temporary file
        fd, tmp_path = tempfile.mkstemp(suffix=".wav")
        os.close(fd)

        # generate voice
        tts.tts_to_file(text=text, file_path=tmp_path,)

        # clean file after sending
        @after_this_request
        def cleanup(response):
            try:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
            except:
                pass
            return response

        return send_file(tmp_path, mimetype="audio/wav", as_attachment=False)

    except Exception as e:
        return jsonify({"error": "TTS failed", "detail": str(e)}), 500
