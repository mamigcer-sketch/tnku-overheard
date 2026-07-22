"use client";

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Scroll durumunu dinleyerek butonun görünüp gizlenmesini kontrol edelim
  useEffect(() => {
    const toggleVisibility = () => {
      // 300px aşağı kaydırıldığında göster, değilse gizle
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    // Haptik geri bildirim (Titreme) - Mobilde ekstra premium his!
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    
    // Yağ gibi kayarak (smooth) en tepeye git
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-[90] p-3 sm:p-4 rounded-2xl bg-[#121212]/80 backdrop-blur-md border border-white/10 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-500 ease-out hover:bg-white/[0.08] hover:border-white/20 active:scale-90 hover:-translate-y-1 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'
      }`}
      aria-label="Yukarı Çık"
    >
      <ArrowUp size={20} className="sm:w-6 sm:h-6 text-[#4DA3FF]" />
    </button>
  );
}