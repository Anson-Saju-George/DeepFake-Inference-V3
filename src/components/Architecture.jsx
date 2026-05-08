import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Film, Fingerprint, Image as ImageIcon, Layers, Network } from 'lucide-react';

export const Architecture = () => {
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

          {/* Right: Technical Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative lg:ml-auto lg:w-[38%] xl:translate-x-8"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 blur-3xl animate-pulse"></div>
            <div className="relative rounded-[2rem] border border-white bg-white/60 p-10 shadow-2xl backdrop-blur-xl overflow-hidden">
              
              <div className="mb-10 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inference Visualization</span>
                  <h4 className="font-Sora font-bold text-[#0A0A0A]">Neural Activation Map</h4>
                </div>
                <div className="h-10 w-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500">
                  <Eye size={20} />
                </div>
              </div>

              {/* Simulated Heatmap UI */}
              <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-900 shadow-inner group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-cyan-900/40"></div>
                
                {/* Simulated Grid of Activations */}
                <div className="grid grid-cols-8 grid-rows-8 h-full w-full opacity-40">
                  {Array.from({length: 64}).map((_, i) => (
                    <div 
                      key={i} 
                      className="border-[0.5px] border-white/5 transition-colors duration-1000"
                      style={{ 
                        backgroundColor: Math.random() > 0.8 ? 'rgba(6, 182, 212, 0.4)' : 'transparent' 
                      }}
                    ></div>
                  ))}
                </div>

                {/* Overlay Scanning Line */}
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)] z-10"
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2 relative z-20">
                    <Fingerprint size={48} className="text-cyan-400 mx-auto drop-shadow-glow animate-pulse" />
                    <span className="block text-[10px] font-mono font-bold text-cyan-400 tracking-[0.3em] uppercase">Deep Artifact Detected</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-6 pt-10 border-t border-gray-100">
                <div>
                  <span className="block text-2xl font-bold text-[#0A0A0A]">224px</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Input Resolution</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-[#0A0A0A]">FP32</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inference Precision</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
