"use client";

import { useEffect, useState } from "react";
import { Flame, Disc, Music2, Trophy } from "lucide-react";

export default function DjScreen() {
  const [stats, setStats] = useState<any>(null);
  const [leading, setLeading] = useState<string>("POP");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/parti?t=" + Date.now(), { cache: "no-store" });
        const data = await res.json();
        if (data && data.stats) {
          setStats(data.stats);
          setLeading(data.leading);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const genres = [
    { id: "POP", title: "TÜRKÇE POP", icon: Flame, color: "#ec4899", bgGlow: "rgba(236,72,153,0.3)" },
    { id: "RAP", title: "TÜRKÇE RAP", icon: Disc, color: "#a855f7", bgGlow: "rgba(168,85,247,0.3)" },
    { id: "ROCK", title: "TÜRKÇE ROCK", icon: Music2, color: "#f59e0b", bgGlow: "rgba(245,158,11,0.3)" },
  ];

  const leadingObj = genres.find(g => g.id === leading) || genres[0];

  return (
    <main className="min-h-screen bg-[#030208] text-white flex flex-col justify-between p-8 md:p-12 select-none relative overflow-hidden">
      
      {/* Şampiyon Renge Göre Atmosfer Işığı */}
      <div 
        className="absolute inset-0 transition-all duration-1000 opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${leadingObj.color} 0%, transparent 70%)`
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase">CANLI MÜZİK OYLAMASI</h1>
          <p className="text-gray-400 font-bold tracking-widest text-sm mt-1">overheardparty.xyz/parti</p>
        </div>

        {/* Lider Rozeti */}
        <div 
          className="flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-xl animate-pulse"
          style={{ borderColor: leadingObj.color, background: leadingObj.bgGlow }}
        >
          <Trophy size={28} style={{ color: leadingObj.color }} />
          <div>
            <span className="text-[10px] font-black tracking-widest text-white/70 block">ŞU AN ÖNDE</span>
            <span className="text-xl font-black tracking-wider uppercase" style={{ color: leadingObj.color }}>
              {leadingObj.title}
            </span>
          </div>
        </div>
      </header>

      {/* Canlı Yüzde Barları */}
      <section className="relative z-10 my-auto space-y-8 max-w-6xl w-full mx-auto">
        {genres.map((g) => {
          const percent = stats ? stats[g.id]?.percent || 0 : 0;
          const count = stats ? stats[g.id]?.count || 0 : 0;
          const isLeading = leading === g.id;
          const Icon = g.icon;

          return (
            <div key={g.id} className="relative">
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-3">
                  <Icon size={36} style={{ color: g.color }} />
                  <span className="text-2xl md:text-4xl font-black tracking-wider">{g.title}</span>
                  {isLeading && (
                    <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase">
                      LİDER 🔥
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-4xl md:text-6xl font-black" style={{ color: g.color }}>{percent}%</span>
                  <span className="text-xs text-gray-400 font-bold ml-3">({count} OY)</span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="h-12 md:h-16 w-full bg-black/60 rounded-2xl border border-white/10 p-1.5 backdrop-blur-md relative overflow-hidden">
                <div 
                  className="h-full rounded-xl transition-all duration-1000 relative"
                  style={{ 
                    width: `${Math.max(percent, 2)}%`,
                    background: `linear-gradient(90deg, ${g.color}aa, ${g.color})`,
                    boxShadow: `0 0 30px ${g.color}80`
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center border-t border-white/10 pt-6">
        <span className="text-gray-400 font-black tracking-[0.4em] text-sm md:text-lg">
          MASADAN OYUNU VER ➔ OVERHEARDPARTY.XYZ/PARTI
        </span>
      </footer>
    </main>
  );
}