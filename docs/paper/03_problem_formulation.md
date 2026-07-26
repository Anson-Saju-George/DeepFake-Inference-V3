# Problem Formulation and System Overview

Deepfake detection is formulated as binary classification: given a sample (an image, or a video
clip), predict whether it is REAL or FAKE (synthetically generated/manipulated). Image and video
are treated as separate tasks with separate models, separate splits, and separate reported metrics
— they are never pooled into one evaluation.

## 3.1 Spatial and Temporal Representations

**Spatial (image) path.** A backbone (ConvNeXt, Swin, ViT) maps an input image to a feature vector,
followed by a classification head trained with binary cross-entropy loss between the predicted
probability and the REAL/FAKE label.

**Temporal (video) path.** A fixed number of frames are sampled per clip and each frame is passed
through the same spatial backbone. The resulting per-frame feature sequence is then aggregated by
one of several temporal heads before the final classification layer:

- **Mean pooling** — average the per-frame spatial features directly (no learned temporal model);
  the simplest way to turn a per-frame backbone into a per-clip classifier.
- **LSTM / ConvLSTM** — a recurrent head that processes the frame-feature sequence in order,
  carrying a hidden state across frames to model temporal dependencies.
- **TCN (Temporal Convolutional Network)** — a stack of causal 1D convolutions over the frame
  sequence, capturing local temporal patterns without recurrence.
- **Temporal Transformer** — self-attention over the frame sequence, allowing every frame to attend
  to every other frame when forming the clip-level representation.
- **Hybrid heads (Hybrid TCN, Hybrid Transformer)** — combine a spatial-only branch with a
  temporal-head branch and fuse both before classification.

**Loss functions compared.** Standard binary cross-entropy (with class-balanced sampling), weighted
cross-entropy (class weights inversely proportional to class frequency), and focal loss (down-weights
easy examples to focus training on hard/misclassified ones) are each evaluated on the video task to
measure their effect independent of architecture choice.
