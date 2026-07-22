"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";

export default function AdminStoryExporter({ postContent, postType, authorName }: { postContent: string; postType: string; authorName: string }) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownloadPng = async () => {
    if (!storyRef.current) return;
    setLoading(true);
    try {
      // Piksel oranını ve boyutları 1080x1920'ye sabitliyoruz (Beyaz boşluk sorununu çözer)
      const dataUrl = await toPng(storyRef.current, { 
        cacheBust: true, 
        pixelRatio: 1, 
        width: 1080,
        height: 1920,
        style: {
          transform: 'none',
        }
      });
      
      const link = document.createElement("a");
      link.download = `tnku-story-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Story indirme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      {/* İndir Butonu */}
      <button
        onClick={handleDownloadPng}
        disabled={loading}
        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] active:scale-95 disabled:opacity-50"
      >
        <Download size={14} />
        {loading ? "Hazırlanıyor..." : "Story İndir (PNG)"}
      </button>

      {/* GİZLİ ŞABLON KAPSAYICISI - Ekrandan tamamen saklı ama tam boyut render edilir */}
      <div 
        className="absolute pointer-events-none opacity-0" 
        style={{ top: '-10000px', left: '-10000px' }}
      >
        
        {/* ASIL 1080x1920 TASARIM */}
        <div 
          ref={storyRef}
          className="bg-[#050505] text-white p-20 flex flex-col justify-between relative overflow-hidden"
          style={{ width: '1080px', height: '1920px' }}
        >
          {/* Arka Plan Neon Parlamaları */}
          <div className="absolute top-[-5%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#4DA3FF]/30 blur-[150px] pointer-events-none z-0" />
          <div className="absolute bottom-[5%] right-[-10%] w-[900px] h-[900px] rounded-full bg-purple-600/30 blur-[150px] pointer-events-none z-0" />

          {/* Üst Logo Alanı */}
          <div className="flex items-center justify-between z-10 border-b border-white/10 pb-12 mt-10">
            <h1 className="text-5xl font-extrabold tracking-tighter">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span></h1>
            <span className="bg-white/10 text-white px-8 py-4 rounded-full text-3xl font-bold uppercase tracking-widest border border-white/10 shadow-lg">
              {postType === 'CONFESSION' ? 'İTİRAF 🎭' : postType === 'BOSYAP' ? 'BOŞ YAP ☕' : 'FISILTI 📌'}
            </span>
          </div>

          {/* Orta İçerik Kartı */}
          <div className="my-auto z-10 bg-white/[0.04] backdrop-blur-3xl border border-white/10 p-20 rounded-[48px] shadow-[0_30px_80px_rgba(0,0,0,0.9)] relative">
            <div className="absolute -top-8 left-16 bg-gradient-to-r from-amber-500 to-pink-500 text-black px-8 py-4 rounded-full text-2xl font-black uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              @ {authorName}
            </div>
            
            <p className="text-5xl leading-[1.6] font-semibold text-gray-100 tracking-wide mt-8">
              "{postContent}"
            </p>
          </div>

          {/* Alt Bilgi / Yönlendirme - 🔥 YUKARI ALINDI (mb-48 ile alt tarafta boşluk bırakıldı) */}
          <div className="z-10 text-center border-t border-white/10 pt-16 pb-8 flex flex-col items-center justify-center gap-6 mb-48">
            <p className="text-3xl font-bold text-gray-400 uppercase tracking-widest">Devamı ve daha fazlası için:</p>
            <span className="text-5xl font-black text-[#4DA3FF] tracking-wider drop-shadow-[0_0_15px_rgba(77,163,255,0.6)]">www.tnkuoverheard.com.tr</span>
          </div>
        </div>

      </div>
    </div>
  );
}