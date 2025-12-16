# tts_engine.py
import os
import tempfile
from flask import jsonify, send_file, after_this_request
from TTS.api import TTS

# Load TTS model once
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")

def handle_tts_request(request):

    try:
        data = request.get_json()
        text = data.get("text", "").strip()

        if not text:    
            return jsonify({"error": "Text is empty"}), 400
        if not text.endswith("."):
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
