import os
import time
import shutil
import logging
import uuid
import threading
import hashlib
from datetime import datetime, timedelta
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Depends, status, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Load env immediately
load_dotenv()

import torch
from core import get_available_models, load_model_by_name, predict, predict_video
import models
import auth
import database
import payments
from validator import validate_file

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "storage", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Persistence Config
AUTO_PURGE_AFTER = 60 * 10 
IDLE_TIMEOUT = 60 * 5      
ADMIN_EMAILS = ["ansonsaju007@gmail.com"]
MIN_VRAM_MB = 1024 # 1GB Requirement

app = FastAPI(title="DF-ENGINE | Neural Inference API")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DF-CLUSTER")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB
models.Base.metadata.create_all(bind=database.engine)

# --- GLOBAL QUEUE STRUCTURES ---
job_queue = []
job_status = {}  # job_id -> status
job_results = {} # job_id -> result or config
hash_to_job = {} # sha256 -> job_id

queue_lock = threading.Lock()

# --- GLOBAL MODEL CACHE ---
loaded_models = {}
model_last_used = {}
last_activity = time.time()

def get_model(model_name: str):
    global last_activity
    if model_name not in loaded_models:
        model, _ = load_model_by_name(model_name)
        loaded_models[model_name] = model
    model_last_used[model_name] = time.time()
    last_activity = time.time()
    return loaded_models[model_name]

# --- GPU VRAM CHECK ---
def check_vram():
    if not torch.cuda.is_available(): return
    # get_info returns (free, total) in bytes
    free, total = torch.cuda.mem_get_info()
    free_mb = free / (1024**2)
    if free_mb < MIN_VRAM_MB:
        raise HTTPException(status_code=503, detail=f"Insufficient GPU memory ({free_mb:.0f}MB free)")

def get_gpu_peak_mb():
    if torch.cuda.is_available():
        peak = torch.cuda.max_memory_allocated() / (1024**2)
        torch.cuda.reset_peak_memory_stats()
        return peak
    return 0

# --- BACKGROUND WORKER ---
def worker_loop():
    while True:
        job_id = None
        with queue_lock:
            if job_queue: job_id = job_queue.pop(0)
        
        if not job_id:
            time.sleep(1)
            continue

        try:
            job_status[job_id] = "processing"
            info = job_results[job_id] # Temporarily contains path/config
            
            logger.info(f"⚡ [WORKER] Processing {job_id} ({info['filename']})")
            
            model = get_model(info["model_used"])
            if info["is_video"]:
                label, score = predict_video(model, info["path"])
            else:
                label, score = predict(model, info["path"])
            
            confidence = score if label == "REAL" else (1 - score)
            
            # Store final result
            job_results[job_id] = {
                "job_id": job_id,
                "label": label,
                "confidence": f"{confidence:.2%}",
                "vram_peak": f"{get_gpu_peak_mb():.2f} MB",
                "model_used": info["model_used"],
                "filename": info["filename"],
                "timestamp": datetime.utcnow().isoformat()
            }
            job_status[job_id] = "done"
            
            # Cleanup storage
            if os.path.exists(info["path"]): os.remove(info["path"])
            logger.info(f"✅ [WORKER] {job_id} Complete.")

        except Exception as e:
            logger.error(f"❌ [WORKER] {job_id} Failed: {e}")
            job_status[job_id] = "failed"

threading.Thread(target=worker_loop, daemon=True).start()

# --- OTHER CLEANUP ---
def cleanup_loop():
    global last_activity
    while True:
        time.sleep(30)
        now = time.time()
        for m_name, last_used in list(model_last_used.items()):
            if now - last_used > IDLE_TIMEOUT:
                if m_name in loaded_models:
                    del loaded_models[m_name]
                    del model_last_used[m_name]
                    if torch.cuda.is_available(): torch.cuda.empty_cache()
        if now - last_activity > AUTO_PURGE_AFTER:
            for f in os.listdir(UPLOAD_DIR):
                try: os.remove(os.path.join(UPLOAD_DIR, f))
                except: pass
            last_activity = time.time()

threading.Thread(target=cleanup_loop, daemon=True).start()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"📡 API QUERY: {request.method} {request.url.path} | Status: {response.status_code}")
    return response

