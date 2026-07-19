"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Arama yapınca URL'i güncelliyoruz, böylece sayfa kendi kendine filtreliyor
    router.push(`/?q=${query}${searchParams.get('f') ? `&f=${searchParams.get('f')}` : ''}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative mb-6">
      <input 
        type="text" 
        placeholder="Bir şeyler ara..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-[#121212] border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-[#4DA3FF] transition-all"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
    </form>
  );
}