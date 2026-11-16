"use client";

import { useState } from 'react';
import Image from 'next/image';
import { sendPartyMessage } from '../admin/actions';
import { Flame, Skull, Eye, Sparkles, Send, CheckCircle2, Lock, RotateCcw } from 'lucide-react';

const SIN_CATEGORIES = [
  {
    id: 'PARTY_ITIRAF',
    title: 'Masum İtiraf',
    desc: 'Küçük kaçamaklar',
    icon: Sparkles,
    hex: '#f59e0b',
    activeCard: 'border-amber-500/70 bg-amber-500/15 text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.2)]',
    buttonGradient: 'from-amber-600 via-amber-500 to-orange-500 shadow-[0_0_35px_rgba(245,158,11,0.35)]',
    focusRing: 'focus:border-amber-500/70',
  },
  {
    id: 'PARTY_LINC',
    title: 'Büyük Günah',
    desc: 'Affedilmez itiraf',
    icon: Flame,
    hex: '#dc2626',
    activeCard: 'border-red-500/80 bg-red-600/20 text-red-200 shadow-[0_0_30px_rgba(220,38,38,0.3)]',
    buttonGradient: 'from-red-700 via-red-600 to-rose-600 shadow-[0_0_35px_rgba(220,38,38,0.45)]',
    focusRing: 'focus:border-red-500/80',
  },
  {
    id: 'PARTY_REZIL',
    title: 'Rezillik',
    desc: 'Yüz kızartan anı',
    icon: Skull,
    hex: '#a855f7',
    activeCard: 'border-purple-500/80 bg-purple-600/20 text-purple-200 shadow-[0_0_30px_rgba(168,85,247,0.25)]',
    buttonGradient: 'from-purple-700 via-purple-600 to-indigo-600 shadow-[0_0_35px_rgba(168,85,247,0.4)]',
    focusRing: 'focus:border-purple-500/80',
  },
  {
    id: 'PARTY_IFSA',
    title: 'İfşa & Sır',
    desc: 'Ortaya dökülsün',
    icon: Eye,
    hex: '#f43f5e',
    activeCard: 'border-rose-500/80 bg-rose-600/20 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.25)]',
    buttonGradient: 'from-rose-700 via-rose-600 to-pink-600 shadow-[0_0_35px_rgba(244,63,94,0.4)]',
    focusRing: 'focus:border-rose-500/80',
  },
];

const REACTION_EMOJIS = [
  { emoji: '🔥', label: 'Yandın' },
  { emoji: '😱', label: 'Oha' },
  { emoji: '🙏', label: 'Affet' },
  { emoji: '💀', label: 'Gömün' },
];

export default function ConfessionPartyPage() {
  const [selectedType, setSelectedType] = useState<string>('PARTY_LINC');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [flyingEmojis, setFlyingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);

  const currentTheme = SIN_CATEGORIES.find((c) => c.id === selectedType) || SIN_CATEGORIES[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!content.trim()) {
      setErrorMsg('İtiraf etmek için önce günahını yazmalısın.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('type', selectedType);
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
    <main className="min-h-screen bg-[#030102] text-white flex flex-col items-center justify-between px-5 py-7 md:py-10 relative overflow-hidden select-none">
      {/* Seçilen Günaha Göre Değişen Sahne Atmosfer Işığı */}
      <div
        className="fixed inset-0 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 12%, ${currentTheme.hex}30 0%, rgba(3, 1, 2, 1) 62%)`,
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

      {/* ANA İÇERİK (Kutusuz, Tam Ekran Mobil Kulüp Arayüzü) */}
      <div className="w-full max-w-[460px] mx-auto flex-1 flex flex-col justify-center relative z-10">
        {/* LOGO & BAŞLIK ALANI */}
        <div className="text-center mb-7">
          <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto mb-3">
            <Image
              src="/5555.png"
              alt="TNKU Overheard Logo"
              fill
              priority
              className="object-contain drop-shadow-[0_0_25px_rgba(220,38,38,0.45)]"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.28em] text-red-400/90 uppercase mb-1.5">
            <Lock size={11} /> %100 ANONİM • KAYIT TUTULMAZ
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-[0.12em] text-white uppercase">
            GÜNAH ÇIKARMA GECESİ
          </h1>
          <p className="text-white/50 text-xs font-medium mt-1.5 max-w-xs mx-auto leading-relaxed">
            İçinde tuttuğun ne varsa dökül; onaylanan itiraflar anında DJ ekranına düşsün.
          </p>
        </div>

        {submitted ? (
          <div className="py-10 px-6 text-center bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl mb-6 space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
              <CheckCircle2 size={34} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wider text-white uppercase mb-1.5">
                GÜNAHIN İLETİLDİ 🕯️
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                İtirafın moderasyon kürsüsüne düştü. Birazdan dev ekranda herkesin gözü önünde yargılanabilir!
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-black tracking-[0.15em] uppercase transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw size={15} /> YENİ GÜNAH YAZ
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mb-7">
            {/* 1. Günah Derecesi */}
            <div>
              <span className="block text-[10px] font-black tracking-[0.25em] text-white/45 uppercase mb-2.5 text-center">
                GÜNAH DERECESİNİ SEÇ
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {SIN_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedType === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedType(cat.id)}
                      className={`p-3.5 rounded-2xl border backdrop-blur-md text-left transition-all duration-300 cursor-pointer active:scale-[0.97] ${
                        isSelected
                          ? cat.activeCard
                          : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon size={16} />
                        <span className="font-black text-xs tracking-wide">{cat.title}</span>
                      </div>
                      <span className="text-[10px] opacity-70 block">{cat.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. İtiraf Alanı */}
            <div className="relative">
              <textarea
                rows={4}
                maxLength={300}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Günahını buraya dökül... (Örn: En yakın arkadaşımın...)"
                className={`w-full rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/15 ${currentTheme.focusRing} p-4 pb-8 text-sm text-white placeholder-white/30 outline-none resize-none transition-all`}
              />
              <span
                className={`absolute bottom-3 right-4 text-[10px] font-black tracking-wider ${
                  content.length > 260 ? 'text-red-400' : 'text-white/35'
                }`}
              >
                {content.length}/300
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className={`w-full py-4 rounded-2xl bg-gradient-to-r ${currentTheme.buttonGradient} disabled:opacity-35 text-white font-black text-xs tracking-[0.22em] uppercase flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] cursor-pointer`}
            >
              <Send size={16} />
              {loading ? 'GÖNDERİLİYOR...' : 'GÜNAHIMI İTİRAF ET'}
            </button>
          </form>
        )}

        {/* CANLI TEPKİ BAR */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-center text-[10px] text-white/45 font-black tracking-[0.25em] uppercase mb-3">
            SAHNEDEKİ GÜNAHA TEPKİ PATLAT ⚡
          </p>
          <div className="grid grid-cols-4 gap-2.5">
            {REACTION_EMOJIS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendEmojiReaction(item.emoji)}
                className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/10 hover:border-white/25 active:scale-90 transition-all cursor-pointer group"
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