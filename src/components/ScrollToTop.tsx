"use client";

import { useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  useEffect(() => {
    const handleScroll = () => {
      const btn = document.getElementById('scroll-to-top-btn');
      if (!btn) return;

      if (window.scrollY > 300) {
        btn.classList.remove('opacity-0', 'translate-y-10', 'scale-50', 'pointer-events-none');
        btn.classList.add('opacity-100', 'translate-y-0', 'scale-100');
      } else {
        btn.classList.add('opacity-0', 'translate-y-10', 'scale-50', 'pointer-events-none');
        btn.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Sayfa açılış kontrolü

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
      id="scroll-to-top-btn"
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-24 sm:bottom-6 left-6 z-40 group relative overflow-hidden flex items-center justify-center p-3.5 sm:py-3.5 sm:px-4 rounded-2xl bg-white/[0.07] backdrop-blur-[24px] border border-white/20 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] hover:bg-white/[0.12] hover:border-white/45 cursor-pointer active:scale-95 transition-all duration-300 opacity-0 translate-y-10 scale-50 pointer-events-none"
      aria-label="Yukarı Çık"
    >
      <div className="w-6 h-6 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#4DA3FF] group-hover:-translate-y-0.5 transition-transform duration-300">
        <ArrowUp size={16} />
      </div>
    </button>
  );
}