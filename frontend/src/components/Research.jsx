import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle2, Download, FileText, Layers3, Table2 } from "lucide-react";

const appBase = import.meta.env.BASE_URL || "/";

const sectionIcons = [BookOpen, Layers3, CheckCircle2, FileText];

const DocFocus = ({ children }) => (
  <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-6">
    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 shadow-sm">
      <BookOpen size={14} /> Document Focus
    </div>
    <h1 className="font-Sora text-3xl font-bold tracking-tight text-[#0A0A0A] md:text-4xl">{children}</h1>
  </div>
);

const SubHeading = ({ index, children }) => {
  const Icon = sectionIcons[index % sectionIcons.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-10 flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A0A0A] text-cyan-400">
        <Icon size={19} />
      </div>
      <div>
        <div className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Research Section</div>
        <h2 className="font-Sora text-2xl font-bold tracking-tight text-[#0A0A0A]">{children}</h2>
      </div>
    </motion.div>
  );
};

const Prose = ({ children }) => (
  <p className="rounded-2xl border border-white bg-white/70 px-5 py-4 text-sm font-medium leading-7 text-gray-600 shadow-sm">
    {children}
  </p>
);

const Checklist = ({ items }) => (
  <div className="grid gap-3 md:grid-cols-2">
    {items.map((text, i) => (
      <div key={i} className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-cyan-500" />
        <div className="text-sm font-semibold leading-6 text-gray-700">{text}</div>
      </div>
    ))}
  </div>
);

