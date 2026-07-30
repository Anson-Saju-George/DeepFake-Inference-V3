FROM node:20-slim AS frontend
WORKDIR /app/frontend
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
COPY docs/ /app/docs/
COPY images/ /app/images/
RUN npm run build

FROM python:3.12-slim AS backend-modal

# Selected by DEEPFAKE_MODE=modal. Slim API/static image: no CUDA, Torch, timm, or
# model folders - real inference happens on Modal; this process only dispatches and polls.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gettext-base \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 \
    DEEPFAKE_MODE=modal \
    INFERENCE_BACKEND_MODAL=true \
    FALLBACK_TO_LOCAL=false

WORKDIR /app/backend

COPY backend/requirements-modal.txt ./requirements-modal.txt
RUN python -m pip install --upgrade pip \
    && python -m pip install --no-cache-dir -r requirements-modal.txt

COPY backend/main.py backend/auth.py backend/database.py backend/models.py backend/payments.py \
     backend/validator.py backend/model_catalog.py backend/inference.py backend/fetch_weights.py \
     backend/entrypoint.sh ./
RUN chmod +x ./entrypoint.sh
RUN mkdir -p ./storage/uploads
COPY --from=frontend /app/frontend/dist /app/frontend/dist

EXPOSE 8000
ENTRYPOINT ["/app/backend/entrypoint.sh"]


FROM nvidia/cuda:13.0.2-runtime-ubuntu24.04 AS backend-local-gpu

# Selected by DEEPFAKE_MODE=local-gpu. Requires NVIDIA Container Toolkit; pulls model
# weights from Hugging Face at startup when backend/models is empty.
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv python3-pip \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 \
    DEEPFAKE_MODE=local-gpu \
    INFERENCE_BACKEND_MODAL=false \
    FALLBACK_TO_LOCAL=false
COPY backend/requirements.txt ./backend/requirements.txt
RUN grep -v -E '^(torch|torchvision|timm)==' backend/requirements.txt > /tmp/requirements.runtime.txt \
    && pip install --no-cache-dir --timeout 180 --retries 10 -r /tmp/requirements.runtime.txt \
    && pip install --no-cache-dir --timeout 180 --retries 10 --force-reinstall torch==2.13.0 --index-url https://download.pytorch.org/whl/cu130 \
    && pip install --no-cache-dir --timeout 180 --retries 10 --force-reinstall --no-deps torchvision==0.28.0+cu130 --index-url https://download.pytorch.org/whl/cu130 \
    && pip install --no-cache-dir --timeout 180 --retries 10 timm==1.0.12
WORKDIR /app/backend
COPY backend/*.py ./
COPY backend/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
# Weights are large (15GB+) and change independently of code; bind-mounted at
# runtime via docker-compose.yml (./backend/models:/app/backend/models). entrypoint.sh
# pulls them from Hugging Face automatically on startup if the mount is empty.
RUN mkdir -p ./models /app/backend/storage/uploads
COPY --from=frontend /app/frontend/dist /app/frontend/dist
EXPOSE 8000
ENTRYPOINT ["/app/backend/entrypoint.sh"]
