"use client";

import { useEffect, useState } from 'react';
import { getLatestPartyMessage } from '../actions';
import { Flame, EyeOff, Ear, Radio } from 'lucide-react';

export const dynamic = 'force-dynamic'; // 🔥 NEXT.JS CACHE SİSTEMİNİ PARÇALAYAN KOD 🔥

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

  let titleColor = "text-purple-500 drop-shadow-[0_0_40px_rgba(168,85,247,0.8)]";
  let title = "SİSTEM HAZIR";

  if (message) {
    if (message.location === 'PARTY_ITIRAF') {
      titleColor = "text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]";
      title = "İTİRAF EDİYORUM";
    } else if (message.location === 'PARTY_REZIL') {
      titleColor = "text-purple-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]";
      title = "REZİL OLDUM";
    } else if (message.location === 'PARTY_OVERHEARD') {
      titleColor = "text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]";
      title = "KULAK MİSAFİRİ OLDUM";
    }
  }

  return (
    <main className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-8 overflow-hidden cursor-none relative">
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>

      <div className="fixed top-10 left-10 z-50">
        <img src="/5555.png" alt="TNKU Logo" className="w-24 md:w-32 h-auto opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
      </div>

      <div className="fixed top-12 right-12 z-50 flex items-center gap-3 bg-red-900/20 px-5 py-2 rounded-full border border-red-500/20">
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
        <span className="text-red-500/80 font-bold tracking-[0.2em] text-xs uppercase">Canlı</span>
      </div>

      <div className={`relative z-10 w-full max-w-6xl flex flex-col items-center justify-center text-center ${animate ? 'animate-in zoom-in-[0.95] fade-in duration-700 ease-out' : ''}`}>
        
        {message ? (
          <>
            <h2 className={`text-xl md:text-2xl font-black uppercase tracking-[0.6em] mb-12 opacity-90 ${titleColor}`}>
              {title}
            </h2>
            <p className="text-white font-bold text-[3rem] md:text-[5rem] leading-[1.1] break-words drop-shadow-2xl px-4">
              {message.content}
            </p>
          </>
        ) : (
          <div className="text-white/20 tracking-[0.4em] text-xl md:text-2xl uppercase animate-pulse font-medium">
            Yeni Mesaj Bekleniyor...
          </div>
        )}

      </div>

      <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center">
        <div className="text-white/40 tracking-[0.2em] text-lg md:text-xl font-medium uppercase">
          Sen de yaz: <span className="text-white/90 font-black ml-3">tnkuoverheard.com.tr/parti</span>
        </div>
      </div>

      <div className="fixed bottom-10 right-10 z-50">
        <img src="/d6.png" alt="Partner Logo" className="w-20 md:w-28 h-auto opacity-50" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>

    </main>
  );
}