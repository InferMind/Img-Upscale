import os
from io import BytesIO
from typing import Optional, Union

import numpy as np
import cv2
from PIL import Image
import torch
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan.archs.srvgg_arch import SRVGGNetCompact
from realesrgan.utils import RealESRGANer
try:
    from gfpgan import GFPGANer
except Exception:
    GFPGANer = None  # optional dependency

# Cache per-(model, device) upsampler instances
_upsamplers: dict[tuple[str, str], RealESRGANer] = {}
_gfpganers: dict[tuple[str, str, int], Union["GFPGANer", None]] = {}
_device: str = "cpu"  # set to "cuda" if you have a GPU and CUDA torch installed

# Model weights URLs
WEIGHTS = {
    "x4plus": {
        "url": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth",
        "filename": "RealESRGAN_x4plus.pth",
        "arch": "rrdb",
    },
    "anime6B": {
        "url": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth",
        "filename": "RealESRGAN_x4plus_anime_6B.pth",
        "arch": "srvgg",
    },
    "gfpgan": {
        "url": "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth",
        "filename": "GFPGANv1.4.pth",
    },
}


def _get_weights_path(filename: str) -> str:
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    weights_dir = os.path.join(base_dir, "weights")
    os.makedirs(weights_dir, exist_ok=True)
    return os.path.join(weights_dir, filename)


def _build_model(model_key: str):
    if model_key == "x4plus":
        # RRDBNet for general photos
        return RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
    elif model_key == "anime6B":
        # SRVGGNetCompact for anime
        return SRVGGNetCompact(num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=16, upscale=4, act_type='prelu')
    else:
        raise ValueError("Unsupported model key")


def _get_upsampler(model_key: str) -> RealESRGANer:
    global _upsamplers
    device = torch.device(_device)
    cache_key = (model_key, str(device))
    if cache_key in _upsamplers:
        return _upsamplers[cache_key]

    cfg = WEIGHTS[model_key]
    model = _build_model(model_key)
    weights_path = _get_weights_path(cfg["filename"])
    model_path = weights_path if os.path.exists(weights_path) else cfg["url"]

    up = RealESRGANer(
        scale=4,
        model_path=model_path,
        model=model,
        tile=0,
        tile_pad=10,
        pre_pad=0,
        half=False,
        device=device,
    )
    _upsamplers[cache_key] = up
    return up


def _get_gfpganer(bg_upsampler: RealESRGANer) -> Union["GFPGANer", None]:
    if GFPGANer is None:
        return None
    device = torch.device(_device)
    cache_key = ("gfpgan", str(device), 0)
    if cache_key in _gfpganers:
        return _gfpganers[cache_key]
    cfg = WEIGHTS["gfpgan"]
    weights_path = _get_weights_path(cfg["filename"])
    model_path = weights_path if os.path.exists(weights_path) else cfg["url"]
    restorer = GFPGANer(
        model_path=model_path,
        upscale=1,
        arch="clean",
        channel_multiplier=2,
        bg_upsampler=bg_upsampler,
        device=str(device),
    )
    _gfpganers[cache_key] = restorer
    return restorer


def upscale_image(input_path: str, scale: int = 2, model_name: str = "x4plus", face_enhance: bool = False) -> bytes:
    if scale not in (2, 4, 6):
        raise ValueError("scale must be 2, 4, or 6")

    if model_name not in ("x4plus", "anime6B"):
        raise ValueError("model_name must be 'x4plus' or 'anime6B'")

    upsampler = _get_upsampler("anime6B" if model_name in ("anime6B", "RealESRGAN_x4plus_anime_6B.pth") else "x4plus")

    # Load as RGB then convert to BGR numpy for RealESRGANer
    with Image.open(input_path) as pil_img:
        pil_img = pil_img.convert("RGB")
        img_rgb = np.array(pil_img)
        img_bgr = img_rgb[:, :, ::-1].copy()

    if face_enhance and GFPGANer is not None:
        restorer = _get_gfpganer(upsampler)
        if restorer is not None:
            _, _, output_bgr = restorer.enhance(img_bgr, has_aligned=False, only_center_face=False, paste_back=True)
            if scale and scale != 4:
                # resize to arbitrary outscale like inference script
                h_in, w_in = img_bgr.shape[:2]
                output_bgr = cv2.resize(output_bgr, (int(w_in * scale), int(h_in * scale)), interpolation=cv2.INTER_LANCZOS4)
        else:
            output_bgr, _ = upsampler.enhance(img_bgr, outscale=float(scale))
    else:
        # Enhance using outscale similar to inference_realesrgan.py
        output_bgr, _ = upsampler.enhance(img_bgr, outscale=float(scale))

    # Convert to PIL Image (RGB)
    out_rgb = cv2.cvtColor(output_bgr, cv2.COLOR_BGR2RGB)
    out_img = Image.fromarray(out_rgb)

    buf = BytesIO()
    out_img.save(buf, format="PNG")
    return buf.getvalue()