const DataTable = ({ head, rows, caption }) => (
  <div className="my-2 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
      <Table2 size={14} /> {caption || "Evidence Table"}
    </div>
    <table className="w-full min-w-[520px] border-collapse text-left text-sm">
      <thead>
        <tr className="bg-white text-[10px] uppercase tracking-widest text-gray-500">
          {head.map((cell, i) => (
            <th key={i} className="border-b border-gray-100 px-4 py-3 font-black">{cell}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className="border-b border-gray-50 last:border-b-0">
            {row.map((cell, ci) => (
              <td key={ci} className="px-4 py-3 align-top leading-6 text-gray-600">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Note = ({ children }) => (
  <p className="rounded-2xl border border-amber-100 bg-amber-50/70 px-5 py-4 text-sm font-medium italic leading-7 text-amber-800 shadow-sm">
    {children}
  </p>
);

// --- Section content, hand-authored from Deepfake_Research_Revised.docx ---

const Introduction = () => (
  <div className="space-y-6">
    <DocFocus>Introduction</DocFocus>
    <Prose>
      <span className="font-Sora font-bold text-[#0A0A0A]">
        Deepfake Detection Across Modalities: A Protocol-Separated Comparative Study of Image and
        Video Models with Spatial and Temporal Learning.
      </span>
      {" "}Anson Saju George, Division of AI and ML, Karunya Institute of Technology and Sciences.
    </Prose>
    <Prose>
      Deepfake detection research routinely evaluates image and video models under the same
      protocol, pooling frame-level and video-level samples together and reporting a single
      aggregate score. This paper argues that image and video deepfake detection are fundamentally
      different problems and should be evaluated separately, under a protocol that removes the
      sources of evaluation leakage that make cross-modality comparisons misleading:
    </Prose>
    <Checklist
      items={[
        "No pooling of image and video samples into a single evaluation set.",
        "No frame-level-to-video-level leakage — a model must not be credited with “seeing” frames from a video during training that overlap with frames used to evaluate it on that same video.",
        "Identity-aware splitting for video data: a 70/10/20 train/validation/test split keyed off the subject/source identity in each clip, so the same person or source video never appears across more than one split.",
      ]}
    />
    <SubHeading index={0}>1.1 Contributions</SubHeading>
    <Checklist
      items={[
        "A protocol-separated evaluation framework that treats image and video deepfake detection as distinct tasks, each with its own data splitting, sampling, and reporting rules.",
        "A controlled comparison of convolutional (ConvNeXt, Swin) and transformer (ViT, MaxViT) backbones across both modalities.",
        "A systematic ablation of temporal aggregation heads for video (ConvLSTM, LSTM, TCN, hybrid TCN/transformer, temporal transformer) on top of a fixed spatial backbone.",
        "A loss-function ablation (standard cross-entropy, weighted cross-entropy, focal loss) isolating its effect on video detection performance.",
        "Empirical evidence that image deepfake detection is substantially easier than video detection under this protocol, and that convolutional backbones outperform transformer backbones in both modalities at the scale evaluated here.",
      ]}
    />
  </div>
);

const RelatedWork = () => (
  <div className="space-y-6">
    <DocFocus>Related Work</DocFocus>
    <SubHeading index={0}>2.1 Image-Based Blind Spots</SubHeading>
    <Prose>
      Image deepfake detectors trained on a specific generator family or dataset often fail to
      generalize to unseen generation methods — a "blind spot" where a detector performs well
      in-distribution but collapses on out-of-distribution synthetic content. This motivates
      evaluating image detectors on more than one dataset rather than a single benchmark.
    </Prose>
    <SubHeading index={1}>2.2 Video Evaluation Inconsistency</SubHeading>
    <Prose>
      Prior video deepfake detection work is inconsistent in how it splits data: many studies split
      at the frame level rather than the identity/source level, which allows a model to see frames
      from the same underlying video (or the same subject) in both training and evaluation. This
      inflates reported accuracy and makes cross-paper comparisons unreliable.
    </Prose>
    <SubHeading index={2}>2.3 Temporal Modelling</SubHeading>
    <Prose>
      Video deepfake artifacts are not purely spatial — inconsistencies can appear across frames
      (flicker, unnatural motion, temporal discontinuities at generation boundaries). This has
      motivated a range of temporal aggregation strategies on top of per-frame spatial features:
      recurrent heads (LSTM, ConvLSTM), convolutional sequence heads (TCN), and attention-based
      heads (temporal transformers), each combined with a spatial backbone in different ways (mean
      pooling, hybrid spatial+temporal fusion).
    </Prose>
    <SubHeading index={3}>2.4 CNN vs. Transformer Backbones</SubHeading>
    <Prose>
      Vision Transformers (ViT) and hybrid convolution-attention architectures (Swin, MaxViT) have
      shown strong results on general image classification, sometimes outperforming convolutional
      backbones at scale. Whether this advantage transfers to deepfake detection — a task with a
      different signal structure (subtle generation artifacts) than natural image classification —
      is an open question this paper investigates directly.
    </Prose>
  </div>
);

const ProblemFormulation = () => (
  <div className="space-y-6">
    <DocFocus>Problem Formulation and System Overview</DocFocus>
    <Prose>
      Deepfake detection is formulated as binary classification: given a sample (an image, or a
      video clip), predict whether it is REAL or FAKE (synthetically generated/manipulated). Image
      and video are treated as separate tasks with separate models, separate splits, and separate
      reported metrics — they are never pooled into one evaluation.
    </Prose>
    <SubHeading index={0}>3.1 Spatial and Temporal Representations</SubHeading>
    <Prose>
      <span className="font-bold text-[#0A0A0A]">Spatial (image) path.</span> A backbone (ConvNeXt,
      Swin, ViT) maps an input image to a feature vector, followed by a classification head trained
      with binary cross-entropy loss between the predicted probability and the REAL/FAKE label.
    </Prose>
    <Prose>
      <span className="font-bold text-[#0A0A0A]">Temporal (video) path.</span> A fixed number of
      frames are sampled per clip and each frame is passed through the same spatial backbone. The
      resulting per-frame feature sequence is then aggregated by one of several temporal heads
      before the final classification layer:
    </Prose>
    <Checklist
      items={[
        "Mean pooling — average the per-frame spatial features directly (no learned temporal model); the simplest way to turn a per-frame backbone into a per-clip classifier.",
        "LSTM / ConvLSTM — a recurrent head that processes the frame-feature sequence in order, carrying a hidden state across frames to model temporal dependencies.",
        "TCN (Temporal Convolutional Network) — a stack of causal 1D convolutions over the frame sequence, capturing local temporal patterns without recurrence.",
        "Temporal Transformer — self-attention over the frame sequence, allowing every frame to attend to every other frame when forming the clip-level representation.",
        "Hybrid heads (Hybrid TCN, Hybrid Transformer) — combine a spatial-only branch with a temporal-head branch and fuse both before classification.",
      ]}
    />
    <Prose>
      <span className="font-bold text-[#0A0A0A]">Loss functions compared.</span> Standard binary
      cross-entropy (with class-balanced sampling), weighted cross-entropy (class weights inversely
      proportional to class frequency), and focal loss (down-weights easy examples to focus
      training on hard/misclassified ones) are each evaluated on the video task to measure their
      effect independent of architecture choice.
    </Prose>
  </div>
);

const Datasets = () => (
  <div className="space-y-6">
    <DocFocus>Datasets, Cleaning, and Exploratory Analysis</DocFocus>
    <Prose>
      192,016 valid samples across 5 datasets, split cleanly by modality — no image dataset is
      mixed with a video dataset and no dataset is used to train both an image and a video model.
    </Prose>
    <DataTable
      caption="Dataset Composition"
      head={["Dataset", "Modality", "Samples", "Class Balance"]}
      rows={[
        ["CIFAKE", "Image", "120,000", "Balanced"],
        ["AI-vs-Real", "Image", "59,988", "Balanced"],
        ["Celeb-DF v2", "Video", "6,533", "~86% fake"],
        ["FaceForensics++", "Video", "5,429", "~75% fake"],
        ["Real-AI Videos", "Video", "66", "Balanced (too small to use standalone)"],
      ]}
    />
    <SubHeading index={0}>4.1 Cleaning and Validation</SubHeading>
    <Prose>
      Corrupted files, zero-byte samples, and duplicate entries were removed before any split was
      created. Video clips were validated for a minimum readable frame count before being included.
    </Prose>
    <SubHeading index={1}>4.2 Exploratory Analysis</SubHeading>
    <Prose>
      The video datasets are meaningfully smaller and more class-imbalanced than the image datasets,
      which directly motivated the loss-function ablation (Section 7.4) and the identity-aware
      splitting strategy (Section 6.1) — with only a few thousand video clips per dataset, naive
      splitting risks substantial identity leakage between train and test.
    </Prose>
  </div>
);

const Models = () => (
  <div className="space-y-6">
    <DocFocus>Models and Architectural Scope</DocFocus>
    <SubHeading index={0}>5.1 Image Backbones</SubHeading>
    <Checklist
      items={[
        "ConvNeXt (Base and Large) — a modernized convolutional architecture using depthwise convolutions and large kernels, evaluated as the primary convolutional candidate.",
        "ViT (Base and Large, patch16/224) — Vision Transformer, evaluated as the primary transformer candidate for the image task.",
        "Swin (Base, patch4/window7/224) — a hierarchical window-attention transformer, evaluated as a hybrid convolution-like transformer baseline.",
      ]}
    />
    <SubHeading index={1}>5.2 Video Backbones and Temporal Heads</SubHeading>
    <Prose>
      The video task fixes ConvNeXt as the spatial backbone (chosen based on its image-task
      results) and varies the temporal aggregation head on top of it:
    </Prose>
    <Checklist
      items={[
        "ConvNeXt (spatial-only baseline) — mean-pooled per-frame features, no learned temporal model.",
        "ConvNeXt + ConvLSTM — convolutional recurrent temporal head.",
        "ConvNeXt + LSTM — standard recurrent temporal head over pooled per-frame features.",
        "ConvNeXt + TCN — causal convolutional temporal head.",
        "ConvNeXt + Temporal Transformer — self-attention temporal head.",
        "ConvNeXt Hybrid (TCN / Transformer) — combined spatial + temporal branches, fused before classification.",
        "Swin (spatial-only) and MaxViT Hybrid — included as transformer-family points of comparison against the ConvNeXt-based video configurations.",
      ]}
    />
  </div>
);

const ExperimentalSetup = () => (
  <div className="space-y-6">
    <DocFocus>Experimental Setup</DocFocus>
    <SubHeading index={0}>6.1 Splitting and Sampling</SubHeading>
    <Prose>
      Image datasets use a standard train/validation/test split. Video datasets use an
      identity-aware 70/10/20 split: clips are grouped by the subject/source identity encoded in
      their filename before splitting, so no identity appears in more than one split. Video clips
      are sampled at a fixed sequence length (4 frames per clip in the temporal-head sweep) using
      fixed centre-clip sampling.
    </Prose>
    <SubHeading index={1}>6.2 Training Configuration</SubHeading>
    <Checklist
      items={[
        "Optimizer: AdamW",
        "Learning rate schedule: cosine annealing with a 1-epoch warmup",
        "Learning rate: 1e-4 (image models), 5e-5 (video models)",
        "Weight decay: 1e-4, gradient clipping: 1.0",
        "EMA (exponential moving average of weights): 0.999",
        "Early stopping on validation F1, single fixed seed (42), mixed precision",
        "Hardware: RTX 5080 laptop GPU · Stack: PyTorch, timm, OpenCV",
      ]}
    />
    <SubHeading index={2}>6.3 Model Complexity</SubHeading>
    <Prose>
      Model parameter counts and FLOPs were measured per architecture on the same hardware, to
      relate raw capacity (Section 8.1) to observed performance — this is where ViT-Large's much
      larger footprint relative to ConvNeXt-Base becomes relevant to the results below.
    </Prose>
  </div>
);

const Results = () => (
  <div className="space-y-6">
    <DocFocus>Results and Analysis</DocFocus>
    <SubHeading index={0}>7.1 Image Models</SubHeading>
    <DataTable
      head={["Model", "F1", "Accuracy", "ROC-AUC"]}
      rows={[
        ["ConvNeXt-Base", "0.9863", "98.63%", "0.9968"],
        ["Swin-Base", "0.9842", "98.42%", "—"],
        ["ConvNeXt-Large", "0.9840", "98.40%", "—"],
        ["ViT-Base", "0.9702", "97.02%", "—"],
        ["ViT-Large", "0.9546", "95.46%", "—"],
      ]}
    />
    <Prose>
      ViT-Large has roughly 3.5× the parameters and 4× the FLOPs of ConvNeXt-Base, but scores lower
      — additional capacity did not translate into better image detection performance in this
      evaluation.
    </Prose>
    <SubHeading index={1}>7.2 Video Spatial Baseline</SubHeading>
    <DataTable
      head={["Model", "F1", "Accuracy"]}
      rows={[
        ["ConvNeXt-Base", "0.7023", "85.66%"],
        ["Swin-Base", "0.5253", "—"],
      ]}
    />
    <SubHeading index={2}>7.3 Temporal-Head Comparison</SubHeading>
    <Prose>
      Fixed backbone: ConvNeXt-Large, dataset scope: video_all, sequence length: 4, learning rate: 5e-5.
    </Prose>
    <DataTable
      head={["Temporal Head", "Accuracy", "F1"]}
      rows={[
        ["TCN", "0.9102", "0.7831"],
        ["Hybrid TCN", "—", "0.7632"],
        ["Hybrid Transformer", "—", "0.7591"],
        ["ConvLSTM", "—", "0.7342"],
        ["LSTM", "—", "0.7274"],
        ["Temporal Transformer (weakest)", "—", "0.7249"],
      ]}
    />
    <SubHeading index={3}>7.4 Loss-Function Ablation</SubHeading>
    <Prose>
      Standard cross-entropy with class-balanced oversampling performed at least as well as weighted
      cross-entropy. Focal loss actively hurt performance, dropping spatial F1 to 0.4744 — the
      down-weighting of "easy" examples appears to work against this task rather than for it.
    </Prose>
    <SubHeading index={0}>7.5 Cross-Modality Gap</SubHeading>
    <Prose>
      Across every comparable category, image detection outperforms video detection by roughly 20
      F1 points — image detection is substantially easier under this protocol than video detection.
    </Prose>
    <SubHeading index={1}>7.6 CNN vs. Transformer Backbones</SubHeading>
    <Prose>
      Convolutional backbones (ConvNeXt) outperformed transformer backbones (ViT, Swin, MaxViT) in
      both the image and video tasks at the scale evaluated here.
    </Prose>
    <SubHeading index={2}>7.7 Overall Leaderboard</SubHeading>
    <DataTable
      head={["Model", "Domain", "F1"]}
      rows={[
        ["ConvNeXt-Base", "Image", "98.63%"],
        ["Swin-Base", "Image", "98.42%"],
        ["ConvNeXt-Large", "Image", "98.40%"],
        ["ViT-Base", "Image", "97.02%"],
        ["ViT-Large", "Image", "95.46%"],
        ["ConvNeXt-Large (mean-pooled sequence / hybrid)", "Video", "78.41%"],
        ["ConvNeXt-Large + TCN head", "Video", "78.31%"],
        ["ConvNeXt-Large + Hybrid TCN", "Video", "76.32%"],
        ["ConvNeXt-Large + Hybrid Transformer", "Video", "75.91%"],
        ["ConvNeXt-Large + ConvLSTM", "Video", "73.42%"],
      ]}
    />
    <Note>
      Note: the top mean-pooled-sequence and hybrid video configurations converge to effectively
      the same underlying architecture, so they should be read as one result rather than two
      independent points of evidence (see Limitations).
    </Note>
  </div>
);

const Discussion = () => (
  <div className="space-y-6">
    <DocFocus>Discussion</DocFocus>
    <SubHeading index={0}>8.1 Performance vs. Computational Cost</SubHeading>
    <Prose>
      Larger models did not reliably outperform smaller ones — ViT-Large underperformed
      ConvNeXt-Base despite roughly 3.5× the parameters and 4× the FLOPs, and among video temporal
      heads the cheapest architectural family (ConvNeXt + TCN) matched or beat heavier hybrid
      configurations. Under the compute and data scale of this study, convolutional backbones offer
      the best accuracy-per-FLOP trade-off in both modalities, and additional temporal-head
      complexity beyond a TCN did not pay for itself.
    </Prose>
  </div>
);

const Limitations = () => (
  <div className="space-y-6">
    <DocFocus>Limitations</DocFocus>
    <Checklist
      items={[
        "Single-seed training — all runs used one fixed random seed (42); no repeated-seed or statistical-significance testing was performed.",
        "No cross-dataset / unseen-generator evaluation — models were evaluated on held-out splits of the same datasets they were trained on.",
        "Fixed centre-clip sampling only — alternative video sampling strategies were not explored.",
        "Single-hardware complexity measurements — parameter counts and FLOPs were measured on one GPU configuration only.",
        "Shared, not per-model, hyperparameter tuning — learning rate and schedule were fixed per modality rather than tuned per architecture.",
        "Mean-pooled and hybrid video configurations converge to the same underlying architecture and should not be treated as independent evidence.",
        "The Real-AI Videos dataset (66 clips) is too small to draw conclusions from independently.",
      ]}
    />
  </div>
);

const FutureWork = () => (
  <div className="space-y-6">
    <DocFocus>Future Work</DocFocus>
    <Checklist
      items={[
        "Repeated-seed training with statistical significance testing to confirm which architectural differences are real versus noise.",
        "Cross-dataset and unseen-generator evaluation to measure generalization beyond the training datasets.",
        "Per-model hyperparameter tuning rather than a single shared schedule per modality.",
        "Broader video sampling strategies (denser sampling, multi-clip test-time averaging).",
        "Expanding the video dataset pool beyond Celeb-DF v2 and FaceForensics++ to reduce single-dataset artifact influence.",
      ]}
    />
  </div>
);

const Conclusion = () => (
  <div className="space-y-6">
    <DocFocus>Conclusion</DocFocus>
    <Prose>
      Evaluating image and video deepfake detection as separate, protocol-controlled problems
      reveals a consistent picture: image detection is substantially easier than video detection
      (roughly a 20 F1-point gap), convolutional backbones outperform transformer backbones in both
      modalities at the scale studied, and simpler temporal heads (TCN) matched or outperformed more
      complex hybrid temporal architectures for video. ConvNeXt-Base is the strongest image
      detector evaluated (F1 0.9863), and a ConvNeXt backbone with a TCN temporal head is the
      strongest video configuration by accuracy (0.9102) among the models compared.
    </Prose>
  </div>
);

const DataCodeAvailability = () => (
  <div className="space-y-6">
    <DocFocus>Data and Code Availability</DocFocus>
    <Checklist
      items={[
        "Datasets — published on Hugging Face (Anson-Saju-George/deepfake_datasets).",
        "Model weights — published on Hugging Face (Anson-Saju-George/deepfake-model-weights).",
        "Code — available on GitHub (Anson-Saju-George/DeepFake-Inference-V3).",
        "Live demo — the trained models are deployed and queryable at ansonsajugeorge.online/deepfake/.",
      ]}
    />
  </div>
);

const References = () => (
  <div className="space-y-6">
    <DocFocus>References</DocFocus>
    <Prose>
      This page summarizes the paper's methodology and results; it does not reproduce the full
      39-entry reference list from the original manuscript. For the complete, citable reference
      list, download the original paper using the button above.
    </Prose>
  </div>
);

const RESEARCH_DOCUMENTS = [
  {
    group: "Overview",
    docs: [
      { title: "Introduction", filename: "01 · Introduction", Component: Introduction },
      { title: "Related Work", filename: "02 · Related Work", Component: RelatedWork },
      { title: "Problem Formulation and System Overview", filename: "03 · Problem Formulation", Component: ProblemFormulation },
    ],
  },
  {
    group: "Methodology & Data",
    docs: [
      { title: "Datasets, Cleaning, and Exploratory Analysis", filename: "04 · Datasets", Component: Datasets },
      { title: "Models and Architectural Scope", filename: "05 · Models", Component: Models },
      { title: "Experimental Setup", filename: "06 · Experimental Setup", Component: ExperimentalSetup },
    ],
  },
  {
    group: "Results & Discussion",
    docs: [
      { title: "Results and Analysis", filename: "07 · Results", Component: Results },
      { title: "Discussion", filename: "08 · Discussion", Component: Discussion },
      { title: "Limitations", filename: "09 · Limitations", Component: Limitations },
      { title: "Future Work", filename: "10 · Future Work", Component: FutureWork },
      { title: "Conclusion", filename: "11 · Conclusion", Component: Conclusion },
    ],
  },
  {
    group: "Reference",
    docs: [
      { title: "Data and Code Availability", filename: "12 · Availability", Component: DataCodeAvailability },
      { title: "References", filename: "13 · References", Component: References },
    ],
  },
];

const FLAT_RESEARCH_DOCUMENTS = RESEARCH_DOCUMENTS.flatMap((section) => section.docs);

export const Research = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDocument = FLAT_RESEARCH_DOCUMENTS[activeIndex];
  const ActiveComponent = activeDocument.Component;

  return (
    <main className="min-h-screen bg-[#F7F9FC] pt-28">
      <section className="border-b border-gray-200 bg-[#0A0A0A] px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <a href={appBase} className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-cyan-400">
            <ArrowLeft size={14} /> Back to Engine
          </a>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                <BookOpen size={16} /> Research Archive
              </div>
              <h1 className="font-Sora text-4xl font-bold tracking-tight md:text-6xl">DF-ENGINE Research</h1>
              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-gray-400">
                The full paper behind DF-Engine: a protocol-separated comparative study of image and
                video deepfake detection, covering datasets, model architectures, experimental setup,
                results, and limitations.
              </p>
              <a
                href={`${appBase}paper/Deepfake_Research_Revised.docx`}
                download
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#0A0A0A] transition-colors hover:bg-cyan-400"
              >
                <Download size={14} /> Download Original Paper (.docx)
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-3xl font-bold text-white">{FLAT_RESEARCH_DOCUMENTS.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sections</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-3xl font-bold text-white">98.63%</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Best Image F1</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[90rem] gap-8 px-6 py-10 lg:grid-cols-[26rem_minmax(0,1fr)]">
        <aside className="min-w-0">
          <div className="sticky top-24 rounded-2xl border border-white bg-white/80 p-5 shadow-xl backdrop-blur-xl">
            {RESEARCH_DOCUMENTS.map((group) => (
              <div key={group.group} className="mb-6 last:mb-0">
                <div className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{group.group}</div>
                <div className="space-y-1">
                  {group.docs.map((doc) => {
                    const docIndex = FLAT_RESEARCH_DOCUMENTS.indexOf(doc);
                    const isActive = docIndex === activeIndex;
                    return (
                      <button
                        key={doc.filename}
                        onClick={() => setActiveIndex(docIndex)}
                        className={`w-full rounded-xl px-3 py-3 text-left transition-all ${
                          isActive ? "bg-cyan-50 text-cyan-700 shadow-sm" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-start gap-2">
                          <FileText size={14} className={isActive ? "mt-0.5 text-cyan-500" : "mt-0.5 text-gray-300"} />
                          <span className="min-w-0">
                            <span className="block text-xs font-bold">{doc.title}</span>
                            <span className="mt-1 block truncate text-[9px] font-mono text-gray-400">{doc.filename}</span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <article className="min-w-0">
          <div className="rounded-2xl border border-white bg-white/90 p-6 shadow-xl backdrop-blur-xl md:p-10">
            <div className="mb-8 border-b border-gray-100 pb-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600">{activeDocument.filename}</div>
              <div className="mt-2 font-Sora text-2xl font-bold tracking-tight text-[#0A0A0A]">{activeDocument.title}</div>
            </div>
            <ActiveComponent />
          </div>
        </article>
      </section>
    </main>
  );
};
