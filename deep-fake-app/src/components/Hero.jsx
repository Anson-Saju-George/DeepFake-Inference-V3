import React from 'react';
import { motion } from 'framer-motion';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { Activity } from 'lucide-react';

export const Hero = () => {
  const { system, isOnline } = useSystemStatus();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0B0F14] px-6 pt-24 text-center border-b border-white/5">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse"></div>
      </div>
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-5xl space-y-10"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase shadow-[0_0_20px_rgba(34,211,238,0.1)]">
          <Activity size={14} className="animate-pulse" />
          Neural Integrity Analysis Active
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="font-Sora text-6xl font-bold tracking-tight text-white md:text-8xl lg:text-9xl leading-[0.9]">
          Detect the <br />
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Unseen.
            </span>
            <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 600 12" fill="none">
               <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.8 }}
                d="M1 10.5C100 2.5 200 2.5 300 10.5C400 18.5 500 2.5 599 10.5" 
                stroke="url(#grad_hero)" 
                strokeWidth="3" 
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              />
              <defs>
                <linearGradient id="grad_hero" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#06b6d4" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="mx-auto max-w-2xl text-lg text-gray-400 md:text-xl font-Inter font-light leading-relaxed">
          Advanced vision architectures—<span className="text-white font-medium">ConvNext, ViT, and ResNet</span>—engineered 
          to identify synthetic media with research-grade precision. 
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-6 pt-6">
          <a href="#demo" className="group relative rounded-full bg-cyan-500 px-10 py-5 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95 hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] overflow-hidden">
            <span className="relative z-10 text-black uppercase tracking-widest">Start Inference</span>
          </a>
          <button className="rounded-full border border-white/10 bg-white/5 px-10 py-5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 uppercase tracking-widest">
            Technical Specs
          </button>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="mt-20 flex w-full flex-wrap justify-between gap-8 border-t border-white/5 pt-10 text-left"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Cluster Status</span>
            <div className="flex items-center gap-2 font-mono text-sm text-white">
              <div className={`h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,1)] ${isOnline ? 'bg-cyan-500 animate-pulse' : 'bg-red-500'}`}></div>
              {isOnline ? 'SYSTEM_ONLINE' : 'UNREACHABLE'}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Detection Accuracy</span>
            <div className="font-mono text-sm text-white">0.9820 F1_SCORE</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Engine Node</span>
            <div className="font-mono text-sm text-white truncate max-w-[200px] md:max-w-none">
              {isOnline && system ? system.gpu : 'OFFLINE'}
            </div>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Latency</span>
            <div className="font-mono text-sm text-cyan-400">&lt; 124ms / FRAME</div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="relative z-10 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
      >
        {[
          { 
            name: "ConvNext-Base", 
            tag: "CNN Backbone", 
            desc: "Utilizes modernized depthwise convolutions for multi-scale spatial feature extraction." 
          },
          { 
            name: "ViT-B/16", 
            tag: "Transformer", 
            desc: "Global self-attention mechanisms to identify long-range inconsistencies in pixel sequences." 
          },
          { 
            name: "ResNet-50", 
            tag: "Standard Baseline", 
            desc: "Residual learning architecture providing stable gradients for localized artifact detection." 
          },
        ].map((item, i) => (
          <div key={i} className="group flex flex-col items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-left backdrop-blur-md transition-all hover:border-cyan-500/20 hover:bg-white/[0.04]">
            <div className="flex items-center gap-2">
              <h3 className="font-Sora font-bold text-white group-hover:text-cyan-400 transition-colors">{item.name}</h3>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 border border-white/10 px-1.5 py-0.5 rounded-sm bg-white/5">
                {item.tag}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500 font-Inter font-medium italic">
              {item.desc}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
};
