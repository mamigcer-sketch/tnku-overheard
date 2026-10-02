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
      themeGlow = "from-red-900/60 via-red-950/10 to-[#020205]";
      badgeStyle = "bg-red-950/60 border-red-500/40 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]";
      textGlow = "drop-shadow-[0_0_40px_rgba(239,68,68,0.7)] text-white";
      title = "İTİRAF";
      IconComponent = Flame;
    } else if (message.location === 'PARTY_REZIL') {
      themeGlow = "from-fuchsia-900/60 via-fuchsia-950/10 to-[#020205]";
      badgeStyle = "bg-fuchsia-950/60 border-fuchsia-500/40 text-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.4)]";
      textGlow = "drop-shadow-[0_0_40px_rgba(217,70,239,0.7)] text-white";
      title = "REZİL@";
      IconComponent = EyeOff;
    } else if (message.location === 'PARTY_OVERHEARD') {
      themeGlow = "from-cyan-900/60 via-cyan-950/10 to-[#020205]";
      badgeStyle = "bg-cyan-950/60 border-cyan-500/40 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]";
      textGlow = "drop-shadow-[0_0_40px_rgba(6,182,212,0.7)] text-white";
      title = "DUYDUM";
      IconComponent = Ear;
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col justify-between p-6 md:p-10 overflow-hidden cursor-none relative font-sans selection:bg-transparent">
      
      {/* 1. DİNAMİK & ANİMASYONLU ARKA PLAN (Sürekli nefes alır) */}
      <div className={`absolute inset-0 bg-gradient-to-br ${themeGlow} transition-colors duration-[2000ms] ease-in-out animate-[pulse_8s_ease-in-out_infinite]`}></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_100%)] pointer-events-none animate-[pulse_5s_ease-in-out_infinite]"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.10] mix-blend-overlay pointer-events-none"></div>

      {/* ÜST BAR (Header) - DAHA MİNİMAL VE ŞIK */}
      <header className="relative z-10 w-full flex justify-between items-start">
        
        {/* Sol Üst - Daha küçük, zarif dönen logo */}
        <div className="flex items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-black/30 border border-white/10 flex items-center justify-center p-2 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-transform">
             <img src="/5555.png" alt="TNKU Logo" className="w-full h-full object-contain drop-shadow-lg animate-[spin_20s_linear_infinite]" />
          </div>
        </div>

        {/* Sağ Üst Canlı Yayın Bildirgeci - Daha ince ve kibar */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-red-500/20 px-5 py-2.5 rounded-full shadow-lg">
          <Radio size={16} className="text-red-500 animate-[pulse_1s_ease-in-out_infinite]" />
          <span className="text-red-100 font-bold tracking-[0.2em] text-xs md:text-sm uppercase opacity-90">Canlı Parti Akışı</span>
        </div>
      </header>

      {/* MERKEZ (Ana Mesaj Alanı) */}
      <section className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6">
        {message ? (
          <div className={`max-w-7xl mx-auto flex flex-col items-center transform transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
            
            <div className={`inline-flex items-center gap-3 px-8 py-3 rounded-full border mb-10 backdrop-blur-md ${badgeStyle}`}>
              <IconComponent size={24} className={isAnimating ? "animate-bounce" : ""} style={{ animationDuration: '2s' }} />
              <span className="text-xl md:text-2xl font-black tracking-[0.35em] uppercase">
                {title}
              </span>
            </div>

            <h1 className={`font-black text-[4.5rem] md:text-[7rem] lg:text-[9rem] leading-[1.05] tracking-tighter break-words max-w-[95vw] ${textGlow}`}>
              {message.content}
            </h1>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 opacity-30">
            <Sparkles size={60} className="text-white animate-[pulse_2s_ease-in-out_infinite]" />
            <h2 className="text-white text-3xl md:text-4xl font-black tracking-[0.4em] uppercase">Bomba Bekleniyor</h2>
          </div>
        )}
      </section>

      {/* ALT BAR (Footer & Sponsor) - DAHA KİBAR KUTULAR */}
      <footer className="relative z-10 w-full flex justify-between items-end">
        
        {/* Sol Alt - Gönderim Linki - İnceltilmiş ve zarif */}
        <div className="bg-black/40 backdrop-blur-md border border-white/5 px-6 py-3 md:px-8 md:py-4 rounded-2xl shadow-xl flex items-center gap-3">
          <span className="text-gray-400 font-bold tracking-widest text-xs md:text-sm uppercase">Masadan Gönder:</span>
          <span className="text-white font-black text-lg md:text-2xl tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            overheardparti/parti
          </span>
        </div>

        {/* Sağ Alt - VIP Sponsor Logosu (d6.png) - Daha toparlanmış boyut */}
        <div className="flex items-center justify-center bg-black/20 backdrop-blur-md border border-white/5 p-4 md:p-5 rounded-2xl shadow-xl hover:scale-105 transition-transform">
          <img 
            src="/D6.png" 
            alt="Sponsor Logo" 
            className="h-12 md:h-16 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          />
        </div>
        
      </footer>

    </main>
  );
}