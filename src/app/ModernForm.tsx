"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, VenetianMask, Send, CheckCircle2 } from 'lucide-react';
import { createPost } from "@/app/post/actions";

export default function ModernForm() {
  const [type, setType] = useState<'OVERHED' | 'CONFESSION'>('OVERHED');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [people, setPeople] = useState('2 kişi');
  const [gender, setGender] = useState('Kız');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  
  const router = useRouter();

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
      setPeople('2 kişi');
      setGender('Kız');
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
    <div className="bg-[#121212]/60 backdrop-blur-xl border border-white/10 p-6 rounded-[24px] shadow-lg mb-10 transition-all">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">Ne paylaşmak istiyorsun?</h2>
      
      <div className="flex gap-2 mb-6">
        <button 
          type="button"
          onClick={() => setType('OVERHED')} 
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${type === 'OVERHED' ? 'bg-[#4DA3FF] text-black font-bold' : 'bg-white/5 text-gray-400'}`}
        >
          <Headphones size={18} /> Overheard
        </button>
        <button 
          type="button"
          onClick={() => setType('CONFESSION')} 
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${type === 'CONFESSION' ? 'bg-[#4DA3FF] text-black font-bold' : 'bg-white/5 text-gray-400'}`}
        >
          <VenetianMask size={18} /> İtiraf
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'OVERHED' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input 
              required 
              placeholder="Konum" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              className="col-span-2 md:col-span-1 bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#4DA3FF]" 
            />
            
            <select 
              value={people} 
              onChange={(e) => setPeople(e.target.value)} 
              className="bg-[#1a1a1a] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#4DA3FF] cursor-pointer"
            >
              <option value="2 kişi" className="bg-[#1a1a1a] text-white">2 kişi</option>
              <option value="3 kişi" className="bg-[#1a1a1a] text-white">3 kişi</option>
              <option value="4 kişi" className="bg-[#1a1a1a] text-white">4 kişi</option>
              <option value="Kalabalık" className="bg-[#1a1a1a] text-white">Kalabalık</option>
            </select>

            <select 
              value={gender} 
              onChange={(e) => setGender(e.target.value)} 
              className="bg-[#1a1a1a] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#4DA3FF] cursor-pointer"
            >
              <option value="Kız" className="bg-[#1a1a1a] text-white">Kız</option>
              <option value="Erkek" className="bg-[#1a1a1a] text-white">Erkek</option>
              <option value="Karışık" className="bg-[#1a1a1a] text-white">Karışık</option>
            </select>

            <input 
              type="time" 
              required 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              className="bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#4DA3FF] [color-scheme:dark]" 
            />
          </div>
        )}

        <textarea 
          required 
          rows={4} 
          placeholder={type === 'OVERHED' ? "Ne konuşuluyordu?" : "İtirafın nedir?"} 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#4DA3FF] resize-none" 
        />

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-[#4DA3FF] hover:bg-blue-400 py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? 'Gönderiliyor...' : <><Send size={18} /> Gönder</>}
        </button>
      </form>

      {successMsg && (
        <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl flex items-center gap-2 justify-center">
          <CheckCircle2 size={18} /> Gönderin alındı! Yönetici onayından sonra yayınlanacak.
        </div>
      )}
    </div>
  );
}