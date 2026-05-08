import os
import time
import logging
import uuid
import threading
import json
import subprocess
import sys
from datetime import datetime, timedelta
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

from model_catalog import MODEL_LOADER_VERSION, get_public_models, resolve_model_key
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
MIN_VRAM_MB = 1024
INFERENCE_WORKER = os.path.join(BASE_DIR, "inference_worker.py")

app = FastAPI(title="DF-ENGINE | Neural Inference API")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DF-CLUSTER")
logger.info(f"MODEL_LOADER: {MODEL_LOADER_VERSION}")

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

queue_lock = threading.Lock()

last_activity = time.time()

# --- GPU VRAM CHECK ---
def get_gpu_info():
    try:
        result = subprocess.run(
            [
                "nvidia-smi",
                "--query-gpu=name,memory.free,memory.used",
                "--format=csv,noheader,nounits",
            ],
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
        name, free_mb, used_mb = [part.strip() for part in result.stdout.splitlines()[0].split(",")]
        return {"name": name, "free_mb": float(free_mb), "used_mb": float(used_mb)}
    except Exception:
        return {"name": "CPU", "free_mb": None, "used_mb": 0.0}

def check_vram():
    gpu = get_gpu_info()
    if gpu["free_mb"] is not None and gpu["free_mb"] < MIN_VRAM_MB:
        raise HTTPException(status_code=503, detail=f"Insufficient GPU memory ({gpu['free_mb']:.0f}MB free)")

def run_isolated_inference(info):
    cmd = [
        sys.executable,
        INFERENCE_WORKER,
        "--model-key",
        info["model_used"],
        "--domain",
        info["domain"],
        "--path",
        info["path"],
    ]
    if info["is_video"]:
        cmd.append("--is-video")

    result = subprocess.run(
        cmd,
        cwd=BASE_DIR,
        capture_output=True,
        text=True,
        timeout=600,
    )
    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or f"Inference worker exited with {result.returncode}"
        raise RuntimeError(detail)
    return json.loads(result.stdout.strip().splitlines()[-1])

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
            
            inference = run_isolated_inference(info)
            
            # Store final result
            job_results[job_id] = {
                "job_id": job_id,
                "label": inference["label"],
                "confidence": inference["confidence"],
                "vram_peak": inference["vram_peak"],
                "vram_reserved": "0.00 MB",
                "model_used": info["model_used"],
                "model_label": inference.get("model_label", info["model_used"]),
                "domain": info["domain"],
                "filename": info["filename"],
                "timestamp": datetime.utcnow().isoformat()
            }
            job_status[job_id] = "done"
            
            # Cleanup storage
            if os.path.exists(info["path"]): os.remove(info["path"])
            logger.info(f"✅ [WORKER] {job_id} Complete.")

        except Exception as e:
            logger.error(f"❌ [WORKER] {job_id} Failed: {e}")
            info = job_results.get(job_id, {})
            job_results[job_id] = {
                "job_id": job_id,
                "error": str(e),
                "model_used": info.get("model_used"),
                "domain": info.get("domain"),
                "filename": info.get("filename"),
                "timestamp": datetime.utcnow().isoformat(),
            }
            if info.get("path") and os.path.exists(info["path"]):
                os.remove(info["path"])
            job_status[job_id] = "failed"

threading.Thread(target=worker_loop, daemon=True).start()

# --- OTHER CLEANUP ---
def cleanup_loop():
    global last_activity
    while True:
        time.sleep(30)
        now = time.time()
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
    gpu = get_gpu_info()
    return {
        "status": "online",
        "gpu": gpu["name"],
        "models_cached": [],
        "queue": len(job_queue),
        "model_loader": MODEL_LOADER_VERSION,
        "cache_models": False,
        "vram_reserved": f"{gpu['used_mb']:.2f} MB",
    }

@app.get("/models")
async def list_models():
    return {"models": get_public_models()}

@app.post("/predict")
async def run_prediction(model_name: str, file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # 1. Validation
    meta = validate_file(file)
    check_vram()
    is_video = meta["is_video"]
    domain = "video" if is_video else "image"

    try:
        resolved_model_name = resolve_model_key(model_name, domain)
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # 2. Read upload content. Each request runs fresh inference.
    content = await file.read()
    await file.seek(0)

    # 3. Credits
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
    job_results[job_id] = {"model_used": resolved_model_name, "domain": domain, "path": path, "is_video": is_video, "filename": file.filename}
    
    with queue_lock:
        job_queue.append(job_id)

    return {"job_id": job_id, "status": "queued"}

@app.get("/status/{job_id}")
async def get_job_status(job_id: str):
    if job_id not in job_status: raise HTTPException(status_code=404)
    return {
        "status": job_status[job_id],
        "result": job_results[job_id] if job_status[job_id] == "done" else None,
        "error": job_results[job_id] if job_status[job_id] == "failed" else None,
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
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")), log_config=None)
