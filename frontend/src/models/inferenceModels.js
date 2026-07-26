export const FALLBACK_INFERENCE_MODELS = [
  { key: "image_convnext_convnext_base", domain: "image", label: "ConvNeXt Base", family: "ConvNeXt", score: 0.9863, mode: "image", category: "spatial" },
  { key: "image_convnext_convnext_large", domain: "image", label: "ConvNeXt Large", family: "ConvNeXt", score: 0.9840, mode: "image", category: "spatial" },
  { key: "image_swin_swin_base_patch4_window7_224", domain: "image", label: "Swin Base", family: "Swin", score: 0.9820, mode: "image", category: "spatial" },
  { key: "image_vit_vit_base_patch16_224", domain: "image", label: "ViT Base", family: "ViT", score: 0.9702, mode: "image", category: "spatial" },
  { key: "image_vit_vit_large_patch16_224", domain: "image", label: "ViT Large", family: "ViT", score: 0.9546, mode: "image", category: "spatial" },
  { key: "video_convnext_sequence_convnext_base", domain: "video", label: "ConvNeXt Sequence Base", family: "ConvNeXt Sequence", score: 0.7090, mode: "sequence", category: "temporal" },
  { key: "video_convnext_convnext_base", domain: "video", label: "ConvNeXt Spatial Base", family: "ConvNeXt", score: 0.7023, mode: "single", category: "spatial" },
  { key: "video_convnext_hybrid_convnext_large", domain: "video", label: "ConvNeXt Hybrid Large", family: "ConvNeXt Hybrid", score: 0.6212, mode: "sequence", category: "spatiotemporal" },
  { key: "video_convnext_hybrid_convnext_base", domain: "video", label: "ConvNeXt Hybrid Base", family: "ConvNeXt Hybrid", score: 0.5766, mode: "sequence", category: "spatiotemporal" },
  { key: "video_swin_swin_base_patch4_window7_224", domain: "video", label: "Swin Spatial Base", family: "Swin", score: 0.5669, mode: "single", category: "spatial" },
  { key: "video_convnext_sequence_convnext_large", domain: "video", label: "ConvNeXt Sequence Large", family: "ConvNeXt Sequence", score: 0.4986, mode: "sequence", category: "temporal" },
  { key: "video_maxvit_hybrid_maxvit_base_tf_224_in1k", domain: "video", label: "MaxViT Hybrid Base", family: "MaxViT Hybrid", score: 0.3462, mode: "sequence", category: "spatiotemporal" },
];
