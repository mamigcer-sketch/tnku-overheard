"use client";

import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';

export default function ShareAccordion({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleToggle = () => {
    triggerHaptic();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative z-10 bg-white/[0.02] backdrop-blur-2xl border transition-all duration-500 rounded-[24px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden ${
      isOpen ? 'border-white/[0.15] bg-white/[0.04]' : 'border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04]'
    }`}>
      
      {/* ÜST TIKLANABİLİR ALAN - Mobilde p-3, Bilgisayarda p-5 yapıldı */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 sm:p-5 outline-none group gap-2"
      >
        <div className="flex items-center gap-3 sm:gap-4 text-left">
          
          {/* İKON ANİMASYONU: Mobilde boyutu ve iç boşluğu küçültüldü */}
          <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-500 shrink-0 ${
            isOpen 
              ? 'bg-pink-500/20 border border-pink-500/30 rotate-45 sm:scale-110' 
              : 'bg-[#4DA3FF]/10 border border-[#4DA3FF]/10 group-hover:scale-105'
          }`}>
            <Plus className={`transition-colors duration-500 ${isOpen ? 'text-pink-400' : 'text-[#4DA3FF]'}`} size={18} />
          </div>
          
          <div>
            {/* YAZILAR: Mobilde font boyutları bir tık ufalatıldı */}
            <h3 className="font-bold text-gray-100 text-[13px] sm:text-[15px] leading-tight sm:leading-normal">
              Anonim paylaşım yapmak ister misin?
            </h3>
            <p className="text-[11px] sm:text-[12px] text-gray-500 font-medium mt-0.5">
              Kampüste olan biteni anonim fısılda.
            </p>
          </div>
        </div>
        
        {/* OK İKONU: Mobilde boyutu bir tık küçültüldü */}
        <div className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-transform duration-500 ${isOpen ? 'rotate-180 bg-white/10' : 'bg-white/5'}`}>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </button>

      {/* Grid ile Yükseklik Animasyonu */}
      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}>
        <div className="overflow-hidden">
          <div className="px-3 pb-4 sm:px-5 sm:pb-5">
            <div className={`pt-3 sm:pt-4 border-t border-white/[0.05] transform transition-all duration-700 delay-[50ms] ${
              isOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-[0.95]'
            }`}>
                {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}