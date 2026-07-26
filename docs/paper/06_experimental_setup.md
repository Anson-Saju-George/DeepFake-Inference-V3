# Experimental Setup

## 6.1 Splitting and Sampling

Image datasets use a standard train/validation/test split. Video datasets use an **identity-aware
70/10/20 split**: clips are grouped by the subject/source identity encoded in their filename before
splitting, so no identity appears in more than one split. Video clips are sampled at a fixed
sequence length (4 frames per clip in the temporal-head sweep) using fixed centre-clip sampling.

## 6.2 Training Configuration

- Optimizer: AdamW
- Learning rate schedule: cosine annealing with a 1-epoch warmup
- Learning rate: 1e-4 for image models, 5e-5 for video models
- Weight decay: 1e-4
- Gradient clipping: 1.0
- EMA (exponential moving average of weights): 0.999
- Early stopping on validation F1
- Single fixed random seed (42) across all runs
- Mixed-precision training
- Hardware: RTX 5080 laptop GPU
- Stack: PyTorch, timm, OpenCV

## 6.3 Model Complexity

Model parameter counts and FLOPs were measured per architecture on the same hardware, to relate raw
capacity (Section 8.1) to observed performance — this is where ViT-Large's much larger footprint
relative to ConvNeXt-Base becomes relevant to the results in Section 7.