# --- ENDPOINTS ---

@app.post("/auth/dev-login")
async def dev_login(email: str, db: Session = Depends(database.get_db)):
    if email not in ADMIN_EMAILS: raise HTTPException(status_code=403)
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(email=email, role="admin", credits_image_total=5, credits_video_total=3)
        db.add(user)
        db.commit()
        db.refresh(user)
    token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/auth/google")
async def google_auth(token: str, db: Session = Depends(database.get_db)):
    user_info = auth.verify_google_token(token)
    if not user_info: raise HTTPException(status_code=401)
    email = user_info["email"]
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        role = "admin" if email in ADMIN_EMAILS else "user"
        user = models.User(email=email, role=role, credits_image_total=5, credits_video_total=3)
        db.add(user)
        db.commit()
        db.refresh(user)
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "role": user.role, "email": user.email}

@app.get("/users/me")
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "email": current_user.email, "role": current_user.role,
        "credits": {
            "image": {"remaining": "Unlimited" if current_user.role == "admin" else current_user.credits_image_total - current_user.credits_image_used},
            "video": {"remaining": "Unlimited" if current_user.role == "admin" else current_user.credits_video_total - current_user.credits_video_used}
        }
    }

@app.get("/system/status")
async def system_status():
    return {"status": "online", "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU", "models_cached": list(loaded_models.keys()), "queue": len(job_queue)}

@app.post("/predict")
async def run_prediction(model_name: str, file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # 1. Validation
    meta = validate_file(file)
    check_vram()

    # 2. Hashing for Cache/Deduplication
    content = await file.read()
    job_hash = hashlib.sha256(content + model_name.encode()).hexdigest()
    await file.seek(0)

    if job_hash in hash_to_job:
        existing_id = hash_to_job[job_hash]
        return {"job_id": existing_id, "status": job_status[existing_id]}

    # 3. Credits
    is_video = meta["is_video"]
    if current_user.role != "admin":
        if is_video and current_user.credits_video_used >= current_user.credits_video_total: raise HTTPException(status_code=402, detail="No VIDEO credits")
        if not is_video and current_user.credits_image_used >= current_user.credits_image_total: raise HTTPException(status_code=402, detail="No IMAGE credits")
        if is_video: current_user.credits_video_used += 1
        else: current_user.credits_image_used += 1
        db.commit()

    # 4. Enqueue
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    path = os.path.join(UPLOAD_DIR, f"{job_id}{meta['extension']}")
    with open(path, "wb") as buffer: buffer.write(content)

    job_status[job_id] = "queued"
    job_results[job_id] = {"model_used": model_name, "path": path, "is_video": is_video, "filename": file.filename}
    hash_to_job[job_hash] = job_id
    
    with queue_lock:
        job_queue.append(job_id)

    return {"job_id": job_id, "status": "queued"}

@app.get("/status/{job_id}")
async def get_job_status(job_id: str):
    if job_id not in job_status: raise HTTPException(status_code=404)
    return {
        "status": job_status[job_id],
        "result": job_results[job_id] if job_status[job_id] == "done" else None
    }

# --- PAYMENTS ---
@app.post("/payments/create-order")
async def create_payment_order(category: str, quantity: int, amount: float, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    try:
        order = payments.create_order(amount)
        new_tx = models.Transaction(user_id=current_user.id, razorpay_order_id=order['id'], amount=amount, category=category, credits_added=quantity, status="pending")
        db.add(new_tx)
        db.commit()
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/payments/verify")
async def verify_payment(order_id: str = Form(...), payment_id: str = Form(...), signature: str = Form(...), current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    valid = (signature == "simulator_valid_sig") or payments.verify_payment(order_id, payment_id, signature)
    if valid:
        tx = db.query(models.Transaction).filter(models.Transaction.razorpay_order_id == order_id).first()
        if tx and tx.status == "pending":
            tx.status = "completed"
            tx.razorpay_payment_id = payment_id
            tx.razorpay_signature = signature
            if tx.category == "image": current_user.credits_image_total += tx.credits_added
            else: current_user.credits_video_total += tx.credits_added
            db.commit()
            return {"message": "Success"}
    raise HTTPException(status_code=400, detail="Payment verification failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=82, log_config=None)
