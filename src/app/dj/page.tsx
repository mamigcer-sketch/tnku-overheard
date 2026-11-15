"use client";

import { useEffect, useState, useRef } from 'react';
import { Flame, Disc, Music2, Camera } from 'lucide-react';
import Image from 'next/image';

export default function DjScreen() {
  const [stats, setStats] = useState<any>(null);
  const [leading, setLeading] = useState<string>("POP");
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [photoState, setPhotoState] = useState<{ active: boolean; photoUrl: string | null; caption: string }>({
    active: false,
    photoUrl: null,
    caption: 'GECENİN EN GÜZEL KARESİ 📸',
  });

  const processedReactionIds = useRef<Set<number>>(new Set());

  // Oylama verileri
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/parti?t=" + Date.now(), { cache: "no-store" });
        const data = await res.json();
        if (data && data.stats) {
          setStats(data.stats);
          setLeading(data.leading || "POP");
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fotoğraf Modu Kontrolü
  useEffect(() => {
    const fetchPhotoState = async () => {
      try {
        const res = await fetch("/api/photo?t=" + Date.now(), { cache: "no-store" });
        const data = await res.json();
        if (data) setPhotoState(data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchPhotoState();
    const interval = setInterval(fetchPhotoState, 1500);
    return () => clearInterval(interval);
  }, []);

  // Emojiler
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const res = await fetch("/api/reaction?t=" + Date.now(), { cache: "no-store" });
        const data = await res.json();
        if (data && data.reactions) {
          data.reactions.forEach((item: { id: number; emoji: string }) => {
            if (!processedReactionIds.current.has(item.id)) {
              processedReactionIds.current.add(item.id);
              const left = Math.random() * 80 + 10;
              setFloatingEmojis((prev) => [...prev, { id: item.id, emoji: item.emoji, left }]);
              setTimeout(() => {
                setFloatingEmojis((prev) => prev.filter((e) => e.id !== item.id));
              }, 2500);
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchReactions();
    const interval = setInterval(fetchReactions, 800);
    return () => clearInterval(interval);
  }, []);

  const genres = [
    { 
      id: "POP", 
      title: "TÜRKÇE POP", 
      icon: Flame, 
      color: "from-pink-500 to-rose-600", 
      hex: "#ec4899",
      bgImage: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000&auto=format&fit=crop"
    },
    { 
      id: "RAP", 
      title: "TÜRKÇE RAP", 
      icon: Disc, 
      color: "from-purple-500 to-indigo-600", 
      hex: "#a855f7",
      bgImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000&auto=format&fit=crop"
    },
    { 
      id: "ROCK", 
      title: "TÜRKÇE ROCK", 
      icon: Music2, 
      color: "from-amber-500 to-red-600", 
      hex: "#f59e0b",
      bgImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop"
    },
  ];

  const leadingObj = genres.find(g => g.id === leading) || genres[0];

  return (
    <main className="min-h-screen bg-[#030107] text-white flex flex-col justify-between p-6 md:p-10 select-none relative overflow-hidden">
      
      {/* 📸 CANLI FOTOĞRAF MODU (ADMİN'DEN GÖNDERİLİNCE AÇILIR) */}
      {photoState.active && photoState.photoUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 md:p-12 animate-fade-in backdrop-blur-3xl">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-pink-900/30 blur-3xl" />
          
          {/* Logo & Başlık */}
          <div className="relative z-10 text-center mb-6">
            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 px-6 py-2.5 rounded-full backdrop-blur-md mb-3 animate-bounce">
              <Camera className="text-pink-400" size={24} />
              <span className="text-sm font-black tracking-widest text-white uppercase">GECENİN EN GÜZEL KARESİ 📸</span>
            </div>
          </div>

          {/* Fotoğraf Frame */}
          <div className="relative z-10 max-w-5xl max-h-[75vh] w-full h-full rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-[0_0_100px_rgba(236,72,153,0.4)] bg-black/50 p-3">
            <img 
              src={photoState.photoUrl} 
              alt="Gecenin Kare" 
              className="w-full h-full object-contain rounded-[2.5rem]" 
            />
          </div>
        </div>
      )}

      {/* Uçuşan Emojiler */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-10 text-6xl animate-fade-in"
            style={{
              left: `${item.left}%`,
              animation: 'floatUpDj 2.5s ease-out forwards'
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Arka Plan Atmosfer Işığı */}
      <div 
        className="absolute inset-0 transition-all duration-1000 opacity-25 pointer-events-none filter blur-[140px] animate-pulse"
        style={{ background: `radial-gradient(circle at 50% 50%, ${leadingObj.hex} 0%, transparent 70%)` }}
      />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center bg-black/50 backdrop-blur-2xl border border-white/10 px-8 py-5 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/60 flex items-center justify-center">
            <Image 
              src="/5555.png" 
              alt="Logo" 
              fill 
              className="object-contain p-2"
            />
          </div>
          <div>
            <span className="text-xs font-black tracking-[0.4em] text-purple-400 uppercase block mb-1">CANLI OYLAMA</span>
            <h1 className="text-2xl md:text-4xl font-black tracking-wider uppercase">MÜZİK SEÇİMİ</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3.5 rounded-2xl backdrop-blur-md shadow-xl">
          <div className="text-right">
            <span className="text-[10px] font-black tracking-widest text-gray-400 block uppercase">ŞU AN SALONUN FAVORİSİ</span>
            <span className="text-xl font-black tracking-wider uppercase" style={{ color: leadingObj.hex }}>
              {leadingObj.title} 🔥
            </span>
          </div>
        </div>
      </header>

      {/* 3'lü Sütun Kartlar */}
      <section className="relative z-10 my-auto grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full mx-auto py-6">
        {genres.map((g) => {
          const percent = stats ? stats[g.id]?.percent || 0 : 0;
          const isLeading = leading === g.id;
          const Icon = g.icon;

          return (
            <div 
              key={g.id}
              className={`relative flex flex-col justify-between p-8 rounded-[2.5rem] border transition-all duration-700 overflow-hidden group ${
                isLeading 
                  ? 'scale-105 z-20 shadow-[0_0_70px_rgba(0,0,0,0.95)] animate-[pulse_3s_infinite]' 
                  : 'opacity-50 scale-95 border-white/10'
              }`}
              style={{
                borderColor: isLeading ? g.hex : 'rgba(255,255,255,0.1)',
                boxShadow: isLeading ? `0 0 60px ${g.hex}60` : 'none'
              }}
            >
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-1000 ${isLeading ? 'scale-110 animate-pulse' : 'scale-100'}`}
                style={{ backgroundImage: `url(${g.bgImage})` }}
              />
              <div className={`absolute inset-0 transition-opacity duration-700 ${isLeading ? 'bg-gradient-to-t from-black via-black/80 to-black/40' : 'bg-black/90'}`} />

              <div className="relative z-10 flex items-center justify-between">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-md"
                  style={{ background: isLeading ? g.hex : 'rgba(0,0,0,0.6)', color: '#fff' }}
                >
                  <Icon size={34} className={isLeading ? 'animate-bounce' : ''} />
                </div>

                {isLeading && (
                  <div className="flex items-center gap-2 bg-white text-black font-black text-xs px-4 py-1.5 rounded-full tracking-widest shadow-2xl uppercase">
                    <div className="flex items-end gap-0.5 h-3">
                      <span className="w-1 bg-black animate-[ping_1s_infinite_100ms] h-full rounded-full" />
                      <span className="w-1 bg-black animate-[ping_1s_infinite_300ms] h-2/3 rounded-full" />
                      <span className="w-1 bg-black animate-[ping_1s_infinite_200ms] h-full rounded-full" />
                    </div>
                    <span>👑 SALONUN LİDERİ</span>
                  </div>
                )}
              </div>

              <div className="relative z-10 mt-6">
                <h2 className={`font-black tracking-wider uppercase ${isLeading ? 'text-3xl md:text-4xl text-white drop-shadow-md' : 'text-xl text-gray-300'}`}>
                  {g.title}
                </h2>
              </div>

              <div className="relative z-10 my-8 text-center">
                <span 
                  className={`font-black tracking-tighter block transition-all duration-500 drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] ${
                    isLeading ? 'text-7xl md:text-9xl animate-pulse' : 'text-6xl md:text-7xl'
                  }`} 
                  style={{ color: isLeading ? g.hex : '#fff' }}
                >
                  {percent}%
                </span>
              </div>

              <div className="relative z-10 w-full bg-black/90 rounded-2xl border border-white/20 h-6 p-1 backdrop-blur-md overflow-hidden">
                <div 
                  className={`h-full rounded-xl transition-all duration-1000 bg-gradient-to-r ${g.color} relative overflow-hidden`}
                  style={{ width: `${Math.max(percent, 4)}%`, boxShadow: isLeading ? `0 0 30px ${g.hex}` : 'none' }}
                >
                  {isLeading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <footer className="relative z-10 text-center pt-2">
        <span className="text-gray-500 font-bold tracking-[0.3em] text-xs uppercase">
          OFFDAY ORGANİZASYON SAHNE SİSTEMİ
        </span>
      </footer>

      <style jsx global>{`
        @keyframes floatUpDj {
          0% { transform: translateY(0px) scale(0.8); opacity: 1; }
          100% { transform: translateY(-400px) scale(1.6); opacity: 0; }
        }
      `}</style>
    </main>
  );
}