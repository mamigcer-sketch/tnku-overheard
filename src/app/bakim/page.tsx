"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function BakimPage() {
  // 🔥 Hedef bakım bitiş tarihini buraya yazabilirsin (Örn: Yıl, Ay(0-11), Gün, Saat, Dakika)
  const targetDate = new Date("2026-09-1T23:59:59").getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      
      {/* Hafif arka plan derinlik efekti */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        
        {/* Logo Alanı */}
        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-black border border-white/10 p-4 shadow-[0_0_40px_rgba(255,255,255,0.03)] flex items-center justify-center">
            {/* Eğer public klasöründe logo dosyan varsa (örn: logo.png veya icon.jpg) buraya yazabilirsin */}
            <Image 
              src="/icon.jpg" 
              alt="TNKU Overheard Logo" 
              width={80} 
              height={80} 
              className="rounded-2xl object-cover"
              priority
            />
          </div>
        </div>

        {/* Başlık */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 bg-neutral-900/80 px-3 py-1.5 rounded-full border border-white/5">
            Sistem Güncelleniyor
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">
            BAKIMDAYIZ
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm font-medium px-4">
            Değirmenaltı'nın nabzını daha güçlü tutmak için altyapıyı yeniliyoruz. Çok yakındayız.
          </p>
        </div>

        {/* Simsiyah Sayaç Kutuları */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 pt-2">
          {[
            { label: "GÜN", value: timeLeft.days },
            { label: "SAAT", value: timeLeft.hours },
            { label: "DAKİKA", value: timeLeft.minutes },
            { label: "SANİYE", value: timeLeft.seconds },
          ].map((item, index) => (
            <div 
              key={index} 
              className="bg-[#050505] border border-white/10 rounded-2xl p-3 sm:p-4 text-center shadow-inner flex flex-col items-center justify-center"
            >
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-white font-mono">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="text-[9px] font-bold text-neutral-500 tracking-wider mt-0.5">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Alt Bilgi */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-[11px] text-neutral-600 font-medium tracking-wide">
            TNKU Overheard © {new Date().getFullYear()} — Tüm Hakları Saklıdır.
          </p>
        </div>

      </div>
    </main>
  );
}