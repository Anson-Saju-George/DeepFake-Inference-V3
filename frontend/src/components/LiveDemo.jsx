import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSystemStatus } from "../hooks/useSystemStatus";
import { FALLBACK_INFERENCE_MODELS } from "../models/inferenceModels";
import { Upload, Cpu, Zap, AlertCircle, Lock, Image as ImageIcon, Video } from "lucide-react";

const API = "/api";
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv", ".webm"];

const getFileDomain = (file) => {
  if (!file) return "image";
  if (file.type?.startsWith("video")) return "video";
  const name = file.name.toLowerCase();
  return VIDEO_EXTENSIONS.some((extension) => name.endsWith(extension)) ? "video" : "image";
};

export const LiveDemo = ({ user, onAuthRequired, onUpdateUser }) => {
  const { system, isOnline, checked } = useSystemStatus();
  const [file, setFile] = useState(null);
  const [models, setModels] = useState(FALLBACK_INFERENCE_MODELS);
  const [model, setModel] = useState(FALLBACK_INFERENCE_MODELS[0].key);
  const [status, setStatus] = useState("idle"); // idle, queued, processing, success, error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("image");
  const fileDomain = file ? getFileDomain(file) : selectedDomain;
  const activeModels = useMemo(
    () => models.filter((item) => item.domain === fileDomain),
    [models, fileDomain]
  );
  const selectedModel = activeModels.find((item) => item.key === model) || activeModels[0];

  useEffect(() => {
    const loadModels = async () => {
      try {
        const res = await fetch(`${API}/models`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models);
        }
      } catch (err) {
        setModels(FALLBACK_INFERENCE_MODELS);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (activeModels.length > 0 && !activeModels.some((item) => item.key === model)) {
      setModel(activeModels[0].key);
    }
  }, [activeModels, model]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setSelectedDomain(getFileDomain(selectedFile));
      setResult(null);
      setStatus("idle");
      setError("");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files ? e.dataTransfer.files[0] : null;
    if (droppedFile) {
      setFile(droppedFile);
      setSelectedDomain(getFileDomain(droppedFile));
      setResult(null);
      setStatus("idle");
      setError("");
    }
  };

  const pollStatus = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/status/${jobId}`);
        const data = await res.json();

        if (data.status === "done") {
          clearInterval(interval);
          setResult(data.result);
          setStatus("success");
          onUpdateUser(); // Refresh credits
        } else if (data.status === "failed") {
          clearInterval(interval);
          setStatus("error");
          setError(data.error?.error || "Inference engine failure.");
        } else {
          setStatus(data.status); // Updates to 'processing'
        }
      } catch (e) {
        clearInterval(interval);
        setStatus("error");
        setError("Polling connection lost.");
      }
    }, 2000);
  };

  const runInference = async () => {
    if (!user) { onAuthRequired(); return; }
    if (!file) return;
    if (!selectedModel) {
      setStatus("error");
      setError(`No ${fileDomain} model is available.`);
      return;
    }

    setStatus("queued");
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/predict?model_name=${selectedModel.key}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        pollStatus(data.job_id);
      } else {
        setStatus("error");
        setError(data.detail || "Inference rejected");
      }
    } catch (err) {
      setStatus("error");
      setError("Network error");
    }
  };

  const isOutOfCredits = user && user.role !== 'admin' && (
    (fileDomain === 'video' && user.credits.video.remaining <= 0) ||
    (fileDomain === 'image' && user.credits.image.remaining <= 0)
  );

  return (
    <section id="demo" className="bg-[#F7F9FC] py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center space-y-4">
          <h2 className="font-Sora text-4xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl uppercase">
            Live Cluster
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-Inter font-medium italic">
            Authorized node access required. 
            {user ? ` Node: ${user.email}` : " Authenticate to initialize session."}
          </p>
        </div>

        {/* System Status Indicator */}
        <div className="mb-8 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl border border-white bg-white/50 px-6 py-3 shadow-sm backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                isOnline ? 'bg-green-500 animate-pulse' : checked ? 'bg-red-500' : 'bg-gray-400'
              }`} />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isOnline ? 'Cluster Online' : checked ? 'Cluster Offline' : 'Sign In To Check Status'}
              </span>
            </div>
            {checked && (
              <>
                <div className="h-4 w-px bg-gray-200" />
                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest truncate max-w-[280px]">
                  Engine: <span className="text-cyan-600">{isOnline && system ? system.gpu : 'UNREACHABLE'}</span>
                </div>
              </>
            )}
            {isOnline && system && system.queue > 0 && (
              <>
                <div className="h-4 w-px bg-gray-200" />
                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  Queue: <span className="text-rose-500">{system.queue} Jobs</span>
                </div>
              </>
            )}
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white bg-white/60 p-6 shadow-xl backdrop-blur-xl">
              <h3 className="mb-6 flex items-center gap-2 text-sm font-bold text-[#0A0A0A] uppercase tracking-wider">
                <Cpu size={18} className="text-cyan-500" /> Architecture
              </h3>
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1">
                {["image", "video"].map((domain) => {
                  const Icon = domain === "image" ? ImageIcon : Video;
                  const isActive = fileDomain === domain;
                  return (
                    <button
                      type="button"
                      key={domain}
                      onClick={() => {
                        setSelectedDomain(domain);
                        setResult(null);
                        setError("");
                        if (file && getFileDomain(file) !== domain) {
                          setFile(null);
                          setStatus("idle");
                        }
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
                        isActive ? "bg-white text-cyan-600 shadow-sm" : "text-gray-400"
                      }`}
                    >
                      <Icon size={13} /> {domain}
                    </button>
                  );
                })}
              </div>
              <div className="max-h-[22rem] space-y-3 overflow-y-auto pr-1">
                {activeModels.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setModel(m.key)}
                    className={`w-full flex flex-col items-start rounded-2xl border p-4 transition-all ${
                      selectedModel?.key === m.key ? "border-cyan-500 bg-cyan-50/50 shadow-sm" : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <span className={`font-bold ${selectedModel?.key === m.key ? "text-cyan-700" : "text-gray-700"}`}>{m.label}</span>
                    <span className="mt-1 text-[10px] text-gray-400 uppercase font-medium">
                      {m.category || m.mode} Node {m.score ? `| F1 ${Number(m.score).toFixed(4)}` : ""}
                    </span>
                  </button>
                ))}
              </div>
              {file && (
                <p className="mt-4 text-[10px] font-bold uppercase leading-5 tracking-widest text-gray-400">
                  Selected {fileDomain} sample. Only {fileDomain} models are available for this run.
                </p>
              )}
            </div>

            {user && (
              <div className="rounded-3xl border border-white bg-white/60 p-6 shadow-xl backdrop-blur-xl">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0A0A0A] uppercase tracking-wider">
                  Compute Balance
                </h3>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-black/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Images</span>
                    <span className="text-sm font-mono font-bold text-cyan-600">{user.role === 'admin' ? "∞" : user.credits.image.remaining}</span>
                  </div>
                  <div className="bg-black/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Videos</span>
                    <span className="text-sm font-mono font-bold text-blue-600">{user.role === 'admin' ? "∞" : user.credits.video.remaining}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Area */}
          <div className="lg:col-span-8">
            <div className="h-full flex flex-col rounded-3xl border border-white bg-white/60 p-8 shadow-2xl backdrop-blur-xl md:p-12 relative overflow-hidden">
              {!user && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md text-center">
                  <Lock size={32} className="mb-4 text-[#0A0A0A]" />
                  <h4 className="font-Sora font-bold text-[#0A0A0A] uppercase tracking-tight">Access Restricted</h4>
                  <p className="text-xs text-gray-500 font-medium mb-6">Authenticate to initialize node</p>
                  <button onClick={onAuthRequired} className="rounded-xl bg-[#0A0A0A] px-8 py-3 text-[10px] font-bold text-white uppercase tracking-[0.2em] shadow-xl">Authorize Now</button>
                </div>
              )}

              <motion.label 
                onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                animate={{ 
                  scale: isDragging ? 1.02 : 1,
                  borderColor: isDragging ? "#06b6d4" : "#e5e7eb",
                  backgroundColor: isDragging ? "rgba(6, 182, 212, 0.05)" : "rgba(249, 250, 251, 0.5)"
                }}
                className="group relative flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden mb-8 shadow-inner"
              >
                <input
                  type="file"
                  accept={fileDomain === "video" ? "video/*,.mp4,.mov,.avi,.mkv,.webm" : "image/*,.jpg,.jpeg,.png,.webp"}
                  className="hidden"
                  disabled={!user}
                  onChange={handleFileChange}
                />
                
                <AnimatePresence mode="wait">
                  {status === "queued" || status === "processing" ? (
                    <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 text-center">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-gray-100 border-t-cyan-500 animate-spin" />
                        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500" size={20} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-gray-700 uppercase tracking-widest text-xs animate-pulse">
                          {status === "queued" ? "Positioned in Queue..." : "GPU Inference Active..."}
                        </p>
                        <p className="text-[9px] text-gray-400 font-mono">NODE_HASH_VERIFIED</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center p-6">
                      <div className={`mb-4 rounded-full bg-white p-5 shadow-sm transition-transform ${isDragging ? 'scale-110 text-cyan-500' : 'text-gray-400 group-hover:text-cyan-500'}`}>
                        <Upload size={32} />
                      </div>
                      <p className="text-lg font-bold text-gray-700 truncate max-w-[300px]">{file ? file.name : "Drop Sample or Browse"}</p>
                        <p className="mt-1 text-xs text-gray-400 font-bold tracking-widest uppercase">
                          {fileDomain === "video" ? "Video mode | Max 50MB" : "Image mode | Max 10MB"}
                        </p>
                        {selectedModel && (
                          <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-cyan-600">
                            Routed to {selectedModel.label}
                          </p>
                        )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.label>

              <div className="flex gap-4">
                <button
                  disabled={!file || !selectedModel || status === "queued" || status === "processing" || isOutOfCredits}
                  onClick={runInference}
                  className={`flex-1 rounded-2xl py-5 text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-lg ${
                    !file || !selectedModel || status === "queued" || status === "processing" || isOutOfCredits
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#0A0A0A] text-white hover:bg-black active:scale-95 shadow-cyan-500/10"
                  }`}
                >
                  {!selectedModel ? "No Model Available" : isOutOfCredits ? "Insufficient Credits" : (status === "queued" || status === "processing") ? "Analyzing..." : "Begin Inference"}
                </button>
                {file && status === "idle" && (
                   <button onClick={() => { setFile(null); setStatus("idle"); setResult(null); setError(""); }} className="rounded-2xl border border-gray-200 bg-white px-6 text-[10px] font-bold text-gray-400 hover:text-rose-500 transition-colors uppercase font-mono">
                    Clear
                   </button>
                )}
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-[10px] font-bold text-rose-600 uppercase tracking-widest border border-rose-100">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <AnimatePresence>
                {result && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 border-t border-gray-100 pt-12">
                    <div className="grid gap-8 md:grid-cols-3 items-center">
                      <div className="space-y-1 text-center md:text-left">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Classification</span>
                        <div className={`text-5xl font-Sora font-bold ${result.label === 'REAL' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {result.label}
                        </div>
                      </div>
                      <div className="space-y-1 text-center md:text-left">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confidence</span>
                        <div className="text-2xl font-bold text-[#0A0A0A]">{result.confidence}</div>
                      </div>
                      <div className="space-y-1 text-center md:text-right">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">VRAM PEAK</span>
                        <div className="text-2xl font-bold text-cyan-600 font-mono tracking-tighter">{result.vram_peak}</div>
                        {result.vram_reserved && (
                          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Reserved {result.vram_reserved}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-8 rounded-2xl bg-gray-50 p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Model: <span className="text-cyan-600">{result.model_label || result.model_used}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
