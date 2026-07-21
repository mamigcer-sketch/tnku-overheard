"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

export default function CountdownWidget({ countdown }: { countdown: any }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!countdown || !countdown.isActive) return;

    const target = new Date(countdown.targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  // Sayaç süresi bitmişse veya aktif değilse bileşeni hiç gösterme
  if (!isMounted || !countdown || !countdown.isActive) return null;
  const isExpired = new Date(countdown.targetDate).getTime() - new Date().getTime() < 0;
  if (isExpired) return null;

  return (
    <div className="bg-[#121212]/90 backdrop-blur-xl border border-red-500/20 rounded-[24px] p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(239,68,68,0.08)] overflow-hidden">
      
      {/* Sol Taraf - Başlık ve İkon */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="bg-red-500/10 p-2.5 rounded-full border border-red-500/20 shrink-0">
          <Timer className="text-red-400 animate-pulse" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-black text-sm tracking-tight truncate" title={countdown.title}>
            {countdown.title}
          </h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
            Geri Sayım
          </p>
        </div>
      </div>
      
      {/* Sağ Taraf - Dinamik Sayaç Kutuları */}
      <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 text-center w-full sm:w-auto">
        <div className="bg-black/50 border border-white/5 rounded-xl py-1.5 flex-1 sm:flex-none sm:min-w-[50px] shadow-inner">
          <span className="block text-red-400 font-black text-sm sm:text-base">{timeLeft.days}</span>
          <span className="block text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase">Gün</span>
        </div>
        
        <span className="text-gray-700 font-black self-center text-sm sm:text-lg mb-2 sm:mb-1">:</span>
        
        <div className="bg-black/50 border border-white/5 rounded-xl py-1.5 flex-1 sm:flex-none sm:min-w-[50px] shadow-inner">
          <span className="block text-red-400 font-black text-sm sm:text-base">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="block text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase">Saat</span>
        </div>
        
        <span className="text-gray-700 font-black self-center text-sm sm:text-lg mb-2 sm:mb-1">:</span>
        
        <div className="bg-black/50 border border-white/5 rounded-xl py-1.5 flex-1 sm:flex-none sm:min-w-[50px] shadow-inner">
          <span className="block text-red-400 font-black text-sm sm:text-base">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="block text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase">Dk</span>
        </div>
        
        <span className="text-gray-700 font-black self-center text-sm sm:text-lg mb-2 sm:mb-1">:</span>
        
        <div className="bg-black/50 border border-white/5 rounded-xl py-1.5 flex-1 sm:flex-none sm:min-w-[50px] shadow-inner">
          <span className="block text-red-400 font-black text-sm sm:text-base">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="block text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase">Sn</span>
        </div>
      </div>

    </div>
  );
}