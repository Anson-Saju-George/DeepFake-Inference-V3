# Limitations

- **Single-seed training.** All runs used one fixed random seed (42); no repeated-seed or
  statistical-significance testing was performed, so reported differences between close-scoring
  models are not confirmed to be statistically significant.
- **No cross-dataset / unseen-generator evaluation.** Models were evaluated on held-out splits of
  the same datasets they were trained on, not on a fully unseen dataset or generation method — the
  generalization gap to novel deepfake generators is not measured here.
- **Fixed centre-clip sampling only.** Video clips were sampled using a single fixed sampling
  strategy; alternative sampling (random clips, dense sampling, multi-clip averaging at inference)
  was not explored.
- **Single-hardware complexity measurements.** Parameter counts and FLOPs (Section 6.3, 8.1) were
  measured on one GPU configuration; wall-clock throughput may differ on other hardware.
- **Shared, not per-model, hyperparameter tuning.** Learning rate and schedule were fixed per
  modality (Section 6.2) rather than tuned independently for every architecture, which may
  understate the ceiling of any individual model.
- **Mean-pooled and hybrid video configurations converge.** The best two video results (Section
  7.7) reduce to effectively the same underlying architecture and should not be treated as two
  independent pieces of evidence.
- **Real-AI Videos dataset too small to stand alone.** At only 66 clips, this dataset was included
  for balance but is too small to draw conclusions from independently.
