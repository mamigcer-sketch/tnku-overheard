"use client";

import { useState, useEffect } from 'react';
import { sendPartyMessage } from './actions';
import { Send, Flame, Ear, EyeOff, Loader2, PartyPopper, Lock, KeyRound } from 'lucide-react';

export default function PartyInputPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState(false);

  const [content, setContent] = useState("");
  const [type, setType] = useState("ITIRAF");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Daha önce şifreyi girdiyse tekrar sormayalım
  useEffect(() => {
    const auth = sessionStorage.getItem('tnku_party_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔥 Masalara yazacağın şifre burası! İstediğin gibi değiştirebilirsin (Örn: "parti2026")
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
    setTimeout(() => setSuccess(false), 2500); 
  };

  // 1. EĞER ŞİFRE GİRİLMEDİYSE KİLİT EKRANI GÖSTER
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-purple-500/30">
        <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-600/20 to-transparent pointer-events-none"></div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6 animate-pulse relative z-10">
            <Lock size={28} className="text-purple-400" />
          </div>

          <h1 className="text-2xl font-black uppercase tracking-wider mb-2 relative z-10">Parti Alanı Kilitli</h1>
          <p className="text-gray-400 text-sm mb-8 relative z-10">Dev ekrana mesaj göndermek için masada yazan şifreyi girin!</p>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <KeyRound size={20} />
              </span>
              <input 
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Masa Şifresi"
                className={`w-full bg-[#121212] border rounded-2xl py-4 pl-12 pr-4 text-white text-lg font-bold outline-none transition-all ${passError ? 'border-red-500 text-red-400 animate-shake' : 'border-white/10 focus:border-purple-500/50'}`}
                autoFocus
              />
            </div>

            {passError && (
              <p className="text-red-400 text-xs font-bold animate-pulse">Şifre hatalı, masadaki kodu kontrol et!</p>
            )}

            <button 
              type="submit"
              className="w-full py-4 rounded-2xl bg-white text-black font-black text-lg hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
            >
              Partiye Giriş Yap 🚀
            </button>
          </form>
        </div>
      </main>
    );
  }

  // 2. ŞİFRE DOĞRUYSA NORMAL MESAJ GÖNDERME EKRANI
  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-purple-500/30">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-600/20 to-transparent pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4 animate-pulse">
            <PartyPopper size={32} className="text-purple-400" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Canlı Parti Modu</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">Yaz, gönder, dev ekranda gör!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setType('ITIRAF')} className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${type === 'ITIRAF' ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/5 text-gray-500'}`}>
              <Flame size={20} className="mb-1" />
              <span className="text-[10px] font-black tracking-wider">İTİRAF</span>
            </button>
            <button type="button" onClick={() => setType('REZIL')} className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${type === 'REZIL' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/5 text-gray-500'}`}>
              <EyeOff size={20} className="mb-1" />
              <span className="text-[10px] font-black tracking-wider">REZİL@</span>
            </button>
            <button type="button" onClick={() => setType('OVERHEARD')} className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${type === 'OVERHEARD' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/5 text-gray-500'}`}>
              <Ear size={20} className="mb-1" />
              <span className="text-[10px] font-black tracking-wider">DUYDUM</span>
            </button>
          </div>

          <div className="relative">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ekrana ne yansıtmak istiyorsun?"
              className="w-full bg-[#121212] border border-white/10 rounded-2xl p-4 text-white text-lg font-medium outline-none focus:border-purple-500/50 transition-all resize-none h-32"
              maxLength={150}
            />
            <div className="absolute bottom-3 right-4 text-xs font-bold text-gray-600">{content.length}/150</div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !content.trim() || success}
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${success ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.3)]' : isSubmitting || !content.trim() ? 'bg-white/5 text-gray-600' : 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]'}`}
          >
            {success ? "EKRANA GÖNDERİLDİ! 🚀" : isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Dev Ekrana Fırlat</>}
          </button>
        </form>
      </div>
    </main>
  );
}