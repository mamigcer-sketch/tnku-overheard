"use client";

import { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';

export default function ClientShareWidgetV2({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setDragY(0);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 120) {
      setIsOpen(false);
    }
    setDragY(0);
  };

  return (
    <>
      {/* 🔥 ASİL VE TOK GLASSMORPHISM PAYLAŞ BUTONU (Pavyon ışıkları temizlendi) */}
      <div className="fixed bottom-6 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 py-3.5 px-6 rounded-2xl text-white font-bold text-sm active:scale-95 transition-all duration-300 bg-[#181818]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-white/20 hover:bg-[#202020] cursor-pointer"
        >
          {/* Butonun Asıl İçeriği */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <span className="tracking-wide text-white/90 group-hover:text-white transition-colors">Paylaş</span>
          </div>
        </button>
      </div>

      {/* Arka Plan Karartma */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
        />
      )}

      {/* Bottom Sheet Paneli */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isOpen 
            ? `translateY(${dragY}px)` 
            : 'translateY(100%)',
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className={`fixed inset-x-0 bottom-0 z-[100] max-h-[90vh] overflow-y-auto rounded-t-[32px] bg-[#151515]/95 backdrop-blur-3xl border-t border-white/15 p-5 sm:p-8 pb-12 sm:pb-8 shadow-[0_-10px_50px_rgba(0,0,0,0.9)] scrollbar-hide ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        
        {/* Üst Tutamaç */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 cursor-grab active:cursor-grabbing" />

        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Yeni Paylaşım Yap ✨</h3>
            <p className="text-[11px] text-gray-400">Değirmenaltı'nda gizli kalmasın.</p>
          </div>
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="pb-6">
          {children}
        </div>
      </div>
    </>
  );
}