"use client";

import { useEffect, useState } from 'react';
import { Flame, EyeOff, Ear, Sparkles } from 'lucide-react';

export default function DjScreen() {
  const [message, setMessage] = useState<any>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchMsg = async () => {
      try {
        const res = await fetch('/api/parti?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        
        if (data?.message) {
          setMessage((prev: any) => {
            if (prev?.id !== data.message.id) {
              setAnimate(false);
              setTimeout(() => setAnimate(true), 50); 
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

  let themeGlow = "from-purple-500/20 via-indigo-500/10 to-transparent";
  let badgeStyle = "bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.3)]";
  let textGlow = "drop-shadow-[0_0_35px_rgba(168,85,247,0.4)]";
  let title = "";
  let IconComponent = Sparkles;

  if (message) {
    if (message.location === 'PARTY_ITIRAF') {
      themeGlow = "from-red-600/30 via-orange-600/10 to-transparent";
      badgeStyle = "bg-red-500/15 border-red-500/40 text-red-400 shadow-[0_0_35px_rgba(239,68,68,0.4)]";
      textGlow = "drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]";
      title = "İTİRAF";
      IconComponent = Flame;
    } else if (message.location === 'PARTY_REZIL') {
      themeGlow = "from-fuchsia-600/30 via-purple-600/10 to-transparent";
      badgeStyle = "bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-400 shadow-[0_0_35px_rgba(217,70,239,0.4)]";
      textGlow = "drop-shadow-[0_0_40px_rgba(217,70,239,0.5)]";
      title = "REZİL@";
      IconComponent = EyeOff;
    } else if (message.location === 'PARTY_OVERHEARD') {
      themeGlow = "from-cyan-600/30 via-blue-600/10 to-transparent";
      badgeStyle = "bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)]";
      textGlow = "drop-shadow-[0_0_40px_rgba(6,182,212,0.5)]";
      title = "DUYDUM";
      IconComponent = Ear;
    }
  }

  return (
    <main className="min-h-screen bg-[#020205] flex flex-col items-center justify-between p-8 md:p-12 overflow-hidden cursor-none relative selection:bg-purple-500/30">
      
      <div className={`absolute inset-0 bg-gradient-to-b ${themeGlow} pointer-events-none transition-all duration-700`}></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_100%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 pointer-events-none mix-blend-overlay"></div>

      <div className="w-full max-w-7xl flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <img src="/5555.png" alt="TNKU Logo" className="w-24 md:w-28 h-auto opacity-95 drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]" />
        </div>
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-6 py-2.5 rounded-full border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
          <span className="text-red-400 font-black tracking-[0.25em] text-xs uppercase">CANLI PARTİ AKIŞI</span>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col items-center justify-center text-center z-10 my-auto px-4">
        {message ? (
          <div className={`flex flex-col items-center transition-all duration-700 ${animate ? 'animate-in zoom-in-95 fade-in duration-600' : ''}`}>
            
            <div className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border mb-10 backdrop-blur-md transition-all duration-500 ${badgeStyle}`}>
              <IconComponent size={20} className="animate-pulse" />
              <span className="text-sm md:text-base font-black tracking-[0.35em] uppercase">
                {title}
              </span>
            </div>

            <h1 className={`text-white font-black text-[3rem] md:text-[6rem] lg:text-[7rem] leading-[1.08] tracking-tight max-w-5xl break-words ${textGlow}`}>
              {message.content}
            </h1>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02] animate-pulse">
              <Sparkles className="text-white/30" size={28} />
            </div>
            <div className="text-white/30 tracking-[0.4em] text-xl md:text-2xl uppercase font-extrabold animate-pulse">
              Ortama Bomba Bir Mesaj Bekleniyor... ⚡
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-7xl flex items-center justify-between z-50">
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 px-6 py-3.5 rounded-2xl shadow-xl">
          <span className="text-white/50 tracking-widest text-xs md:text-sm font-bold uppercase">
            Masadan Gönder: <span className="text-white font-black ml-2 tracking-normal underline decoration-purple-500/50 underline-offset-4">tnkuoverheard.com.tr/parti</span>
          </span>
        </div>
        <div>
          <img 
            src="/d6.png" 
            alt="Partner Logo" 
            className="w-18 md:w-24 h-auto opacity-70 drop-shadow-lg" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />
        </div>
      </div>

    </main>
  );
}