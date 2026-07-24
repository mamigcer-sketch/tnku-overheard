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
    <div className="relative group w-full">
      {/* 🔥 Eski mor/mavi abartılı arka plan parlaması tamamen silindi */}
      
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <Search className="text-gray-500 group-focus-within:text-[#4DA3FF] transition-colors duration-300" size={18} />
      </div>
      
      <input 
        type="text" 
        placeholder="Bir şeyler ara..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        // 🔥 Premium Dark Glassmorphism eklendi (PostCard'lar ile aynı renk tonu)
        className="relative w-full bg-[#121212]/80 backdrop-blur-xl border border-white/5 hover:border-white/10 text-gray-200 text-[13px] sm:text-[15px] rounded-[20px] pl-11 pr-4 py-3.5 sm:py-4 focus:outline-none focus:border-[#4DA3FF]/30 focus:ring-1 focus:ring-[#4DA3FF]/30 focus:bg-[#151515] transition-all shadow-sm placeholder:text-gray-600"
      />
    </div>
  );
}