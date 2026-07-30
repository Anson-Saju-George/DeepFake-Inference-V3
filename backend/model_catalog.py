import json
import os
import re


MODEL_LOADER_VERSION = "domain-discovery-v3-subprocess"


def _slug(value):
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")


def _read_json(path):
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, json.JSONDecodeError):
        return {}


# Real Hugging Face export layout (Anson-Saju-George/deepfake-model-weights):
#   models/<domain>/<Family>_<model_name>/<experiment_id>/{best.pth, config.json, final_summary.json}
# best.pth carries no score in its filename; score comes from final_summary.json/config.json.

def _load_model_metadata(experiment_dir):
    config = _read_json(os.path.join(experiment_dir, "config.json"))
    summary = _read_json(os.path.join(experiment_dir, "final_summary.json"))
    return config, summary


def _discover_domain_models(domain):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.join(current_dir, "models", domain)
    available = {}

    if not os.path.isdir(base_path):
        return available

    for root, _dirs, files in os.walk(base_path):
        # Discover by metadata, not the weight file. In modal mode the web container holds
        # only config.json/final_summary.json (weights live on Modal), so keying off
        # config.json lets it build the catalog; best.pth still names the (Modal-side)
        # weight for the loader, and local-gpu has both files present anyway.
        if "config.json" not in files:
            continue

        config, summary = _load_model_metadata(root)
        metrics = summary.get("test_metrics", {})
        model_name = config.get("model_name") or summary.get("model_name")
        if not model_name:
            continue

        experiment_no = summary.get("experiment_no") or config.get("experiment_no") or os.path.basename(root)
        family = config.get("family") or os.path.basename(os.path.dirname(root)).split("_", 1)[0]
        mode = config.get("mode") or ("single" if domain == "video" else "image")
        category = config.get("category") or domain
        key = f"{domain}_{_slug(experiment_no)}"

        available[key] = {
            "key": key,
            "domain": domain,
            "label": f"{family} {model_name}".replace("_", " "),
            "family": family,
            "model_name": model_name,
            "path": os.path.join(root, "best.pth"),
            "checkpoint": "best.pth",
            "score": metrics.get("f1", summary.get("best_val_f1", -1.0)),
            "accuracy": metrics.get("acc", summary.get("best_val_acc")),
            "mode": mode,
            "category": category,
            "seq_len": int(config.get("seq_len") or (8 if mode == "sequence" else 1)),
            "experiment_no": experiment_no,
            "dataset_scope": summary.get("dataset_scope") or config.get("dataset_scope"),
            "description": config.get("what_it_tests") or config.get("description") or "",
        }

    return available


def get_available_models(domain=None):
    available = {}
    domains = [domain] if domain else ["image", "video"]
    for item in domains:
        available.update(_discover_domain_models(item))
    return available


def get_public_models():
    models = get_available_models()
    return [
        {
            "key": config["key"],
            "domain": config["domain"],
            "label": config["label"],
            "family": config["family"],
            "model_name": config["model_name"],
            "score": config["score"],
            "accuracy": config["accuracy"],
            "mode": config["mode"],
            "category": config["category"],
            "seq_len": config["seq_len"],
            "experiment_no": config["experiment_no"],
            "dataset_scope": config["dataset_scope"],
            "description": config["description"],
        }
        for config in sorted(models.values(), key=lambda item: (item["domain"], -(item["score"] or 0), item["label"]))
    ]


def resolve_model_key(model_key, domain):
    available = get_available_models(domain)
    if model_key in available:
        return model_key

    best_key = None
    best_score = -1.0
    for key, config in available.items():
        score = config.get("score") or -1.0
        if score > best_score:
            best_key = key
            best_score = score

    if best_key:
        return best_key
    raise FileNotFoundError(f"No {domain} model checkpoints found.")
