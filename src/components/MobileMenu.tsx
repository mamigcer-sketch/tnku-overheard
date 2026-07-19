"use client";

import { useState } from 'react';
import { Menu, X, Heart, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Paylaşımlarım', icon: <Heart size={18} />, href: '/my-posts', isExternal: false },
    { name: 'Bildir / Şikayet', icon: <ShieldAlert size={18} />, href: 'https://instagram.com/tnkuoverheard', isExternal: true },
   
  ];

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {isOpen && (
        <div className="absolute top-14 right-0 w-60 bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="space-y-1">
            {menuItems.map((item) => (
              item.isExternal ? (
                <a 
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-[#4DA3FF] transition-all"
                >
                  {item.icon} {item.name}
                </a>
              ) : (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-[#4DA3FF] transition-all"
                >
                  {item.icon} {item.name}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}