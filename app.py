from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from api.text_to_speech import handle_tts_request
from api.ocr_api import process_images 
from api.GEC_api import correct_text
from api.STT_api import transcribe_audio
import os


# -----------------------------
#Flask and dotenv setup
# -----------------------------
load_dotenv()
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "default_secret_key")

# -----------------------------
# home page
# -----------------------------
@app.route("/")
def home():
    return render_template("index.html")

# -----------------------------
# STT API
# -----------------------------
@app.route('/stt', methods=["POST","GET"])  # هذا هو الراوت الجديد
def stt_page():
    if request.method == "POST":
        if "file" not in request.files:
            return {"error": "No file sent"}, 400
        
        audio_file = request.files["file"].read()

        try:
            text = transcribe_audio(audio_file)
            print(text)
            return {"text": text}
        except Exception as e:
            return {"error": str(e)}, 500

    return render_template('STT.html')


# -----------------------------
# Text-to-Speech
# -----------------------------
@app.route("/tts", methods=["POST", "GET"])
def tts_api():
    if request.method == "POST":
        return handle_tts_request(request)

    return render_template('TTS.html')

# -----------------------------
# OCR convert image to text#
# -----------------------------
@app.route("/ocr", methods=["POST","GET"])
def ocr_api():
    if request.method == "POST":
        files = request.files.getlist("images")
        results = process_images(files)  # استدعاء الدالة من الملف الخارجي
        return jsonify({"status": "ok", "results": results})
   
    return render_template('OCR.html')

# -----------------------------
# Grammatical Error Correction (GEC)#
# -----------------------------
@app.route("/GEC", methods=["POST","GET"])
def sentiment_api():
    if request.method == "POST":
        print("processing")
        data = request.get_json()
        text = data.get("text", "").strip()

        if not text:    
            return jsonify({"error": "Text is empty"}), 400
        if not text.endswith("."):
            text += "." 
        corrected = correct_text(text)
        print(corrected)
        return jsonify({"status": "ok", "result": corrected})
        
    return render_template('GEC.html')


if __name__ == "__main__":
    app.run(debug=False)
