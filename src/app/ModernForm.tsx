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
      setTimeout(() => setSuccessMsg(false), 5000);
      router.refresh();
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* ÜÇLÜ SEKMELER */}
      <div className="flex gap-2 mb-4 p-1 bg-gray-100 dark:bg-black/40 rounded-xl border border-gray-200 dark:border-white/5 transition-colors duration-300">
        <button 
          type="button"
          onClick={() => handleTabChange('CONFESSION')} 
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] font-bold transition-all duration-300 ${
            type === 'CONFESSION' 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 dark:shadow-purple-900/30' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-white dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
          }`}
        >
          <VenetianMask size={15} /> İtiraf
        </button>

        <button 
          type="button"
          onClick={() => handleTabChange('BOSYAP')} 
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] font-bold transition-all duration-300 ${
            type === 'BOSYAP' 
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/35' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-white dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
          }`}
        >
          <Coffee size={15} /> Boş Yap
        </button>

        <button 
          type="button"
          onClick={() => handleTabChange('OVERHEARD')} 
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] font-bold transition-all duration-300 ${
            type === 'OVERHEARD' 
              ? 'bg-[#4DA3FF] text-black shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-white dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
          }`}
        >
          <Headphones size={15} /> <span className="hidden sm:inline">Overheard</span><span className="sm:hidden">Duyum</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} key={type} className="space-y-4 animate-in fade-in duration-200">
        
        {type === 'OVERHEARD' && (
          <div className="bg-white dark:bg-black/40 rounded-2xl p-3 sm:p-4 border border-gray-200 dark:border-white/5 grid grid-cols-2 md:grid-cols-4 gap-3 transition-colors duration-300 shadow-sm dark:shadow-none">
            <div className="relative col-span-2 md:col-span-1">
              <input 
                type="text" 
                id="location_field" 
                required 
                placeholder=" " 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className="block px-3 pb-2 pt-4 w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 focus:border-[#4DA3FF] outline-none peer transition-colors duration-300" 
              />
              <label htmlFor="location_field" className={`absolute text-[11px] duration-200 transform top-3.5 left-3 pointer-events-none peer-focus:text-[#4DA3FF] peer-focus:scale-75 peer-focus:-translate-y-2.5 ${location ? 'text-gray-500 dark:text-gray-400 scale-75 -translate-y-2.5' : 'text-gray-500'}`}>Konum</label>
            </div>
            
            <div className="relative col-span-1">
               <select 
                id="people_field"
                required 
                value={people} 
                onChange={(e) => setPeople(e.target.value)} 
                className="block px-3 pb-2 pt-4 w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 focus:border-[#4DA3FF] outline-none peer cursor-pointer transition-colors duration-300"
              >
                <option value="" disabled hidden></option>
                <option value="2 kişi" className="bg-white text-gray-900 dark:bg-[#121212] dark:text-white">2 Kişi</option>
                <option value="3 kişi" className="bg-white text-gray-900 dark:bg-[#121212] dark:text-white">3 Kişi</option>
                <option value="4 kişi" className="bg-white text-gray-900 dark:bg-[#121212] dark:text-white">4 Kişi</option>
                <option value="Kalabalık" className="bg-white text-gray-900 dark:bg-[#121212] dark:text-white">Kalabalık</option>
              </select>
              <label htmlFor="people_field" className={`absolute text-[11px] duration-200 transform top-3.5 left-3 pointer-events-none peer-focus:text-[#4DA3FF] peer-focus:scale-75 peer-focus:-translate-y-2.5 ${people ? 'text-gray-500 dark:text-gray-400 scale-75 -translate-y-2.5' : 'text-gray-500'}`}>Kişi Sayısı</label>
            </div>

            <div className="relative col-span-1">
              <select 
                id="gender_field"
                required
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                className="block px-3 pb-2 pt-4 w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 focus:border-[#4DA3FF] outline-none peer cursor-pointer transition-colors duration-300"
              >
                <option value="" disabled hidden></option>
                <option value="Kız" className="bg-white text-gray-900 dark:bg-[#121212] dark:text-white">Kız</option>
                <option value="Erkek" className="bg-white text-gray-900 dark:bg-[#121212] dark:text-white">Erkek</option>
                <option value="Karışık" className="bg-white text-gray-900 dark:bg-[#121212] dark:text-white">Karışık</option>
              </select>
              <label htmlFor="gender_field" className={`absolute text-[11px] duration-200 transform top-3.5 left-3 pointer-events-none peer-focus:text-[#4DA3FF] peer-focus:scale-75 peer-focus:-translate-y-2.5 ${gender ? 'text-gray-500 dark:text-gray-400 scale-75 -translate-y-2.5' : 'text-gray-500'}`}>Grup</label>
            </div>

            <div className="relative col-span-2 md:col-span-1">
              <input 
                type="time" 
                id="time_field"
                required 
                placeholder=" "
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                className="block px-3 pb-2 pt-4 w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 focus:border-[#4DA3FF] outline-none peer dark:[color-scheme:dark] transition-colors duration-300" 
              />
              <label htmlFor="time_field" className={`absolute text-[11px] duration-200 transform top-3.5 left-3 pointer-events-none peer-focus:text-[#4DA3FF] peer-focus:scale-75 peer-focus:-translate-y-2.5 ${time ? 'text-gray-500 dark:text-gray-400 scale-75 -translate-y-2.5' : 'text-gray-500'}`}>Saat</label>
            </div>
          </div>
        )}

        <div className="relative">
            <textarea 
              maxLength={maxChars}
              rows={3} 
              placeholder={
                type === 'OVERHEARD' ? "Duyduğun o efsane diyalog neydi? 🤫" 
                : type === 'BOSYAP' ? "Boş yapma vakti... Ne düşünüyorsun? ☕"
                : "Sırrını buraya fısılda... 🎭"
              } 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 p-4 pb-7 rounded-2xl text-sm text-gray-900 dark:text-white outline-none resize-none transition-all placeholder-gray-400 dark:placeholder:text-gray-600 focus:border-gray-300 dark:focus:border-white/20 shadow-sm dark:shadow-none" 
            />
            <div className={`absolute bottom-2.5 right-4 text-[10px] font-bold transition-colors ${
              content.length >= maxChars ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-600'
            }`}>
                {content.length} / {maxChars}
            </div>
        </div>

        {type !== 'OVERHEARD' && (
          <VoiceRecorder 
            onAudioReady={(base64) => setAudioBase64(base64)} 
            onRecordingStateChange={(recording) => setIsRecordingNow(recording)}
          />
        )}

        {type === 'CONFESSION' && (
          <div 
            onClick={() => setIsEphemeral(!isEphemeral)}
            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-300 shadow-sm dark:shadow-none ${
              isEphemeral ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/40 dark:text-amber-300' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-black/30 dark:border-white/5 dark:text-gray-400 dark:hover:border-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock size={16} className={isEphemeral ? 'text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'} />
              <div>
                <div className="text-[12px] font-bold">24 Saat Sonra Kendini İmha Etsin ⏳</div>
                <div className={`text-[10px] ${isEphemeral ? 'text-amber-600/70 dark:text-amber-300/70' : 'text-gray-500'}`}>Bu seçenek açılırsa itiraf 24 saat sonra silinir.</div>
              </div>
            </div>
            <div className={`w-4 h-4 rounded border flex items-center justify-center text-xs transition-colors ${
              isEphemeral ? 'bg-amber-500 border-amber-400 text-black font-black' : 'border-gray-300 dark:border-white/20'
            }`}>
              {isEphemeral && '✓'}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || successMsg || isRecordingNow} 
          className={`relative overflow-hidden w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm ${
            successMsg ? 'bg-green-500 text-black' 
            : (loading || isRecordingNow) ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed shadow-none'
            : (type === 'CONFESSION' && isEphemeral) ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
            : type === 'CONFESSION' ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20' 
            : type === 'BOSYAP' ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
            : 'bg-[#4DA3FF] hover:bg-blue-400 text-black shadow-blue-500/20'
          }`}
        >
          {successMsg ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} /> Başarıyla Fırlatıldı!
            </span>
          ) : isRecordingNow ? (
            <span className="text-red-500 dark:text-red-300">🎙️ Önce Kaydı Durdurman Gerekiyor!</span>
          ) : loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Yükleniyor...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send size={15} /> 
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