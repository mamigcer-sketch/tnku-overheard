"use client";

import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("tnku_splash_seen");

    if (!hasSeenSplash) {
      setShow(true);
      setTimeout(() => setFade(true), 1500);
      
      setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("tnku_splash_seen", "true");
      }, 2000);
    }
  }, []);

  if (!show) return null;

  return (
    <div 
      // 🔥 ARKA PLAN GÜNDÜZ/GECE UYUMLU
      className={`fixed inset-0 z-[9999] bg-slate-50 dark:bg-[#0B0B0B] flex flex-col items-center justify-center transition-all duration-500 ${
        fade ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Arkadaki hafif mavi ışıltı */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-blue-400/20 dark:bg-[#4DA3FF]/20 rounded-full blur-[80px] transition-colors duration-500"></div>
      
      {/* Nefes Alan Logo */}
      <div className="relative z-10 flex flex-col items-center gap-6 animate-pulse">
        <img 
          src="/logo.jpg" 
          alt="TNKU Overheard Logo" 
          className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-full shadow-[0_0_30px_rgba(77,163,255,0.3)] dark:shadow-[0_0_40px_rgba(77,163,255,0.4)] transition-shadow duration-500"
        />
        
        {/* Logo Altı Metin (Gündüz Siyah, Gece Beyaz) */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors duration-500">
          TNKU<span className="text-[#4DA3FF]">OVERHEARD</span>
        </h1>
      </div>
      
      {/* Alttaki Yükleniyor Barı */}
      <div className="absolute bottom-16 w-32 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden transition-colors duration-500">
        <div className="h-full bg-[#4DA3FF] w-1/2 rounded-full animate-[progress_1s_ease-in-out_infinite] shadow-[0_0_10px_rgba(77,163,255,0.5)] dark:shadow-[0_0_10px_rgba(77,163,255,0.8)]"></div>
      </div>
    </div>
  );
}