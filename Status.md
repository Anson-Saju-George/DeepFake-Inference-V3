# DF-ENGINE Project Technical Status Report

**Project Version:** 4.0.0 Research Demo  
**Last Updated:** May 8, 2026  
**Environment:** React 19 + Vite + Tailwind + FastAPI + SQLite + local CUDA inference

---

## 1. Current Project Shape

DF-Engine is now a flattened React/Vite application at the repository root with the FastAPI backend in `backend/`.

The old nested `deep-fake-app/` folder has been removed. Frontend source now lives directly in:

- `src/`
- `index.html`
- `vite.config.js`
- `package.json`

Backend source lives in:

- `backend/main.py`
- `backend/core.py`
- `backend/model_catalog.py`
- `backend/inference_worker.py`
- `backend/auth.py`
- `backend/database.py`
- `backend/models.py`
- `backend/payments.py`
- `backend/validator.py`

Local-only folders are ignored by Git:

- `backend/models/`
- `backend/temp/`
- `backend/samples/`
- `backend/.env`
- `node_modules/`
- `dist/`

---

## 2. Research and Model Status

The project now treats image and video deepfake detection as separate inference domains instead of one pooled task.

### Image Domain

Image uploads are routed to image-trained spatial models.

Current visible model family:

- ConvNeXt image models
- Swin image models
- ViT image models

Best displayed image benchmark:

- **ConvNeXt-Base Image**
- **98.63% accuracy**
- **0.9863 F1**
- Dataset family: `image_combined`

### Video Domain

Video uploads are routed to video-trained models. The backend distinguishes raw video inference from image inference before model resolution.

Current visible video model family:

- ConvNeXt spatial video
- ConvNeXt hybrid video
- ConvNeXt sequence video
- Swin video
- MaxViT hybrid video

Best displayed video benchmark:

- **ConvNeXt Hybrid / Sequence Video**
- **90.89% accuracy**
- **0.7841 F1**
- Dataset family: `video_combined`

### Important Implementation Note

The public model list is discovered from local model metadata in `backend/models/`, but that directory is intentionally ignored by Git. Runtime machines must have the model folders and checkpoint files present locally.

---

## 3. Backend Architecture

The backend has been refactored around domain-aware model discovery and isolated inference.

### Active Runtime Flow

1. Frontend uploads an image or video to `/predict`.
2. `backend/validator.py` classifies the upload as image or video.
3. `backend/model_catalog.py` resolves the requested model key against the correct domain.
4. The job is queued by `backend/main.py`.
5. `backend/inference_worker.py` runs inference in a separate Python subprocess.
6. The subprocess exits after inference, releasing model memory instead of keeping weights resident in the API process.
7. `/status/{job_id}` returns the final result.

### Why Subprocess Inference Is Used

Earlier versions kept models loaded in the main API process and attempted cache/offload management. The current design avoids persistent model residency by running each inference in an isolated worker process.

Current behavior:

- No long-lived model cache in the FastAPI process
- `models_cached` reports an empty list
- `cache_models` reports `false`
- Result payload reports `vram_reserved: "0.00 MB"`
- CUDA context residue may still exist at the driver/process level while active processes are running, but model weights are not intentionally retained by the app

### Backend API Port

Development backend runs on:

```bash
http://127.0.0.1:8000
```

Run it with:

```bash
cd backend
python main.py
```

---

## 4. Frontend Architecture

The frontend is served by Vite with base path:

```js
base: "/deepfake/"
```

API calls are proxied through:

```text
/deepfake/api -> http://127.0.0.1:8000
```

Main frontend areas:

- Hero section with current image/video benchmark highlights
- Research lifecycle page at `/deepfake/research`
- Multi-architecture inference engine section
- Inference pipeline section
- Technical benchmarks section
- Live demo with image/video domain-aware model selection
- Compact credit purchase section
- Footer links to GitHub, Hugging Face datasets, and Hugging Face model weights

The navbar logo and `DF-ENGINE` brand link now route back to the home hero section.

---

## 5. Auth, Credits, and Payments

The backend keeps SQLAlchemy database models in `backend/models.py`. This file is required and should not be confused with ML model files.

It defines:

- `User`
- `Job`
- `Transaction`

Implemented account features:

- Google OAuth login
- Admin dev login route
- Separate image and video credit accounting
- Razorpay order creation and verification

---

## 6. Verification Status

Latest checks completed successfully:

```bash
npm run build
python -m py_compile backend\main.py backend\core.py backend\model_catalog.py backend\inference_worker.py backend\auth.py backend\database.py backend\models.py backend\payments.py backend\validator.py
```

`npm run build` passes with only the standard Vite large chunk warning.

`npm run lint` currently fails on code-quality rules that are not related to the folder move:

- unused caught error variables
- React hook lint warnings for synchronous state updates inside effects
- `Math.random()` used during render in the architecture visualization
- a mutable local index in the research content renderer

The deleted `deep-fake-app/` folder is not referenced by active runtime files.

---

## 7. Current Commit Notes

Expected staged changes include:

- flattened frontend from `deep-fake-app/` to repo root
- updated `.gitignore`
- backend subprocess inference worker
- domain-aware model catalog
- frontend research/live demo/benchmark/copy updates
- removal of old tracked sample media and old model training scripts

`backend/models/` is intentionally ignored and should not be committed.

