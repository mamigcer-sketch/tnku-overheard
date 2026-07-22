"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    // Kullanıcı yazmayı bıraktıktan 500ms sonra arama tetiklenir
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q'); // Arama kutusunu silerse aramayı temizle
      }
      
      router.push(`/?${params.toString()}`);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, searchParams]);

  return (
    <div className="relative group/search w-full">
      {/* 🔥 Arka Plan Parlama Efekti (Sadece hover durumunda hafifçe belirir) */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[#4DA3FF]/20 to-purple-500/20 rounded-[20px] sm:rounded-[24px] blur-md opacity-0 group-hover/search:opacity-100 transition-opacity duration-500 -z-10" />
      
      <input 
        type="text" 
        placeholder="Bir şeyler ara..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="peer w-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.05] focus:bg-white/[0.06] p-3.5 sm:p-4 pl-12 sm:pl-12 rounded-[20px] sm:rounded-[24px] text-[13px] sm:text-[15px] text-white outline-none focus:ring-2 focus:ring-[#4DA3FF]/30 focus:border-[#4DA3FF]/50 transition-all placeholder:text-gray-500 shadow-inner"
      />
      {/* 🔥 Input focus olunca ikon da canlansın diye peer-focus eklendi */}
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-[#4DA3FF] transition-colors duration-300" size={20} />
    </div>
  );
}