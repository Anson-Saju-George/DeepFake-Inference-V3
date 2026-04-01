import React, { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Pipeline } from './components/Pipeline'
import { Setup } from './components/Setup'
import { Architecture } from './components/Architecture'
import { Benchmarks } from './components/Benchmarks'
import { LiveDemo } from './components/LiveDemo'
import { Pricing } from './components/Pricing'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'

const GOOGLE_CLIENT_ID = "771999870087-il14aouajsabcfmmin80t1hbkl6dhvu6.apps.googleusercontent.com"

function App() {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await fetch("/deepfake/api/users/me", {
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
        <Hero />
        <Pipeline />
        <Setup />
        <Architecture />
        <Benchmarks />
        <LiveDemo user={user} onAuthRequired={() => setIsAuthModalOpen(true)} onUpdateUser={fetchUser} />
        <Pricing user={user} onAuthRequired={() => setIsAuthModalOpen(true)} onUpdateUser={fetchUser} />
        <Footer />
        
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
