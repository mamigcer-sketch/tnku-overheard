"use client";

import { useState, useEffect } from 'react';
import { sendPartyMessage } from './actions';
import { Send, Skull, Ghost, Zap, Loader2, Lock, KeyRound } from 'lucide-react';

export default function PartyInputPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState(false);

  const [content, setContent] = useState("");
  const [type, setType] = useState("PARTY_ITIRAF"); 
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

    try {
      const response = await sendPartyMessage(formData);
      if (response?.error) {
        alert("Hata: " + response.error);
        setIsSubmitting(false);
        return;
      }
      setSuccess(true);
      setContent("");
    } catch (err) {
      console.error(err);
    }
    
    setIsSubmitting(false);
    setTimeout(() => setSuccess(false), 3000); 
  };

  let themeObj = {
    glow: "from-[#ff6a00]/25",
    ambient: "bg-[#ff6a00]/15",
    line: "before:via-[#ff6a00]/80",
    iconBox: "bg-[#ff6a00]/15 border-[#ff6a00]/30 shadow-[0_0_35px_rgba(255,106,0,0.25)]",
    border: "focus:border-[#ff6a00]/60",
    btn: "bg-[#ff6a00] hover:bg-[#ff8a33] text-black shadow-[0_0_25px_rgba(255,106,0,0.5)]",
    icon: "text-[#ff6a00]",
    selection: "selection:bg-[#ff6a00]/40",
    inputBg: "focus:bg-[#1a0b00]"
  };

  if (type === 'PARTY_LINC') {
    themeObj = {
      glow: "from-[#9d00ff]/25",
      ambient: "bg-[#9d00ff]/15",
      line: "before:via-[#9d00ff]/80",
      iconBox: "bg-[#9d00ff]/15 border-[#9d00ff]/30 shadow-[0_0_35px_rgba(157,0,255,0.25)]",
      border: "focus:border-[#9d00ff]/60",
      btn: "bg-[#9d00ff] hover:bg-[#b533ff] text-white shadow-[0_0_25px_rgba(157,0,255,0.5)]",
      icon: "text-[#9d00ff]",
      selection: "selection:bg-[#9d00ff]/40",
      inputBg: "focus:bg-[#0f001a]"
    };
  } else if (type === 'PARTY_OVERHEARD') {
    themeObj = {
      glow: "from-[#00ff33]/25",
      ambient: "bg-[#00ff33]/15",
      line: "before:via-[#00ff33]/80",
      iconBox: "bg-[#00ff33]/15 border-[#00ff33]/30 shadow-[0_0_35px_rgba(0,255,51,0.25)]",
      border: "focus:border-[#00ff33]/60",
      btn: "bg-[#00ff33] hover:bg-[#33ff5c] text-black shadow-[0_0_25px_rgba(0,255,51,0.5)]",
      icon: "text-[#00ff33]",
      selection: "selection:bg-[#00ff33]/40",
      inputBg: "focus:bg-[#001a05]"
    };
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-[#ff6a00]/30 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40" style={{ backgroundImage: "url('/halloween-bg.jpg')" }} />
        <div className="absolute inset-0 z-0 bg-black/80 mix-blend-multiply pointer-events-none" />

        <div className="w-full max-w-md bg-[#0a0503]/90 border border-[#ff6a00]/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(255,106,0,0.15)] relative overflow-hidden text-center backdrop-blur-xl z-10">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#ff6a00]/10 to-transparent pointer-events-none"></div>

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#ff6a00]/10 border border-[#ff6a00]/30 mb-6 relative z-10 shadow-[0_0_30px_rgba(255,106,0,0.2)]">
            <Lock size={32} className="text-[#ff6a00]" />
          </div>

          <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-2 relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#ffaa00] to-[#ff6a00]">
            HALLOWEEN GİRİŞ
          </h1>
          <p className="text-gray-400 text-sm mb-8 relative z-10 font-medium">Parti ekranına bağlanmak için masadaki şifreyi gir.</p>

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#ff6a00]/50">
                <KeyRound size={20} />
              </span>
              <input 
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Şifreyi Girin"
                className={`w-full bg-[#0a0a0a] border rounded-2xl py-4 pl-14 pr-4 text-white text-lg font-bold tracking-widest outline-none transition-all ${passError ? 'border-red-500 text-red-400 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-white/10 focus:border-[#ff6a00]/50 focus:bg-[#150a00]'}`}
                autoFocus
              />
            </div>
            {passError && <p className="text-red-400 text-xs font-bold animate-pulse">Erişim reddedildi, şifreyi kontrol et!</p>}
            <button type="submit" className="w-full py-4 rounded-2xl bg-[#ff6a00] text-black font-black text-lg hover:bg-[#ff8a33] transition-all shadow-[0_0_30px_rgba(255,106,0,0.3)] active:scale-[0.98]">
              PARTİYE KATIL 🎃
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-black text-white flex items-center justify-center p-4 md:p-8 transition-colors duration-700 relative overflow-hidden ${themeObj.selection}`}>
      
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40" style={{ backgroundImage: "url('/halloween-bg.jpg')" }} />
      <div className="absolute inset-0 z-0 bg-black/80 mix-blend-multiply pointer-events-none" />

      <div className={`absolute inset-0 bg-gradient-to-b ${themeObj.glow} to-black/80 opacity-60 pointer-events-none transition-all duration-1000 z-0`}></div>
      <div className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[620px] h-[360px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 z-0 ${themeObj.ambient}`}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06] mix-blend-overlay pointer-events-none z-0"></div>

      <div className={`w-full max-w-[520px] bg-[#050308]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-7 md:p-8 shadow-[0_35px_100px_rgba(0,0,0,.8)] relative overflow-hidden z-10 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent ${themeObj.line} before:to-transparent transition-all duration-700`}>

        <div className="text-center mb-6 relative z-10">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 backdrop-blur-md transition-colors duration-700 ${themeObj.iconBox}`}>
            <Skull size={28} className={themeObj.icon} />
          </div>
          <h1 className="text-2xl md:text-[26px] font-black tracking-[0.12em] text-white mb-1 whitespace-nowrap">
            HALLOWEEN PARTY
          </h1>
          <p className="text-gray-400 text-[13px] font-medium tracking-wide">Mesajını yaz, onaya gönder, dev ekranda gör!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          <div className="flex gap-1.5 bg-black/50 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <button type="button" onClick={() => setType('PARTY_ITIRAF')} className={`flex-1 min-w-0 h-[76px] flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 ${type === 'PARTY_ITIRAF' ? 'bg-[#ff6a00]/20 border border-[#ff6a00]/40 text-[#ff6a00] shadow-[0_0_20px_rgba(255,106,0,0.2)]' : 'border border-transparent text-gray-500 hover:text-gray-300'}`}>
              <Skull size={20} />
              <span className="text-[10px] font-black tracking-widest mt-1">İTİRAF</span>
            </button>

            <button type="button" onClick={() => setType('PARTY_LINC')} className={`flex-1 min-w-0 h-[76px] flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 ${type === 'PARTY_LINC' ? 'bg-[#9d00ff]/20 border border-[#9d00ff]/40 text-[#9d00ff] shadow-[0_0_20px_rgba(157,0,255,0.2)]' : 'border border-transparent text-gray-500 hover:text-gray-300'}`}>
              <Ghost size={20} />
              <span className="text-[10px] font-black tracking-widest mt-1">LİNÇ@</span>
            </button>

            <button type="button" onClick={() => setType('PARTY_OVERHEARD')} className={`flex-1 min-w-0 h-[76px] flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 ${type === 'PARTY_OVERHEARD' ? 'bg-[#00ff33]/20 border border-[#00ff33]/40 text-[#00ff33] shadow-[0_0_20px_rgba(0,255,51,0.2)]' : 'border border-transparent text-gray-500 hover:text-gray-300'}`}>
              <Zap size={20} />
              <span className="text-[10px] font-black tracking-widest mt-1">DUYDUM</span>
            </button>
          </div>

          <div className="relative group">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ekrana ne yansıtmak istiyorsun?"
              className={`w-full bg-black/40 border border-white/10 rounded-[1.35rem] p-5 text-white text-lg font-medium placeholder:text-gray-600 outline-none transition-all duration-300 resize-none h-[140px] ${themeObj.border} ${themeObj.inputBg} shadow-inner`}
              maxLength={150}
            />
            <div className={`absolute bottom-4 right-5 text-xs font-bold transition-colors duration-300 ${content.length >= 140 ? themeObj.icon : 'text-gray-600'}`}>
              {content.length}/150
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !content.trim() || success}
            className={`w-full h-14 rounded-xl font-black text-[13px] tracking-[0.18em] flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] ${
              success 
                ? 'bg-green-500 text-black shadow-[0_0_30px_rgba(34,197,94,0.4)]' 
                : isSubmitting || !content.trim() 
                  ? 'bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed' 
                  : `${themeObj.btn}`
            }`}
          >
            {success ? (
              "ONAYA GÖNDERİLDİ! ✔️"
            ) : isSubmitting ? (
              <Loader2 className="animate-spin text-black" />
            ) : (
              <><Send size={18} /> DEV EKRANA FIRLAT</>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}