# Conclusion

Evaluating image and video deepfake detection as separate, protocol-controlled problems reveals a
consistent picture: image detection is substantially easier than video detection (roughly a 20
F1-point gap), convolutional backbones outperform transformer backbones in both modalities at the
scale studied, and simpler temporal heads (TCN) matched or outperformed more complex hybrid
temporal architectures for video. ConvNeXt-Base is the strongest image detector evaluated (F1
0.9863), and a ConvNeXt backbone with a TCN temporal head is the strongest video configuration by
accuracy (0.9102) among the models compared.
