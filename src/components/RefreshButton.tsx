"use client";

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = () => {
    // Mobilde basınca premium his (titreşim) versin
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    setIsRefreshing(true);
    
    // Next.js arkadan yeni verileri çekip sayfayı günceller
    router.refresh();

    // İkonun dönüş efekti gözüksün diye animasyonu biraz tutuyoruz
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  return (
    <button 
      onClick={handleRefresh} 
      disabled={isRefreshing}
      className="relative flex items-center justify-center p-2.5 bg-white/[0.03] hover:bg-white/[0.08] rounded-full border border-white/[0.05] transition-all active:scale-90 disabled:opacity-70 group"
      aria-label="Sayfayı Yenile"
    >
      <RefreshCw 
        size={18} 
        className={`text-gray-300 transition-colors group-hover:text-white ${isRefreshing ? 'animate-spin text-[#4DA3FF]' : ''}`} 
      />
    </button>
  );
}