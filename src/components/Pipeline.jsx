import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Cpu, BarChart3, Database, ArrowRight } from 'lucide-react';

export const Pipeline = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const steps = [
    {
      icon: <Upload className="text-blue-500" />,
      title: "Data Ingestion",
      desc: "Secure upload intake with extension, size, and media-type validation before any GPU work is queued."
    },
    {
      icon: <Database className="text-cyan-500" />,
      title: "Domain Routing",
      desc: "Images route to image-trained ConvNeXt/Swin/ViT models; videos route to sequence or hybrid video models."
    },
    {
      icon: <Cpu className="text-indigo-500" />,
      title: "Isolated Inference",
      desc: "A short-lived Python worker loads the selected checkpoint, runs CUDA inference, returns JSON, then exits."
    },
    {
      icon: <BarChart3 className="text-emerald-500" />,
      title: "Integrity Synthesis",
      desc: "Classification, confidence, peak VRAM, and model provenance are returned while worker-resident VRAM is purged."
    }
  ];

  return (
    <section id="pipeline" className="bg-[#F7F9FC] py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24 text-center space-y-4"
        >
          <h2 className="font-Sora text-4xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl">
            Inference Pipeline
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto font-Inter">
            A media-aware path that validates each sample, selects the right image or video
            model family, and isolates GPU memory per inference job.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-4"
        >
          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="group relative rounded-3xl border border-white bg-white/40 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all hover:bg-white/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
            >
              {/* Connector for Desktop */}
              {i < 3 && (
                <div className="absolute top-1/2 -right-6 hidden -translate-y-1/2 text-gray-200 lg:block z-10">
                  <ArrowRight size={24} className="group-hover:text-cyan-400 transition-colors group-hover:translate-x-1" />
                </div>
              )}

              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110 duration-300">
                {step.icon}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-gray-300 tracking-widest">STEP_0{i+1}</span>
                  <h3 className="font-Sora text-lg font-bold text-[#0A0A0A]">{step.title}</h3>
                </div>
                <p className="text-sm leading-7 text-gray-500 font-medium">
                  {step.desc}
                </p>
              </div>

              {/* Hover Accent */}
              <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full" />
            </motion.div>
          ))}
        </motion.div>

        {/* Technical Footer Note */}
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center font-mono text-xs font-bold text-gray-400 uppercase tracking-[0.24em]"
        >
          Pipeline Optimized for Domain Routing, Isolated CUDA Workers, and Immediate VRAM Release
        </motion.p>
      </div>
    </section>
  );
};
