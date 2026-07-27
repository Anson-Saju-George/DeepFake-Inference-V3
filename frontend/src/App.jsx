import React, { useState, useEffect, Suspense, lazy } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Architecture } from './components/Architecture'
import { Benchmarks } from './components/Benchmarks'
import { LiveDemo } from './components/LiveDemo'
import { Pricing } from './components/Pricing'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'

const Research = lazy(() => import('./components/Research').then((m) => ({ default: m.Research })))

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const getAppRoute = (pathname) => {
  const basePath = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (basePath && basePath !== "/" && normalizedPath.startsWith(basePath)) {
    return normalizedPath.slice(basePath.length) || "/";
  }

  return normalizedPath;
};

function App() {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isResearchRoute = getAppRoute(window.location.pathname) === "/research";

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await fetch("/deepfake-detection/api/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (err) {
      console.error("Auth fetch failed");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-white font-Inter text-[#0A0A0A]">
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          onLoginClick={() => setIsAuthModalOpen(true)} 
        />
        {isResearchRoute ? (
          <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            </div>
          }>
            <Research />
          </Suspense>
        ) : (
          <>
            <Hero />
            <Architecture />
            <Benchmarks />
            <LiveDemo user={user} onAuthRequired={() => setIsAuthModalOpen(true)} onUpdateUser={fetchUser} />
            <Pricing user={user} onAuthRequired={() => setIsAuthModalOpen(true)} onUpdateUser={fetchUser} />
            <Footer />
          </>
        )}
        
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onLoginSuccess={fetchUser}
        />
      </div>
    </GoogleOAuthProvider>
  )
}

export default App
