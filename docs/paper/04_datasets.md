# Datasets, Cleaning, and Exploratory Analysis

192,016 valid samples across 5 datasets, split cleanly by modality — no image dataset is mixed
with a video dataset and no dataset is used to train both an image and a video model.

| Dataset | Modality | Samples | Class Balance |
|---|---|---|---|
| CIFAKE | Image | 120,000 | Balanced |
| AI-vs-Real | Image | 59,988 | Balanced |
| Celeb-DF v2 | Video | 6,533 | ~86% fake |
| FaceForensics++ | Video | 5,429 | ~75% fake |
| Real-AI Videos | Video | 66 | Balanced (too small to use standalone) |

## 4.1 Cleaning and Validation

Corrupted files, zero-byte samples, and duplicate entries were removed before any split was
created. Video clips were validated for a minimum readable frame count before being included.

## 4.2 Exploratory Analysis

The video datasets are meaningfully smaller and more class-imbalanced than the image datasets,
which directly motivated the loss-function ablation (Section 7.4) and the identity-aware splitting
strategy (Section 6.1) — with only a few thousand video clips per dataset, naive splitting risks
substantial identity leakage between train and test.
