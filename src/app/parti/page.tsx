"use client";

import { useState } from 'react';
import Image from 'next/image';
import { sendPartyMessage } from '../admin/actions';
import {
  Send,
  CheckCircle2,
  Lock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const REACTION_EMOJIS = [
  { emoji: '🔥', label: 'Yandı' },
  { emoji: '😱', label: 'Oha' },
  { emoji: '😂', label: 'Koptum' },
  { emoji: '💀', label: 'Öldüm' },
];

export default function OverheardPartyPage() {
  // İtiraf Form State
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [flyingEmojis, setFlyingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!content.trim()) {
      setErrorMsg('Göndermek için önce itirafını yazmalısın.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('type', 'PARTY_OVERHEARD');
      formData.append('content', content.trim());

      const result = await sendPartyMessage(formData);

      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setSubmitted(true);
        setContent('');
      }
    } catch (err) {
      setErrorMsg('Bağlantı hatası oluştu, tekrar dene.');
    } finally {
      setLoading(false);
    }
  };

  const sendEmojiReaction = async (emoji: string) => {
    const id = Date.now() + Math.random();
    const left = Math.random() * 80 + 10;
    setFlyingEmojis((prev) => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setFlyingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 1500);

    try {
      await fetch('/api/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
    } catch (e) {
      console.error('Reaction send error:', e);
    }
  };

  return (
    <main className="min-h-screen bg-[#02040a] text-white flex flex-col items-center justify-between px-5 py-7 md:py-10 relative overflow-hidden select-none">
      {/* Overheard Mavi Sahne Atmosfer Işığı */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 12%, rgba(37, 99, 235, 0.28) 0%, rgba(2, 4, 10, 1) 64%)',
        }}
      />

      {/* Ekranda Uçuşan Emojiler */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {flyingEmojis.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-16 text-4xl"
            style={{
              left: `${item.left}%`,
              animation: 'floatUp 1.5s ease-out forwards',
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* ANA İÇERİK */}
      <div className="w-full max-w-[460px] mx-auto flex-1 flex flex-col justify-center relative z-10">
        {/* LOGO & BAŞLIK ALANI */}
        <div className="text-center mb-7">
          <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto mb-3">
            <Image
              src="/5555.png"
              alt="TNKU Overheard Logo"
              fill
              priority
              className="object-contain drop-shadow-[0_0_28px_rgba(59,130,246,0.5)]"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.28em] text-blue-400/90 uppercase mb-1.5">
            <Lock size={11} /> %100 ANONİM • KAYIT TUTULMAZ
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-[0.14em] text-white uppercase">
            OVERHEARD PARTY
          </h1>
          <p className="text-white/50 text-xs font-medium mt-1.5 max-w-xs mx-auto leading-relaxed">
            İçinde tuttuğun ne varsa dökül; onaylanan itiraflar anında DJ ekranına düşsün.
          </p>
        </div>

        {submitted ? (
          <div className="py-10 px-6 text-center bg-white/[0.03] backdrop-blur-xl border border-blue-500/20 rounded-3xl mb-6 space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <CheckCircle2 size={34} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wider text-white uppercase mb-1.5">
                İTİRAFIN İLETİLDİ ✨
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                Mesajın moderasyona düştü. Onaylandığı an dev ekranda herkesin gözü önünde yayınlanacak!
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/25 text-xs font-black tracking-[0.15em] text-blue-200 uppercase transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw size={15} /> YENİ İTİRAF YAZ
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mb-7">
            {/* İtiraf Alanı */}
            <div>
              <span className="flex items-center justify-center gap-1.5 text-[10px] font-black tracking-[0.25em] text-blue-300/60 uppercase mb-2.5">
                <Sparkles size={12} /> ANONİM İTİRAFINI YAZ
              </span>
              <div className="relative">
                <textarea
                  rows={5}
                  maxLength={300}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="İtirafını buraya dökül... (Örn: Kampüste kimsenin bilmediği...)"
                  className="w-full rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/15 focus:border-blue-500/80 p-4 pb-8 text-sm text-white placeholder-white/30 outline-none resize-none transition-all"
                />
                <span
                  className={`absolute bottom-3 right-4 text-[10px] font-black tracking-wider ${
                    content.length > 260 ? 'text-amber-400' : 'text-white/35'
                  }`}
                >
                  {content.length}/300
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 disabled:opacity-35 text-white font-black text-xs tracking-[0.22em] uppercase flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(37,99,235,0.45)] transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <Send size={16} />
              {loading ? 'GÖNDERİLİYOR...' : 'İTİRAFIMI GÖNDER'}
            </button>
          </form>
        )}

        {/* CANLI TEPKİ BAR */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-center text-[10px] text-white/45 font-black tracking-[0.25em] uppercase mb-3">
            SAHNEDEKİ İTİRAFA TEPKİ PATLAT ⚡
          </p>
          <div className="grid grid-cols-4 gap-2.5">
            {REACTION_EMOJIS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendEmojiReaction(item.emoji)}
                className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-blue-500/15 hover:border-blue-400/30 active:scale-90 transition-all cursor-pointer group"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">{item.emoji}</span>
                <span className="text-[9px] font-black tracking-wider text-white/50 mt-1 uppercase">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes floatUp {
          0% { transform: translateY(0px) scale(0.8); opacity: 1; }
          100% { transform: translateY(-280px) scale(1.4); opacity: 0; }
        }
      `}</style>
    </main>
  );
}