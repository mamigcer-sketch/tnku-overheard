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
      {/* 🔥 Sağ Altta Sabit Duran Yüzen Neon Artı Butonu (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#4DA3FF] to-purple-600 text-black font-bold flex items-center justify-center shadow-[0_0_30px_rgba(77,163,255,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border border-white/20 group"
          title="Fısıltı Paylaş"
        >
          <Plus size={28} className="text-white group-hover:rotate-90 transition-transform duration-300 drop-shadow-md" />
        </button>
      </div>

      {/* Arka Plan Karartma */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        />
      )}

      {/* 🔥 Bottom Sheet Paneli */}
      <div className={`fixed inset-x-0 bottom-0 z-[100] transform transition-transform duration-300 ease-out max-h-[92vh] overflow-y-auto rounded-t-[32px] bg-[#121212] border-t border-white/10 p-5 sm:p-8 shadow-[0_-10px_50px_rgba(0,0,0,0.9)] scrollbar-hide ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        
        {/* Mobil Tutamaç */}
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
            <X size= {18} />
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