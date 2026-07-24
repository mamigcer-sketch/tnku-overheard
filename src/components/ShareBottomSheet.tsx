"use client";

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

export default function ShareBottomSheet({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      {/* 🔥 Jilet Gibi Minimalist ve Premium Paylaş Butonu */}
      <div className="fixed bottom-24 sm:bottom-8 right-5 sm:right-8 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#151515]/80 backdrop-blur-xl border border-white/10 text-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.7)] transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {/* İkonun etrafındaki o gereksiz kutuyu sildik, sadece şık bir artı ve mavi bir vurgu bıraktık */}
          <Plus size={18} className="text-[#4DA3FF] transition-transform duration-300 group-hover:rotate-90" />
          <span className="font-bold text-sm tracking-wide">Paylaş</span>
        </button>
      </div>

      {/* Arka Plan Karartma */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        />
      )}

      {/* Bottom Sheet Paneli (Renk tonu PostCard'lar ile aynı #151515 yapıldı) */}
      <div className={`fixed inset-x-0 bottom-0 z-[100] transform transition-transform duration-300 ease-out max-h-[92vh] overflow-y-auto rounded-t-[32px] bg-[#151515]/95 backdrop-blur-3xl border-t border-white/10 p-5 sm:p-8 shadow-[0_-10px_50px_rgba(0,0,0,0.9)] scrollbar-hide ${
        isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}>
        
        {/* Mobil Tutamaç */}
        <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-6" />

        {/* Üst Başlık ve Kapatma Butonu */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-100 tracking-tight">Yeni Paylaşım Yap ✨</h3>
            <p className="text-[11px] text-gray-400">Değirmenaltı'nda gizli kalmasın.</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form İçeriği */}
        <div className="pb-6">
          {children}
        </div>
      </div>
    </>
  );
}