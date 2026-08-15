"use client";

import { useState, useEffect } from 'react';
import { Menu, X, Bookmark, ShieldAlert, BookOpen, ExternalLink, Download, User, MessageCircle, Trophy, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function MobileMenu({ userUuid }: { userUuid?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // 🔥 TEMA KONTROLÜ İÇİN EKLENDİ
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
        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer active:scale-90"
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute top-14 right-0 w-[260px] bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[24px] p-2.5 shadow-[0_10px_50px_rgba(0,0,0,0.7)] z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              
              <Link 
                href="/profil/ben"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-[#4DA3FF]/15 text-[#4DA3FF] transition-all font-bold text-[15px] cursor-pointer mb-2 border border-[#4DA3FF]/20 bg-[#4DA3FF]/10 shadow-inner"
              >
                <User size={18} className="stroke-[2.5]" /> Profilim
              </Link>

              {menuItems.map((item) => (
                item.isExternal ? (
                  <a 
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all font-medium text-[14px] ${item.hideOnDesktop ? 'sm:hidden' : ''}`}
                  >
                    {item.icon} {item.name}
                  </a>
                ) : (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all font-medium text-[14px] ${item.hideOnDesktop ? 'sm:hidden' : ''}`}
                  >
                    {item.icon} {item.name}
                  </Link>
                )
              ))}

              <div className="h-px bg-white/10 w-full my-2"></div>

              {/* 🔥 GÜNDÜZ / GECE MODU ŞALTERİ */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all font-medium text-[14px] cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <><Sun size={18} className="text-amber-400" /> Gündüz Modu</>
                  ) : (
                    <><Moon size={18} className="text-indigo-400" /> Gece Modu</>
                  )}
                </button>
              )}

              <button 
                onClick={() => {
                  setIsOpen(false); 
                  window.dispatchEvent(new Event('trigger-install-modal'));
                }}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl hover:bg-emerald-500/20 text-emerald-400 font-bold text-[14px] transition-all border border-emerald-500/30 bg-emerald-500/10 cursor-pointer active:scale-95 mt-1"
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