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
    <div className="relative mb-6">
      <input 
        type="text" 
        placeholder="Bir şeyler ara..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-[#121212] border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-[#4DA3FF] transition-all"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
    </div>
  );
}