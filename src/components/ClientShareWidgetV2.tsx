"use client";

import { useState, useEffect } from 'react';
import { Plus, X, Home, Trophy, MessageCircle, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ClientShareWidgetV2({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Rota değiştiğinde modalı otomatik kapat
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Modal açıkken arkaplan kaymasını engelle
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {/* 💻 MASAÜSTÜ FLOATING BUTON (Eski Tasarım Masaüstünde Kalır) */}
      <div className="hidden sm:flex fixed bottom-8 right-8 z-40">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-[#4DA3FF] to-blue-600 text-white rounded-full font-black tracking-widest uppercase shadow-[0_10px_30px_rgba(77,163,255,0.4)] hover:shadow-[0_10px_40px_rgba(77,163,255,0.6)] hover:-translate-y-1 transition-all active:scale-95 border border-blue-400/50"
        >
          <Plus size={20} className="stroke-[3]" /> Paylaş
        </button>
      </div>

      {/* 📱 MOBİL BOTTOM NAVIGATION BAR (YENİ EFSANE APP DENEYİMİ) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-2xl border-t border-gray-200 dark:border-white/10 pb-5 pt-3 px-6 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/' ? 'text-[#4DA3FF]' : 'text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'}`}>
          <Home size={24} className={pathname === '/' ? 'stroke-[2.5]' : 'stroke-2'} />
        </Link>

        <Link href="/sohbet" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/sohbet' ? 'text-[#4DA3FF]' : 'text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'}`}>
          <MessageCircle size={24} className={pathname === '/sohbet' ? 'stroke-[2.5]' : 'stroke-2'} />
        </Link>

        {/* ORTA DEV NEON PAYLAŞ BUTONU */}
        <div className="relative -mt-10">
          <button 
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-gradient-to-r from-[#4DA3FF] to-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_10px_25px_rgba(77,163,255,0.6)] border-[4px] border-slate-50 dark:border-[#050505] active:scale-95 transition-transform"
          >
            <Plus size={28} className="stroke-[3]" />
          </button>
        </div>

        <Link href="/liderlik" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/liderlik' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'}`}>
          <Trophy size={24} className={pathname === '/liderlik' ? 'stroke-[2.5]' : 'stroke-2'} />
        </Link>

        <Link href="/profil/ben" className={`flex flex-col items-center gap-1 transition-colors ${pathname.includes('/profil') ? 'text-[#4DA3FF]' : 'text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'}`}>
          <User size={24} className={pathname.includes('/profil') ? 'stroke-[2.5]' : 'stroke-2'} />
        </Link>
      </div>

      {/* 🔥 PAYLAŞIM MODALI (Aşağıdan Pürüzsüz Kayarak Çıkar) */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="bg-white dark:bg-[#0A0A0A] w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] p-6 relative z-10 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300 shadow-2xl border border-gray-200 dark:border-white/10">
            {/* Mobil Çekme Çubuğu */}
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/20 rounded-full mx-auto mb-6 sm:hidden"></div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">Yeni Paylaşım Yap ✨</h2>
                <p className="text-[12px] font-medium text-gray-500 mt-1">Değirmenaltı'nda gizli kalmasın.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 rounded-full transition-colors active:scale-90"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* ModernForm Buraya Gelecek */}
            {children}
          </div>
        </div>
      )}
    </>
  );
}