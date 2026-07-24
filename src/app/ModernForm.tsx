"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, VenetianMask, Coffee, Send, CheckCircle2, Loader2, Info, Clock } from 'lucide-react';
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
  const [audioBase64, setAudioBase64] = useState<string | null>(null); // 🔥 Base64 ses verisi
  const [isRecordingNow, setIsRecordingNow] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const router = useRouter();
  const maxChars = 500;

  const triggerRipple = (e: React.MouseEvent<HTMLElement>, bgClass: string) => {
    const button = e.currentTarget;
    const existingRipple = button.querySelector('.absolute.pointer-events-none.animate-ripple');
    if (existingRipple) existingRipple.remove();

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const circle = document.createElement('span');
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.className = `absolute rounded-full pointer-events-none animate-ripple ${bgClass}`;

    button.appendChild(circle);

    setTimeout(() => {
      circle.remove();
    }, 600);
  };

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
      
      // 🔥 Base64 ses string'ini formData'ya ekliyoruz
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

  return (
    <div className={`relative bg-white/[0.02] backdrop-blur-2xl border transition-all duration-700 p-3 sm:p-6 rounded-[20px] sm:rounded-[24px] mb-2 overflow-hidden group/form ${
      isFocused && type === 'CONFESSION' ? 'shadow-[0_0_60px_rgba(168,85,247,0.3)] border-purple-500/50 scale-[1.01]' 
      : isFocused && type === 'BOSYAP' ? 'shadow-[0_0_60px_rgba(16,185,129,0.3)] border-emerald-500/50 scale-[1.01]'
      : isFocused && type === 'OVERHEARD' ? 'shadow-[0_0_60px_rgba(77,163,255,0.3)] border-[#4DA3FF]/50 scale-[1.01]'
      : (type === 'CONFESSION' && isEphemeral) ? 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] scale-100' 
      : type === 'CONFESSION' ? 'border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)] scale-100'
      : type === 'BOSYAP' ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] scale-100' 
      : 'border-[#4DA3FF]/30 shadow-[0_0_30px_rgba(77,163,255,0.1)] scale-100'
    }`}>
      
      {/* ÜÇLÜ SEKMELER */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 p-1 bg-white/[0.02] backdrop-blur-md rounded-[14px] sm:rounded-[16px] border border-white/[0.03] shadow-inner">
        <button 
          type="button"
          onClick={(e) => {
            triggerRipple(e, 'bg-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.8)]');
            handleTabChange('CONFESSION');
          }} 
          className={`relative overflow-hidden flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-3 rounded-xl text-[11px] sm:text-[13px] transition-all duration-300 ${
            type === 'CONFESSION' 
              ? 'bg-purple-500 text-white font-bold shadow-[0_0_25px_rgba(168,85,247,0.5)] scale-100' 
              : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] scale-95 hover:scale-100'
          }`}
        >
          <VenetianMask size={14} className="sm:w-[16px] sm:h-[16px]" /> İtiraf
        </button>

        <button 
          type="button"
          onClick={(e) => {
            triggerRipple(e, 'bg-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.8)]');
            handleTabChange('BOSYAP');
          }} 
          className={`relative overflow-hidden flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-3 rounded-xl text-[11px] sm:text-[13px] transition-all duration-300 ${
            type === 'BOSYAP' 
              ? 'bg-emerald-500 text-black font-bold shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-100' 
              : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] scale-95 hover:scale-100'
          }`}
        >
          <Coffee size={14} className="sm:w-[16px] sm:h-[16px]" /> Boş Yap
        </button>

        <button 
          type="button"
          onClick={(e) => {
            triggerRipple(e, 'bg-[#4DA3FF]/50 shadow-[0_0_25px_rgba(77,163,255,0.8)]');
            handleTabChange('OVERHEARD');
          }} 
          className={`relative overflow-hidden flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-3 rounded-xl text-[11px] sm:text-[13px] transition-all duration-300 ${
            type === 'OVERHEARD' 
              ? 'bg-[#4DA3FF] text-black font-bold shadow-[0_0_25px_rgba(77,163,255,0.5)] scale-100' 
              : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] scale-95 hover:scale-100'
          }`}
        >
          <Headphones size={14} className="sm:w-[16px] sm:h-[16px]" /> <span className="hidden sm:inline">Overheard</span><span className="sm:hidden">Duyum</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-white/70 bg-white/[0.03] backdrop-blur-md px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl mb-4 sm:mb-6 border border-white/[0.05] shadow-sm">
        <Info size={14} className={`shrink-0 transition-colors duration-300 ${type === 'CONFESSION' ? 'text-purple-400' : type === 'BOSYAP' ? 'text-emerald-400' : 'text-[#4DA3FF]'}`} />
        <span className="text-[10px] sm:text-xs font-medium text-center tracking-wide">
          {type === 'BOSYAP' ? 'Burada kurallar daha esnek, içinden geçeni dökül!' : 'Lütfen paylaşımını doğru kategoriyle işaretlediğinden emin ol.'}
        </span>
      </div>

      <form onSubmit={handleSubmit} key={type} className="space-y-3 sm:space-y-5 relative z-10 animate-in fade-in duration-300">
        
        {type === 'OVERHEARD' && (
          <div className="bg-black/30 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 border border-white/[0.04] shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 relative overflow-hidden">
            
            <div className="relative col-span-2 md:col-span-1 group">
                <input 
                  type="text" 
                  id="location_field" 
                  required 
                  placeholder=" " 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="block px-3 sm:px-4 pb-2 pt-5 w-full text-base text-white bg-white/[0.02] group-hover:bg-white/[0.04] rounded-xl border border-white/[0.05] focus:border-[#4DA3FF]/50 appearance-none focus:outline-none focus:ring-1 focus:ring-[#4DA3FF]/30 transition-all shadow-inner peer" 
                />
                <label htmlFor="location_field" className={`absolute text-[10px] sm:text-xs duration-300 transform top-3.5 z-10 origin-[0] left-3.5 sm:left-4 peer-focus:text-[#4DA3FF] peer-focus:scale-75 peer-focus:-translate-y-2.5 pointer-events-none ${location ? 'text-gray-400 scale-75 -translate-y-2.5' : 'text-gray-500 scale-100 translate-y-0'}`}>Konum (Örn: Yemekhane)</label>
            </div>
            
            <div className="relative col-span-1 group">
               <select 
                id="people_field"
                required 
                value={people} 
                onChange={(e) => setPeople(e.target.value)} 
                className="block px-3 sm:px-4 pb-2 pt-5 w-full text-base text-white bg-white/[0.02] group-hover:bg-white/[0.04] rounded-xl border border-white/[0.05] focus:border-[#4DA3FF]/50 appearance-none focus:outline-none focus:ring-1 focus:ring-[#4DA3FF]/30 transition-all shadow-inner peer cursor-pointer"
              >
                <option value="" disabled hidden></option>
                <option value="2 kişi" className="bg-[#1a1a1a] text-white">2 Kişi</option>
                <option value="3 kişi" className="bg-[#1a1a1a] text-white">3 Kişi</option>
                <option value="4 kişi" className="bg-[#1a1a1a] text-white">4 Kişi</option>
                <option value="Kalabalık" className="bg-[#1a1a1a] text-white">Kalabalık</option>
              </select>
              <label htmlFor="people_field" className={`absolute text-[10px] sm:text-xs duration-300 transform top-3.5 z-10 origin-[0] left-3.5 sm:left-4 peer-focus:text-[#4DA3FF] peer-focus:scale-75 peer-focus:-translate-y-2.5 pointer-events-none ${people ? 'text-gray-400 scale-75 -translate-y-2.5' : 'text-gray-500 scale-100 translate-y-0'}`}>Kişi Sayısı</label>
            </div>

            <div className="relative col-span-1 group">
              <select 
                id="gender_field"
                required
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                className="block px-3 sm:px-4 pb-2 pt-5 w-full text-base text-white bg-white/[0.02] group-hover:bg-white/[0.04] rounded-xl border border-white/[0.05] focus:border-[#4DA3FF]/50 appearance-none focus:outline-none focus:ring-1 focus:ring-[#4DA3FF]/30 transition-all shadow-inner peer cursor-pointer"
              >
                <option value="" disabled hidden></option>
                <option value="Kız" className="bg-[#1a1a1a] text-white">Sadece Kız</option>
                <option value="Erkek" className="bg-[#1a1a1a] text-white">Sadece Erkek</option>
                <option value="Karışık" className="bg-[#1a1a1a] text-white">Karışık Grup</option>
              </select>
              <label htmlFor="gender_field" className={`absolute text-[10px] sm:text-xs duration-300 transform top-3.5 z-10 origin-[0] left-3.5 sm:left-4 peer-focus:text-[#4DA3FF] peer-focus:scale-75 peer-focus:-translate-y-2.5 pointer-events-none ${gender ? 'text-gray-400 scale-75 -translate-y-2.5' : 'text-gray-500 scale-100 translate-y-0'}`}>Grup Türü</label>
            </div>

            <div className="relative col-span-2 md:col-span-1 group">
              <input 
                type="time" 
                id="time_field"
                required 
                placeholder=" "
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                className="block px-3 sm:px-4 pb-2 pt-5 w-full text-base text-white bg-white/[0.02] group-hover:bg-white/[0.04] rounded-xl border border-white/[0.05] focus:border-[#4DA3FF]/50 appearance-none focus:outline-none focus:ring-1 focus:ring-[#4DA3FF]/30 transition-all shadow-inner peer [color-scheme:dark]" 
              />
              <label htmlFor="time_field" className={`absolute text-[10px] sm:text-xs duration-300 transform top-3.5 z-10 origin-[0] left-3.5 sm:left-4 peer-focus:text-[#4DA3FF] peer-focus:scale-75 peer-focus:-translate-y-2.5 pointer-events-none ${time ? 'text-gray-400 scale-75 -translate-y-2.5' : 'text-gray-500 scale-100 translate-y-0'}`}>Olay Saati</label>
            </div>
          </div>
        )}

        <div className="relative group/textarea">
            <textarea 
              maxLength={maxChars}
              rows={3} 
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                type === 'OVERHEARD' ? "Duyduğun o efsane diyalog neydi? 🤫" 
                : type === 'BOSYAP' ? "Boş yapma vakti... Ne düşünüyorsun? ☕"
                : "Sırrını buraya fısılda... 🎭"
              } 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className={`w-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] group-hover/textarea:border-white/[0.1] group-hover/textarea:bg-white/[0.05] p-3 sm:p-4 pb-7 sm:pb-8 rounded-xl text-base text-white outline-none resize-none transition-all shadow-inner placeholder:text-gray-500 ${
                type === 'CONFESSION' ? 'focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50' 
                : type === 'BOSYAP' ? 'focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50'
                : 'focus:ring-2 focus:ring-[#4DA3FF]/30 focus:border-[#4DA3FF]/50'
              }`} 
            />
            <div className={`absolute bottom-2 sm:bottom-3 right-3 sm:right-4 text-[9px] sm:text-xs font-bold transition-colors ${
              content.length >= maxChars ? 'text-red-400' : content.length > maxChars * 0.8 ? 'text-yellow-400' : 'text-gray-600'
            }`}>
                {content.length} / {maxChars}
            </div>
        </div>

        {/* 🔥 SES KAYDEDİCİ - Base64 alacak şekilde */}
        <VoiceRecorder 
          onAudioReady={(base64) => setAudioBase64(base64)} 
          onRecordingStateChange={(recording) => setIsRecordingNow(recording)}
        />

        {type === 'CONFESSION' && (
          <div 
            onClick={() => setIsEphemeral(!isEphemeral)}
            className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border backdrop-blur-md cursor-pointer transition-all duration-300 ${
              isEphemeral ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:border-white/[0.1] hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock size={18} className={isEphemeral ? 'text-amber-400 animate-spin-slow' : 'text-gray-500'} />
              <div>
                <div className="text-[12px] sm:text-[13px] font-bold">24 Saat Sonra Kendini İmha Etsin ⏳</div>
                <div className="text-[10px] text-gray-500 font-medium">Bu seçenek açılırsa itiraf tam 24 saat sonra sistemden silinir.</div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              isEphemeral ? 'bg-amber-500 border-amber-400 text-black font-black' : 'border-white/20 bg-transparent'
            }`}>
              {isEphemeral && '✓'}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || successMsg || isRecordingNow} 
          onClick={(e) => !successMsg && !isRecordingNow && triggerRipple(e, 'bg-white/50 shadow-[0_0_30px_rgba(255,255,255,0.9)]')}
          className={`relative overflow-hidden w-full py-3.5 sm:py-4 rounded-xl text-[13px] sm:text-base font-bold flex items-center justify-center gap-2 transition-all duration-500 disabled:shadow-none shadow-[0_4px_20px_rgba(0,0,0,0.2)] group/btn ${
            successMsg ? 'bg-green-500 text-black scale-[1.02] shadow-[0_0_40px_rgba(34,197,94,0.6)] cursor-default' 
            : (loading || isRecordingNow) ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-70'
            : (type === 'CONFESSION' && isEphemeral) ? 'bg-amber-500 hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] text-black active:scale-95'
            : type === 'CONFESSION' ? 'bg-purple-600 hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] text-white active:scale-95' 
            : type === 'BOSYAP' ? 'bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] text-black active:scale-95'
            : 'bg-[#4DA3FF] hover:bg-blue-400 hover:shadow-[0_0_30px_rgba(77,163,255,0.5)] text-black active:scale-95'
          }`}
        >
          {successMsg ? (
            <span className="flex items-center gap-2 animate-in zoom-in duration-300">
              <CheckCircle2 size={20} className="sm:w-[24px] sm:h-[24px]" /> ✓ Başarıyla Fırlatıldı!
            </span>
          ) : isRecordingNow ? (
            <span className="flex items-center gap-2 text-red-300">
              🎙️ Önce Kaydı Durdurman Gerekiyor!
            </span>
          ) : loading ? (
            <span className="flex items-center gap-2 text-white">
              <Loader2 size={18} className="animate-spin sm:w-[22px] sm:h-[22px]" /> Kapsüle Yükleniyor...
            </span>
          ) : (type === 'CONFESSION' && isEphemeral) ? (
            <span className="flex items-center gap-2"><Send size={16} className="sm:w-[20px] sm:h-[20px] drop-shadow-md transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" /> Süreli İtirafı Fırlat ⏳</span>
          ) : type === 'CONFESSION' ? (
            <span className="flex items-center gap-2"><Send size={16} className="sm:w-[20px] sm:h-[20px] drop-shadow-md transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" /> İtirafı Gönder</span>
          ) : type === 'BOSYAP' ? (
            <span className="flex items-center gap-2"><Send size={16} className="sm:w-[20px] sm:h-[20px] drop-shadow-md transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" /> Boş Yap 🚀</span>
          ) : (
            <span className="flex items-center gap-2"><Send size={16} className="sm:w-[20px] sm:h-[20px] drop-shadow-md transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" /> Fısıltıyı Gönder</span>
          )}
        </button>
      </form>
    </div>
  );
}