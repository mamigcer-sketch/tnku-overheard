"use client";

import { useState, useEffect } from 'react';
import { Menu, X, Bookmark, ShieldAlert, BookOpen, ExternalLink, Download, User, MessageCircle, Trophy, Sun, Moon, Flame, Skull, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function MobileMenu({ userUuid }: { userUuid?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Açıkken arkadaki sayfanın kaymasını engelle
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  // Ortak link stili
  const linkBaseStyle = "flex items-center gap-3 p-3.5 rounded-xl transition-all font-medium text-[15px] text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5 active:scale-95";
  const groupTitleStyle = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-1 mt-4";
  const dividerStyle = "h-px w-full my-3 bg-gray-200 dark:bg-white/10 transition-colors";

  return (
    <div className="relative z-50">
      {/* ANA MENÜ AÇMA TUŞU */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="p-2 rounded-full transition-colors cursor-pointer active:scale-90 text-gray-600 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
      >
        <Menu size={26} />
      </button>

      {/* ARKA PLAN KARARTMASI (OVERLAY) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      {/* 🔥 SAĞDAN KAYARAK AÇILAN DEV MENÜ (DRAWER) 🔥 */}
      <div className={`fixed top-0 right-0 h-[100dvh] w-[85%] max-w-[340px] bg-white dark:bg-[#0A0A0A] border-l border-gray-200 dark:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[101] transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* ÜST KISIM (Başlık ve Kapat Tuşu) */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5">
          <span className="font-black tracking-widest text-[14px] text-gray-900 dark:text-white">MENÜ</span>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-90">
            <X size={20} />
          </button>
        </div>

        {/* ORTA KISIM (Kaydırılabilir Menü İçeriği) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-1">
          
          <a 
            href="/profil/ben"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 p-4 rounded-xl transition-all font-bold text-[16px] cursor-pointer mb-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 dark:bg-[#4DA3FF]/10 dark:hover:bg-[#4DA3FF]/15 dark:text-[#4DA3FF] dark:border-[#4DA3FF]/20 active:scale-95"
          >
            <User size={20} className="stroke-[2.5]" /> Profilim
          </a>

          <div>
            <p className={groupTitleStyle}>Sosyal</p>
            <Link href="/sohbet" onClick={() => setIsOpen(false)} className={linkBaseStyle}>
              <MessageCircle size={18} className="text-[#4DA3FF]" /> NKÜ Chat
            </Link>
            <Link href="/etkinlikler" onClick={() => setIsOpen(false)} className={linkBaseStyle}>
              <Flame size={18} className="text-amber-500" /> Etkinlikler
            </Link>
            <Link href="/liderlik" onClick={() => setIsOpen(false)} className={`${linkBaseStyle} sm:hidden`}>
              <Trophy size={18} className="text-yellow-500" /> Sefirler
            </Link>
          </div>

          <div className={dividerStyle}></div>

          <div>
            <p className={groupTitleStyle}>Eğlence & Risk</p>
            <Link href="/karanlik-oda" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3.5 rounded-xl transition-all font-medium text-[15px] text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-500/10 active:scale-95">
              <Skull size={18} className="text-red-500" /> Karanlık Oda
            </Link>
            <Link href="/borsa" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3.5 rounded-xl transition-all font-medium text-[15px] text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-[#4DA3FF] dark:hover:bg-[#4DA3FF]/10 active:scale-95">
              <TrendingUp size={18} className="text-[#4DA3FF]" /> Kampüs Borsası
            </Link>
          </div>

          <div className={dividerStyle}></div>

          <div>
            <p className={groupTitleStyle}>Diğer</p>
            <Link href="/kaydedilenler" onClick={() => setIsOpen(false)} className={`${linkBaseStyle} sm:hidden`}>
              <Bookmark size={18} className="text-gray-400 dark:text-gray-500" /> Kaydedilenler
            </Link>
            <Link href="/rules" onClick={() => setIsOpen(false)} className={linkBaseStyle}>
              <BookOpen size={18} className="text-gray-400 dark:text-gray-500" /> Topluluk Kuralları
            </Link>
            <a href="https://instagram.com/tnkuoverheard" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className={linkBaseStyle}>
              <ExternalLink size={18} className="text-gray-400 dark:text-gray-500" /> Instagram
            </a>
            <a href="https://instagram.com/tnkuoverheard" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className={linkBaseStyle}>
              <ShieldAlert size={18} className="text-gray-400 dark:text-gray-500" /> Bildir / Şikayet
            </a>
          </div>
          
          {/* Altta kaydırma boşluğu */}
          <div className="h-6"></div> 
        </div>

        {/* ALT KISIM (Sabit Kontroller) */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/50">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl transition-all font-bold text-[14px] cursor-pointer text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-white dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 mb-3"
            >
              {theme === 'dark' ? (
                <><Sun size={18} className="text-amber-500 dark:text-amber-400" /> Gündüz Modu</>
              ) : (
                <><Moon size={18} className="text-indigo-500 dark:text-indigo-400" /> Gece Modu</>
              )}
            </button>
          )}

          <button 
            onClick={() => {
              setIsOpen(false); 
              window.dispatchEvent(new Event('trigger-install-modal'));
            }}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl transition-all font-bold text-[14px] cursor-pointer active:scale-95 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 shadow-inner dark:shadow-none"
          >
            <Download size={18} /> Uygulamayı Yükle
          </button>
        </div>
        
      </div>
    </div>
  );
}