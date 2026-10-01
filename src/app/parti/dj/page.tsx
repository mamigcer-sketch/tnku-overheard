"use client";

import { useEffect, useState } from 'react';

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

  let glowColor = "from-purple-500/10 via-pink-500/5 to-transparent";
  let borderColor = "border-white/10";
  let badgeColor = "bg-purple-500/20 text-purple-400 border-purple-500/30";
  let title = "";

  if (message) {
    if (message.location === 'PARTY_ITIRAF') {
      glowColor = "from-red-600/30 via-orange-600/10 to-transparent";
      borderColor = "border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.2)]";
      badgeColor = "bg-red-500/20 text-red-400 border-red-500/40";
      title = "🔥 İTİRAF EDİYORUM";
    } else if (message.location === 'PARTY_REZIL') {
      glowColor = "from-purple-600/30 via-indigo-600/10 to-transparent";
      borderColor = "border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]";
      badgeColor = "bg-purple-500/20 text-purple-400 border-purple-500/40";
      title = "💀 REZİL OLDUM";
    } else if (message.location === 'PARTY_OVERHEARD') {
      glowColor = "from-blue-600/30 via-cyan-600/10 to-transparent";
      borderColor = "border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.2)]";
      badgeColor = "bg-blue-500/20 text-blue-400 border-blue-500/40";
      title = "👂 KULAK MİSAFİRİ OLDUM";
    }
  }

  return (
    <main className="min-h-screen bg-[#030305] flex flex-col items-center justify-between p-8 overflow-hidden cursor-none relative selection:bg-purple-500/30">
      
      {/* Arka Plan Atmosferik Işıklandırma (Glow) */}
      <div className={`absolute inset-0 bg-gradient-to-t ${glowColor} pointer-events-none transition-all duration-700`}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* Üst Bar */}
      <div className="w-full max-w-7xl flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <img src="/5555.png" alt="TNKU Logo" className="w-20 md:w-24 h-auto opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
        </div>

        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-5 py-2 rounded-full border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
          <span className="text-red-400 font-black tracking-[0.2em] text-xs uppercase">CANLI AKIŞ</span>
        </div>
      </div>

      {/* Orta Alan - Mesaj Kartı */}
      <div className="w-full max-w-5xl flex flex-col items-center justify-center text-center z-10 my-auto">
        {message ? (
          <div className={`w-full bg-[#0a0a0f]/80 backdrop-blur-xl border ${borderColor} rounded-[36px] p-12 md:p-16 transition-all duration-500 relative overflow-hidden ${animate ? 'animate-in zoom-in-95 fade-in duration-500' : ''}`}>
            
            {/* Kart İçi Hafif Işık Efekti */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>

            <div className="inline-block mb-6">
              <span className={`text-xs md:text-sm font-black uppercase tracking-[0.4em] px-5 py-2 rounded-full border ${badgeColor}`}>
                {title}
              </span>
            </div>

            <p className="text-white font-extrabold text-[2.5rem] md:text-[4.5rem] leading-[1.15] break-words drop-shadow-2xl">
              "{message.content}"
            </p>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/5 rounded-[36px] p-16 backdrop-blur-md">
            <div className="text-white/30 tracking-[0.3em] text-xl md:text-2xl uppercase animate-pulse font-bold">
              Ortama Bomba Bir Mesaj Bekleniyor... ⚡
            </div>
          </div>
        )}
      </div>

      {/* Alt Bar */}
      <div className="w-full max-w-7xl flex items-center justify-between z-50 pt-4">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl">
          <span className="text-white/50 tracking-widest text-xs md:text-sm font-bold uppercase">
            Hemen Gönder: <span className="text-white font-black ml-2 tracking-normal">tnkuoverheard.com.tr/parti</span>
          </span>
        </div>

        <div>
          <img 
            src="/d6.png" 
            alt="Partner Logo" 
            className="w-16 md:w-20 h-auto opacity-60 drop-shadow-md" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />
        </div>
      </div>

    </main>
  );
}