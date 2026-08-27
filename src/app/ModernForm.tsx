"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, VenetianMask, Coffee, Send, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { createPost } from "@/app/post/actions";

// 🔥 KATEGORİ RENK DİNAMİKLERİ SÖZLÜĞÜ 🔥
const themeStyles = {
  CONFESSION: {
    ring: "focus-within:ring-purple-500/20 dark:focus-within:ring-purple-500/30 focus-within:border-purple-300 dark:focus-within:border-purple-500/50",
    btn: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/30 dark:shadow-purple-900/40",
    tabActive: "bg-white dark:bg-[#2A1B38] text-purple-600 dark:text-purple-400 shadow-sm border border-purple-200 dark:border-purple-500/30",
  },
  BOSYAP: {
    ring: "focus-within:ring-emerald-500/20 dark:focus-within:ring-emerald-500/30 focus-within:border-emerald-300 dark:focus-within:border-emerald-500/50",
    btn: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30 dark:shadow-emerald-900/40",
    tabActive: "bg-white dark:bg-[#1B332A] text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-200 dark:border-emerald-500/30",
  },
  OVERHEARD: {
    ring: "focus-within:ring-blue-500/20 dark:focus-within:ring-blue-500/30 focus-within:border-blue-300 dark:focus-within:border-[#4DA3FF]/50",
    btn: "bg-[#4DA3FF] hover:bg-blue-400 text-white shadow-blue-500/30 dark:shadow-blue-900/40",
    tabActive: "bg-white dark:bg-[#1B2A40] text-blue-600 dark:text-[#4DA3FF] shadow-sm border border-blue-200 dark:border-[#4DA3FF]/30",
  }
};

