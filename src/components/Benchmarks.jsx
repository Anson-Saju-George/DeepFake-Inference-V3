import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Medal, Microscope, Table } from 'lucide-react';

const benchmarkGroups = {
  image: {
    name: "Image Models",
    scope: "image_combined",
    summary: "Static-image benchmark family across CIFAKE and AI-generated image datasets.",
    best: { label: "ConvNeXt-Base", acc: "98.63%", f1: "0.9863", loss: "0.2289", epoch: "8" },
    rows: [
      { model: "ConvNeXt-Base", experiment: "IMG-EXP-04", acc: "98.63%", f1: "0.9863", loss: "0.2289" },
      { model: "Swin-Base", experiment: "IMG-EXP-07", acc: "98.42%", f1: "0.9842", loss: "0.2272" },
      { model: "ConvNeXt-Large", experiment: "IMG-EXP-05", acc: "98.40%", f1: "0.9840", loss: "0.2286" },
      { model: "ViT-Base", experiment: "IMG-EXP-01", acc: "97.03%", f1: "0.9702", loss: "0.2584" },
    ],
  },
  video: {
    name: "Video Models",
    scope: "video_combined",
    summary: "Raw-video benchmark family across Celeb-DF v2 and FaceForensics++ clips.",
    best: { label: "ConvNeXt Hybrid/Sequence Large", acc: "90.89%", f1: "0.7841", loss: "0.3986", epoch: "10" },
    rows: [
      { model: "ConvNeXt Hybrid Large", experiment: "VID-ST-03", acc: "90.89%", f1: "0.7841", loss: "0.3986" },
      { model: "ConvNeXt Sequence Large", experiment: "VID-TMP-02", acc: "90.89%", f1: "0.7841", loss: "0.3986" },
      { model: "ConvNeXt Sequence Base", experiment: "VID-TMP-01", acc: "88.32%", f1: "0.7099", loss: "0.4553" },
      { model: "ConvNeXt Spatial Base", experiment: "VID-SPA-02", acc: "85.66%", f1: "0.7023", loss: "0.4639" },
    ],
  },
};

const metricCards = (active) => [
  { label: "Best Accuracy", value: active.best.acc },
  { label: "Best F1", value: active.best.f1 },
  { label: "Best Epoch", value: active.best.epoch },
];

export const Benchmarks = () => {
  const [activeTab, setActiveTab] = useState('image');
  const active = benchmarkGroups[activeTab];

  return (
    <section id="benchmarks" className="bg-white py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest">
            Experimental Results
          </div>
          <h2 className="font-Sora text-4xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl">
            Technical Benchmarks
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-Inter">
            Current test-set performance from the active image and video model directories,
            separated by benchmark domain instead of pooled into one score.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex p-1 bg-gray-100 rounded-2xl w-full max-w-md">
            {Object.keys(benchmarkGroups).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === tab ? "bg-white text-[#0A0A0A] shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {benchmarkGroups[tab].name}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid gap-8 lg:grid-cols-12"
          >
            <div className="lg:col-span-8 rounded-[2rem] border border-gray-100 bg-gray-50/30 p-8">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 font-Sora text-2xl font-bold text-[#0A0A0A]">
                    <BarChart3 size={20} className="text-cyan-500" /> {active.name}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-gray-500">{active.summary}</p>
                </div>
                <span className="rounded-full bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 shadow-sm">
                  {active.scope}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {metricCards(active).map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white bg-white/80 p-5 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{metric.label}</div>
                    <div className="mt-2 font-Sora text-3xl font-bold tracking-tight text-[#0A0A0A]">{metric.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-xs font-black uppercase tracking-widest text-gray-400">
                  <Table size={15} /> Ranked Runs
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500">
                      <tr>
                        <th className="px-5 py-3 font-black">Model</th>
                        <th className="px-5 py-3 font-black">Experiment</th>
                        <th className="px-5 py-3 font-black">Accuracy</th>
                        <th className="px-5 py-3 font-black">F1</th>
                        <th className="px-5 py-3 font-black">Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {active.rows.map((row) => (
                        <tr key={row.experiment} className="border-t border-gray-50">
                          <td className="px-5 py-4 font-bold text-[#0A0A0A]">{row.model}</td>
                          <td className="px-5 py-4 font-mono text-xs text-gray-500">{row.experiment}</td>
                          <td className="px-5 py-4 font-mono font-bold text-cyan-600">{row.acc}</td>
                          <td className="px-5 py-4 font-mono text-gray-700">{row.f1}</td>
                          <td className="px-5 py-4 font-mono text-gray-500">{row.loss}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-xl">
                <h3 className="mb-6 flex items-center gap-2 font-Sora font-bold text-[#0A0A0A]">
                  <Medal size={18} className="text-blue-500" /> Best Run
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Model", val: active.best.label },
                    { label: "Accuracy", val: active.best.acc },
                    { label: "F1 Score", val: active.best.f1 },
                    { label: "Loss", val: active.best.loss },
                  ].map((m) => (
                    <div key={m.label} className="flex justify-between gap-4 border-b border-gray-50 pb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{m.label}</span>
                      <span className="text-right font-mono text-sm font-bold text-[#0A0A0A]">{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-gray-100 bg-[#0A0A0A] p-8 text-white">
                <h3 className="mb-5 flex items-center gap-2 font-Sora text-sm font-bold uppercase tracking-widest">
                  <Microscope size={16} className="text-cyan-400" /> Evaluation Scope
                </h3>
                <p className="text-sm leading-7 text-gray-400">
                  {activeTab === 'image'
                    ? "Image scores come from the image_combined test protocol and should not be compared directly against video-only runs."
                    : "Video scores come from raw-video experiments with identity-aware split policy across Celeb-DF v2 and FaceForensics++."}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
