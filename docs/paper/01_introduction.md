# Introduction

Deepfake Detection Across Modalities: A Protocol-Separated Comparative Study of Image and Video
Models with Spatial and Temporal Learning.

Anson Saju George, Division of AI and ML, Karunya Institute of Technology and Sciences.

Deepfake detection research routinely evaluates image and video models under the same protocol,
pooling frame-level and video-level samples together and reporting a single aggregate score. This
paper argues that image and video deepfake detection are fundamentally different problems and
should be evaluated separately, under a protocol that removes the sources of evaluation leakage
that make cross-modality comparisons misleading:

- No pooling of image and video samples into a single evaluation set.
- No frame-level-to-video-level leakage (a model must not be credited with "seeing" frames from a
  video during training that overlap with frames used to evaluate it on that same video).
- Identity-aware splitting for video data: a 70/10/20 train/validation/test split keyed off the
  subject/source identity in each clip, so the same person or source video never appears across
  more than one split.

## 1.1 Contributions

- A protocol-separated evaluation framework that treats image and video deepfake detection as
  distinct tasks, each with its own data splitting, sampling, and reporting rules.
- A controlled comparison of convolutional (ConvNeXt, Swin) and transformer (ViT, MaxViT) backbones
  across both modalities.
- A systematic ablation of temporal aggregation heads for video (ConvLSTM, LSTM, TCN, hybrid
  TCN/transformer, temporal transformer) on top of a fixed spatial backbone.
- A loss-function ablation (standard cross-entropy, weighted cross-entropy, focal loss) isolating
  its effect on video detection performance.
- Empirical evidence that image deepfake detection is substantially easier than video detection
  under this protocol, and that convolutional backbones outperform transformer backbones in both
  modalities at the scale evaluated here.
