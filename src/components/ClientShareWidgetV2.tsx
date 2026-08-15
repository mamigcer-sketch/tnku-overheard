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
      {/* 🔥 PAYLAŞ BUTONU (Gündüz/Gece Uyumlu) */}
      <div className="fixed bottom-6 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 py-3.5 px-6 rounded-2xl text-gray-900 dark:text-white font-bold text-sm active:scale-95 transition-all duration-300 bg-white/90 dark:bg-[#181818]/90 backdrop-blur-2xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-[#202020] cursor-pointer"
        >
          {/* Butonun Asıl İçeriği */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/25 flex items-center justify-center text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-300 shadow-sm dark:shadow-inner">
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <span className="tracking-wide text-gray-800 dark:text-white/90 group-hover:text-black dark:group-hover:text-white transition-colors">Paylaş</span>
          </div>
        </button>
      </div>

      {/* Arka Plan Karartma */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[90] bg-gray-900/30 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-300 transition-colors"
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
        className={`fixed inset-x-0 bottom-0 z-[100] max-h-[90vh] overflow-y-auto rounded-t-[32px] bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-3xl border-t border-gray-200 dark:border-white/10 p-5 sm:p-8 pb-12 sm:pb-8 shadow-[0_-10px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_50px_rgba(0,0,0,0.9)] scrollbar-hide transition-colors duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        
        {/* Üst Tutamaç */}
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-white/20 rounded-full mx-auto mb-6 cursor-grab active:cursor-grabbing transition-colors" />

        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-white/5 transition-colors">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Yeni Paylaşım Yap ✨</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 transition-colors">Değirmenaltı'nda gizli kalmasın.</p>
          </div>
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors"
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