export const Footer = () => (
  <footer className="border-t border-gray-100 bg-white py-20 px-6">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-12 md:flex-row md:items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-cyan-500"></div>
            <span className="font- Sora text-lg font-bold tracking-tight text-[#0A0A0A]">DF-ENGINE</span>
          </div>
          <p className="max-w-xs text-sm text-gray-400">
            Advanced GPU-backed inference system for motion-aware video analysis and temporal synthesis.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-12 md:gap-24">
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest">Platform</h5>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#pipeline" className="hover:text-cyan-500 transition-colors">Pipeline</a></li>
              <li><a href="#architecture" className="hover:text-cyan-500 transition-colors">Architecture</a></li>
              <li><a href="#demo" className="hover:text-cyan-500 transition-colors">Live Demo</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest">Connect</h5>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-cyan-500 transition-colors">GitHub Repository</a></li>
              <li><a href="#" className="hover:text-cyan-500 transition-colors">Research Paper</a></li>
              <li><a href="#" className="hover:text-cyan-500 transition-colors">API Documentation</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-20 flex flex-col justify-between border-t border-gray-50 pt-10 md:flex-row md:items-center text-[10px] font-bold text-gray-300 uppercase tracking-[2px]">
        <p>© 2026 DF-ENGINE CLUSTER • ALL RIGHTS RESERVED</p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
        </div>
      </div>
    </div>
  </footer>
);
