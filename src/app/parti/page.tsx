"use client";

import { useState, useEffect } from 'react';
import { sendPartyMessage } from './actions';
import { Send, Flame, Ear, EyeOff, Loader2, Sparkles, Lock, KeyRound } from 'lucide-react';

export default function PartyInputPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState(false);

  const [content, setContent] = useState("");
  const [type, setType] = useState("ITIRAF");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('tnku_party_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const CORRECT_PASSWORD = "parti2026"; 

    if (passcode.trim() === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('tnku_party_auth', 'true');
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('type', type);
    formData.append('content', content);
    
    const response = await sendPartyMessage(formData);
    
    if (response?.error) {
      alert("Hata: " + response.error);
      setIsSubmitting(false);
      return;
    }
    
    setSuccess(true);
    setContent("");
    setIsSubmitting(false);
    setTimeout(() => setSuccess(false), 3000); 
  };

  // Dinamik Tema Ayarları (Seçili kategoriye göre tüm sayfanın rengi değişir)
  let themeObj = {
    glow: "from-red-600/20",
    border: "focus:border-red-500/50",
    btn: "bg-red-600 hover:bg-red-500 shadow-[0_0_25px_rgba(220,38,38,0.4)]",
    icon: "text-red-500",
    ring: "ring-red-500/50"
  };

  if (type === 'REZIL') {
    themeObj = {
      glow: "from-fuchsia-600/20",
      border: "focus:border-fuchsia-500/50",
      btn: "bg-fuchsia-600 hover:bg-fuchsia-500 shadow-[0_0_25px_rgba(192,38,211,0.4)]",
      icon: "text-fuchsia-500",
      ring: "ring-fuchsia-500/50"
    };
  } else if (type === 'OVERHEARD') {
    themeObj = {
      glow: "from-cyan-600/20",
      border: "focus:border-cyan-500/50",
      btn: "bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_25px_rgba(8,145,178,0.4)]",
      icon: "text-cyan-500",
      ring: "ring-cyan-500/50"
    };
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center p-6 selection:bg-white/20">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden text-center backdrop-blur-xl">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-6 relative z-10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <Lock size={32} className="text-white/80" />
          </div>
          
          <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-2 relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
            GİZLİ ERİŞİM
          </h1>
          <p className="text-gray-400 text-sm mb-8 relative z-10 font-medium">Parti ekranına bağlanmak için masadaki şifreyi gir.</p>
          
          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                <KeyRound size={20} />
              </span>
              <input 
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Şifreyi Girin"
                className={`w-full bg-[#111] border rounded-2xl py-4 pl-14 pr-4 text-white text-lg font-bold tracking-widest outline-none transition-all ${passError ? 'border-red-500 text-red-400 animate-shake shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-white/10 focus:border-white/30 focus:bg-[#151515]'}`}
                autoFocus
              />
            </div>
            {passError && <p className="text-red-400 text-xs font-bold animate-pulse">Erişim reddedildi, şifreyi kontrol et!</p>}
            <button type="submit" className="w-full py-4 rounded-2xl bg-white text-black font-black text-lg hover:bg-gray-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98]">
              PARTİYE KATIL 🚀
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center p-4 md:p-6 selection:bg-white/20 transition-colors duration-700">
      
      {/* Arkada değişen dinamik atmosfer ışığı */}
      <div className={`fixed inset-0 bg-gradient-to-b ${themeObj.glow} to-[#030303] opacity-40 pointer-events-none transition-all duration-1000`}></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06] mix-blend-overlay pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden z-10">
        
        {/* Başlık Alanı */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4 shadow-lg backdrop-blur-md">
            <Sparkles size={28} className={themeObj.icon} />
          </div>
          <h1 className="text-3xl font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-2">
            OVERHEARD PARTY
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide">Mesajını yaz, onaya gönder, dev ekranda gör!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Kategori Seçimi - Premium Görünüm */}
          <div className="grid grid-cols-3 gap-3 bg-black/40 p-2 rounded-3xl border border-white/5">
            <button type="button" onClick={() => setType('ITIRAF')} className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 ${type === 'ITIRAF' ? 'bg-red-500/15 border border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'border border-transparent text-gray-500 hover:text-gray-300'}`}>
              <Flame size={20} className="mb-1.5" />
              <span className="text-[10px] font-black tracking-widest">İTİRAF</span>
            </button>
            
            <button type="button" onClick={() => setType('REZIL')} className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 ${type === 'REZIL' ? 'bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-400 shadow-[0_0_20px_rgba(192,38,211,0.2)]' : 'border border-transparent text-gray-500 hover:text-gray-300'}`}>
              <EyeOff size={20} className="mb-1.5" />
              <span className="text-[10px] font-black tracking-widest">REZİL@</span>
            </button>
            
            <button type="button" onClick={() => setType('OVERHEARD')} className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 ${type === 'OVERHEARD' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(8,145,178,0.2)]' : 'border border-transparent text-gray-500 hover:text-gray-300'}`}>
              <Ear size={20} className="mb-1.5" />
              <span className="text-[10px] font-black tracking-widest">DUYDUM</span>
            </button>
          </div>

          {/* Mesaj Kutusu */}
          <div className="relative group">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ekrana ne yansıtmak istiyorsun?"
              className={`w-full bg-[#111] border border-white/10 rounded-[1.5rem] p-5 text-white text-lg font-medium outline-none transition-all duration-500 resize-none h-36 ${themeObj.border} group-hover:bg-[#151515]`}
              maxLength={150}
            />
            <div className={`absolute bottom-4 right-5 text-xs font-bold transition-colors duration-300 ${content.length >= 140 ? themeObj.icon : 'text-gray-600'}`}>
              {content.length}/150
            </div>
          </div>

          {/* Gönder Butonu */}
          <button 
            type="submit" 
            disabled={isSubmitting || !content.trim() || success}
            className={`w-full py-4 rounded-[1.5rem] font-black text-[15px] tracking-widest flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] ${
              success 
                ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]' 
                : isSubmitting || !content.trim() 
                  ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed' 
                  : `${themeObj.btn} text-white`
            }`}
          >
            {success ? (
              "ONAYA GÖNDERİLDİ! ✔️"
            ) : isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <><Send size={18} /> DEV EKRANA FIRLAT</>
            )}
          </button>
          
        </form>
      </div>
    </main>
  );
}