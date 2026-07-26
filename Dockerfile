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

FROM nvidia/cuda:13.0.2-runtime-ubuntu24.04 AS backend
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv python3-pip \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
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
