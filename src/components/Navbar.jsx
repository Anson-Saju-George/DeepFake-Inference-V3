import React from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Shield, Image as ImageIcon, Video } from 'lucide-react';
import logoIcon from '../../images/Logo/DF_Cropped_Logo_Icon.png';

const appBase = import.meta.env.BASE_URL || "/";
const appRoot = appBase.endsWith("/") ? appBase : `${appBase}/`;
const routeHref = (path = "") => `${appRoot}${path}`.replace(/\/{2,}/g, "/");
const sectionHref = (sectionId) => `${appRoot}#${sectionId}`;

export const Navbar = ({ user, onLogout, onLoginClick }) => (
  <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/20 backdrop-blur-md">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <a href={sectionHref("home")} className="flex items-center gap-2 transition-opacity hover:opacity-80">
        <img src={logoIcon} alt="DF-ENGINE" className="h-8 w-8 rounded-lg object-contain shadow-[0_0_15px_rgba(6,182,212,0.35)]" />
        <span className="font-Sora text-xl font-bold tracking-tight text-white uppercase">DF-ENGINE</span>
      </a>
      
      <div className="hidden items-center gap-8 text-sm font-medium text-gray-400 md:flex">
        <a href={sectionHref("pipeline")} className="transition-colors hover:text-cyan-400 uppercase tracking-widest text-[10px] font-bold">Pipeline</a>
        <a href={sectionHref("architecture")} className="transition-colors hover:text-cyan-400 uppercase tracking-widest text-[10px] font-bold">Architecture</a>
        <a href={sectionHref("demo")} className="transition-colors hover:text-cyan-400 uppercase tracking-widest text-[10px] font-bold">Live Demo</a>
        <a href={routeHref("research")} className="transition-colors hover:text-cyan-400 uppercase tracking-widest text-[10px] font-bold">Research</a>
        <a href={sectionHref("pricing")} className="transition-colors hover:text-cyan-400 uppercase tracking-widest text-[10px] font-bold">Pricing</a>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-1">
                  <ImageIcon size={8} /> Image Credits
                </span>
                <span className="text-[10px] font-bold text-cyan-400 font-mono">
                  {user.role === 'admin' ? '∞' : user.credits.image.remaining}
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-1">
                  <Video size={8} /> Video Credits
                </span>
                <span className="text-[10px] font-bold text-blue-400 font-mono">
                  {user.role === 'admin' ? '∞' : user.credits.video.remaining}
                </span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-white/5" />
            
            <div className="flex items-center gap-3">
              <span className="hidden lg:block text-[10px] font-bold text-white uppercase tracking-wider opacity-60 truncate max-w-[100px]">
                {user.email.split('@')[0]}
              </span>
              <button 
                onClick={onLogout}
                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-white/5"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="rounded-full bg-white px-6 py-2.5 text-[10px] font-bold text-black transition-transform hover:scale-105 active:scale-95 uppercase tracking-[0.2em]"
          >
            Authenticate
          </button>
        )}
      </div>
    </div>
  </nav>
);
