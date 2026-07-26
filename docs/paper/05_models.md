# Models and Architectural Scope

## 5.1 Image Backbones

- **ConvNeXt** (Base and Large) — a modernized convolutional architecture using depthwise
  convolutions and large kernels, evaluated as the primary convolutional candidate.
- **ViT** (Base and Large, patch16/224) — Vision Transformer, evaluated as the primary transformer
  candidate for the image task.
- **Swin** (Base, patch4/window7/224) — a hierarchical window-attention transformer, evaluated as a
  hybrid convolution-like transformer baseline.

## 5.2 Video Backbones and Temporal Heads

The video task fixes ConvNeXt as the spatial backbone (chosen based on its image-task results) and
varies the temporal aggregation head on top of it:

- **ConvNeXt (spatial-only baseline)** — mean-pooled per-frame features, no learned temporal model.
- **ConvNeXt + ConvLSTM** — convolutional recurrent temporal head.
- **ConvNeXt + LSTM** — standard recurrent temporal head over pooled per-frame features.
- **ConvNeXt + TCN** — causal convolutional temporal head.
- **ConvNeXt + Temporal Transformer** — self-attention temporal head.
- **ConvNeXt Hybrid (TCN / Transformer)** — combined spatial + temporal branches, fused before
  classification.
- **Swin (spatial-only)** and **MaxViT Hybrid** — included as transformer-family points of
  comparison against the ConvNeXt-based video configurations.
