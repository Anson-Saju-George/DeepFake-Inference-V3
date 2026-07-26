# Discussion

## 8.1 Performance vs. Computational Cost

Larger models did not reliably outperform smaller ones — ViT-Large underperformed ConvNeXt-Base
despite roughly 3.5× the parameters and 4× the FLOPs (Section 7.1), and among video temporal heads
the cheapest architectural family (ConvNeXt + TCN) matched or beat heavier hybrid configurations
(Section 7.3). Under the compute and data scale of this study, convolutional backbones offer the
best accuracy-per-FLOP trade-off in both modalities, and additional temporal-head complexity beyond
a TCN did not pay for itself.
