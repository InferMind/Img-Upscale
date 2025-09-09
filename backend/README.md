# AI Image Upscaler Backend (FastAPI + Real-ESRGAN Python)

Implements the frontend contract described in the main README:
- POST /api/enhance (multipart/form-data)
  - fields: image (file), scaleFactor (2|4|6)
  - returns: { success: true, enhancedImage: "data:image/jpeg;base64,..." }

This backend uses the Python Real-ESRGAN implementation (PyTorch, CPU by default) and automatically downloads the `RealESRGAN_x4plus.pth` weights on first run.

## Quickstart

1. Create a Python virtual environment and install dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

2. (Optional) Pre-download weights
```bash
mkdir -p backend/weights
wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth \
  -O backend/weights/RealESRGAN_x4plus.pth
```

3. Run the server
```bash
uvicorn backend.app:app --host 0.0.0.0 --port 8000
```

4. Test the API
```bash
curl -X POST \
  -F "image=@/path/to/image.jpg" \
  -F "scaleFactor=4" \
  http://localhost:8000/api/enhance | jq
```

## Notes
- Scales 2 and 6 are produced by running the 4x model and resampling to the requested size with high-quality Lanczos.
- Allowed content types: image/jpeg, image/png, image/webp; max file size 10MB.
- Adjust CORS in `backend/app.py` for production origins.

## GPU usage (optional)
If you have CUDA and want GPU acceleration, install CUDA-enabled torch/torchvision wheels and set `_device = "cuda"` in `backend/services/upscale.py`.