import os
import torch
import timm
from tqdm import tqdm
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score
)

from data.dataloader import DatasetBuilder

# ================= DEVICE =================
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

def load_model(model_name, checkpoint_path):
    print(f"📂 Loading model: {model_name}")
    print(f"📍 From checkpoint: {checkpoint_path}")
    
    model = timm.create_model(
        model_name,
        pretrained=False,
        num_classes=2
    )

    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(f"❌ Checkpoint not found at {checkpoint_path}")

    model.load_state_dict(torch.load(checkpoint_path, map_location=DEVICE))
    model = model.to(DEVICE)
    model.eval()

    return model

def run_evaluation(model_name, checkpoint_path, batch_size=32):
    model = load_model(model_name, checkpoint_path)
    
    print("\n📦 Loading CelebDF Test Set...")
    builder = DatasetBuilder(root="datasets")
    
    # get_loaders already separates CelebDF as the third (test) loader
    _, _, test_loader = builder.get_loaders(
        batch_size=batch_size,
        mode="single",
        dtype="image"
    )

    all_preds = []
    all_labels = []
    all_probs = []

    print(f"🚀 Evaluating {model_name}...")
    with torch.no_grad():
        for images, labels in tqdm(test_loader):
            images = images.to(DEVICE)

            outputs = model(images)

            probs = torch.softmax(outputs, dim=1)[:, 1]
            preds = torch.argmax(outputs, dim=1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            all_probs.extend(probs.cpu().numpy())

    # ================= METRICS =================
    acc = accuracy_score(all_labels, all_preds)
    prec = precision_score(all_labels, all_preds)
    rec = recall_score(all_labels, all_preds)
    f1 = f1_score(all_labels, all_preds)
    cm = confusion_matrix(all_labels, all_preds)
    roc = roc_auc_score(all_labels, all_probs)

    print("\n" + "="*30)
    print(f"📊 CELEBDF EVALUATION: {model_name}")
    print("="*30)
    print(f"Accuracy : {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print(f"ROC-AUC  : {roc:.4f}")

    print("\nConfusion Matrix:")
    print(cm)
    print("="*30)

    return f1
