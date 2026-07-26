# Modal-Architecture.md — DF-Engine GPU Inference on Modal

**Authoritative design spec.** Implement to this document; do not improvise the architecture.
Source of truth for how DF-Engine routes classification inference to Modal. Mirrors the WMS
Modal-Architecture.md pattern; adapted for classification (small output) instead of video
interpolation (large output).

---

## 1. Goal

Move ConvNeXt/ViT deepfake-classification inference off the local GPU and onto **Modal**
(serverless GPU), so:
- The DF-Engine web container is **CPU-only and thin** (no torch/CUDA/timm/opencv-with-CUDA).
- GPU work runs in **ephemeral Modal containers** that exit after each job → VRAM returns to 0
  automatically — the platform-level version of the per-job subprocess isolation DF-Engine
  already implements locally via `backend/inference_worker.py`.
- A single env flag switches backends: `INFERENCE_BACKEND_MODAL=true` → Modal; `false` → the
  existing local subprocess path (`run_isolated_inference` in `main.py`, unchanged for dev/local-GPU).

DF-Engine's existing **async job model** (upload → `job_id` → poll `/deepfake/api/status/{job_id}`)
is preserved 1:1 — Modal's `.spawn()` + `FunctionCall` map directly onto it, exactly as with WMS.

**Why this port is easier than WMS's:** `inference_worker.py` already *is* the per-job-isolated
inference function — it's a standalone script that loads one model, runs one prediction, and exits.
Porting it to Modal is close to a direct copy-paste of its `main()` body into an `@app.function`.
Also, unlike WMS (which returns an interpolated video file), DF-Engine's output is a tiny JSON
payload (label + confidence + vram_peak) — there is no "large output file" problem to solve at all.

---

## 2. Big picture

```
DF-Engine container (CPU, thin: FastAPI + modal client + opencv-headless; NO torch/CUDA/timm)
   /deepfake/api/predict   → validate → resolve_model_key(domain) → fn.spawn(job_id, media_bytes,
                              model_key, domain) → store returned Modal call_id on the job
   /deepfake/api/status/{id} → FunctionCall.from_id(call_id).get(timeout=0)
   (no /download route — the result IS the JSON payload, no file to serve back)
        ▲  (authenticated by MODAL_TOKEN_ID / MODAL_TOKEN_SECRET)
        ▼
Modal App "df-engine"  →  classify() @app.function(gpu="T4")
   ephemeral GPU container: mount weights (Volume) → load_model_by_name + predict/predict_video
   → return {label, confidence, vram_peak, model_label} → container EXITS (VRAM → 0)
```

---

## 3. Modal primitives we use

| Primitive | Choice | Why |
|---|---|---|
| `modal.App` | `App("df-engine")` | one app, `modal deploy` unit |
| `modal.Image` | `debian_slim().apt_install("libgl1","libglib2.0-0").pip_install("torch==2.6.0","timm==1.0.12","opencv-python-headless","numpy","pillow")` | standard cu12x torch works on Modal's T4/L4 — the `cu130`/`sm_120` pin in the local Dockerfile is specific to the local RTX 5080 and irrelevant here |
| `@app.function(gpu="T4")` | the `classify` function | ephemeral GPU container per call; T4 (16GB, ~$0.59/hr, per-second) is ample for a single-image/frame-sampled ConvNeXt/ViT forward pass |
| `modal.Volume` | `df-engine-weights` | holds the domain-organized checkpoints + `config_*.json`/`final_summary_*.json` metadata that `model_catalog.py` discovers at runtime |
| `.spawn()` + `FunctionCall` | async dispatch + poll | maps onto DF-Engine's existing `job_queue`/`job_status`/`job_results` model |
| `@app.local_entrypoint()` | `main()` | `modal run backend/modal_app.py --input sample.jpg --model-key <key> --domain image` for local testing |
| `modal deploy` / `modal serve` | deploy / dev live-reload | deploy the function DF-Engine calls |
| Modal API token | `MODAL_TOKEN_ID` / `MODAL_TOKEN_SECRET` | authenticates the DF-Engine container's `.spawn()`/`FunctionCall` calls |

**Invocation choice:** `.spawn()` + `FunctionCall.from_id(call_id).get(timeout=0)`, **not** a web
endpoint — same reasoning as WMS: native async polling fits the existing job/status routes without
any contract change on `/deepfake/api/status/{job_id}`.

No `modal.Dict` progress-sharing is needed here (unlike WMS's frame-by-frame interpolation
progress bar) — classification is a single forward pass (or a short frame-sampling loop capped at
20 frames), fast enough that a binary queued → processing → done/failed status is sufficient.

---

## 4. `backend/modal_app.py` — reference design

