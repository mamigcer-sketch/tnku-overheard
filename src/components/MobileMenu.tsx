"use client";

import { useState, useEffect } from 'react';
import { Menu, X, Bookmark, ShieldAlert, BookOpen, ExternalLink, Download, User, MessageCircle, Trophy, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { name: 'NKÜ Chat', icon: <MessageCircle size={18} />, href: '/sohbet', isExternal: false },
    { name: 'Sefirler', icon: <Trophy size={18} />, href: '/liderlik', isExternal: false, hideOnDesktop: true },
    { name: 'Kaydedilenler', icon: <Bookmark size={18} />, href: '/kaydedilenler', isExternal: false, hideOnDesktop: true },
    { name: 'Topluluk Kuralları', icon: <BookOpen size={18} />, href: '/rules', isExternal: false },
    { name: 'Instagram', icon: <ExternalLink size={18} />, href: 'https://instagram.com/tnkuoverheard', isExternal: true },
    { name: 'Bildir / Şikayet', icon: <ShieldAlert size={18} />, href: 'https://instagram.com/tnkuoverheard', isExternal: true },
  ];

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
              
              {/* 🔥 TERTEMİZ PROFİL BAĞLANTISI (SUNUCU HALLEDECEK) 🔥 */}
              <a 
                href="/profil/ben"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all font-bold text-[15px] cursor-pointer mb-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 dark:bg-[#4DA3FF]/10 dark:hover:bg-[#4DA3FF]/15 dark:text-[#4DA3FF] dark:border-[#4DA3FF]/20 shadow-inner dark:shadow-none"
              >
                <User size={18} className="stroke-[2.5]" /> Profilim
              </a>

              {menuItems.map((item) => (
                item.isExternal ? (
                  <a 
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all font-medium text-[14px] text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5 ${item.hideOnDesktop ? 'sm:hidden' : ''}`}
                  >
                    {item.icon} {item.name}
                  </a>
                ) : (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all font-medium text-[14px] text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5 ${item.hideOnDesktop ? 'sm:hidden' : ''}`}
                  >
                    {item.icon} {item.name}
                  </Link>
                )
              ))}

              <div className="h-px w-full my-2 bg-gray-200 dark:bg-white/10 transition-colors"></div>

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