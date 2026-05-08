import React from 'react';
import { motion } from 'framer-motion';
import { Server, Layers, Zap, Shield } from 'lucide-react';

export const Setup = () => {
  const steps = [
    {
      title: "VRAM-Aware Scheduling",
      desc: "Real-time GPU memory checks before every request keep image and video jobs from entering unsafe OOM states.",
      icon: <Layers className="text-cyan-500" />
    },
    {
      title: "Isolated GPU Workers",
      desc: "Each inference runs in a short-lived Python subprocess so CUDA context and model weights die with the worker.",
      icon: <Server className="text-blue-500" />
    },
    {
      title: "Domain Model Routing",
      desc: "Image samples route to image-trained ConvNeXt/Swin/ViT models; videos route to video-trained sequence and hybrid models.",
      icon: <Zap className="text-amber-500" />
    },
    {
      title: "Instant Purge Lifecycle",
      desc: "Uploads, temporary tensors, and worker-resident VRAM are released immediately after each completed inference job.",
      icon: <Shield className="text-emerald-500" />
    }
  ];

  return (
    <section id="setup" className="bg-white py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-600 uppercase tracking-[0.18em]">
              Infrastructure Setup
            </div>
            <h2 className="font-Sora text-4xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl leading-tight">
              Production-Grade <br /> Server Architecture
            </h2>
            <p className="text-lg text-gray-500 font-Inter leading-relaxed">
              The backend now treats inference as an isolated GPU transaction: validate the media,
              route it to the correct model family, run a disposable worker, then purge the process.
            </p>
            
            <div className="grid gap-6 sm:grid-cols-2">
              {steps.map((item, i) => (
                <div key={i} className="space-y-3 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 transition-colors group-hover:bg-cyan-500 group-hover:text-white">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-[#0A0A0A] text-base">{item.title}</h4>
                  <p className="text-sm text-gray-500 leading-7">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 blur-2xl"></div>
            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gray-50/50 p-8 shadow-inner backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-400"></div>
                  <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                  <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                </div>
                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">isolated_worker.log</span>
              </div>
              
              <div className="space-y-4 font-mono text-sm leading-7">
                <p className="text-gray-400"><span className="text-cyan-600">[08:42:11]</span> INIT_STORAGE: storage/uploads/ initialized.</p>
                <p className="text-gray-400"><span className="text-cyan-600">[08:42:12]</span> ROUTE_MEDIA: image/video domain resolved.</p>
                <p className="text-gray-400"><span className="text-cyan-600">[08:42:15]</span> SPAWN_WORKER: isolated CUDA process started.</p>
                <p className="text-green-600/80"><span className="text-cyan-600">[08:42:18]</span> WORKER_EXIT: model VRAM released after inference.</p>
                <div className="h-px bg-gray-200 my-4" />
                <p className="text-blue-600/80 animate-pulse">Waiting for next routed sample...</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
