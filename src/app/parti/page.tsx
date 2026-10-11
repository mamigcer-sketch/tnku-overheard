"use client";

import { useState, useEffect } from 'react';
import { sendPartyMessage } from './actions';
import { Send, HelpCircle, Loader2, Flag, Lock, KeyRound } from 'lucide-react';

export default function PartyInputPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState(false);

  const [content, setContent] = useState("");
  // 🔥 Doğrudan SORU formatıyla başlatıyoruz
  const [type, setType] = useState("PARTY_QUESTION"); 
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
    // Doğrudan SORU türünü yolluyoruz
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

  // Dinamik Tema Ayarları (REDFLAG EDITION)
  let themeObj = {
    glow: "from-red-600/25",
    ambient: "bg-red-500/15",
    line: "before:via-red-500/80",
    iconBox: "bg-red-500/15 border-red-500/30 shadow-[0_0_35px_rgba(239,68,68,0.25)]",
    border: "focus:border-red-500/60",
    btn: "bg-red-600 hover:bg-red-500 shadow-[0_0_25px_rgba(220,38,38,0.5)]",
    icon: "text-red-500",
    selection: "selection:bg-red-500/40"
  };

  // 🚩 Kırmızı ve Yeşil Bayrak Animasyonları
  const backgroundFlags = [
    { left: "10%", top: "20%", delay: "0s", duration: "12s", color: "#ff0015" },
    { left: "80%", top: "15%", delay: "2s", duration: "14s", color: "#00ff44" },
    { left: "25%", top: "80%", delay: "4s", duration: "15s", color: "#00ff44" },
    { left: "75%", top: "85%", delay: "1s", duration: "13s", color: "#ff0015" },
    { left: "50%", top: "10%", delay: "5s", duration: "11s", color: "#ff0015" },
    { left: "85%", top: "50%", delay: "3s", duration: "16s", color: "#00ff44" },
  ];

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-red-500/30 relative overflow-hidden">
        
        {/* Şifre Ekranı Arkası Bayraklar */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
          {backgroundFlags.map((flag, index) => (
            <div
              key={index}
              className="absolute opacity-20 animate-[floatFlag_var(--duration)_ease-in-out_infinite]"
              style={{
                  left: flag.left,
                  top: flag.top,
                  "--delay": flag.delay,
                  "--duration": flag.duration,
                  animationDelay: flag.delay,
              } as any}
            >
              <Flag size={40} color={flag.color} fill={flag.color} style={{ filter: `drop-shadow(0 0 15px ${flag.color})` }} />
            </div>
          ))}
        </div>

        <div className="w-full max-w-md bg-[#0a0a0a] border border-red-500/20 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(255,0,0,0.1)] relative overflow-hidden text-center backdrop-blur-xl">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none"></div>

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-6 relative z-10 shadow-[0_0_30px_rgba(255,0,0,0.15)]">
            <Lock size={32} className="text-red-500" />
          </div>

          <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-2 relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
            REDFLAG ERİŞİMİ
          </h1>
          <p className="text-gray-400 text-sm mb-8 relative z-10 font-medium">Parti ekranına bağlanmak için masadaki şifreyi gir.</p>

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-red-500/50">
                <KeyRound size={20} />
              </span>
              <input 
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Şifreyi Girin"
                className={`w-full bg-[#111] border rounded-2xl py-4 pl-14 pr-4 text-white text-lg font-bold tracking-widest outline-none transition-all ${passError ? 'border-red-500 text-red-400 animate-shake shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-white/10 focus:border-red-500/50 focus:bg-[#150a0a]'}`}
                autoFocus
              />
            </div>
            {passError && <p className="text-red-400 text-xs font-bold animate-pulse">Erişim reddedildi, şifreyi kontrol et!</p>}
            <button type="submit" className="w-full py-4 rounded-2xl bg-red-600 text-white font-black text-lg hover:bg-red-500 transition-all shadow-[0_0_30px_rgba(255,0,0,0.3)] active:scale-[0.98]">
              PARTİYE KATIL 🚩
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-[#050208] text-white flex items-center justify-center p-4 md:p-8 transition-colors duration-700 relative overflow-hidden ${themeObj.selection}`}>

      {/* 🚩 KIRMIZI VE YEŞİL BAYRAKLAR */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {backgroundFlags.map((flag, index) => (
          <div
            key={index}
            className="absolute opacity-20 animate-[floatFlag_var(--duration)_ease-in-out_infinite]"
            style={{
                left: flag.left,
                top: flag.top,
                "--delay": flag.delay,
                "--duration": flag.duration,
                animationDelay: flag.delay,
            } as any}
          >
            <Flag size={56} color={flag.color} fill={flag.color} style={{ filter: `drop-shadow(0 0 20px ${flag.color})` }} />
          </div>
        ))}
      </div>

      {/* Arkada değişen dinamik atmosfer ışığı */}
      <div className={`fixed inset-0 bg-gradient-to-b ${themeObj.glow} to-[#030303] opacity-40 pointer-events-none transition-all duration-1000`}></div>
      
      {/* Üstteki yoğunlaşan parıltı */}
      <div className={`fixed -top-32 left-1/2 -translate-x-1/2 w-[620px] h-[360px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${themeObj.ambient}`}></div>
      
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06] mix-blend-overlay pointer-events-none"></div>

      <div className={`w-full max-w-[520px] bg-[#09070c]/92 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-7 md:p-8 shadow-[0_35px_100px_rgba(0,0,0,.6)] relative overflow-hidden z-10 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent ${themeObj.line} before:to-transparent transition-all duration-700`}>

        {/* Başlık Alanı */}
        <div className="text-center mb-8 relative z-10">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 backdrop-blur-md transition-colors duration-700 ${themeObj.iconBox}`}>
            <Flag size={32} className={themeObj.icon} fill="currentColor" />
          </div>
          <h1 className="text-2xl md:text-[26px] font-black tracking-[0.12em] text-white mb-2 whitespace-nowrap">
            REDFLAG EDITION PARTY
          </h1>
          <p className="text-gray-500 text-[13px] font-medium tracking-wide">Ekrandaki kitleye sormak istediğin soruyu fırlat!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">

          {/* SADECE Soru Kutusu Kaldı */}
          <div className="relative group">
            <div className="absolute left-5 top-5 text-red-500/50">
              <HelpCircle size={20} />
            </div>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Soru ne?"
              className={`w-full bg-black/40 border border-white/10 rounded-[1.35rem] py-5 pl-14 pr-5 text-white text-lg font-medium placeholder:text-gray-600 outline-none transition-all duration-300 resize-none h-[140px] ${themeObj.border} group-hover:bg-[#151515] shadow-inner`}
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
            className={`w-full h-14 rounded-xl font-black text-[13px] tracking-[0.18em] flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] ${
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
              <><Send size={18} /> EKRANA SORU FIRLAT</>
            )}
          </button>

        </form>
      </div>

      {/* Bayrak animasyonu için keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatFlag {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-40px) rotate(15deg);
            opacity: 0.25;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}} />
    </main>
  );
}