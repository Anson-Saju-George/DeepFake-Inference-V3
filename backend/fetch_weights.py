"""Pull DF-Engine model weights from Hugging Face into backend/models/{image,video}.

Run manually (`python fetch_weights.py`) or wire into container startup. Skips the
download if backend/models/<domain> already contains at least one best.pth.
"""
import os

from huggingface_hub import snapshot_download

REPO_ID = "Anson-Saju-George/deepfake-model-weights"
REPO_TYPE = "model"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")


def _domain_has_weights(domain):
    domain_dir = os.path.join(MODELS_DIR, domain)
    if not os.path.isdir(domain_dir):
        return False
    for root, _dirs, files in os.walk(domain_dir):
        if "best.pth" in files:
            return True
    return False


def fetch():
    missing = [d for d in ("image", "video") if not _domain_has_weights(d)]
    if not missing:
        print("All domains already have weights on disk; skipping download.")
        return

    print(f"Fetching weights for domains: {missing}")
    snapshot_download(
        repo_id=REPO_ID,
        repo_type=REPO_TYPE,
        local_dir=MODELS_DIR,
        allow_patterns=[f"{d}/*" for d in missing],
    )
    print("Weights fetched.")


if __name__ == "__main__":
    fetch()
