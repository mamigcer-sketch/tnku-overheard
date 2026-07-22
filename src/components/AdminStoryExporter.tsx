"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Sparkles, Image as ImageIcon } from "lucide-react";

export default function AdminStoryExporter({ postContent, postType, authorName }: { postContent: string; postType: string; authorName: string }) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownloadPng = async () => {
    if (!storyRef.current) return;
    setLoading(true);
    try {
      // HTML elementini yüksek kaliteli PNG'ye çeviriyoruz
      const dataUrl = await toPng(storyRef.current, { cacheBust: true, pixelRatio: 2 });
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
    <div className="space-y-4">
      {/* İndir Butonu */}
      <button
        onClick={handleDownloadPng}
        disabled={loading}
        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] active:scale-95 disabled:opacity-50"
      >
        <Download size={14} />
        {loading ? "PNG Hazırlanıyor..." : "Story Olarak İndir (PNG)"}
      </button>

      {/* GİZLİ VEYA ÖNİZLEMELİ HİKAYE ŞABLONU (1080x1920 Instagram Story Oranı) */}
      {/* Kullanıcıya görselin nasıl çıkacağını göstermek için küçük önizleme yapabiliriz veya ekrandan gizleyebiliriz */}
      <div className="overflow-hidden rounded-2xl border border-white/10 w-full max-w-[280px] aspect-[9/16] relative shadow-2xl">
        <div 
          ref={storyRef}
          className="w-[1080px] h-[1920px] bg-[#050505] text-white p-20 flex flex-col justify-between relative select-none origin-top-left scale-[0.25]"
          style={{ width: '1080px', height: '1920px' }}
        >
          {/* Arka Plan Neon Parlamaları */}
          <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#4DA3FF]/20 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none" />

          {/* Üst Logo Alanı */}
          <div className="flex items-center justify-between z-10 border-b border-white/10 pb-10">
            <h1 className="text-4xl font-extrabold tracking-tighter">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span></h1>
            <span className="bg-white/10 text-white px-6 py-2.5 rounded-full text-xl font-bold uppercase tracking-widest border border-white/10">
              {postType === 'CONFESSION' ? 'İTİRAF 🎭' : 'FISILTI 📌'}
            </span>
          </div>

          {/* Orta İçerik Kartı */}
          <div className="my-auto z-10 bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-16 rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative">
            <div className="absolute -top-6 left-12 bg-gradient-to-r from-amber-500 to-pink-500 text-black px-6 py-2 rounded-full text-xl font-black uppercase tracking-wider">
              @ {authorName}
            </div>
            
            <p className="text-5xl leading-[1.4] font-semibold text-gray-100 tracking-wide mt-6">
              "{postContent}"
            </p>
          </div>

          {/* Alt Bilgi / Yönlendirme */}
          <div className="z-10 text-center border-t border-white/10 pt-10 flex flex-col items-center justify-center gap-4">
            <p className="text-2xl font-bold text-gray-400">Devamı ve daha fazlası için:</p>
            <span className="text-4xl font-black text-[#4DA3FF] tracking-wider">www.tnkuoverheard.com.tr</span>
          </div>
        </div>
      </div>
    </div>
  );
}