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


def _score_from_filename(filename):
    match = re.search(r"_f1-([0-9.]+)\.pth$", filename)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def _best_checkpoint(model_dir):
    best = None
    for filename in os.listdir(model_dir):
        if not filename.startswith("best_") or not filename.endswith(".pth"):
            continue
        score = _score_from_filename(filename)
        candidate = {
            "path": os.path.join(model_dir, filename),
            "filename": filename,
            "score": score if score is not None else -1.0,
        }
        if best is None or candidate["score"] > best["score"]:
            best = candidate
    return best


def _load_model_metadata(model_dir):
    config = {}
    summary = {}

    for filename in os.listdir(model_dir):
        path = os.path.join(model_dir, filename)
        if filename.startswith("config_") and filename.endswith(".json"):
            config = _read_json(path)
        elif filename.startswith("final_summary_") and filename.endswith(".json"):
            payload = _read_json(path)
            metrics = payload.get("test_metrics", {})
            current_score = metrics.get("f1", payload.get("best_val_f1", -1.0))
            previous_metrics = summary.get("test_metrics", {})
            previous_score = previous_metrics.get("f1", summary.get("best_val_f1", -1.0))
            if not summary or current_score > previous_score:
                summary = payload

    return config, summary


def _discover_domain_models(domain):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.join(current_dir, "models", domain)
    available = {}

    if not os.path.isdir(base_path):
        return available

    for dirname in sorted(os.listdir(base_path)):
        model_dir = os.path.join(base_path, dirname)
        if not os.path.isdir(model_dir):
            continue

        checkpoint = _best_checkpoint(model_dir)
        if not checkpoint:
            continue

        config, summary = _load_model_metadata(model_dir)
        metrics = summary.get("test_metrics", {})
        model_name = config.get("model_name") or summary.get("model_name")
        if not model_name:
            continue

        family = config.get("family") or dirname.split("_", 1)[0]
        mode = config.get("mode") or ("single" if domain == "video" else "image")
        category = config.get("category") or domain
        key = f"{domain}_{_slug(dirname)}"

        available[key] = {
            "key": key,
            "domain": domain,
            "label": f"{family} {model_name}".replace("_", " "),
            "family": family,
            "model_name": model_name,
            "path": checkpoint["path"],
            "checkpoint": checkpoint["filename"],
            "score": metrics.get("f1", summary.get("best_val_f1", checkpoint["score"])),
            "accuracy": metrics.get("acc", summary.get("best_val_acc")),
            "mode": mode,
            "category": category,
            "seq_len": int(config.get("seq_len") or (8 if mode == "sequence" else 1)),
            "experiment_no": summary.get("experiment_no") or config.get("experiment_no"),
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
