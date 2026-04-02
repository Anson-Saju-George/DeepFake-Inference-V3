# 📄 DF-ENGINE Project Technical Status Report

**Project Version:** 3.1.0-Research  
**Deployment Date:** April 1, 2026  
**Environment:** Nginx + Gunicorn + Cloudflare + FastAPI + React v19

---

## 🔬 1. Neural Architecture & Model Performance

The core of DF-Engine is a heterogeneous ensemble designed to address the "generalization gap" in deepfake detection.

### A. Model Ensemble Breakdown
1.  **ConvNeXt-Base (Spatial Backbone)**:
    *   **Architecture:** Modernized CNN with depthwise convolutions and 7x7 kernels.
    *   **Role:** Primary spatial feature extractor. Modern convolution blocks allow for better multi-scale artifact detection than traditional ResNets.
    *   **Peak F1-Score:** 0.9820 (Native Validation).
2.  **ViT-B/16 (Global Attention)**:
    *   **Architecture:** Vision Transformer with 16x16 patch embeddings.
    *   **Role:** Identifies non-local inconsistencies and long-range pixel correlations that signal synthetic blending.
    *   **Peak F1-Score:** 0.8536 (Native Validation).
3.  **ResNet-50 (Baseline Validator)**:
    *   **Role:** Provides a stable residual gradient flow for high-speed initial screening.

### B. Cross-Dataset Generalization (Celeb-DF)
To verify real-world robustness, models were tested zero-shot on the Celeb-DF dataset:
*   **ConvNeXt ROC-AUC:** 0.6498
*   **ViT ROC-AUC:** 0.4565
*   *Observation:* ConvNeXt showed significantly higher domain adaptation, justifying its use as the default inference architecture.

---

## ⚙️ 2. Backend Infrastructure (FastAPI)

The backend was refactored from a simple API to a **Distributed State Machine** capable of managing high-load GPU clusters.

### A. Asynchronous Hashed-Queue System
*   **Deduplication:** Implemented SHA256 content-based hashing (`hashlib.sha256(file_content + model_name)`). 
*   **Mechanism:** If a file hash exists in the `hash_to_job` cache, the system returns the result in O(1) time without triggering the GPU.
*   **Concurrency:** FIFO worker thread handles sequential job processing to prevent CUDA race conditions.

### B. Intelligent Resource Management
*   **VRAM Safety Guard:** Prior to execution, the system queries `torch.cuda.mem_get_info()`. A hard floor of **1GB free VRAM** is required to proceed, returning a `503 Service Unavailable` if the cluster is saturated.
*   **Idle Model Offloading:** Implemented a 5-minute `IDLE_TIMEOUT`. Inactive model weights are purged from VRAM (`del models[m]`, `empty_cache()`) to free resources for other tasks.
*   **Automated Storage Persistence:** ephemeral data in `storage/uploads` is purged after 10 minutes of inactivity using a background `cleanup_loop`.

---

## 🎨 3. Frontend Architecture (React v19)

Designed with a "Light Glass" UI aesthetic focusing on technical transparency and low-latency interaction.

### A. Centralized Telemetry
*   **`useSystemStatus` Hook:** A custom hook that centralizes the polling of the `/system/status` endpoint. 
*   **UI Synchronization:** Ensures the "Cluster Online" indicator and GPU model name are synchronized across the Hero and LiveDemo components, reducing network overhead.

### B. User Interaction & Visualization
*   **Drag & Drop Ingestion:** Native browser event handling with Framer Motion spring-physics for visual feedback.
*   **Data Visualization:** Integrated `Recharts` to render real-time training curves and confusion matrices, providing empirical proof of model integrity to the user.

---

## 🌐 4. Deployment Stack & Security

### A. Reverse Proxy Configuration
*   **Nginx Subpath Routing:** Configured to serve the application from `/deepfake/`. All API calls are routed via `/deepfake/api/` using a trailing-slash rewrite to maintain endpoint integrity.
*   **Gunicorn/Uvicorn:** Utilized Gunicorn as a process manager with Uvicorn workers on **Port 82** for high-concurrency production throughput.

### B. Identity & Billing
*   **Google OAuth2:** Restricted node initialization to verified Google identities.
*   **Tiered Credits:** Implemented separate database schemas for **Image** and **Video** processing tracks.
*   **Razorpay Integration:** Secure, category-aware payment gateway for provisioning additional compute credits (₹10 for images / ₹20 for videos).

---

## 🏁 Summary for Research Paper
*   **Primary Research Contribution:** Successful implementation of a high-throughput, resource-aware inference cluster that bridges the gap between raw ML research and production-grade SaaS architecture.
*   **Hardware Efficiency:** Demonstrated effective VRAM management via automated offloading and peak memory tracking.
*   **Generalization Analysis:** Empirical evidence shows modernized CNNs (ConvNeXt) currently outperform Transformers (ViT) in cross-dataset zero-shot deepfake detection scenarios.
