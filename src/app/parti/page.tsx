"use client";

import { useState, useEffect } from 'react';
import { sendPartyMessage } from './actions';
import { Send, Flame, Ear, EyeOff, Loader2, PartyPopper } from 'lucide-react';

export default function PartyPage() {
  const [content, setContent] = useState("");
  const [type, setType] = useState("ITIRAF");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  // Mesajları periyodik olarak çeken fonksiyon (Real-time polling)
  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/party/messages'); // Aşağıda API rotası kuracağız ya da doğrudan Prisma sorgusu atabiliriz
      // Alternatif olarak client-side fetch yapabiliriz.
    } catch (e) {
      console.error(e);
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

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-between p-6 selection:bg-purple-500/30">
      {/* Üst Başlık */}
      <div className="w-full max-w-4xl flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center animate-pulse">
            <PartyPopper className="text-purple-400" size={20} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider">TNKÜ Canlı Parti</h1>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 animate-pulse">
          ● CANLI AKIŞ
        </div>
      </div>

      {/* Orta Alan: Dev Ekran Mesaj Akışı ve Gönderim Formu */}
      <div className="w-full max-w-xl my-8 bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-600/10 to-transparent pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setType('ITIRAF')} className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${type === 'ITIRAF' ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/5 text-gray-500'}`}>
              <Flame size={18} className="mb-1" />
              <span className="text-[10px] font-black tracking-wider">İTİRAF</span>
            </button>
            <button type="button" onClick={() => setType('REZIL')} className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${type === 'REZIL' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/5 text-gray-500'}`}>
              <EyeOff size={18} className="mb-1" />
              <span className="text-[10px] font-black tracking-wider">REZİL@</span>
            </button>
            <button type="button" onClick={() => setType('OVERHEARD')} className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${type === 'OVERHEARD' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,2)]' : 'bg-white/5 border-white/5 text-gray-500'}`}>
              <Ear size={18} className="mb-1" />
              <span className="text-[10px] font-black tracking-wider">DUYDUM</span>
            </button>
          </div>

          <div className="relative">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ortama bomba bir mesaj bırak..."
              className="w-full bg-[#121212] border border-white/10 rounded-2xl p-4 text-white text-base font-medium outline-none focus:border-purple-500/50 transition-all resize-none h-28"
              maxLength={150}
            />
            <div className="absolute bottom-3 right-4 text-xs font-bold text-gray-600">{content.length}/150</div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !content.trim() || success}
            className={`w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all ${success ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]' : isSubmitting || !content.trim() ? 'bg-white/5 text-gray-600' : 'bg-white text-black hover:bg-gray-200'}`}
          >
            {success ? "Ekrana Fırlatıldı! 🚀" : isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Dev Ekrana Gönder</>}
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-gray-600 font-medium">
        TNKU Overheard • Canlı Parti Altyapısı
      </div>
    </main>
  );
}