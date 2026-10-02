"use client";

import { useEffect, useState } from 'react';
import { Flame, EyeOff, Ear, Sparkles, Radio } from 'lucide-react';

export default function DjScreen() {
  const [message, setMessage] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchMsg = async () => {
      try {
        const res = await fetch('/api/parti?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        
        if (data?.message) {
          setMessage((prev: any) => {
            if (prev?.id !== data.message.id) {
              setIsAnimating(false);
              setTimeout(() => setIsAnimating(true), 50); 
            }
            return data.message;
          });
        }
      } catch (e) {
        console.error("Mesaj çekilemedi", e);
      }
    };

    fetchMsg(); 
    const interval = setInterval(fetchMsg, 3000); 
    return () => clearInterval(interval);
  }, []);

  // Animasyonlu Arka Plan Temalandırması
  let themeGlow = "from-zinc-900/60 via-black to-[#020205]";
  let badgeStyle = "bg-white/10 border-white/20 text-white shadow-lg";
  let textGlow = "drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]";
  let title = "BEKLENİYOR";
  let IconComponent = Sparkles;

  if (message) {
    if (message.location === 'PARTY_ITIRAF') {
      themeGlow = "from-red-900/80 via-red-950/20 to-[#020205]";
      badgeStyle = "bg-red-950/80 border-red-500/60 text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.6)]";
      textGlow = "drop-shadow-[0_0_50px_rgba(239,68,68,0.9)] text-white";
      title = "İTİRAF";
      IconComponent = Flame;
    } else if (message.location === 'PARTY_REZIL') {
      themeGlow = "from-fuchsia-900/80 via-fuchsia-950/20 to-[#020205]";
      badgeStyle = "bg-fuchsia-950/80 border-fuchsia-500/60 text-fuchsia-400 shadow-[0_0_40px_rgba(217,70,239,0.6)]";
      textGlow = "drop-shadow-[0_0_50px_rgba(217,70,239,0.9)] text-white";
      title = "REZİL@";
      IconComponent = EyeOff;
    } else if (message.location === 'PARTY_OVERHEARD') {
      themeGlow = "from-cyan-900/80 via-cyan-950/20 to-[#020205]";
      badgeStyle = "bg-cyan-950/80 border-cyan-500/60 text-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.6)]";
      textGlow = "drop-shadow-[0_0_50px_rgba(6,182,212,0.9)] text-white";
      title = "DUYDUM";
      IconComponent = Ear;
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col justify-between p-8 md:p-12 overflow-hidden cursor-none relative font-sans selection:bg-transparent">
      
      {/* 1. DİNAMİK & ANİMASYONLU ARKA PLAN (Sürekli nefes alır) */}
      <div className={`absolute inset-0 bg-gradient-to-br ${themeGlow} transition-colors duration-[2000ms] ease-in-out animate-[pulse_6s_ease-in-out_infinite]`}></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0,transparent_100%)] pointer-events-none animate-[pulse_4s_ease-in-out_infinite]"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] mix-blend-overlay pointer-events-none"></div>

      {/* ÜST BAR (Header) */}
      <header className="relative z-10 w-full flex justify-between items-start">
        
        {/* Sol Üst - Profesyonel, Dev ve Animasyonlu Logo */}
        <div className="flex items-center">
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-black/40 border-[3px] border-white/10 flex items-center justify-center p-3 backdrop-blur-xl shadow-[0_0_50px_rgba(255,255,255,0.1)] animate-[pulse_4s_ease-in-out_infinite] hover:scale-105 transition-transform">
             {/* Logo kendi etrafında DJ plağı gibi çok yavaş döner */}
             <img src="/5555.png" alt="TNKU Logo" className="w-full h-full object-contain drop-shadow-2xl animate-[spin_20s_linear_infinite]" />
          </div>
        </div>

        {/* Sağ Üst Canlı Yayın Bildirgeci */}
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-red-500/30 px-8 py-4 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <Radio size={24} className="text-red-500 animate-[pulse_1s_ease-in-out_infinite]" />
          <span className="text-red-100 font-black tracking-[0.25em] text-lg uppercase">Canlı Parti Akışı</span>
        </div>
      </header>

      {/* MERKEZ (Ana Mesaj Alanı) */}
      <section className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-8">
        {message ? (
          <div className={`max-w-7xl mx-auto flex flex-col items-center transform transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-90'}`}>
            
            <div className={`inline-flex items-center gap-4 px-10 py-4 rounded-full border mb-14 backdrop-blur-xl ${badgeStyle}`}>
              <IconComponent size={32} className={isAnimating ? "animate-bounce" : ""} style={{ animationDuration: '2s' }} />
              <span className="text-2xl md:text-3xl font-black tracking-[0.4em] uppercase">
                {title}
              </span>
            </div>

            <h1 className={`font-black text-[5.5rem] md:text-[8rem] lg:text-[11rem] leading-[1.05] tracking-tighter break-words max-w-[95vw] ${textGlow}`}>
              {message.content}
            </h1>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 opacity-40">
            <Sparkles size={80} className="text-white animate-[pulse_2s_ease-in-out_infinite]" />
            <h2 className="text-white text-4xl md:text-5xl font-black tracking-[0.5em] uppercase">Bomba Bekleniyor</h2>
          </div>
        )}
      </section>

      {/* ALT BAR (Footer & Sponsor) */}
      <footer className="relative z-10 w-full flex justify-between items-end">
        
        {/* Sol Alt - Gönderim Linki */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-10 py-6 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center md:gap-5 animate-[pulse_5s_ease-in-out_infinite]">
          <span className="text-gray-400 font-black tracking-widest text-lg uppercase">Masadan Gönder:</span>
          <span className="text-white font-black text-3xl md:text-4xl tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            overheardparti/parti
          </span>
        </div>

        {/* Sağ Alt - VIP Sponsor Logosu (d6.png) */}
        {/* Hata gizleme kodunu kaldırdık, görsel yolu doğruysa efsane parlayacak */}
        <div className="flex items-center justify-center bg-white/5 backdrop-blur-2xl border-[3px] border-white/10 p-6 md:p-8 rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform">
          <img 
            src="/D6.png" 
            alt="Sponsor Logo" 
            className="h-20 md:h-28 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          />
        </div>
        
      </footer>

    </main>
  );
}