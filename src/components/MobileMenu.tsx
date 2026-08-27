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

  // Ortak link stili (Gündüz / Gece uyumlu)
  const linkBaseStyle = "flex items-center gap-3 p-3.5 rounded-xl transition-all font-medium text-[14px] text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5";
  const groupTitleStyle = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-1 mt-3";
  const dividerStyle = "h-px w-full my-2 bg-gray-200 dark:bg-white/10 transition-colors";

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 rounded-full transition-colors cursor-pointer active:scale-90 text-gray-600 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm transition-colors duration-300" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute top-14 right-0 w-[260px] bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-[24px] p-2.5 shadow-xl dark:shadow-[0_10px_50px_rgba(0,0,0,0.7)] z-50 animate-in fade-in zoom-in-95 duration-200 transition-colors">
            <div className="space-y-1">
              
              {/* TERTEMİZ PROFİL BAĞLANTISI */}
              <a 
                href="/profil/ben"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all font-bold text-[15px] cursor-pointer mb-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 dark:bg-[#4DA3FF]/10 dark:hover:bg-[#4DA3FF]/15 dark:text-[#4DA3FF] dark:border-[#4DA3FF]/20 shadow-inner dark:shadow-none"
              >
                <User size={18} className="stroke-[2.5]" /> Profilim
              </a>

              {/* 🔥 KATEGORİZE EDİLMİŞ MENÜ 🔥 */}
              <div className="space-y-1 pb-2">
                
                {/* 1. SOSYAL GRUBU */}
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

                {/* 2. EĞLENCE & RİSK GRUBU */}
                <div>
                  <p className={groupTitleStyle}>Eğlence & Risk</p>
                  <Link href="/karanlik-oda" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3.5 rounded-xl transition-all font-medium text-[14px] text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-500/10">
                    <Skull size={18} className="text-red-500" /> Karanlık Oda
                  </Link>
                  <Link href="/borsa" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3.5 rounded-xl transition-all font-medium text-[14px] text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-[#4DA3FF] dark:hover:bg-[#4DA3FF]/10">
                    <TrendingUp size={18} className="text-[#4DA3FF]" /> Kampüs Borsası
                  </Link>
                </div>

                <div className={dividerStyle}></div>

                {/* 3. DİĞER GRUBU */}
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

              </div>

              <div className={dividerStyle}></div>

              {/* ALT KONTROLLER */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all font-medium text-[14px] cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5"
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
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl transition-all font-bold text-[14px] cursor-pointer active:scale-95 mt-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 shadow-inner dark:shadow-none"
              >
                <Download size={18} /> Uygulamayı Yükle
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}