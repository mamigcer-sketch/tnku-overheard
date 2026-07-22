"use client";

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // 300 pikselden fazla aşağı kaydırıldıysa göster, en üstteyken gizle
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    // Sayfa ilk açıldığında da pozisyonu kontrol et
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-24 sm:bottom-6 left-6 z-40 group relative overflow-hidden flex items-center justify-center p-3.5 sm:py-3.5 sm:px-4 rounded-2xl bg-white/[0.07] backdrop-blur-[24px] border border-white/20 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] hover:bg-white/[0.12] hover:border-white/45 cursor-pointer active:scale-95 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'
      }`}
      aria-label="Yukarı Çık"
    >
      <div className="w-6 h-6 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#4DA3FF] group-hover:-translate-y-0.5 transition-transform duration-300">
        <ArrowUp size={16} />
      </div>
    </button>
  );
}