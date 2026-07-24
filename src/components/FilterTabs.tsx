"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';

export default function FilterTabs({ filters, currentFilter, searchQuery }: { filters: string[], currentFilter: string, searchQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleFilterClick = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('f', filter);
    if (searchQuery) params.set('q', searchQuery);
    else params.delete('q');

    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false });
    });
  };

  return (
    // 🔥 DÜZELTME: Arka plan bg-[#121212]/80 yapıldı, premium cam efekti eklendi
    <div className="flex gap-2.5 overflow-x-auto overflow-y-visible py-3 my-2 scrollbar-hide snap-x relative z-40 sticky top-[70px] sm:top-[80px] bg-[#121212]/80 backdrop-blur-xl -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-2xl border-b border-white/5 sm:border-b-0 items-center transition-colors">
      {filters.map((filter) => {
        const isActive = currentFilter === filter;
        
        // 🔥 PAVYON IŞIKLARI SİLİNDİ, YERİNE ZARİF GLASSMORPHISM GELDİ
        let activeClass = 'bg-white/10 text-white border-white/20 shadow-sm scale-[1.02]';
        
        if (isActive) {
          if (filter === 'Overheard') activeClass = 'bg-[#4DA3FF]/15 text-[#4DA3FF] border-[#4DA3FF]/30 shadow-[0_0_15px_rgba(77,163,255,0.15)] scale-[1.02]';
          else if (filter === 'İtiraf') activeClass = 'bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] scale-[1.02]';
          else if (filter === 'Boş Yap') activeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]';
          else if (filter === '🔥 Trend') activeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.02]';
        }

        // İnaktif sekmeler arka planla bütünleşiyor, göz yormuyor
        const inactiveClass = 'bg-transparent border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/5 hover:border-white/10';

        return (
          <button
            key={filter}
            onClick={() => handleFilterClick(filter)}
            disabled={isPending}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap snap-start transition-all duration-300 backdrop-blur-md flex items-center justify-center cursor-pointer border ${
              isActive ? activeClass : inactiveClass
            }`}
          >
            {filter} {isActive && isPending && <Loader2 size={12} className="ml-1.5 animate-spin inline" />}
          </button>
        );
      })}
    </div>
  );
}