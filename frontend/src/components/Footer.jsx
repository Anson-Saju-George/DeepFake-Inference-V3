import logoIcon from '../../../images/Logo/DF_Cropped_Logo_Icon.png';

const resources = [
  {
    label: "GitHub Repository",
    href: "https://github.com/Anson-Saju-George/Deepfake-Engine-Research",
  },
  {
    label: "Dataset Archive",
    href: "https://huggingface.co/datasets/Anson-Saju-George/deepfake_datasets",
  },
  {
    label: "Model Weights",
    href: "https://huggingface.co/Anson-Saju-George/deepfake-model-weights",
  },
];

export const Footer = () => (
  <footer className="border-t border-gray-100 bg-white px-6 py-16">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-10 md:flex-row md:items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="DF-ENGINE" className="h-9 w-9 rounded-lg object-contain" />
            <span className="font-Sora text-lg font-bold tracking-tight text-[#0A0A0A]">DF-ENGINE</span>
          </div>
          <p className="max-w-sm text-sm leading-6 text-gray-500">
            Domain-aware deepfake inference for image and raw-video research workflows.
          </p>
        </div>

        <div className="flex flex-wrap gap-12 md:gap-20">
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest">Platform</h5>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#architecture" className="transition-colors hover:text-cyan-500">Architecture</a></li>
              <li><a href="#benchmarks" className="transition-colors hover:text-cyan-500">Benchmarks</a></li>
              <li><a href="#demo" className="transition-colors hover:text-cyan-500">Live Demo</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest">Resources</h5>
            <ul className="space-y-2 text-sm text-gray-500">
              {resources.map((resource) => (
                <li key={resource.href}>
                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-cyan-500"
                  >
                    {resource.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-col justify-between border-t border-gray-100 pt-8 text-[10px] font-bold uppercase tracking-[2px] text-gray-400 md:flex-row md:items-center">
        <p>Copyright 2026 DF-ENGINE Cluster. All rights reserved.</p>
        <div className="mt-4 flex gap-8 md:mt-0">
          <a href="#pricing" className="transition-colors hover:text-gray-600">Acquire Credits</a>
          <a href="/research" className="transition-colors hover:text-gray-600">Research Archive</a>
        </div>
      </div>
    </div>
  </footer>
);
