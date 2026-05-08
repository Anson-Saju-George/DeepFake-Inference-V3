import json
import os
import re

import cv2
import numpy as np
import timm
import torch
from PIL import Image
from torchvision import transforms

from model_catalog import (
    MODEL_LOADER_VERSION,
    get_available_models,
    get_public_models,
    resolve_model_key,
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
THRESHOLD = 0.50

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def load_model_by_name(model_key, domain=None):
    available = get_available_models(domain)
    if model_key not in available:
        raise ValueError(f"Model '{model_key}' not found for domain '{domain or 'any'}'.")

    config = available[model_key]
    model = timm.create_model(config["model_name"], pretrained=False, num_classes=2)
    checkpoint = torch.load(config["path"], map_location=DEVICE)
    if isinstance(checkpoint, dict):
        state_dict = (
            checkpoint.get("state_dict")
            or checkpoint.get("model_state_dict")
            or checkpoint.get("model")
            or checkpoint
        )
    else:
        state_dict = checkpoint

    if isinstance(state_dict, dict):
        cleaned_state_dict = {}
        for key, value in state_dict.items():
            clean_key = key
            for prefix in ("module.", "model.", "backbone."):
                if clean_key.startswith(prefix):
                    clean_key = clean_key[len(prefix):]
            cleaned_state_dict[clean_key] = value
        state_dict = cleaned_state_dict

    model.load_state_dict(state_dict)
    model = model.to(DEVICE)
    model.eval()
    return model, config


def get_latest_model(domain=None):
    available = get_available_models(domain)
    if not available:
        raise FileNotFoundError("No model checkpoints found.")
    best_key = max(available, key=lambda key: available[key].get("score") or -1.0)
    return load_model_by_name(best_key, domain=domain)


def _predict_tensor(model, image_tensor):
    with torch.no_grad():
        output = model(image_tensor)
        probabilities = torch.softmax(output, dim=1)
        return probabilities[0][1].item()


def predict(model, image_path):
    image = Image.open(image_path).convert("RGB")
    image_tensor = transform(image).unsqueeze(0).to(DEVICE)
    real_prob = _predict_tensor(model, image_tensor)
    label = "REAL" if real_prob > THRESHOLD else "FAKE"
    return label, real_prob


def predict_video(model, video_path, num_frames=20):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        raise ValueError(f"Video has no frames: {video_path}")

    indices = np.linspace(0, total_frames - 1, min(num_frames, total_frames), dtype=int)
    scores = []

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            continue

        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image = Image.fromarray(frame)
        image_tensor = transform(image).unsqueeze(0).to(DEVICE)
        scores.append(_predict_tensor(model, image_tensor))

    cap.release()
    if not scores:
        raise ValueError("No frames could be read.")

    avg_real_prob = sum(scores) / len(scores)
    label = "REAL" if avg_real_prob > THRESHOLD else "FAKE"
    return label, avg_real_prob
