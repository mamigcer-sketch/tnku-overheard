"use client";

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

export default function ClientShareWidgetV2({ children }: { children: React.ReactNode }) {
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
      {/* Paylaş Butonu - Safari alt barının üstünde güvenli bölgede */}
      <div className="fixed bottom-24 sm:bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative overflow-hidden flex items-center gap-2.5 py-3.5 px-6 rounded-2xl bg-white/[0.07] backdrop-blur-[24px] border border-white/20 text-white font-bold text-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] hover:bg-white/[0.12] hover:border-white/45 cursor-pointer active:scale-95 transition-all"
        >
          <div className="w-6 h-6 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#4DA3FF]">
            <Plus size={16} />
          </div>
          <span className="tracking-wide text-gray-100">Paylaş</span>
        </button>
      </div>

      {/* Arka Plan Karartma */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        />
      )}

      {/* Bottom Sheet Paneli - Safari piksel kaymasını önlemek için opacity-0 ve pointer-events-none eklendi */}
      <div className={`fixed inset-x-0 bottom-0 z-[100] transform transition-all duration-300 ease-out max-h-[90vh] overflow-y-auto rounded-t-[32px] bg-[#121212]/95 backdrop-blur-3xl border-t border-white/15 p-5 sm:p-8 pb-12 sm:pb-8 shadow-[0_-10px_50px_rgba(0,0,0,0.9)] scrollbar-hide ${
        isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
      }`}>
        
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />

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