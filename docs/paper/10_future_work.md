# Future Work

- Repeated-seed training with statistical significance testing to confirm which architectural
  differences are real versus noise.
- Cross-dataset and unseen-generator evaluation to measure generalization beyond the datasets used
  for training.
- Per-model hyperparameter tuning rather than a single shared schedule per modality.
- Broader video sampling strategies (denser sampling, multi-clip test-time averaging) to test
  whether the video/image performance gap narrows with more temporal context per clip.
- Expanding the video dataset pool beyond Celeb-DF v2 and FaceForensics++ to reduce the influence
  of any single dataset's artifacts on the reported results.
