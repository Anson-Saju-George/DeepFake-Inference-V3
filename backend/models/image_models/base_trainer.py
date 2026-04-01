import os
import time
import random
import logging
import copy
import numpy as np

import torch
import torch.nn as nn
import timm

from tqdm import tqdm
from sklearn.metrics import f1_score, accuracy_score
from torch.amp import autocast, GradScaler
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

from data.dataloader import DatasetBuilder

# ================= DEVICE =================
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


# ================= SEED =================
def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


# ================= LOGGER =================
def setup_logger(save_dir):
    log_path = os.path.join(save_dir, "train.log")

    logger = logging.getLogger(save_dir)
    logger.setLevel(logging.INFO)
    logger.handlers.clear()

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s"
    )

    fh = logging.FileHandler(log_path)
    fh.setFormatter(formatter)

    ch = logging.StreamHandler()
    ch.setFormatter(formatter)

    logger.addHandler(fh)
    logger.addHandler(ch)

    return logger


# ================= EMA =================
class EMA:
    def __init__(self, model, decay):
        self.ema = copy.deepcopy(model).eval()
        self.decay = decay

    def update(self, model):
        with torch.no_grad():
            for ema_p, model_p in zip(self.ema.parameters(), model.parameters()):
                ema_p.data.mul_(self.decay).add_(model_p.data, alpha=1 - self.decay)


# ================= WARMUP =================
def adjust_lr_warmup(optimizer, epoch, config):
    if epoch < config["warmup_epochs"]:
        scale = float(epoch + 1) / config["warmup_epochs"]
        for param_group in optimizer.param_groups:
            param_group["lr"] = config["initial_lr"] * scale


# ================= TRAIN =================
def train_one_epoch(model, loader, optimizer, scaler, criterion, ema, config):

    model.train()
    total_loss = 0
    all_preds, all_labels = [], []

    pbar = tqdm(loader)

    for images, labels in pbar:
        images, labels = images.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()

        with autocast(device_type="cuda"):
            outputs = model(images)
            loss = criterion(outputs, labels)

        scaler.scale(loss).backward()

        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), config["grad_clip"])

        scaler.step(optimizer)
        scaler.update()

        ema.update(model)

        total_loss += loss.item()

        preds = torch.argmax(outputs, dim=1)
        all_preds.extend(preds.detach().cpu().numpy())
        all_labels.extend(labels.detach().cpu().numpy())

        pbar.set_description(f"Loss: {loss.item():.4f}")

    return (
        total_loss / len(loader),
        f1_score(all_labels, all_preds),
        accuracy_score(all_labels, all_preds),
    )


# ================= VALIDATE =================
def validate(model, loader, criterion):

    model.eval()
    total_loss = 0
    all_preds, all_labels = [], []

    with torch.no_grad():
        for images, labels in tqdm(loader):
            images, labels = images.to(DEVICE), labels.to(DEVICE)

            outputs = model(images)
            loss = criterion(outputs, labels)

            total_loss += loss.item()

            preds = torch.argmax(outputs, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    return (
        total_loss / len(loader),
        f1_score(all_labels, all_preds),
        accuracy_score(all_labels, all_preds),
    )


# ================= MAIN =================
def run_training(config):

    set_seed(42)

    os.makedirs(config["save_dir"], exist_ok=True)
    logger = setup_logger(config["save_dir"])

    logger.info(f"🚀 Training started: {config['model_name']}")

    # ================= DATA =================
    builder = DatasetBuilder(root="datasets")
    train_loader, val_loader, _ = builder.get_loaders(
        batch_size=config["batch_size"],
        mode="single",
        dtype="image" # 🔥 CLEAN FILTER
    )

    # ================= MODEL =================
    model = timm.create_model(
        config["model_name"],
        pretrained=True,
        num_classes=2
    ).to(DEVICE)

    # ================= LR =================
    base_lr = config["base_lr"] * (config["batch_size"] / 64)
    config["initial_lr"] = base_lr

    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=base_lr,
        weight_decay=config["weight_decay"]
    )

    # 🔥 Smooth fluctuating LR: Starts at base_lr, decays to min_lr in a wave
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, 
        T_max=config["epochs"], 
        eta_min=config["min_lr"]
    )

    # ================= LOSS =================
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)

    scaler = GradScaler(device="cuda")
    ema = EMA(model, config["ema_decay"])

    best_f1 = 0
    patience_counter = 0

    # ================= TRAIN LOOP =================
    for epoch in range(config["epochs"]):

        start_time = time.time()

        logger.info(f"\n===== EPOCH {epoch+1}/{config['epochs']} =====")

        adjust_lr_warmup(optimizer, epoch, config)

        train_loss, train_f1, _ = train_one_epoch(
            model, train_loader, optimizer, scaler, criterion, ema, config
        )

        val_loss, val_f1, _ = validate(ema.ema, val_loader, criterion)

        scheduler.step()

        current_lr = optimizer.param_groups[0]['lr']
        epoch_time = time.time() - start_time

        logger.info(
            f"LR: {current_lr:.6f} | "
            f"Train Loss: {train_loss:.4f} | Train F1: {train_f1:.4f} | "
            f"Val Loss: {val_loss:.4f} | Val F1: {val_f1:.4f} | "
            f"Time: {epoch_time:.2f}s"
        )

        # ================= SAVE & EARLY STOP =================
        if val_f1 > best_f1 + config["min_delta"]:
            best_f1 = val_f1
            patience_counter = 0

            torch.save(
                ema.ema.state_dict(),
                os.path.join(config["save_dir"], f"best_{val_f1:.4f}.pth")
            )

            logger.info("✅ Model improved and saved")

        else:
            patience_counter += 1
            logger.info(f"⚠️ No significant improvement ({patience_counter}/{config['patience']})")

            if patience_counter >= config["patience"]:
                logger.info("🛑 Early stopping triggered")
                break

    logger.info(f"🏁 Training complete | Best F1: {best_f1:.4f}")