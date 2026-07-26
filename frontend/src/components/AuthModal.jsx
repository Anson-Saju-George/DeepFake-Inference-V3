import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        onLoginSuccess();
        onClose();
      } else {
        setError(data.detail || "Google Auth Failed");
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-[#0B0F14] p-10 shadow-2xl shadow-cyan-500/10 text-center"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="mb-10 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="font-Sora text-2xl font-bold text-white uppercase tracking-tight">
              Neural Access
            </h2>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Authorized cluster entry required. <br />
              Authenticate with Google to initialize your research node.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <GoogleLogin 
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Sign-In failed")}
            theme="filled_black"
            shape="pill"
            width="100%"
          />
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-10 pt-10 border-t border-white/5">
          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">
            DF-ENGINE SECURE PROTOCOL V3.1
          </p>
        </div>
      </motion.div>
    </div>
  );
};
