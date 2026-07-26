# Results and Analysis

## 7.1 Image Models

| Model | F1 | Accuracy | ROC-AUC |
|---|---|---|---|
| ConvNeXt-Base | 0.9863 | 98.63% | 0.9968 |
| Swin-Base | 0.9842 | 98.42% | — |
| ConvNeXt-Large | 0.9840 | 98.40% | — |
| ViT-Base | 0.9702 | 97.02% | — |
| ViT-Large | 0.9546 | 95.46% | — |

ViT-Large has roughly 3.5× the parameters and 4× the FLOPs of ConvNeXt-Base, but scores lower —
additional capacity did not translate into better image detection performance in this evaluation.

## 7.2 Video Spatial Baseline

| Model | F1 | Accuracy |
|---|---|---|
| ConvNeXt-Base | 0.7023 | 85.66% |
| Swin-Base | 0.5253 | — |

## 7.3 Temporal-Head Comparison

Fixed backbone: ConvNeXt-Large, dataset scope: video_all, sequence length: 4, learning rate: 5e-5.

| Temporal Head | Accuracy | F1 |
|---|---|---|
| TCN | 0.9102 | 0.7831 |
| Hybrid TCN | — | 0.7632 |
| Hybrid Transformer | — | 0.7591 |
| ConvLSTM | — | 0.7342 |
| LSTM | — | 0.7274 |
| Temporal Transformer | — | 0.7249 (weakest) |

## 7.4 Loss-Function Ablation

Standard cross-entropy with class-balanced oversampling performed at least as well as weighted
cross-entropy. Focal loss actively hurt performance, dropping spatial F1 to 0.4744 — the down-
weighting of "easy" examples appears to work against this task rather than for it.

## 7.5 Cross-Modality Gap

Across every comparable category, image detection outperforms video detection by roughly 20 F1
points — image detection is substantially easier under this protocol than video detection.

## 7.6 CNN vs. Transformer Backbones

Convolutional backbones (ConvNeXt) outperformed transformer backbones (ViT, Swin, MaxViT) in both
the image and video tasks at the scale evaluated here.

## 7.7 Overall Leaderboard

| Model | Domain | F1 |
|---|---|---|
| ConvNeXt-Base | Image | 98.63% |
| Swin-Base | Image | 98.42% |
| ConvNeXt-Large | Image | 98.40% |
| ViT-Base | Image | 97.02% |
| ViT-Large | Image | 95.46% |
| ConvNeXt-Large (mean-pooled sequence / hybrid) | Video | 78.41% |
| ConvNeXt-Large + TCN head | Video | 78.31% |
| ConvNeXt-Large + Hybrid TCN | Video | 76.32% |
| ConvNeXt-Large + Hybrid Transformer | Video | 75.91% |
| ConvNeXt-Large + ConvLSTM | Video | 73.42% |

Note: the top mean-pooled-sequence and hybrid video configurations converge to effectively the same
underlying architecture, so they should be read as one result rather than two independent points of
evidence (see Limitations).
