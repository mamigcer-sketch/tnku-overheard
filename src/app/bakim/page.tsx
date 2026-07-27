"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function BakimPage() {
  const targetTime = new Date("2026-10-01T00:00:00").getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        
        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-black border border-white/15 p-2 shadow-[0_0_50px_rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden">
            <Image 
              src="/icon.jpg" 
              alt="TNKU Overheard Logo" 
              width={96} 
              height={96} 
              className="rounded-full object-cover w-full h-full"
              priority
            />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">
            BAKIMDAYIZ
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm font-medium px-4">
            HEPİNİZİ YERİM, SAYAÇ BİTTİĞİNDE BURDA OLUNN! <br />
          </p>
        </div>

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

        <div className="pt-6 border-t border-white/5">
          <p className="text-[11px] text-neutral-600 font-medium tracking-wide">
            TNKU Overheard © {new Date().getFullYear()} — Tüm Hakları Saklıdır.
          </p>
        </div>

      </div>
    </main>
  );
}