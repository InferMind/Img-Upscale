from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from PIL import Image
import tempfile
import os

from .services.upscale import upscale_image

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # tighten in production


@app.post("/api/enhance")
def enhance_image():
    if "image" not in request.files or "scaleFactor" not in request.form:
        return jsonify(success=False, error="Missing image or scaleFactor"), 400

    file = request.files["image"]
    try:
        scale = int(request.form.get("scaleFactor", 4))
    except ValueError:
        return jsonify(success=False, error="scaleFactor must be 2, 4, or 6"), 400

    model_name = request.form.get("model", "x4plus")  # "x4plus" | "anime6B"
    face_enhance = request.form.get("faceEnhance", "false").lower() in ("1", "true", "yes")

    if scale not in (2, 4, 6):
        return jsonify(success=False, error="scaleFactor must be 2, 4, or 6"), 400

    if file.mimetype not in ("image/jpeg", "image/png", "image/webp"):
        return jsonify(success=False, error="Unsupported file type. Use JPEG, PNG, or WebP."), 400

    data = file.read()
    if len(data) > 10 * 1024 * 1024:
        return jsonify(success=False, error="File too large. Max 10MB."), 400

    suffix = os.path.splitext(file.filename or "")[1] or ".png"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        tmp.write(data)
        tmp.close()

        out_bytes = upscale_image(tmp.name, scale=scale, model_name=model_name, face_enhance=face_enhance)

        img = Image.open(BytesIO(out_bytes)).convert("RGB")
        buf = BytesIO()
        img.save(buf, format="JPEG", quality=95)
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return jsonify(success=True, enhancedImage=f"data:image/jpeg;base64,{b64}")
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500
    finally:
        try:
            os.remove(tmp.name)
        except Exception:
            pass


@app.get("/health")
def health():
    return {"status": "ok"}