```python
import modal

app = modal.App("df-engine")

weights_vol = modal.Volume.from_name("df-engine-weights", create_if_missing=True)

WEIGHTS_DIR = "/weights"

image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("libgl1", "libglib2.0-0")
    .pip_install("torch==2.6.0", "timm==1.0.12", "opencv-python-headless", "numpy", "pillow")
    # ship the inference code (NOT the weights) into the image:
    .add_local_dir("backend", "/root/backend", copy=True,
                   ignore=["storage", "*.db", "__pycache__", "temp", "models"])
)


@app.function(gpu="T4", image=image, volumes={WEIGHTS_DIR: weights_vol}, timeout=300)
def classify(job_id: str, media_bytes: bytes, model_key: str, domain: str, is_video: bool) -> dict:
    import os
    import sys
    import tempfile

    sys.path.insert(0, "/root/backend")
    # model_catalog.py's _discover_domain_models scans "<backend>/models/<domain>/..." —
    # point it at the mounted Volume instead by monkeypatching its base path, OR (simpler,
    # matches WMS's convention) mount the Volume directly at /root/backend/models so the
    # existing discovery code needs zero changes:
    #   volumes={"/root/backend/models": weights_vol}
    from core import load_model_by_name, predict, predict_video
    import torch

    suffix = ".mp4" if is_video else ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
        f.write(media_bytes)
        media_path = f.name

    if torch.cuda.is_available():
        torch.cuda.reset_peak_memory_stats()

    model, config = load_model_by_name(model_key, domain=domain)
    if is_video:
        label, score = predict_video(model, media_path, num_frames=config.get("seq_len", 20))
    else:
        label, score = predict(model, media_path)

    confidence = score if label == "REAL" else (1 - score)
    vram_peak = torch.cuda.max_memory_allocated() / (1024**2) if torch.cuda.is_available() else 0

    os.remove(media_path)
    return {
        "label": label,
        "confidence": f"{confidence:.2%}",
        "vram_peak": f"{vram_peak:.2f} MB",
        "model_label": config.get("label", model_key),
    }


@app.local_entrypoint()
def main(input: str, model_key: str, domain: str = "image", is_video: bool = False):
    data = open(input, "rb").read()
    out = classify.remote("local-test", data, model_key, domain, is_video)
    print(out)
```

Notes:
- Mount the Volume directly at `/root/backend/models` (matching `model_catalog.py`'s existing
  `models/<domain>/...` scan path) so **no code changes** are needed in `model_catalog.py` or
  `core.py` — the discovery logic just works against the Volume's contents, identical to how it
  works against local disk today. This is the key adaptation vs. WMS (which mounted weights at a
  neutral `/weights` path and pointed `model_engine.load_model` at it explicitly).
- `core.py`'s `load_model_by_name`/`predict`/`predict_video` are reused **unmodified** — this is
  literally the same code `inference_worker.py` calls locally; only the process boundary changes
  (Modal ephemeral container vs. local `subprocess.run`).

---

## 5. Weights delivery (one-time)

Upload the domain-organized checkpoints + metadata to the Volume, matching `model_catalog.py`'s
expected layout (**not** the current stale `backend/models/image_models/` layout — see the
separate open item on migrating checkpoints to `models/image/<name>/{checkpoints,config_*.json,
final_summary_*.json}` and `models/video/<name>/...` before this can go live):

```bash
modal volume put df-engine-weights ./backend/models/image /image
modal volume put df-engine-weights ./backend/models/video /video
```

---

## 6. Backend adapter — `INFERENCE_BACKEND_MODAL`

New module `backend/inference.py` (dispatch layer), mirroring WMS's adapter shape but returning
the classification result directly instead of a file:

```python
import os
import modal

_USE_MODAL = os.getenv("INFERENCE_BACKEND_MODAL", "false").lower() in {"1", "true", "t", "yes"}
_FALLBACK = os.getenv("FALLBACK_TO_LOCAL", "true").lower() in {"1", "true", "t", "yes"}


def dispatch(job_id, media_bytes, model_key, domain, is_video):
    """Returns ('modal', call_id) or ('local', None). Local = existing subprocess path."""
    if _USE_MODAL:
        try:
            fn = modal.Function.from_name("df-engine", "classify")
            call = fn.spawn(job_id, media_bytes, model_key, domain, is_video)
            return ("modal", call.object_id)
        except Exception:
            if not _FALLBACK:
                raise
    return ("local", None)  # fall through to run_isolated_inference() in main.py


def poll(call_id):
    """Returns ('running', None) | ('done', result_dict) | ('failed', reason)."""
    fc = modal.FunctionCall.from_id(call_id)
    try:
        return ("done", fc.get(timeout=0))
    except TimeoutError:
        return ("running", None)
    except Exception as e:
        return ("failed", str(e))
```

