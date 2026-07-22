"use client";

import { useState, useEffect } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';

export default function ShareBottomSheet({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  // Modal açıkken arkadaki sayfanın kaymasını engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      {/* 🔥 Tetikleyici Buton (Eski Accordion yerine parmak dostu şık tasarım) */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#4DA3FF]/15 via-purple-500/15 to-[#4DA3FF]/15 border border-white/10 hover:border-white/20 text-white font-bold flex items-center justify-between gap-2 shadow-[0_0_25px_rgba(77,163,255,0.1)] transition-all active:scale-[0.98] group cursor-pointer backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4DA3FF]/20 border border-[#4DA3FF]/30 flex items-center justify-center text-[#4DA3FF] group-hover:scale-110 transition-transform shadow-inner">
            <Sparkles size={18} />
          </div>
          <div className="text-left">
            <div className="text-[13px] sm:text-sm font-bold tracking-wide">Kampüste Ne Var? Fısılda... 🤫</div>
            <div className="text-[10px] text-gray-400 font-medium">Anonim olarak itiraf et veya duyum paylaş.</div>
          </div>
        </div>
        <div className="bg-white/10 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-200 flex items-center gap-1.5 group-hover:bg-[#4DA3FF] group-hover:text-black transition-colors shrink-0 shadow">
          <Plus size={14} /> Paylaş
        </div>
      </button>

      {/* Arka Plan Karartma ve Blur */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        />
      )}

      {/* 🔥 Ekranın Altından Yukarı Kayarak Gelen Bottom Sheet Paneli */}
      <div className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out max-h-[92vh] overflow-y-auto rounded-t-[32px] bg-[#121212] border-t border-white/10 p-5 sm:p-8 shadow-[0_-10px_50px_rgba(0,0,0,0.9)] scrollbar-hide ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        
        {/* Mobil Tutamaç (Drag Handle Çubuğu) */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />

        {/* Üst Başlık ve Kapatma Butonu */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Yeni Fısıltı / Paylaşım</h3>
            <p className="text-[11px] text-gray-400">Değirmenaltı'nda gizli kalmasın.</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form İçeriği (ModernForm) */}
        <div className="pb-6">
          {children}
        </div>
      </div>
    </>
  );
}