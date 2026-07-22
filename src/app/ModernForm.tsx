"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, VenetianMask, Coffee, Send, CheckCircle2, Loader2, Info, Clock } from 'lucide-react';
import { createPost } from "@/app/post/actions";

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
  
  // 🔥 Ripple (Dalga) Efekti İçin State
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const router = useRouter();
  const maxChars = 500;

  // 🔥 Tıklanan Yerde Neon Dalga Yaratan Fonksiyon
  const triggerRipple = (e: React.MouseEvent<HTMLElement>, color: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y, color };

    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600); // 600ms sonra dalga kaybolur
  };

  const handleTabChange = (e: React.MouseEvent<HTMLButtonElement>, newType: 'CONFESSION' | 'BOSYAP' | 'OVERHEARD', color: string) => {
    triggerRipple(e, color);
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

  return (
    <div className={`relative bg-white/[0.02] backdrop-blur-2xl border transition-all duration-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-3 sm:p-6 rounded-[20px] sm:rounded-[24px] mb-2 overflow-hidden group/form ${
      (type === 'CONFESSION' && isEphemeral) ? 'border-amber-500/40 shadow-[0_8px_32px_0_rgba(245,158,11,0.15)]' 
      : type === 'BOSYAP' ? 'border-emerald-500/20 shadow-[0_8px_32px_0_rgba(16,185,129,0.1)]' 
      : 'border-white/[0.05]'
    }`}>
      
      <div className={`absolute -inset-[1px] opacity-0 group-hover/form:opacity-100 transition-opacity duration-1000 blur-2xl -z-10 bg-gradient-to-b ${
        type === 'CONFESSION' && isEphemeral ? 'from-amber-500/20' 
        : type === 'BOSYAP' ? 'from-emerald-500/10' 
        : 'from-white/[0.02]'
      } to-transparent pointer-events-none`} />

      {/* 🔥 ÜÇLÜ SEKMELER (Ripple Efekti Entegre Edildi) */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 p-1 bg-white/[0.02] backdrop-blur-md rounded-[14px] sm:rounded-[16px] border border-white/[0.03] shadow-inner relative overflow-hidden">
        
        {/* Ortak Ripple Çizici */}
        {ripples.map((r) => (
          <span
            key={r.id}
            style={{ left: r.x, top: r.y }}
            className={`absolute w-0 h-0 rounded-full pointer-events-none animate-ripple z-30 ${r.color}`}
          />
        ))}

        <button 
          type="button"
          onClick={(e) => handleTabChange(e, 'CONFESSION', 'bg-purple-400/40 shadow-[0_0_25px_rgba(168,85,247,0.8)]')} 
          className={`relative overflow-hidden flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-3 rounded-xl text-[11px] sm:text-[13px] transition-all duration-300 ${
            type === 'CONFESSION' 
              ? 'bg-purple-500 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-100' 
              : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] scale-95 hover:scale-100'
          }`}
        >
          <VenetianMask size={14} className="sm:w-[16px] sm:h-[16px]" /> İtiraf
        </button>

        <button 
          type="button"
          onClick={(e) => handleTabChange(e, 'BOSYAP', 'bg-emerald-400/40 shadow-[0_0_25px_rgba(16,185,129,0.8)]')} 
          className={`relative overflow-hidden flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-3 rounded-xl text-[11px] sm:text-[13px] transition-all duration-300 ${
            type === 'BOSYAP' 
              ? 'bg-emerald-500 text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-100' 
              : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] scale-95 hover:scale-100'
          }`}
        >
          <Coffee size={14} className="sm:w-[16px] sm:h-[16px]" /> Boş Yap
        </button>

        <button 
          type="button"
          onClick={(e) => handleTabChange(e, 'OVERHEARD', 'bg-[#4DA3FF]/40 shadow-[0_0_25px_rgba(77,163,255,0.8)]')} 
          className={`relative overflow-hidden flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-3 rounded-xl text-[11px] sm:text-[13px] transition-all duration-300 ${
            type === 'OVERHEARD' 
              ? 'bg-[#4DA3FF] text-black font-bold shadow-[0_0_20px_rgba(77,163,255,0.3)] scale-100' 
              : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] scale-95 hover:scale-100'
          }`}
        >
          <Headphones size={14} className="sm:w-[16px] sm:h-[16px]" /> <span className="hidden sm:inline">Overheard</span><span className="sm:hidden">Duyum</span>
        </button>
      </div>

      {/* Uyarı Kutusu */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-white/70 bg-white/[0.03] backdrop-blur-md px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl mb-4 sm:mb-6 border border-white/[0.05] shadow-sm">
        <Info size={14} className={`shrink-0 ${type === 'CONFESSION' ? 'text-purple-400' : type === 'BOSYAP' ? 'text-emerald-400' : 'text-[#4DA3FF]'}`} />
        <span className="text-[10px] sm:text-xs font-medium text-center tracking-wide">
          {type === 'BOSYAP' ? 'Burada kurallar daha esnek, içinden geçeni dökül!' : 'Lütfen paylaşımını doğru kategoriyle işaretlediğinden emin ol.'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5 relative z-10">
        {type === 'OVERHEARD' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="col-span-2 md:col-span-1">
                <input 
                  required 
                  placeholder="Konum (Örn: Yemekhane)" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="w-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.05] focus:bg-white/[0.06] p-2.5 sm:p-3.5 rounded-xl text-[12px] sm:text-base text-white outline-none focus:ring-2 focus:ring-[#4DA3FF]/30 focus:border-[#4DA3FF]/50 transition-all placeholder:text-gray-500 shadow-inner" 
                />
            </div>
            
            <div className="col-span-1 flex flex-col gap-1 sm:gap-1.5">
               <label className="text-[8px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider px-1">Kişi Sayısı</label>
               <select 
                required 
                value={people} 
                onChange={(e) => setPeople(e.target.value)} 
                className="bg-white/[0.03] backdrop-blur-md border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.05] focus:bg-white/[0.06] p-2.5 sm:p-3.5 rounded-xl text-[12px] sm:text-base text-white outline-none focus:ring-2 focus:ring-[#4DA3FF]/30 focus:border-[#4DA3FF]/50 transition-all cursor-pointer shadow-inner appearance-none"
              >
                <option value="" disabled hidden>Seçiniz</option>
                <option value="2 kişi" className="bg-[#1a1a1a] text-white">2 Kişi</option>
                <option value="3 kişi" className="bg-[#1a1a1a] text-white">3 Kişi</option>
                <option value="4 kişi" className="bg-[#1a1a1a] text-white">4 Kişi</option>
                <option value="Kalabalık" className="bg-[#1a1a1a] text-white">Kalabalık</option>
              </select>
            </div>

            <div className="col-span-1 flex flex-col gap-1 sm:gap-1.5">
              <label className="text-[8px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider px-1">Grup Türü</label>
              <select 
                required
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                className="bg-white/[0.03] backdrop-blur-md border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.05] focus:bg-white/[0.06] p-2.5 sm:p-3.5 rounded-xl text-[12px] sm:text-base text-white outline-none focus:ring-2 focus:ring-[#4DA3FF]/30 focus:border-[#4DA3FF]/50 transition-all cursor-pointer shadow-inner appearance-none"
              >
                <option value="" disabled hidden>Seçiniz</option>
                <option value="Kız" className="bg-[#1a1a1a] text-white">Sadece Kız</option>
                <option value="Erkek" className="bg-[#1a1a1a] text-white">Sadece Erkek</option>
                <option value="Karışık" className="bg-[#1a1a1a] text-white">Karışık Grup</option>
              </select>
            </div>

            <div className="col-span-2 md:col-span-1 flex flex-col gap-1 sm:gap-1.5">
              <label className="text-[8px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider px-1">Olay Saati</label>
              <input 
                type="time" 
                required 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                className="bg-white/[0.03] backdrop-blur-md border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.05] focus:bg-white/[0.06] p-2.5 sm:p-3.5 rounded-xl text-[12px] sm:text-base text-white outline-none focus:ring-2 focus:ring-[#4DA3FF]/30 focus:border-[#4DA3FF]/50 transition-all [color-scheme:dark] w-full shadow-inner" 
              />
            </div>
          </div>
        )}

        <div className="relative group/textarea">
            <textarea 
              required 
              maxLength={maxChars}
              rows={3} 
              placeholder={
                type === 'OVERHEARD' ? "Duyduğun o efsane diyalog neydi? 🤫" 
                : type === 'BOSYAP' ? "Boş yapma vakti... Ne düşünüyorsun? ☕"
                : "Sırrını buraya fısılda... 🎭"
              } 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className={`w-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] group-hover/textarea:border-white/[0.1] group-hover/textarea:bg-white/[0.05] p-3 sm:p-4 pb-7 sm:pb-8 rounded-xl text-[13px] sm:text-base text-white outline-none resize-none transition-all shadow-inner placeholder:text-gray-600 ${
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

        {type === 'CONFESSION' && (
          <div 
            onClick={() => setIsEphemeral(!isEphemeral)}
            className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border backdrop-blur-md cursor-pointer transition-all duration-300 animate-in fade-in duration-300 ${
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
          disabled={loading} 
          onClick={(e) => triggerRipple(e, 'bg-white/40 shadow-[0_0_30px_rgba(255,255,255,0.8)]')}
          className={`relative overflow-hidden w-full py-2.5 sm:py-4 rounded-xl text-[13px] sm:text-base font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,0,0,0.2)] active:scale-95 ${
            (type === 'CONFESSION' && isEphemeral) ? 'bg-amber-600 hover:bg-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] text-black'
            : type === 'CONFESSION' ? 'bg-purple-600 hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]' 
            : type === 'BOSYAP' ? 'bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]'
            : 'bg-[#4DA3FF] text-black hover:bg-blue-400 hover:shadow-[0_0_30px_rgba(77,163,255,0.4)]'
          }`}
        >
          {/* Ortak Ripple Çizici (Buton İçin) */}
          {ripples.map((r) => (
            <span
              key={r.id}
              style={{ left: r.x, top: r.y }}
              className={`absolute w-0 h-0 rounded-full pointer-events-none animate-ripple z-30 ${r.color}`}
            />
          ))}

          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin sm:w-[20px] sm:h-[20px]" /> Kapsüle Yükleniyor...
            </span>
          ) : (type === 'CONFESSION' && isEphemeral) ? (
            <span className="flex items-center gap-2"><Send size={16} className="sm:w-[20px] sm:h-[20px] drop-shadow-md" /> Süreli İtirafı Fırlat ⏳</span>
          ) : type === 'CONFESSION' ? (
            <span className="flex items-center gap-2"><Send size={16} className="sm:w-[20px] sm:h-[20px] drop-shadow-md" /> İtirafı Gönder</span>
          ) : type === 'BOSYAP' ? (
            <span className="flex items-center gap-2"><Send size={16} className="sm:w-[20px] sm:h-[20px] drop-shadow-md" /> Boş Yap 🚀</span>
          ) : (
            <span className="flex items-center gap-2"><Send size={16} className="sm:w-[20px] sm:h-[20px] drop-shadow-md" /> Fısıltıyı Gönder</span>
          )}
        </button>
      </form>

      {/* Başarı Mesajı */}
      {successMsg && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B0B0B]/80 backdrop-blur-md rounded-[20px] sm:rounded-[24px] animate-in fade-in duration-300">
          <div className="p-4 sm:p-5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl flex flex-col items-center gap-2 sm:gap-3 justify-center animate-in zoom-in-95 duration-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
            <CheckCircle2 size={28} className="sm:w-[40px] sm:h-[40px] animate-bounce" /> 
            <span className="font-bold text-[13px] sm:text-base tracking-wide">Onaya Gönderildi!</span>
            <span className="text-[10px] sm:text-xs text-green-400/70 font-medium">Yönetici onayından sonra yayınlanacaktır.</span>
          </div>
        </div>
      )}
    </div>
  );
}