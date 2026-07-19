"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, VenetianMask, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { createPost } from "@/app/post/actions";

export default function ModernForm() {
  const [type, setType] = useState<'OVERHEARD' | 'CONFESSION'>('OVERHEARD'); 
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [people, setPeople] = useState(''); 
  const [gender, setGender] = useState(''); 
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  
  const router = useRouter();
  const maxChars = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('content', content);
      formData.append('location', location || '');
      formData.append('people', people);
      formData.append('gender', gender);
      formData.append('time', time);

      const res = await createPost(formData);

      if (res?.id) {
        const myPosts = JSON.parse(localStorage.getItem('my_posts') || '[]');
        localStorage.setItem('my_posts', JSON.stringify([...myPosts, res.id]));
      }

      setContent('');
      setLocation('');
      setPeople(''); 
      setGender(''); 
      setTime('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 5000);
      router.refresh();
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121212]/60 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] mb-2 transition-all">
      
      {/* Üst Sekmeler */}
      <div className="flex gap-2 mb-4 sm:mb-6">
        <button 
          type="button"
          onClick={() => setType('OVERHEARD')} 
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base transition-all duration-300 ${type === 'OVERHEARD' ? 'bg-[#4DA3FF] text-black font-bold shadow-[0_0_15px_rgba(77,163,255,0.2)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
        >
          <Headphones size={16} className="sm:w-[18px] sm:h-[18px]" /> Overheard
        </button>
        <button 
          type="button"
          onClick={() => setType('CONFESSION')} 
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base transition-all duration-300 ${type === 'CONFESSION' ? 'bg-[#4DA3FF] text-black font-bold shadow-[0_0_15px_rgba(77,163,255,0.2)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
        >
          <VenetianMask size={16} className="sm:w-[18px] sm:h-[18px]" /> İtiraf
        </button>
      </div>

      {/* Uyarı Kutusu */}
      <div className="flex items-center justify-center gap-2 text-[#4DA3FF]/70 bg-[#4DA3FF]/5 px-4 py-3 rounded-xl mb-6 border border-[#4DA3FF]/10">
        <span className="text-[11px] sm:text-xs font-medium text-center">
          ⚠️ Lütfen paylaşımını doğru kategoriyle (Overheard veya İtiraf) işaretle.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
        {type === 'OVERHEARD' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="col-span-2 md:col-span-1">
                <input 
                  required 
                  placeholder="Konum" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 p-2.5 sm:p-3.5 rounded-xl text-sm sm:text-base text-white outline-none focus:ring-2 focus:ring-[#4DA3FF]/40 focus:border-[#4DA3FF] transition-all placeholder:text-gray-500" 
                />
            </div>
            
            <div className="col-span-1 flex flex-col gap-0.5 sm:gap-1">
               <label className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-wider px-1">Kişi</label>
               <select 
                required 
                value={people} 
                onChange={(e) => setPeople(e.target.value)} 
                className="bg-white/5 border border-white/10 p-2.5 sm:p-3.5 rounded-xl text-sm sm:text-base text-white outline-none focus:ring-2 focus:ring-[#4DA3FF]/40 focus:border-[#4DA3FF] transition-all cursor-pointer appearance-none"
              >
                <option value="" disabled hidden>Seçiniz</option>
                <option value="2 kişi" className="bg-[#1a1a1a] text-white">2 kişi</option>
                <option value="3 kişi" className="bg-[#1a1a1a] text-white">3 kişi</option>
                <option value="4 kişi" className="bg-[#1a1a1a] text-white">4 kişi</option>
                <option value="Kalabalık" className="bg-[#1a1a1a] text-white">Kalabalık</option>
              </select>
            </div>

            <div className="col-span-1 flex flex-col gap-0.5 sm:gap-1">
              <label className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-wider px-1">Grup</label>
              <select 
                required
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                className="bg-white/5 border border-white/10 p-2.5 sm:p-3.5 rounded-xl text-sm sm:text-base text-white outline-none focus:ring-2 focus:ring-[#4DA3FF]/40 focus:border-[#4DA3FF] transition-all cursor-pointer appearance-none"
              >
                <option value="" disabled hidden>Seçiniz</option>
                <option value="Kız" className="bg-[#1a1a1a] text-white">Kız</option>
                <option value="Erkek" className="bg-[#1a1a1a] text-white">Erkek</option>
                <option value="Karışık" className="bg-[#1a1a1a] text-white">Karışık</option>
              </select>
            </div>

            <div className="col-span-2 md:col-span-1 flex flex-col gap-0.5 sm:gap-1">
              <label className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-wider px-1">Saat Seç</label>
              <input 
                type="time" 
                required 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                className="bg-white/5 border border-white/10 p-2.5 sm:p-3.5 rounded-xl text-sm sm:text-base text-white outline-none focus:ring-2 focus:ring-[#4DA3FF]/40 focus:border-[#4DA3FF] transition-all [color-scheme:dark] w-full" 
              />
            </div>
          </div>
        )}

        <div className="relative">
            <textarea 
              required 
              maxLength={maxChars}
              rows={3} 
              placeholder={type === 'OVERHEARD' ? "Ne konuşuluyordu?" : "İtirafın nedir?"} 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 p-3 sm:p-4 pb-8 rounded-xl text-sm sm:text-base text-white outline-none focus:ring-2 focus:ring-[#4DA3FF]/40 focus:border-[#4DA3FF] resize-none transition-all placeholder:text-gray-500" 
            />
            <div className={`absolute bottom-2 sm:bottom-3 right-3 sm:right-4 text-[10px] sm:text-xs font-medium transition-colors ${content.length >= maxChars ? 'text-red-400' : 'text-gray-500'}`}>
                {content.length} / {maxChars}
            </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-[#4DA3FF] hover:bg-blue-400 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-black flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(77,163,255,0.2)] hover:shadow-[0_0_25px_rgba(77,163,255,0.4)]"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin sm:w-[18px] sm:h-[18px]" /> Gönderiliyor...</>
          ) : (
            <><Send size={16} className="sm:w-[18px] sm:h-[18px]" /> Yönetici Onayına Gönder</>
          )}
        </button>
      </form>

      {successMsg && (
        <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center gap-2 sm:gap-3 justify-center animate-in fade-in zoom-in-95 duration-300 font-medium text-xs sm:text-sm">
          <CheckCircle2 size={18} className="sm:w-[20px] sm:h-[20px]" /> Gönderin başarıyla alındı!
        </div>
      )}
    </div>
  );
}