"use client";

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopV2() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    // 🔥 DÜZELTİLEN YER: Artık arka planın kilitlenip kilitlenmediğini kontrol ediyor
    const observer = new MutationObserver(() => {
      setIsModalOpen(document.body.style.overflow === 'hidden');
    });

    // Style değişikliklerini dinle
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
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

  // Modal açıksa veya yeterince aşağıda değilse butonu gizle
  const showButton = isVisible && !isModalOpen;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '16px',
        zIndex: 30, // Modalların kesinlikle altında kalması için 30'a düşürüldü
        opacity: showButton ? 1 : 0,
        transform: showButton ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
        pointerEvents: showButton ? 'auto' : 'none',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className="group relative overflow-hidden flex items-center justify-center p-3.5 rounded-2xl bg-white/[0.07] backdrop-blur-[24px] border border-white/20 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] hover:bg-white/[0.12] hover:border-white/45 cursor-pointer active:scale-95"
      aria-label="Yukarı Çık"
    >
      <div className="w-6 h-6 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#4DA3FF] group-hover:-translate-y-0.5 transition-transform duration-300">
        <ArrowUp size={16} />
      </div>
    </button>
  );
}