- **`worker_loop`** (main.py): call `dispatch()` with the job's `path` read into bytes. If `modal`,
  store the returned `call_id` on the job (instead of immediately running
  `run_isolated_inference`) and let a status-poll step drive completion. If `local`, run the
  existing `run_isolated_inference(info)` path unchanged.
- **`GET /deepfake/api/status/{job_id}`**: for a Modal-backed job, call `poll(call_id)`; map
  `running` → `"processing"`, `done` → write the returned dict into `job_results[job_id]` and set
  `"done"`, `failed` → run the existing credit-refund path and set `"failed"`.
- Keep the parent process **torch-free** in Modal mode — it never imports `core`/`timm`/`torch` at
  all; only `model_catalog.get_public_models()`'s metadata-only scan needs to stay CPU-side (it
  just reads JSON files, no model loading).

---

## 7. Config / env vars (DF-Engine container)

| Var | Meaning | Prod (Modal) | Local dev |
|---|---|---|---|
| `INFERENCE_BACKEND_MODAL` | route GPU work to Modal | `true` | `false` |
| `FALLBACK_TO_LOCAL` | fall back to local subprocess on Modal error | `false` (no GPU on box) | `true` |
| `MODAL_TOKEN_ID` / `MODAL_TOKEN_SECRET` | authenticate the modal client | via secret mount | `~/.modal.toml` or `.env` |
| `MODAL_APP_NAME` / `MODAL_FUNCTION_NAME` | override lookup names | `df-engine` / `classify` | same |

Add `MODAL_TOKEN_ID=` / `MODAL_TOKEN_SECRET=` (names only, blank) to `.env.example`. Secrets
arrive via mount/env, never git.

---

## 8. Security

- Modal calls are **token-gated** (Modal API token), same as WMS.
- **No weights or secrets in git or the DF-Engine image.** Weights live only in the Modal Volume
  and local disk (both already gitignored).
- DF-Engine keeps its existing JWT/Google-auth, per-user IDOR checks on `/status/{job_id}`, and
  server-side pricing on `/payments/create-order` — none of that changes; Modal only replaces the
  GPU compute step inside `worker_loop`.

---

## 9. Thin production image (follow-up task, mirrors WMS's two-target Dockerfile)

Once Modal mode works, split the current single `nvidia/cuda` Dockerfile stage into two named
targets, exactly like WMS:
- `backend-modal` (slim, `python:3.12-slim`, selected by `DEEPFAKE_MODE=modal`, installs a
  `requirements-modal.txt` without torch/timm/opencv-with-CUDA — keep `opencv-python-headless` for
  the parent-side video-frame-sampling validation path if needed, otherwise drop even that).
- `backend-local-gpu` (fat, current `nvidia/cuda:13.0.2-runtime-ubuntu24.04` base, selected by
  `DEEPFAKE_MODE=local-gpu`, unchanged from today).

`DEEPFAKE_MODE` becomes the `.env.example` master switch selecting the Docker build target,
matching WMS's `WMS_MODE` convention.

---

## 10. Deploy + verify

```bash
pip install modal && modal setup                 # once (owner)
# after the models/image_models -> models/image + models/video migration (open item, task #9):
modal volume put df-engine-weights ./backend/models/image /image
modal volume put df-engine-weights ./backend/models/video /video
modal run backend/modal_app.py --input backend/samples/<file> --model-key <key> --domain image
modal deploy backend/modal_app.py
```
Then set `INFERENCE_BACKEND_MODAL=true` + `MODAL_TOKEN_*` in the DF-Engine container and run the
normal upload → status flow. Expected: job dispatches to Modal, `/status/{job_id}` shows
`processing` then `done` with a real label/confidence, and **no GPU is used on the DF-Engine host**.

## 11. Cost

T4 per-second billing, zero idle. A single-image classification forward pass or a 20-frame video
sample ≈ 1–3s ≈ **$0.0002–$0.0005/job** — effectively free at DF-Engine's expected traffic.

## 12. Rollback

Set `INFERENCE_BACKEND_MODAL=false` → DF-Engine reverts to the local per-job subprocess
(`run_isolated_inference`). No redeploy of Modal needed. The Modal app can stay deployed idle at $0.

## 13. Blocking dependency

This entire design assumes `model_catalog.py`'s domain-based discovery (`models/image/`,
`models/video/` with `config_*.json`/`final_summary_*.json`) actually has weights in that shape —
which it currently does not (see the open finding: disk still has the old
`models/image_models/<name>/checkpoints/*.pth` layout with no metadata JSON). **Do not implement
`modal_app.py` until that migration happens** — the Volume upload in §5/§10 would just ship the
same broken layout to Modal.
