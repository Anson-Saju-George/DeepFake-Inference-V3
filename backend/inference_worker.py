import argparse
import gc
import json
import sys

import torch

from core import load_model_by_name, predict, predict_video


def main():
    parser = argparse.ArgumentParser(description="Run one isolated inference job.")
    parser.add_argument("--model-key", required=True)
    parser.add_argument("--domain", required=True, choices=["image", "video"])
    parser.add_argument("--path", required=True)
    parser.add_argument("--is-video", action="store_true")
    args = parser.parse_args()

    if torch.cuda.is_available():
        torch.cuda.reset_peak_memory_stats()

    model, config = load_model_by_name(args.model_key, domain=args.domain)
    if args.is_video:
        # Frame-average the single-frame classifier over 20 sampled frames.
        label, score = predict_video(model, args.path, num_frames=20)
    else:
        label, score = predict(model, args.path)

    confidence = score if label == "REAL" else (1 - score)
    vram_peak = torch.cuda.max_memory_allocated() / (1024**2) if torch.cuda.is_available() else 0

    payload = {
        "label": label,
        "score": score,
        "confidence": f"{confidence:.2%}",
        "vram_peak": f"{vram_peak:.2f} MB",
        "model_label": config.get("label", args.model_key),
    }

    del model
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.synchronize()
        torch.cuda.empty_cache()
        torch.cuda.ipc_collect()

    print(json.dumps(payload), flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stderr, flush=True)
        raise
