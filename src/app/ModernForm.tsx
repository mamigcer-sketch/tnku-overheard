"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, VenetianMask, Coffee, Send, CheckCircle2, Loader2, Clock, MapPin, Users, VenusAndMars, Clock4 } from 'lucide-react';
import { createPost } from "@/app/post/actions";

// 🔥 KATEGORİ RENK DİNAMİKLERİ SÖZLÜĞÜ (Premium Gradient ve Soft Tonlar Eklendi) 🔥
const themeStyles = {
  CONFESSION: {
    ring: "focus-within:ring-purple-500/20 dark:focus-within:ring-purple-500/30 focus-within:border-purple-200 dark:focus-within:border-purple-500/30",
    btn: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_8px_20px_rgba(147,51,234,0.25)] dark:shadow-[0_8px_20px_rgba(147,51,234,0.15)]",
    tabActive: "bg-white dark:bg-[#2A1B38] text-purple-600 dark:text-purple-400 shadow-sm",
    icon: "text-purple-500 dark:text-purple-400",
    bgSoft: "bg-purple-100 dark:bg-purple-500/20",
  },
  BOSYAP: {
    ring: "focus-within:ring-emerald-500/20 dark:focus-within:ring-emerald-500/30 focus-within:border-emerald-200 dark:focus-within:border-emerald-500/30",
    btn: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)] dark:shadow-[0_8px_20px_rgba(16,185,129,0.15)]",
    tabActive: "bg-white dark:bg-[#1B332A] text-emerald-600 dark:text-emerald-400 shadow-sm",
    icon: "text-emerald-500 dark:text-emerald-400",
    bgSoft: "bg-emerald-100 dark:bg-emerald-500/20",
  },
  OVERHEARD: {
    ring: "focus-within:ring-blue-500/20 dark:focus-within:ring-blue-500/30 focus-within:border-blue-200 dark:focus-within:border-[#4DA3FF]/30",
    btn: "bg-gradient-to-r from-[#4DA3FF] to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-[0_8px_20px_rgba(77,163,255,0.25)] dark:shadow-[0_8px_20px_rgba(77,163,255,0.15)]",
    tabActive: "bg-white dark:bg-[#1B2A40] text-blue-600 dark:text-[#4DA3FF] shadow-sm",
    icon: "text-blue-500 dark:text-[#4DA3FF]",
    bgSoft: "bg-blue-100 dark:bg-[#4DA3FF]/20",
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

  const tabBaseStyle = "flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-[13px] sm:text-[14px] font-bold transition-all duration-300 border border-transparent";
  const tabInactiveStyle = "text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300";

  return (
    <div className="w-full transition-colors duration-300 relative">

      {/* 🔥 PREMIUM iOS SEKMELERİ (Arka plan ve radiuslar yumuşatıldı) */}
      <div className="flex bg-[#F1F3F5] dark:bg-white/[0.04] p-1 rounded-2xl mb-5 transition-colors duration-300">
        <button 
          type="button"
          onClick={() => handleTabChange('CONFESSION')} 
          className={`${tabBaseStyle} ${type === 'CONFESSION' ? currentTheme.tabActive : tabInactiveStyle}`}
        >
          <VenetianMask size={16} className={type === 'CONFESSION' ? 'animate-bounce' : ''} /> İtiraf
        </button>

        <button 
          type="button"
          onClick={() => handleTabChange('BOSYAP')} 
          className={`${tabBaseStyle} ${type === 'BOSYAP' ? currentTheme.tabActive : tabInactiveStyle}`}
        >
          <Coffee size={16} /> Boş Yap
        </button>

        <button 
          type="button"
          onClick={() => handleTabChange('OVERHEARD')} 
          className={`${tabBaseStyle} ${type === 'OVERHEARD' ? currentTheme.tabActive : tabInactiveStyle}`}
        >
          <Headphones size={16} /> Duyum
        </button>
      </div>

      <form onSubmit={handleSubmit} key={type} className="space-y-4 animate-in fade-in duration-300">
        
        {/* 🔥 OVERHEARD (DUYUM) EK ALANLARI (Premium Kapsüller) */}
        {type === 'OVERHEARD' && (
          <div className="grid grid-cols-2 gap-3 mb-2 transition-colors duration-300">
            {/* Konum */}
            <div className="flex items-center gap-2.5 bg-[#F8F9FA] dark:bg-white/[0.03] p-2.5 rounded-[18px] transition-all focus-within:bg-white dark:focus-within:bg-[#0A0A0A] focus-within:shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20">
               <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-[#4DA3FF]">
                  <MapPin size={16} />
               </div>
               <input type="text" required placeholder="Nerede?" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-transparent w-full outline-none text-[13px] font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600" />
            </div>
            
            {/* Kişi */}
            <div className="flex items-center gap-2.5 bg-[#F8F9FA] dark:bg-white/[0.03] p-2.5 rounded-[18px] transition-all focus-within:bg-white dark:focus-within:bg-[#0A0A0A] focus-within:shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20">
               <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-[#4DA3FF]">
                  <Users size={16} />
               </div>
               <select required value={people} onChange={(e) => setPeople(e.target.value)} className="bg-transparent w-full outline-none text-[13px] font-bold text-gray-900 dark:text-white placeholder-gray-400 appearance-none cursor-pointer">
                  <option value="" disabled hidden>Kişi Sayısı</option>
                  <option value="2 kişi">2 Kişi</option>
                  <option value="3 kişi">3 Kişi</option>
                  <option value="4 kişi">4 Kişi</option>
                  <option value="Kalabalık">Kalabalık</option>
               </select>
            </div>

            {/* Cinsiyet / Grup */}
            <div className="flex items-center gap-2.5 bg-[#F8F9FA] dark:bg-white/[0.03] p-2.5 rounded-[18px] transition-all focus-within:bg-white dark:focus-within:bg-[#0A0A0A] focus-within:shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20">
               <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-[#4DA3FF]">
                  <VenusAndMars size={16} />
               </div>
               <select required value={gender} onChange={(e) => setGender(e.target.value)} className="bg-transparent w-full outline-none text-[13px] font-bold text-gray-900 dark:text-white placeholder-gray-400 appearance-none cursor-pointer">
                  <option value="" disabled hidden>Grup Tipi</option>
                  <option value="Kız">Sadece Kız</option>
                  <option value="Erkek">Sadece Erkek</option>
                  <option value="Karışık">Karışık</option>
               </select>
            </div>

            {/* Saat */}
            <div className="flex items-center gap-2.5 bg-[#F8F9FA] dark:bg-white/[0.03] p-2.5 rounded-[18px] transition-all focus-within:bg-white dark:focus-within:bg-[#0A0A0A] focus-within:shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20">
               <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-[#4DA3FF]">
                  <Clock4 size={16} />
               </div>
               <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="bg-transparent w-full outline-none text-[13px] font-bold text-gray-900 dark:text-white dark:[color-scheme:dark]" />
            </div>
          </div>
        )}

        {/* 🔥 ANA YAZI ALANI (Çerçevesiz, İçten Gölgeli, Soft Tasarım) 🔥 */}
        <div className={`relative bg-[#F8F9FA] dark:bg-white/[0.02] border border-transparent rounded-[28px] transition-all duration-300 focus-within:bg-white dark:focus-within:bg-[#050505] shadow-inner focus-within:shadow-md ${currentTheme.ring}`}>
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
              className="w-full bg-transparent p-5 pb-10 text-[16px] text-gray-900 dark:text-white outline-none resize-none placeholder-gray-400 dark:placeholder-gray-600 leading-relaxed font-medium" 
            />
            {/* Karakter Sayacı */}
            <div className={`absolute bottom-4 right-5 text-[11px] font-black tracking-widest transition-colors ${
              content.length >= maxChars ? 'text-red-500 dark:text-red-400' 
              : content.length >= maxChars - 50 ? 'text-amber-500 dark:text-amber-400'
              : 'text-gray-400 dark:text-gray-600'
            }`}>
                {content.length} / {maxChars}
            </div>
        </div>

        {/* 🔥 SÜRELİ İTİRAF ANAHTARI (iOS Ayarlar Menüsü Tarzı) 🔥 */}
        {type === 'CONFESSION' && (
          <label className="flex items-center justify-between p-4 bg-[#F8F9FA] dark:bg-white/[0.02] rounded-[24px] cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all duration-300 active:scale-[0.98]">
            <div className="flex items-center gap-3.5">
              <div className={`p-2.5 rounded-[14px] transition-colors ${isEphemeral ? currentTheme.bgSoft + ' ' + currentTheme.icon : 'bg-white border border-gray-200 dark:bg-white/5 dark:border-transparent text-gray-400 dark:text-gray-500 shadow-sm'}`}>
                <Clock size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <div className={`text-[14px] font-extrabold tracking-tight transition-colors ${isEphemeral ? currentTheme.icon : 'text-gray-900 dark:text-white'}`}>24 Saat Sonra Silinir</div>
                <div className="text-[11px] mt-0.5 font-semibold text-gray-500 dark:text-gray-500">Bu gönderi kalıcı olarak kaydedilmez.</div>
              </div>
            </div>
            
            <div className="relative ml-2 shrink-0">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={isEphemeral}
                onChange={() => setIsEphemeral(!isEphemeral)} 
              />
              <div className={`w-[46px] h-[26px] rounded-full transition-colors duration-300 ease-in-out border border-transparent dark:border-white/10 ${isEphemeral ? 'bg-purple-500 dark:bg-purple-500 border-purple-500' : 'bg-gray-200 dark:bg-black/50'}`}>
                <div className={`absolute top-0.5 w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${isEphemeral ? 'translate-x-[22px]' : 'translate-x-0.5'}`}></div>
              </div>
            </div>
          </label>
        )}

        {/* 🔥 GÖNDER BUTONU (Opaklık Animasyonlu Premium Görünüm) 🔥 */}
        <button 
          type="submit" 
          disabled={loading || successMsg || content.trim().length === 0} 
          className={`relative w-full py-4 rounded-[20px] text-[15px] font-black tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${
            successMsg ? 'bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)]' 
            : loading || content.trim().length === 0 ? `${currentTheme.btn} opacity-40 grayscale-[30%] cursor-not-allowed`
            : currentTheme.btn
          }`}
        >
          {successMsg ? (
            <span className="flex items-center gap-2 animate-in zoom-in">
              <CheckCircle2 size={18} className="stroke-[2.5]" /> Başarıyla Fırlatıldı!
            </span>
          ) : loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin stroke-[2.5]" /> Yükleniyor...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send size={18} className="translate-x-0.5 -translate-y-0.5 stroke-[2.5]" /> 
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