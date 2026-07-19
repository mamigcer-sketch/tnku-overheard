"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
    >
      <ArrowLeft size={20} /> Geri Dön
    </button>
  );
}