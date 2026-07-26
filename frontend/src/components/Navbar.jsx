import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Menu, Shield, Image as ImageIcon, Video, X } from 'lucide-react';
import logoIcon from '../../../images/Logo/DF_Cropped_Logo_Icon.png';

const appBase = import.meta.env.BASE_URL || "/";
const appRoot = appBase.endsWith("/") ? appBase : `${appBase}/`;
const routeHref = (path = "") => `${appRoot}${path}`.replace(/\/{2,}/g, "/");
const sectionHref = (sectionId) => `${appRoot}#${sectionId}`;

const NAV_LINKS = [
  { label: "Architecture", href: sectionHref("architecture") },
  { label: "Benchmarks", href: sectionHref("benchmarks") },
  { label: "Live Demo", href: sectionHref("demo") },
  { label: "Pricing", href: sectionHref("pricing") },
  { label: "Research", href: routeHref("research") },
];

export const Navbar = ({ user, onLogout, onLoginClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
  <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/20 backdrop-blur-md">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <a href={sectionHref("home")} className="flex items-center gap-2 transition-opacity hover:opacity-80">
        <img src={logoIcon} alt="DF-ENGINE" className="h-8 w-8 rounded-lg object-contain shadow-[0_0_15px_rgba(6,182,212,0.35)]" />
        <span className="font-Sora text-xl font-bold tracking-tight text-white uppercase">DF-ENGINE</span>
      </a>

      <div className="hidden items-center gap-8 text-sm font-medium text-gray-400 md:flex">
        {NAV_LINKS.map((link) => (
          <a key={link.label} href={link.href} className="transition-colors hover:text-cyan-400 uppercase tracking-widest text-[10px] font-bold">
            {link.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        {user ? (
          <div className="flex items-center gap-6">
            <div className="hidden gap-4 sm:flex">
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

            <div className="hidden h-8 w-px bg-white/5 sm:block" />

            <div className="flex items-center gap-3">
              <span className="hidden lg:block text-[10px] font-bold text-white uppercase tracking-wider opacity-60 truncate max-w-[100px]">
                {user.email.split('@')[0]}
              </span>
              <button
                onClick={onLogout}
                aria-label="Log out"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-white/5"
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

    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden border-t border-white/5 bg-black/40 backdrop-blur-md md:hidden"
        >
          <div className="flex flex-col gap-1 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 transition-colors hover:bg-white/5 hover:text-cyan-400"
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </nav>
  );
};
