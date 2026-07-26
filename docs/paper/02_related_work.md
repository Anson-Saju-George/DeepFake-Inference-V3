# Related Work

## 2.1 Image-Based Blind Spots

Image deepfake detectors trained on a specific generator family or dataset often fail to
generalize to unseen generation methods — a "blind spot" where a detector performs well
in-distribution but collapses on out-of-distribution synthetic content. This motivates evaluating
image detectors on more than one dataset rather than a single benchmark.

## 2.2 Video Evaluation Inconsistency

Prior video deepfake detection work is inconsistent in how it splits data: many studies split at
the frame level rather than the identity/source level, which allows a model to see frames from the
same underlying video (or the same subject) in both training and evaluation. This inflates
reported accuracy and makes cross-paper comparisons unreliable.

## 2.3 Temporal Modelling

Video deepfake artifacts are not purely spatial — inconsistencies can appear across frames
(flicker, unnatural motion, temporal discontinuities at generation boundaries). This has motivated
a range of temporal aggregation strategies on top of per-frame spatial features: recurrent heads
(LSTM, ConvLSTM), convolutional sequence heads (TCN), and attention-based heads (temporal
transformers), each combined with a spatial backbone in different ways (mean pooling, hybrid
spatial+temporal fusion).

## 2.4 CNN vs. Transformer Backbones

Vision Transformers (ViT) and hybrid convolution-attention architectures (Swin, MaxViT) have shown
strong results on general image classification, sometimes outperforming convolutional backbones at
scale. Whether this advantage transfers to deepfake detection — a task with a different signal
structure (subtle generation artifacts) than natural image classification — is an open question
this paper investigates directly.
