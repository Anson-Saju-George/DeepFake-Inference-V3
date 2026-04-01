import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Table, Microscope, BarChart, Activity } from 'lucide-react';

const convnextData = [
  { epoch: 1, trainF1: 0.9574, valF1: 0.9724, loss: 0.2688 },
  { epoch: 2, trainF1: 0.9741, valF1: 0.9784, loss: 0.2439 },
  { epoch: 3, trainF1: 0.9825, valF1: 0.9820, loss: 0.2294 },
  { epoch: 5, trainF1: 0.9899, valF1: 0.9828, loss: 0.2170 },
  { epoch: 10, trainF1: 0.9963, valF1: 0.9833, loss: 0.2051 },
  { epoch: 15, trainF1: 0.9981, valF1: 0.9827, loss: 0.2019 },
  { epoch: 20, trainF1: 0.9985, valF1: 0.9830, loss: 0.2012 },
];

const vitData = [
  { epoch: 1, trainF1: 0.6895, valF1: 0.7574, loss: 0.5971 },
  { epoch: 3, trainF1: 0.7924, valF1: 0.8146, loss: 0.4862 },
  { epoch: 5, trainF1: 0.8182, valF1: 0.8378, loss: 0.4562 },
  { epoch: 10, trainF1: 0.8353, valF1: 0.8434, loss: 0.4339 },
  { epoch: 15, trainF1: 0.8486, valF1: 0.8551, loss: 0.4175 },
];

const stats = {
  convnext: {
    name: "ConvNeXt-Base",
    bestF1: "0.9820",
    celebDF: { acc: "0.5951", prec: "0.1913", rec: "0.6112", f1: "0.2915", auc: "0.6498" },
    matrix: [[3344, 2299], [346, 544]]
  },
  vit: {
    name: "ViT-B/16",
    bestF1: "0.8536",
    celebDF: { acc: "0.5135", prec: "0.1138", rec: "0.3787", f1: "0.1750", auc: "0.4565" },
    matrix: [[3018, 2625], [553, 337]]
  }
};

export const Benchmarks = () => {
  const [activeTab, setActiveTab] = useState('convnext');

  return (
    <section id="benchmarks" className="bg-white py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
            Experimental Results
          </div>
          <h2 className="font-Sora text-4xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl">
            Technical Benchmarks
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-Inter">
            Empirical validation of model performance across native validation sets and 
            unseen cross-dataset (Celeb-DF) challenges.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="flex p-1 bg-gray-100 rounded-2xl w-full max-w-md">
            {Object.keys(stats).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === tab ? "bg-white text-[#0A0A0A] shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {stats[tab].name}
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
            {/* Left: Training Curve */}
            <div className="lg:col-span-8 rounded-[2rem] border border-gray-100 bg-gray-50/30 p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="flex items-center gap-2 font-Sora font-bold text-[#0A0A0A]">
                  <Activity size={18} className="text-cyan-500" /> Training Progress
                </h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Best Val F1: {stats[activeTab].bestF1}</span>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeTab === 'convnext' ? convnextData : vitData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="epoch" fontSize={10} fontWeight="bold" tickMargin={10} />
                    <YAxis fontSize={10} fontWeight="bold" domain={[0, 1]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="valF1" name="Validation F1" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="trainF1" name="Train F1" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: CelebDF & Confusion Matrix */}
            <div className="lg:col-span-4 space-y-8">
              <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-xl">
                <h3 className="flex items-center gap-2 font-Sora font-bold text-[#0A0A0A] mb-6">
                  <Microscope size={18} className="text-blue-500" /> Celeb-DF Eval
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Accuracy", val: stats[activeTab].celebDF.acc },
                    { label: "F1 Score", val: stats[activeTab].celebDF.f1 },
                    { label: "ROC-AUC", val: stats[activeTab].celebDF.auc },
                  ].map((m, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-gray-50 pb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.label}</span>
                      <span className="font-mono text-sm font-bold text-[#0A0A0A]">{m.val}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-[10px] leading-relaxed text-gray-400 italic">
                  *Cross-dataset evaluation represents zero-shot performance on unseen lighting and compression domains.
                </p>
              </div>

              <div className="rounded-[2rem] border border-gray-100 bg-[#0A0A0A] p-8 text-white">
                <h3 className="flex items-center gap-2 font-Sora font-bold mb-6 text-sm uppercase tracking-widest">
                  Confusion Matrix
                </h3>
                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <span className="block text-xs text-gray-500 mb-1">TN</span>
                    <span className="text-lg font-bold">{stats[activeTab].matrix[0][0]}</span>
                  </div>
                  <div className="bg-cyan-500/10 p-4 rounded-xl text-cyan-400">
                    <span className="block text-xs text-cyan-500/50 mb-1">FP</span>
                    <span className="text-lg font-bold">{stats[activeTab].matrix[0][1]}</span>
                  </div>
                  <div className="bg-red-500/10 p-4 rounded-xl text-red-400">
                    <span className="block text-xs text-red-500/50 mb-1">FN</span>
                    <span className="text-lg font-bold">{stats[activeTab].matrix[1][0]}</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <span className="block text-xs text-gray-500 mb-1">TP</span>
                    <span className="text-lg font-bold">{stats[activeTab].matrix[1][1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