export default function ModernForm() {
  const [type, setType] = useState<'CONFESSION' | 'BOSYAP' | 'OVERHEARD'>('CONFESSION'); 
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [people, setPeople] = useState(''); 
  const [gender, setGender] = useState(''); 
  const [time, setTime] = useState('');
  const [isEphemeral, setIsEphemeral] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  
  const router = useRouter();
  const maxChars = 500;

  const currentTheme = themeStyles[type];

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
      
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 5000);
      router.refresh();
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabBaseStyle = "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all duration-300";
  const tabInactiveStyle = "text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300";

  return (
    <div className="w-full transition-colors duration-300 relative">

      {/* YENİ NESİL iOS SEKMELERİ */}
      <div className="flex bg-gray-100 dark:bg-white/[0.04] p-1.5 rounded-2xl mb-5 border border-gray-200/50 dark:border-white/5 transition-colors duration-300">
        <button 
          type="button"
          onClick={() => handleTabChange('CONFESSION')} 
          className={`${tabBaseStyle} ${type === 'CONFESSION' ? themeStyles.CONFESSION.tabActive : tabInactiveStyle}`}
        >
          <VenetianMask size={16} className={type === 'CONFESSION' ? 'animate-bounce' : ''} /> İtiraf
        </button>

        <button 
          type="button"
          onClick={() => handleTabChange('BOSYAP')} 
          className={`${tabBaseStyle} ${type === 'BOSYAP' ? themeStyles.BOSYAP.tabActive : tabInactiveStyle}`}
        >
          <Coffee size={16} /> Boş Yap
        </button>

        <button 
          type="button"
          onClick={() => handleTabChange('OVERHEARD')} 
          className={`${tabBaseStyle} ${type === 'OVERHEARD' ? themeStyles.OVERHEARD.tabActive : tabInactiveStyle}`}
        >
          <Headphones size={16} /> Duyum
        </button>
      </div>

      <form onSubmit={handleSubmit} key={type} className="space-y-4 animate-in fade-in duration-300">
        
        {/* OVERHEARD (DUYUM) EK ALANLARI */}
        {type === 'OVERHEARD' && (
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/5 grid grid-cols-2 md:grid-cols-4 gap-3 transition-colors duration-300">
            <div className="relative col-span-2 md:col-span-1 bg-white dark:bg-black/20 rounded-xl border border-gray-200 dark:border-transparent transition-colors">
              <input 
                type="text" 
                id="location_field" 
                required 
                placeholder=" " 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className="block px-3 pb-2 pt-5 w-full text-sm text-gray-900 dark:text-white bg-transparent rounded-xl outline-none peer transition-all duration-300" 
              />
              <label htmlFor="location_field" className={`absolute text-[11px] font-bold duration-200 transform top-3.5 left-3 pointer-events-none peer-focus:text-blue-500 dark:peer-focus:text-[#4DA3FF] peer-focus:scale-90 peer-focus:-translate-y-2.5 ${location ? 'text-gray-500 scale-90 -translate-y-2.5' : 'text-gray-400 dark:text-gray-500'}`}>Nerede?</label>
            </div>
            
            <div className="relative col-span-1 bg-white dark:bg-black/20 rounded-xl border border-gray-200 dark:border-transparent transition-colors">
               <select 
                id="people_field"
                required 
                value={people} 
                onChange={(e) => setPeople(e.target.value)} 
                className="block px-3 pb-2 pt-5 w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent outline-none peer cursor-pointer appearance-none"
              >
                <option value="" disabled hidden></option>
                <option value="2 kişi">2 Kişi</option>
                <option value="3 kişi">3 Kişi</option>
                <option value="4 kişi">4 Kişi</option>
                <option value="Kalabalık">Kalabalık</option>
              </select>
              <label htmlFor="people_field" className={`absolute text-[11px] font-bold duration-200 transform top-3.5 left-3 pointer-events-none peer-focus:text-blue-500 dark:peer-focus:text-[#4DA3FF] peer-focus:scale-90 peer-focus:-translate-y-2.5 ${people ? 'text-gray-500 scale-90 -translate-y-2.5' : 'text-gray-400 dark:text-gray-500'}`}>Kaç Kişi?</label>
            </div>

            <div className="relative col-span-1 bg-white dark:bg-black/20 rounded-xl border border-gray-200 dark:border-transparent transition-colors">
              <select 
                id="gender_field"
                required
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                className="block px-3 pb-2 pt-5 w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent outline-none peer cursor-pointer appearance-none"
              >
                <option value="" disabled hidden></option>
                <option value="Kız">Kız</option>
                <option value="Erkek">Erkek</option>
                <option value="Karışık">Karışık</option>
              </select>
              <label htmlFor="gender_field" className={`absolute text-[11px] font-bold duration-200 transform top-3.5 left-3 pointer-events-none peer-focus:text-blue-500 dark:peer-focus:text-[#4DA3FF] peer-focus:scale-90 peer-focus:-translate-y-2.5 ${gender ? 'text-gray-500 scale-90 -translate-y-2.5' : 'text-gray-400 dark:text-gray-500'}`}>Grup</label>
            </div>

            <div className="relative col-span-2 md:col-span-1 bg-white dark:bg-black/20 rounded-xl border border-gray-200 dark:border-transparent transition-colors">
              <input 
                type="time" 
                id="time_field"
                required 
                placeholder=" "
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                className="block px-3 pb-2 pt-5 w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent outline-none peer dark:[color-scheme:dark]" 
              />
              <label htmlFor="time_field" className={`absolute text-[11px] font-bold duration-200 transform top-3.5 left-3 pointer-events-none peer-focus:text-blue-500 dark:peer-focus:text-[#4DA3FF] peer-focus:scale-90 peer-focus:-translate-y-2.5 ${time ? 'text-gray-500 scale-90 -translate-y-2.5' : 'text-gray-400 dark:text-gray-500'}`}>Saat</label>
            </div>
          </div>
        )}

        {/* ANA YAZI ALANI (DİNAMİK RENKLİ) */}
        <div className={`relative bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl transition-all duration-300 focus-within:ring-2 shadow-sm dark:shadow-none ${currentTheme.ring}`}>
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
              className="w-full bg-transparent p-5 pb-9 text-[15px] sm:text-[16px] text-gray-900 dark:text-white outline-none resize-none placeholder-gray-400 dark:placeholder-gray-600 leading-relaxed font-medium" 
            />
            {/* Karakter Sayacı (Sona yaklaşınca kızarır) */}
            <div className={`absolute bottom-3 right-4 text-[11px] font-bold transition-colors ${
              content.length >= maxChars ? 'text-red-500 dark:text-red-400' 
              : content.length >= maxChars - 50 ? 'text-yellow-500 dark:text-yellow-400'
              : 'text-gray-400 dark:text-gray-500'
            }`}>
                {content.length} / {maxChars}
            </div>
        </div>

        {/* SÜRELİ İTİRAF ANAHTARI */}
        {type === 'CONFESSION' && (
          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all duration-300 shadow-sm dark:shadow-none group">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl transition-colors ${isEphemeral ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 shadow-inner' : 'bg-white text-gray-400 border border-gray-200 dark:bg-black/30 dark:text-gray-400 dark:border-white/5'}`}>
                <Clock size={20} />
              </div>
              <div>
                <div className={`text-[14px] font-bold transition-colors ${isEphemeral ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>24 Saat Sonra Kendini İmha Etsin</div>
                <div className={`text-[11px] mt-0.5 transition-colors ${isEphemeral ? 'text-purple-600/80 dark:text-purple-300/70 font-medium' : 'text-gray-500 dark:text-gray-500'}`}>Bu seçenek açılırsa itiraf kalıcı olarak silinir.</div>
              </div>
            </div>
            
            {/* iOS Tarzı Şık Switch */}
            <div className="relative ml-2 shrink-0">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={isEphemeral}
                onChange={() => setIsEphemeral(!isEphemeral)} 
              />
              <div className={`w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${isEphemeral ? 'bg-purple-500 dark:bg-purple-500' : 'bg-gray-300 dark:bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${isEphemeral ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </div>
            </div>
          </label>
        )}

        {/* GÖNDER BUTONU */}
        <button 
          type="submit" 
          disabled={loading || successMsg || content.trim().length === 0} 
          className={`relative w-full py-4 rounded-2xl text-[15px] font-black flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
            successMsg ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
            : loading || content.trim().length === 0 ? 'bg-gray-200 text-gray-400 dark:bg-white/5 dark:text-gray-600 cursor-not-allowed shadow-none'
            : (type === 'CONFESSION' && isEphemeral) ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30 dark:shadow-purple-900/40'
            : currentTheme.btn
          }`}
        >
          {successMsg ? (
            <span className="flex items-center gap-2 animate-in zoom-in">
              <CheckCircle2 size={18} /> Başarıyla Fırlatıldı!
            </span>
          ) : loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Yükleniyor...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send size={16} className="translate-x-0.5 -translate-y-0.5" /> 
              {type === 'CONFESSION' && isEphemeral ? 'Süreli İtirafı Fırlat' 
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