"use client";

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopV2() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
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
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      className="fixed bottom-24 sm:bottom-6 left-6 z-40 group relative overflow-hidden flex items-center justify-center p-3.5 sm:py-3.5 sm:px-4 rounded-2xl bg-white/[0.07] backdrop-blur-[24px] border border-white/20 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] hover:bg-white/[0.12] hover:border-white/45 cursor-pointer active:scale-95 transition-all duration-300"
      aria-label="Yukarı Çık"
    >
      <div className="w-6 h-6 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#4DA3FF] group-hover:-translate-y-0.5 transition-transform duration-300">
        <ArrowUp size={16} />
      </div>
    </button>
  );
}