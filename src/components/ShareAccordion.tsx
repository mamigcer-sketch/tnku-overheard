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
      
      {/* ÜST TIKLANABİLİR ALAN */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 sm:p-5 outline-none group"
      >
        <div className="flex items-center gap-4 text-left">
          {/* İKON ANİMASYONU: Açıldığında dönerek pembe X olur */}
          <div className={`p-3 rounded-2xl transition-all duration-500 ${
            isOpen 
              ? 'bg-pink-500/20 border border-pink-500/30 rotate-45 scale-110' 
              : 'bg-[#4DA3FF]/10 border border-[#4DA3FF]/10 group-hover:scale-105'
          }`}>
            <Plus className={`transition-colors duration-500 ${isOpen ? 'text-pink-400' : 'text-[#4DA3FF]'}`} size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-100 text-[15px]">Anonim paylaşım yapmak ister misin?</h3>
            <p className="text-[12px] text-gray-500 font-medium mt-0.5">Kampüste olan biteni anonim fısılda.</p>
          </div>
        </div>
        
        {/* OK İKONU: Açıldığında 180 derece döner */}
        <div className={`bg-white/5 w-8 h-8 flex items-center justify-center rounded-full transition-transform duration-500 ${isOpen ? 'rotate-180 bg-white/10' : ''}`}>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </button>

      {/* 🚀 EFSANE KISIM: Grid ile Yükseklik (Height) Animasyonu */}
      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-5 sm:px-5">
            {/* 🚀 FORM İÇERİĞİ ANİMASYONU: Gecikmeli süzülme (Stagger effect) */}
            <div className={`pt-4 border-t border-white/[0.05] transform transition-all duration-700 delay-[50ms] ${
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