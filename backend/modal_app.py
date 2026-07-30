import os
from pathlib import Path

import modal

app = modal.App("df-engine")

weights_vol = modal.Volume.from_name("df-engine-weights", create_if_missing=True)

LOCAL_BACKEND_DIR = Path(__file__).resolve().parent
BACKEND_DIR = "/root/backend"
MODELS_DIR = f"{BACKEND_DIR}/models"

# Hugging Face is the single source of truth for weights (same repo the local-gpu
# container's fetch_weights.py pulls). Modal syncs from it into the Volume on cold
# start so the two runtimes can't drift.
HF_REPO = "Anson-Saju-George/deepfake-model-weights"

_weights_synced = False


def _sync_weights_from_hf():
    """Etag-verified pull from HF into the mounted Volume. Runs once per container:
    downloads only missing/changed files (fast no-op when the Volume is current),
    picking up any HF update automatically. Falls back to the cached Volume copy if
    HF is unreachable so inference still serves."""
    global _weights_synced
    if _weights_synced:
        return
    try:
        from huggingface_hub import snapshot_download
        snapshot_download(
            repo_id=HF_REPO,
            repo_type="model",
            local_dir=MODELS_DIR,
            allow_patterns=["image/*", "video/*"],
        )
        try:
            weights_vol.commit()
        except Exception:
            pass
    except Exception as exc:
        print(f"[weights] HF sync skipped ({exc}); serving from cached Volume copy.")
    _weights_synced = True


def ignore_backend_path(path):
    path = Path(path)
    parts = set(path.parts)

    if "__pycache__" in parts or path.suffix == ".pyc":
        return True
    if "models" in parts or "storage" in parts or "temp" in parts:
        return True
    if path.name == ".env" or path.suffix in {".db", ".sqlite", ".sqlite3"}:
        return True
    return False


image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("libgl1", "libglib2.0-0")
    .pip_install("torch==2.6.0", "timm==1.0.12", "opencv-python-headless", "numpy", "pillow", "huggingface_hub")
    .add_local_dir(str(LOCAL_BACKEND_DIR), BACKEND_DIR, copy=True, ignore=ignore_backend_path)
)


@app.function(gpu="T4", image=image, volumes={MODELS_DIR: weights_vol}, timeout=600)
def classify(job_id: str, media_bytes: bytes, model_key: str, domain: str, is_video: bool) -> dict:
    import sys
    import tempfile

    import torch

    _sync_weights_from_hf()  # HF is source of truth; sync into the Volume before loading.

    sys.path.insert(0, BACKEND_DIR)
    from core import load_model_by_name, predict, predict_video_temporal

    suffix = ".mp4" if is_video else ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
        f.write(media_bytes)
        media_path = f.name

    if torch.cuda.is_available():
        torch.cuda.reset_peak_memory_stats()

    model, config = load_model_by_name(model_key, domain=domain)
    if is_video:
        # Temporal clip inference (sample seq_len frames -> one sequence forward pass).
        label, score = predict_video_temporal(model, media_path, seq_len=config.get("seq_len", 4))
    else:
        label, score = predict(model, media_path)

    confidence = score if label == "REAL" else (1 - score)
    vram_peak = torch.cuda.max_memory_allocated() / (1024**2) if torch.cuda.is_available() else 0

    os.remove(media_path)
    return {
        "label": label,
        "confidence": f"{confidence:.2%}",
        "vram_peak": f"{vram_peak:.2f} MB",
        "model_label": config.get("label", model_key),
    }


@app.local_entrypoint()
def main(input: str, model_key: str, domain: str = "image", is_video: bool = False):
    data = open(input, "rb").read()
    out = classify.remote("local-test", data, model_key, domain, is_video)
    print(out)
