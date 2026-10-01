"use client";

import { useEffect, useState } from 'react';
import { getLatestPartyMessage } from '../actions';
import { Flame, EyeOff, Ear } from 'lucide-react';

export default function DjScreen() {
  const [message, setMessage] = useState<any>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchMsg = async () => {
      const msg = await getLatestPartyMessage();
      if (msg) {
        setMessage((prev: any) => {
          if (prev?.id !== msg.id) {
            setAnimate(false);
            setTimeout(() => setAnimate(true), 50); 
          }
          return msg;
        });
      }
    };

    fetchMsg(); 
    const interval = setInterval(fetchMsg, 3000); 
    return () => clearInterval(interval);
  }, []);

  if (!message) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-8"></div>
        <h1 className="text-3xl font-black text-white/40 animate-pulse uppercase tracking-[0.5em]">DJ Ekranı Hazır, Mesaj Bekleniyor...</h1>
      </div>
    );
  }

  // Renk ve Tema ayarları
  let themeColor = "";
  let gradientColor = "";
  let Icon = Flame;
  let title = "";

  if (message.location === 'itiraf') {
    themeColor = "text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.8)]";
    gradientColor = "from-red-900/30";
    Icon = Flame;
    title = "İTİRAF EDİYORUM";
  } else if (message.location === 'rezil') {
    themeColor = "text-purple-500 drop-shadow-[0_0_40px_rgba(168,85,247,0.8)]";
    gradientColor = "from-purple-900/30";
    Icon = EyeOff;
    title = "REZİL OLDUM";
  } else if (message.location === 'overheard') {
    themeColor = "text-blue-500 drop-shadow-[0_0_40px_rgba(59,130,246,0.8)]";
    gradientColor = "from-blue-900/30";
    Icon = Ear;
    title = "KULAK MİSAFİRİ OLDUM";
  }

  return (
    <main className="min-h-screen bg-[#020202] flex items-center justify-center p-8 md:p-24 overflow-hidden cursor-none relative">
      
      {/* Dev Arka Plan Parlaması */}
      <div className={`absolute inset-0 bg-gradient-to-b ${gradientColor} via-[#020202] to-[#020202] pointer-events-none transition-colors duration-1000`}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* 🔥 KENDİ LOGON (5555.png) ANİMASYONLU ŞEKİLDE BURADA 🔥 */}
      <div className="fixed top-8 left-8 z-[99] flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-full backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.05)]">
        
        {/* Senin 5555.png Logon - Pulse animasyonu ve havalı bir parlama eklendi */}
        <img 
          src="/5555.png" 
          alt="TNKU Logo" 
          className="w-14 h-14 object-contain animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
        />

        <div className="flex flex-col">
          <span className="text-white font-black text-xl tracking-[0.2em] leading-none drop-shadow-md">TNKU</span>
          <span className="text-white/50 font-bold text-[10px] tracking-[0.4em] leading-none mt-1.5">OVERHEARD</span>
        </div>
      </div>

      {/* Sağ Üst - CANLI YAYIN BUTONU */}
      <div className="fixed top-8 right-8 z-[99] flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-6 py-3 rounded-full backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute"></div>
        <div className="w-4 h-4 bg-red-500 rounded-full relative z-10"></div>
        <span className="text-red-500 font-black text-xl tracking-[0.2em] uppercase drop-shadow-md">Canlı Yayın</span>
      </div>

      {/* Ana İçerik Kutusu */}
      <div className={`relative z-10 w-full max-w-[90vw] flex flex-col items-center justify-center text-center ${animate ? 'animate-in zoom-in-[0.9] fade-in duration-700 ease-out' : ''}`}>
        
        {/* Başlık Kısmı */}
        <div className={`inline-flex items-center gap-6 border-b-2 pb-6 mb-16 px-12 ${message.location === 'itiraf' ? 'border-red-500/20' : message.location === 'rezil' ? 'border-purple-500/20' : 'border-blue-500/20'}`}>
          <Icon size={70} className={`${themeColor} animate-pulse`} />
          <h2 className={`text-5xl md:text-6xl font-black uppercase tracking-[0.4em] ${themeColor}`}>
            {title}
          </h2>
          <Icon size={70} className={`${themeColor} animate-pulse`} />
        </div>

        {/* Mesaj Kısmı (Dev Tırnak İşaretleri ile) */}
        <div className="relative w-full max-w-7xl">
          <span className={`absolute -top-20 -left-10 text-[15rem] font-serif leading-none opacity-20 ${themeColor}`}>"</span>
          
          <p className="text-white font-black text-[4rem] md:text-[5.5rem] leading-[1.2] break-words drop-shadow-[0_10px_30px_rgba(0,0,0,1)] relative z-10 px-12">
            {message.content}
          </p>
          
          <span className={`absolute -bottom-32 -right-10 text-[15rem] font-serif leading-none opacity-20 ${themeColor}`}>"</span>
        </div>

      </div>

      {/* Alt Bilgi - İnsanlar nereye gireceğini bilsin */}
      <div className="fixed bottom-12 left-0 right-0 z-[99] flex justify-center pointer-events-none">
        <div className="bg-white/5 border border-white/10 backdrop-blur-md px-8 py-4 rounded-3xl flex items-center gap-4 shadow-2xl">
          <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
          <p className="text-white/60 font-bold text-2xl tracking-widest uppercase">
            Sen de katıl: <span className="text-white font-black ml-2">tnkuoverheard.com.tr/parti</span>
          </p>
        </div>
      </div>

    </main>
  );
}