import os
import torch
import timm
import cv2
import numpy as np
from PIL import Image
from torchvision import transforms

# Device setup
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model configuration mapping based on directory names
MODEL_MAP = {
    "convnext": "convnext_base",
    "resnet50": "resnet50.a1_in1k",
    "efficientnet": "tf_efficientnet_b4"
}

# Standard transforms for models like ViT and ConvNext
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def get_available_models():
    """Returns a list of available models and their best scores."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.join(current_dir, "models", "image_models")
    
    available = {}
    
    if not os.path.exists(base_path):
        return available

    for model_dir in os.listdir(base_path):
        # Only include architectures defined in MODEL_MAP
        model_key = model_dir.split('_')[0]
        if model_key not in MODEL_MAP:
            continue
            
        dir_path = os.path.join(base_path, model_dir)
        if not os.path.isdir(dir_path):
            continue
            
        checkpoint_dir = os.path.join(dir_path, "checkpoints")
        if not os.path.exists(checkpoint_dir):
            continue
            
        best_score = -1.0
        best_path = None
        
        for file in os.listdir(checkpoint_dir):
            if file.startswith("best_") and file.endswith(".pth"):
                try:
                    score = float(file.replace("best_", "").replace(".pth", ""))
                    if score > best_score:
                        best_score = score
                        best_path = os.path.join(checkpoint_dir, file)
                except ValueError:
                    continue
        
        if best_path:
            available[model_dir] = {
                "score": best_score,
                "path": best_path,
                "model_name": MODEL_MAP.get(model_dir.split('_')[0], model_dir.split('_')[0])
            }
            
    return available

def load_model_by_name(model_key):
    """Loads a specific model by its key (e.g., 'vit', 'convnext')."""
    available = get_available_models()
    if model_key not in available:
        raise ValueError(f"❌ Model '{model_key}' not found or has no checkpoints.")
    
    config = available[model_key]
    print(f"📂 Loading {model_key} model...")
    print(f"📍 Checkpoint: {config['path']}")
    
    model = timm.create_model(config['model_name'], pretrained=False, num_classes=2)
    model.load_state_dict(torch.load(config['path'], map_location=DEVICE))
    model = model.to(DEVICE)
    model.eval()
    return model, config

def get_latest_model():
    """Finds and loads the best overall model across all architectures."""
    available = get_available_models()
    if not available:
        raise FileNotFoundError("❌ No model checkpoints found!")
    
    # Sort by score descending
    best_key = max(available, key=lambda k: available[k]['score'])
    return load_model_by_name(best_key)

# Detection Threshold
THRESHOLD = 0.50

def predict(model, image_path):
    """Takes a path to an image and returns the prediction and confidence."""
    image = Image.open(image_path).convert("RGB")
    image_tensor = transform(image).unsqueeze(0).to(DEVICE)
    
    with torch.no_grad():
        output = model(image_tensor)
        probabilities = torch.softmax(output, dim=1)
        # Class 1 is REAL, Class 0 is FAKE
        real_prob = probabilities[0][1].item()
        label = "REAL" if real_prob > THRESHOLD else "FAKE"
        
    return label, real_prob

def predict_video(model, video_path, num_frames=20):
    """Samples frames from a video and returns the average prediction."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"❌ Could not open video: {video_path}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        raise ValueError(f"❌ Video has no frames: {video_path}")

    indices = np.linspace(0, total_frames - 1, min(num_frames, total_frames), dtype=int)
    scores = []
    
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret: continue
            
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image = Image.fromarray(frame)
        image_tensor = transform(image).unsqueeze(0).to(DEVICE)
        
        with torch.no_grad():
            output = model(image_tensor)
            probabilities = torch.softmax(output, dim=1)
            scores.append(probabilities[0][1].item())
            
    cap.release()
    if not scores:
        raise ValueError("❌ No frames could be read.")
        
    avg_real_prob = sum(scores) / len(scores)
    label = "REAL" if avg_real_prob > THRESHOLD else "FAKE"
    return label, avg_real_prob
