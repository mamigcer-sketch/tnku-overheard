"use client";

import { useState } from 'react';
import { Menu, X, Heart, ShieldAlert, BookOpen, FileText, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  // "Beğendiklerim" için hideOnDesktop özelliği ekledik ki masaüstünde 2 kere gözükmesin
  const menuItems = [
    { name: 'Paylaşımlarım', icon: <FileText size={18} />, href: '/my-posts', isExternal: false },
    { name: 'Beğendiklerim', icon: <Heart size={18} />, href: '/my-likes', isExternal: false, hideOnDesktop: true },
    { name: 'Topluluk Kuralları', icon: <BookOpen size={18} />, href: '/rules', isExternal: false },
    { name: 'Instagram', icon: <ExternalLink size={18} />, href: 'https://instagram.com/tnkuoverheard', isExternal: true },
    { name: 'Bildir / Şikayet', icon: <ShieldAlert size={18} />, href: 'https://instagram.com/tnkuoverheard', isExternal: true },
  ];

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {isOpen && (
        <>
          {/* Arka plan karartma */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute top-14 right-0 w-64 bg-[#121212] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-0.5">
              {menuItems.map((item) => (
                item.isExternal ? (
                  <a 
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-[#4DA3FF] transition-all font-medium text-sm ${item.hideOnDesktop ? 'sm:hidden' : ''}`}
                  >
                    {item.icon} {item.name}
                  </a>
                ) : (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-[#4DA3FF] transition-all font-medium text-sm ${item.hideOnDesktop ? 'sm:hidden' : ''}`}
                  >
                    {item.icon} {item.name}
                  </Link>
                )
              ))}

              {/* 🔥 İŞTE SİHİR BURADA: Artık kendi içindeki eski modalı değil, global tetikleyiciyi ateşliyor */}
              <button 
                onClick={() => {
                  setIsOpen(false); 
                  window.dispatchEvent(new Event('trigger-install-modal')); // Yeni V3.0 modalı tetikler!
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-[#4DA3FF]/10 text-[#4DA3FF] font-medium text-sm transition-all border-t border-white/5 mt-2 cursor-pointer"
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