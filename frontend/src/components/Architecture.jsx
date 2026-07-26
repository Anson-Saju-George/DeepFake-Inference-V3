import React from 'react';
import { motion } from 'framer-motion';
import { Film, Image as ImageIcon, Layers, Network, Trophy } from 'lucide-react';

export const Architecture = () => {
  const leaderboard = [
    { model: "ConvNeXt-Base", domain: "Image", f1: "98.63%" },
    { model: "Swin-Base", domain: "Image", f1: "98.42%" },
    { model: "ConvNeXt-Large", domain: "Image", f1: "98.40%" },
    { model: "ViT-Base", domain: "Image", f1: "97.02%" },
    { model: "ConvNeXt-Large (Hybrid/Sequence)", domain: "Video", f1: "78.41%" },
    { model: "ConvNeXt-Large + TCN head", domain: "Video", f1: "78.31%" },
    { model: "ConvNeXt-Large + Hybrid TCN", domain: "Video", f1: "76.32%" },
    { model: "ConvNeXt-Large + ConvLSTM", domain: "Video", f1: "73.42%" },
  ];

  const models = [
    {
      name: "ConvNeXt-Base Image",
      type: "Image Domain | image_combined",
      detail: "Primary image detector for synthetic image benchmarks. Test accuracy reaches 98.63% with 0.9863 F1.",
      metric: "98.63% ACC",
      icon: <Layers size={20} className="text-cyan-500" />
    },
    {
      name: "Swin-Base Image",
      type: "Image Domain | image_combined",
      detail: "Hierarchical window attention baseline for image-only detection. Test accuracy reaches 98.42% with 0.9842 F1.",
      metric: "98.42% ACC",
      icon: <Network size={20} className="text-blue-500" />
    },
    {
      name: "ConvNeXt Hybrid Video",
      type: "Video Domain | spatiotemporal",
      detail: "Raw-video route for Celeb-DF v2 and FaceForensics++ clips. Test accuracy reaches 90.89% with 0.7841 F1.",
      metric: "90.89% ACC",
      icon: <Film size={20} className="text-indigo-500" />
    },
    {
      name: "ConvNeXt Sequence Video",
      type: "Video Domain | temporal",
      detail: "Temporal clip aggregation path with the same top video test profile: 90.89% accuracy and 0.7841 F1.",
      metric: "90.89% ACC",
      icon: <ImageIcon size={20} className="text-emerald-500" />
    }
  ];

  return (
    <section id="architecture" className="bg-[#F7F9FC] py-32 px-6 border-t border-gray-100">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          
          {/* Left: Qualitative Breakdown */}
          <div className="flex-1 space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1 text-[10px] font-bold text-cyan-600 uppercase tracking-widest">
                Research Layer
              </div>
              <h2 className="font-Sora text-4xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl">
                Multi-Architecture <br /> Inference Engine
              </h2>
              <p className="text-gray-500 font-Inter leading-relaxed max-w-xl">
                DF-Engine now separates image and video inference by default. Static media is routed
                to image-trained spatial models, while raw clips use video-trained temporal and
                spatiotemporal routes.
              </p>
            </motion.div>

            <div className="space-y-6">
              {models.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative flex gap-6 rounded-3xl border border-white bg-white/40 p-6 shadow-sm backdrop-blur-md transition-all hover:bg-white/80 hover:shadow-xl"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110">
                    {m.icon}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-Sora font-bold text-[#0A0A0A]">{m.name}</h3>
                      <span className="text-[10px] font-bold text-cyan-600">{m.metric}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{m.type}</p>
                    <p className="text-sm text-gray-500 font-medium italic leading-relaxed">{m.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Overall Leaderboard (real evaluation data, paper Section 7.7) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative w-full lg:ml-auto lg:w-[54%] xl:w-[50%]"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 blur-3xl"></div>
            <div className="relative rounded-[2rem] border border-white bg-white/60 p-6 md:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">

              <div className="mb-8 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Evaluation Results</span>
                  <h4 className="font-Sora font-bold text-[#0A0A0A]">Overall Leaderboard</h4>
                </div>
                <div className="h-10 w-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500">
                  <Trophy size={20} />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
                <table className="w-full min-w-[360px] text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400">
                      <th className="px-4 py-3 font-black">Model</th>
                      <th className="px-4 py-3 font-black">Domain</th>
                      <th className="px-4 py-3 font-black text-right">F1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((row, i) => (
                      <tr key={i} className="border-t border-gray-50">
                        <td className="px-4 py-3 font-semibold text-[#0A0A0A]">{row.model}</td>
                        <td className="px-4 py-3 text-gray-400 font-bold uppercase text-[10px] tracking-wide">{row.domain}</td>
                        <td className="px-4 py-3 text-right font-bold text-cyan-600">{row.f1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6 pt-8 border-t border-gray-100">
                <div>
                  <span className="block text-2xl font-bold text-[#0A0A0A]">192,016</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Evaluation Samples</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-[#0A0A0A]">5</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Datasets</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
