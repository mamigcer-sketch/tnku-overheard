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
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-[#4DA3FF] transition-colors duration-300" size={18} />
      </div>
      
      <input 
        type="text" 
        placeholder="Bir şeyler ara..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        // 🔥 GÜNDÜZ/GECE UYUMLU PREMIUM GLASSMORPHISM
        className="relative w-full bg-white dark:bg-[#121212]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 text-gray-900 dark:text-gray-200 text-[13px] sm:text-[15px] rounded-[20px] pl-11 pr-4 py-3.5 sm:py-4 focus:outline-none focus:border-blue-400 dark:focus:border-[#4DA3FF]/30 focus:ring-1 focus:ring-blue-400/30 dark:focus:ring-[#4DA3FF]/30 focus:bg-gray-50 dark:focus:bg-[#151515] transition-all duration-300 shadow-sm placeholder-gray-400 dark:placeholder-gray-600"
      />
    </div>
  );
}