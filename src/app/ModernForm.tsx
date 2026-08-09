"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, VenetianMask, Coffee, Send, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { createPost } from "@/app/post/actions";
import VoiceRecorder from "@/components/VoiceRecorder";

export default function ModernForm() {
  const [type, setType] = useState<'CONFESSION' | 'BOSYAP' | 'OVERHEARD'>('CONFESSION'); 
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [people, setPeople] = useState(''); 
  const [gender, setGender] = useState(''); 
  const [time, setTime] = useState('');
  const [isEphemeral, setIsEphemeral] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isRecordingNow, setIsRecordingNow] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  
  const router = useRouter();
  const maxChars = 500;

  const handleTabChange = (newType: 'CONFESSION' | 'BOSYAP' | 'OVERHEARD') => {
    setType(newType);
    if (newType === 'CONFESSION' || newType === 'BOSYAP') {
      setLocation('');
      setPeople('');
      setGender('');
      setTime('');
      setIsEphemeral(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isRecordingNow) {
      alert("Kral, önce ses kaydını durdurman gerekiyor!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('content', content);
      formData.append('location', type === 'OVERHEARD' ? (location || '') : '');
      formData.append('people', type === 'OVERHEARD' ? people : '');
      formData.append('gender', type === 'OVERHEARD' ? gender : '');
      formData.append('time', type === 'OVERHEARD' ? time : '');
      formData.append('isEphemeral', (type === 'CONFESSION' && isEphemeral) ? 'true' : 'false');
      
      if (audioBase64) {
        formData.append('audioUrl', audioBase64);
      }

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
      setIsEphemeral(false);
      setAudioBase64(null);
      
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
      router.refresh();
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const accentColor = type === 'CONFESSION' ? 'bg-purple-600 text-white shadow-purple-500/20' 
    : type === 'BOSYAP' ? 'bg-emerald-500 text-black shadow-emerald-500/20' 
    : 'bg-[#4DA3FF] text-black shadow-blue-500/20';

  return (
    <div className="w-full bg-[#121212] text-white p-5 sm:p-6 rounded-t-[32px] sm:rounded-[32px] border-t sm:border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
      
      {/* ÜST TUTAMAK (Instagram Çizgisi) */}
      <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5 sm:hidden"></div>

      {/* BAŞLIK */}
      <div className="mb-5">
        <h3 className="text-lg font-extrabold tracking-tight">Yeni Paylaşım Yap ✨</h3>
        <p className="text-xs text-gray-400 mt-0.5">Değirmenaltı'nda gizli kalmasın.</p>
      </div>

      {/* SEKMELER (Minimalist Hatlar) */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-black/40 rounded-2xl mb-5 border border-white/5">
        <button 
          type="button"
          onClick={() => handleTabChange('CONFESSION')}
          className={`py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            type === 'CONFESSION' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <VenetianMask size={15} /> İtiraf
        </button>

        <button 
          type="button"
          onClick={() => handleTabChange('BOSYAP')}
          className={`py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            type === 'BOSYAP' ? 'bg-emerald-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Coffee size={15} /> Boş Yap
        </button>

        <button 
          type="button"
          onClick={() => handleTabChange('OVERHEARD')}
          className={`py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            type === 'OVERHEARD' ? 'bg-[#4DA3FF] text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Headphones size={15} /> Duyum
        </button>
      </div>

      <form onSubmit={handleSubmit} key={type} className="space-y-4">
        
        {/* OVERHEARD ALANLARI */}
        {type === 'OVERHEARD' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/30 p-3 rounded-2xl border border-white/5">
            <input 
              type="text" 
              required 
              placeholder="Konum (Örn: Yemekhane)" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              className="col-span-2 sm:col-span-1 px-3 py-2.5 bg-white/5 rounded-xl text-xs text-white border border-white/5 focus:border-[#4DA3FF] outline-none" 
            />
            
            <select 
              required 
              value={people} 
              onChange={(e) => setPeople(e.target.value)} 
              className="px-3 py-2.5 bg-white/5 rounded-xl text-xs text-white border border-white/5 focus:border-[#4DA3FF] outline-none cursor-pointer"
            >
              <option value="" disabled hidden>Kişi Sayısı</option>
              <option value="2 kişi" className="bg-[#121212]">2 Kişi</option>
              <option value="3 kişi" className="bg-[#121212]">3 Kişi</option>
              <option value="4 kişi" className="bg-[#121212]">4 Kişi</option>
              <option value="Kalabalık" className="bg-[#121212]">Kalabalık</option>
            </select>

            <select 
              required
              value={gender} 
              onChange={(e) => setGender(e.target.value)} 
              className="px-3 py-2.5 bg-white/5 rounded-xl text-xs text-white border border-white/5 focus:border-[#4DA3FF] outline-none cursor-pointer"
            >
              <option value="" disabled hidden>Grup Türü</option>
              <option value="Kız" className="bg-[#121212]">Sadece Kız</option>
              <option value="Erkek" className="bg-[#121212]">Sadece Erkek</option>
              <option value="Karışık" className="bg-[#121212]">Karışık</option>
            </select>

            <input 
              type="time" 
              required 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              className="px-3 py-2.5 bg-white/5 rounded-xl text-xs text-white border border-white/5 focus:border-[#4DA3FF] outline-none [color-scheme:dark]" 
            />
          </div>
        )}

        {/* METİN GİRİŞ ALANI (Kutusuz / Pürüzsüz) */}
        <div className="relative bg-black/30 rounded-2xl border border-white/5 p-3.5 focus-within:border-white/20 transition-all">
          <textarea 
            maxLength={maxChars}
            rows={4} 
            placeholder={
              type === 'OVERHEARD' ? "Duyduğun o efsane diyalog neydi? 🤫" 
              : type === 'BOSYAP' ? "Boş yapma vakti... Ne düşünüyorsun? ☕"
              : "Sırrını buraya fısılda... 🎭"
            } 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            className="w-full bg-transparent text-sm sm:text-base text-white outline-none resize-none placeholder:text-gray-600" 
          />
          <div className="flex justify-end mt-1">
            <span className={`text-[10px] font-bold ${content.length >= maxChars ? 'text-red-400' : 'text-gray-600'}`}>
              {content.length} / {maxChars}
            </span>
          </div>
        </div>

        {/* SES KAYDI */}
        {type !== 'OVERHEARD' && (
          <div className="bg-black/30 p-2 rounded-2xl border border-white/5">
            <VoiceRecorder 
              onAudioReady={(base64) => setAudioBase64(base64)} 
              onRecordingStateChange={(recording) => setIsRecordingNow(recording)}
            />
          </div>
        )}

        {/* 24 SAAT İMHA SEÇENEĞİ */}
        {type === 'CONFESSION' && (
          <div 
            onClick={() => setIsEphemeral(!isEphemeral)}
            className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
              isEphemeral ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock size={18} className={isEphemeral ? 'text-amber-400' : 'text-gray-500'} />
              <div>
                <div className="text-xs font-bold">24 Saat Sonra Kendini İmha Etsin ⏳</div>
                <div className="text-[10px] text-gray-500">Bu seçenek açılırsa itiraf 24 saat sonra silinir.</div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs ${
              isEphemeral ? 'bg-amber-500 border-amber-400 text-black font-black' : 'border-white/20'
            }`}>
              {isEphemeral && '✓'}
            </div>
          </div>
        )}

        {/* GÖNDER BUTONU */}
        <button 
          type="submit" 
          disabled={loading || successMsg || isRecordingNow} 
          className={`w-full py-4 rounded-2xl text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] cursor-pointer ${
            successMsg ? 'bg-green-500 text-black shadow-green-500/20' 
            : (loading || isRecordingNow) ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
            : (type === 'CONFESSION' && isEphemeral) ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
            : accentColor
          }`}
        >
          {successMsg ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} /> Başarıyla Gönderildi!
            </span>
          ) : isRecordingNow ? (
            <span className="text-red-300">🎙️ Önce Kaydı Durdurman Gerekiyor!</span>
          ) : loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Gönderiliyor...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send size={16} /> 
              {type === 'CONFESSION' && isEphemeral ? 'Süreli İtirafı Fırlat ⏳' 
               : type === 'CONFESSION' ? 'İtirafı Gönder' 
               : type === 'BOSYAP' ? 'Boş Yap 🚀' 
               : 'Fısıltıyı Gönder'}
            </span>
          )}
        </button>

      </form>
    </div>
  );
}