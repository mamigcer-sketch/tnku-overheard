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
            // Eğer yeni mesaj geldiyse dev ekrana giriş animasyonunu tetikle
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

  // Temalandırma Ayarları
  let themeGlow = "from-zinc-900/40 via-[#050505] to-[#050505]";
  let badgeStyle = "bg-white/10 border-white/20 text-white shadow-lg";
  let textGlow = "drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]";
  let title = "BEKLENİYOR";
  let IconComponent = Sparkles;

  if (message) {
    if (message.location === 'PARTY_ITIRAF') {
      themeGlow = "from-red-900/60 via-[#050505] to-[#050505]";
      badgeStyle = "bg-red-950/60 border-red-500/50 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]";
      textGlow = "drop-shadow-[0_0_40px_rgba(239,68,68,0.8)] text-white";
      title = "İTİRAF";
      IconComponent = Flame;
    } else if (message.location === 'PARTY_REZIL') {
      themeGlow = "from-fuchsia-900/60 via-[#050505] to-[#050505]";
      badgeStyle = "bg-fuchsia-950/60 border-fuchsia-500/50 text-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.5)]";
      textGlow = "drop-shadow-[0_0_40px_rgba(217,70,239,0.8)] text-white";
      title = "REZİL@";
      IconComponent = EyeOff;
    } else if (message.location === 'PARTY_OVERHEARD') {
      themeGlow = "from-cyan-900/60 via-[#050505] to-[#050505]";
      badgeStyle = "bg-cyan-950/60 border-cyan-500/50 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.5)]";
      textGlow = "drop-shadow-[0_0_40px_rgba(6,182,212,0.8)] text-white";
      title = "DUYDUM";
      IconComponent = Ear;
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col justify-between p-10 overflow-hidden cursor-none relative font-sans selection:bg-transparent">
      
      {/* 1. SİNAMATİK ARKA PLAN EFEKTLERİ */}
      <div className={`absolute inset-0 bg-gradient-to-b ${themeGlow} transition-colors duration-1000 ease-in-out`}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay pointer-events-none"></div>
      
      {/* Hafif hareketli ambient ışık (Yeni mesaj geldiğinde arkada yanan devasa hafif ışık) */}
      {message && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '4s' }}></div>
      )}

      {/* ÜST BAR (Header) */}
      <header className="relative z-10 w-full flex justify-between items-start">
        {/* Sol Üst Logo - Görselindeki yapıya uygun yuvarlak, parlayan logo */}
        <div className="flex items-center">
          <div className="w-24 h-24 rounded-full bg-[#0a1435] border border-blue-500/40 flex items-center justify-center p-3 backdrop-blur-md shadow-[0_0_40px_rgba(30,58,138,0.4)]">
             <img src="/5555.png" alt="TNKU Logo" className="w-full h-full object-contain drop-shadow-xl" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
        </div>

        {/* Sağ Üst Canlı Yayın Bildirgeci */}
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-2xl">
          <Radio size={18} className="text-red-500 animate-pulse" />
          <span className="text-gray-300 font-bold tracking-[0.2em] text-sm uppercase">Canlı Parti Akışı</span>
        </div>
      </header>

      {/* MERKEZ (Ana Mesaj Alanı) */}
      <section className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-8">
        {message ? (
          /* Animasyonlu kapsayıcı: Yeni mesaj geldiğinde alttan büyüyerek girer */
          <div className={`max-w-7xl mx-auto flex flex-col items-center transform transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-90'}`}>
            
            {/* Kategori Rozeti */}
            <div className={`inline-flex items-center gap-3 px-8 py-3 rounded-full border mb-12 backdrop-blur-md ${badgeStyle}`}>
              <IconComponent size={24} className={isAnimating ? "animate-bounce" : ""} style={{ animationDuration: '2s' }} />
              <span className="text-xl md:text-2xl font-black tracking-[0.4em] uppercase">
                {title}
              </span>
            </div>

            {/* Dev Mesaj Metni - Yazılar daha keskin ve devasa */}
            <h1 className={`font-black text-[5rem] md:text-[7rem] lg:text-[10rem] leading-[1.05] tracking-tighter break-words max-w-[95vw] ${textGlow}`}>
              {message.content}
            </h1>

          </div>
        ) : (
          /* Mesaj Yokken Bekleme Ekranı */
          <div className="flex flex-col items-center gap-6 opacity-30">
            <Sparkles size={64} className="text-white animate-pulse" style={{ animationDuration: '3s' }} />
            <h2 className="text-white text-3xl font-bold tracking-[0.5em] uppercase">Mesaj Bekleniyor</h2>
          </div>
        )}
      </section>

      {/* ALT BAR (Footer & Sponsor) */}
      <footer className="relative z-10 w-full flex justify-between items-end">
        {/* Sol Alt - Gönderim Bilgisi */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4">
          <span className="text-gray-400 font-bold tracking-widest text-sm uppercase">Masadan Gönder:</span>
          <span className="text-white font-black text-xl tracking-wider">
            TNKUOVERHEARD.COM.TR/PARTİ
          </span>
        </div>

        {/* Sağ Alt - Sponsor Logosu (d6.png) - Şık bir kapsayıcı içinde */}
        <div className="flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl">
          <img 
            src="/d6.png" 
            alt="Sponsor Logo" 
            className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] opacity-95"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      </footer>

    </main>
  );
}