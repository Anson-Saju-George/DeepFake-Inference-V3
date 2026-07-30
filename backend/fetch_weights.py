"""Pull DF-Engine model files from Hugging Face into backend/models/{image,video}.

Two modes:
  full (default)   : pull best.pth + config.json + final_summary.json (local-gpu runs
                     inference locally, so it needs the weights).
  --metadata-only  : pull only config.json + final_summary.json (modal mode - the web
                     container just builds the model catalog; real weights live on Modal).

Skips a domain that already has the relevant marker on disk. Hugging Face is the single
source of truth for both runtimes.
"""
import os
import sys

from huggingface_hub import snapshot_download

REPO_ID = "Anson-Saju-George/deepfake-model-weights"
REPO_TYPE = "model"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")


def _domain_has(domain, marker):
    domain_dir = os.path.join(MODELS_DIR, domain)
    if not os.path.isdir(domain_dir):
        return False
    for _root, _dirs, files in os.walk(domain_dir):
        if marker in files:
            return True
    return False


def fetch(metadata_only=False):
    marker = "config.json" if metadata_only else "best.pth"
    missing = [d for d in ("image", "video") if not _domain_has(d, marker)]
    if not missing:
        print(f"All domains already have {marker} on disk; skipping download.")
        return

    kind = "metadata" if metadata_only else "weights"
    print(f"Fetching {kind} for domains: {missing}")
    if metadata_only:
        patterns = []
        for d in missing:
            patterns += [f"{d}/**/config.json", f"{d}/**/final_summary.json"]
    else:
        patterns = [f"{d}/*" for d in missing]

    snapshot_download(
        repo_id=REPO_ID,
        repo_type=REPO_TYPE,
        local_dir=MODELS_DIR,
        allow_patterns=patterns,
    )
    print(f"{kind.capitalize()} fetched.")


if __name__ == "__main__":
    fetch(metadata_only="--metadata-only" in sys.argv)
