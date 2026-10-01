"use client";

import { useEffect, useState } from 'react';
import { getLatestPartyMessage } from '../actions';
import { Flame, EyeOff, Ear } from 'lucide-react';

export default function DjScreen() {
  const [message, setMessage] = useState<any>(null);
  const [animate, setAnimate] = useState(false);

  // 🔥 EFSANE ÖZELLİK: Sayfayı yenilemeden her 3 saniyede bir veritabanına bakıp yeni mesajı çeker
  useEffect(() => {
    const fetchMsg = async () => {
      const msg = await getLatestPartyMessage();
      if (msg) {
        setMessage((prev: any) => {
          // Eğer yeni bir mesaj geldiyse animasyon tetikle
          if (prev?.id !== msg.id) {
            setAnimate(false);
            setTimeout(() => setAnimate(true), 50); // Animasyon restart trigeri
          }
          return msg;
        });
      }
    };

    fetchMsg(); // İlk açılışta çek
    const interval = setInterval(fetchMsg, 3000); // 3 saniyede bir kontrol et
    return () => clearInterval(interval);
  }, []);

  if (!message) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <h1 className="text-4xl font-black text-white/20 animate-pulse uppercase tracking-[1em]">Mesaj Bekleniyor...</h1>
      </div>
    );
  }

  // Renk ve Tema ayarları
  let themeColor = "";
  let Icon = Flame;
  let title = "";

  if (message.location === 'itiraf') {
    themeColor = "text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]";
    Icon = Flame;
    title = "İTİRAF EDİYORUM";
  } else if (message.location === 'rezil') {
    themeColor = "text-purple-500 drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]";
    Icon = EyeOff;
    title = "REZİL OLDUM";
  } else if (message.location === 'overheard') {
    themeColor = "text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.8)]";
    Icon = Ear;
    title = "KULAK MİSAFİRİ OLDUM";
  }

  return (
    // Ekranda cursor gözükmesin diye cursor-none eklendi
    <main className="min-h-screen bg-black flex items-center justify-center p-12 overflow-hidden cursor-none">
      
      {/* Dev Arka Plan Parlaması */}
      <div className={`absolute inset-0 bg-gradient-to-b ${message.location === 'itiraf' ? 'from-red-900/20' : message.location === 'rezil' ? 'from-purple-900/20' : 'from-blue-900/20'} to-black pointer-events-none transition-colors duration-1000`}></div>
      
      <div className={`relative z-10 w-full max-w-7xl flex flex-col items-center justify-center text-center ${animate ? 'animate-in zoom-in-50 fade-in duration-700 spring-bounce' : ''}`}>
        
        <div className={`inline-flex items-center gap-6 border-b-4 pb-6 mb-12 ${message.location === 'itiraf' ? 'border-red-500/30' : message.location === 'rezil' ? 'border-purple-500/30' : 'border-blue-500/30'}`}>
          <Icon size={80} className={themeColor} />
          <h2 className={`text-6xl font-black uppercase tracking-[0.3em] ${themeColor}`}>
            {title}
          </h2>
          <Icon size={80} className={themeColor} />
        </div>

        <p className="text-white font-black text-[5rem] leading-tight break-words max-w-6xl drop-shadow-[0_10px_20px_rgba(0,0,0,1)]">
          "{message.content}"
        </p>

        {/* Canlı Yayın İkonu */}
        <div className="absolute top-8 right-8 flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-6 py-3 rounded-full">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
          <span className="text-red-500 font-black text-xl tracking-widest uppercase">Canlı Yayın</span>
        </div>

      </div>
    </main>
  );
}