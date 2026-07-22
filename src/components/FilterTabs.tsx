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

    // 🔥 Geçikmeyi yok eden anlık transition yapısı
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-4 mb-4 scrollbar-hide snap-x relative z-40 sticky top-[70px] sm:top-[80px] bg-[#0B0B0B]/80 backdrop-blur-2xl pt-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-b-2xl border-b border-white/[0.02] sm:border-b-0 shadow-sm items-center">
      {filters.map((filter) => {
        const isActive = currentFilter === filter;
        
        // 🔥 Seçili sekmeler artık dolu renk ve güçlü neon parıltıyla parlayacak
        let activeClass = 'bg-white text-black font-extrabold shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105';
        if (isActive) {
          if (filter === 'Overheard') activeClass = 'bg-[#4DA3FF] text-black font-extrabold shadow-[0_0_25px_rgba(77,163,255,0.5)] scale-105';
          else if (filter === 'İtiraf') activeClass = 'bg-purple-600 text-white font-extrabold shadow-[0_0_25px_rgba(168,85,247,0.5)] scale-105';
          else if (filter === 'Boş Yap') activeClass = 'bg-emerald-500 text-black font-extrabold shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-105';
          else if (filter === '🔥 Trend') activeClass = 'bg-amber-500 text-black font-extrabold shadow-[0_0_25px_rgba(245,158,11,0.5)] scale-105';
        }

        const inactiveClass = 'bg-white/[0.03] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15]';

        return (
          <button
            key={filter}
            onClick={() => handleFilterClick(filter)}
            disabled={isPending}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-bold whitespace-nowrap snap-start transition-all duration-300 backdrop-blur-md flex items-center justify-center cursor-pointer ${
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