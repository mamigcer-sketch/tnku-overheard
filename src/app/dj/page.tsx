"use client";

import { useEffect, useState, useRef } from 'react';
import { getActiveMessage } from '../admin/actions';
import { Flame, Skull, Eye, Sparkles, Camera } from 'lucide-react';
import Image from 'next/image';

const CATEGORY_THEMES: Record<
  string,
  {
    label: string;
    icon: any;
    hex: string;
    textAccent: string;
    lineGradient: string;
  }
> = {
  PARTY_ITIRAF: {
    label: 'MASUM İTİRAF',
    icon: Sparkles,
    hex: '#f59e0b',
    textAccent: 'text-amber-400',
    lineGradient: 'from-transparent via-amber-500 to-transparent',
  },
  PARTY_LINC: {
    label: 'BÜYÜK GÜNAH',
    icon: Flame,
    hex: '#dc2626',
    textAccent: 'text-red-500',
    lineGradient: 'from-transparent via-red-600 to-transparent',
  },
  PARTY_LİNÇ: {
    label: 'BÜYÜK GÜNAH',
    icon: Flame,
    hex: '#dc2626',
    textAccent: 'text-red-500',
    lineGradient: 'from-transparent via-red-600 to-transparent',
  },
  PARTY_REZIL: {
    label: 'REZİLLİK & UTANÇ',
    icon: Skull,
    hex: '#a855f7',
    textAccent: 'text-purple-400',
    lineGradient: 'from-transparent via-purple-500 to-transparent',
  },
  PARTY_IFSA: {
    label: 'İFŞA & GİZLİ SIR',
    icon: Eye,
    hex: '#f43f5e',
    textAccent: 'text-rose-500',
    lineGradient: 'from-transparent via-rose-500 to-transparent',
  },
  PARTY_OVERHEARD: {
    label: 'GÜNAH İTİRAFI',
    icon: Flame,
    hex: '#dc2626',
    textAccent: 'text-red-500',
    lineGradient: 'from-transparent via-red-600 to-transparent',
  },
};

export default function DjConfessionScreen() {
  const [displayedMessage, setDisplayedMessage] = useState<any>(null);
  const [pendingRevealMessage, setPendingRevealMessage] = useState<any>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [photoState, setPhotoState] = useState<{ active: boolean; photoUrl: string | null }>({
    active: false,
    photoUrl: null,
  });

  const lastMessageIdRef = useRef<string | null>(null);
  const isFirstFetchRef = useRef<boolean>(true);
  const processedReactionIds = useRef<Set<number>>(new Set());

  // Aktif günahı kontrol et ve yeni günah geldiyse 3-2-1 sayacını başlat
  useEffect(() => {
    const fetchActive = async () => {
      try {
        const msg = await getActiveMessage();

        if (!msg) {
          lastMessageIdRef.current = null;
          setDisplayedMessage(null);
          setPendingRevealMessage(null);
          setCountdown(null);
          isFirstFetchRef.current = false;
          return;
        }

        if (isFirstFetchRef.current) {
          isFirstFetchRef.current = false;
          lastMessageIdRef.current = msg.id;
          setDisplayedMessage(msg);
          return;
        }

        if (msg.id !== lastMessageIdRef.current) {
          lastMessageIdRef.current = msg.id;
          setPendingRevealMessage(msg);
          setCountdown(3);
        } else if (countdown === null) {
          setDisplayedMessage(msg);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchActive();
    const interval = setInterval(fetchActive, 1200);
    return () => clearInterval(interval);
  }, [countdown]);

  // 3 -> 2 -> 1 Geri Sayım Zamanlayıcısı
  useEffect(() => {
    if (countdown === null) return;

    const timer = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
      } else {
        setDisplayedMessage(pendingRevealMessage);
        setCountdown(null);
      }
    }, 850);

    return () => clearTimeout(timer);
  }, [countdown, pendingRevealMessage]);

  // Fotoğraf Modu Kontrolü
  useEffect(() => {
    const fetchPhotoState = async () => {
      try {
        const res = await fetch('/api/photo?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        if (data) setPhotoState(data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchPhotoState();
    const interval = setInterval(fetchPhotoState, 1500);
    return () => clearInterval(interval);
  }, []);

  // Uçuşan Canlı Tepki Emojileri
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const res = await fetch('/api/reaction?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        if (data && data.reactions) {
          data.reactions.forEach((item: { id: number; emoji: string }) => {
            if (!processedReactionIds.current.has(item.id)) {
              processedReactionIds.current.add(item.id);
              const left = Math.random() * 84 + 8;
              setFloatingEmojis((prev) => [...prev, { id: item.id, emoji: item.emoji, left }]);
              setTimeout(() => {
                setFloatingEmojis((prev) => prev.filter((e) => e.id !== item.id));
              }, 2600);
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchReactions();
    const interval = setInterval(fetchReactions, 800);
    return () => clearInterval(interval);
  }, []);

  const activeSource = countdown !== null ? pendingRevealMessage : displayedMessage;
  const currentTheme = activeSource
    ? CATEGORY_THEMES[activeSource.location] || CATEGORY_THEMES.PARTY_LINC
    : CATEGORY_THEMES.PARTY_LINC;
  const CategoryIcon = currentTheme.icon;

  // LED Ekran için dev punto ölçekleme
  const getTextSizeClass = (len: number) => {
    if (len <= 45) return 'text-6xl md:text-[7.5rem] leading-[1.08]';
    if (len <= 110) return 'text-4xl md:text-7xl leading-[1.15]';
    if (len <= 200) return 'text-3xl md:text-6xl leading-[1.2]';
    return 'text-2xl md:text-5xl leading-[1.25]';
  };

  return (
    <main className="h-screen w-screen bg-black text-white flex flex-col justify-between px-8 py-6 md:px-14 md:py-8 select-none relative overflow-hidden">
      {/* CANLI FOTOĞRAF MODU */}
      {photoState.active && photoState.photoUrl && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
          <span className="text-sm md:text-base font-black tracking-[0.4em] text-amber-400 uppercase mb-4 flex items-center gap-2">
            <Camera size={20} /> GECENİN KARESİ
          </span>
          <img
            src={photoState.photoUrl}
            alt="Gecenin Karesi"
            className="max-w-[92vw] max-h-[82vh] object-contain"
          />
        </div>
      )}

      {/* Uçuşan Tepki Emojileri */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-8 text-6xl md:text-8xl"
            style={{
              left: `${item.left}%`,
              animation: 'floatUpDj 2.6s ease-out forwards',
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* SAHNE ARKA PLAN IŞIĞI */}
      <div
        className="absolute inset-0 transition-all duration-1000 pointer-events-none"
        style={{
          background:
            countdown !== null
              ? 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.42) 0%, rgba(0, 0, 0, 1) 70%)'
              : `radial-gradient(circle at 50% 52%, ${currentTheme.hex}33 0%, rgba(0, 0, 0, 1) 68%)`,
        }}
      />

      {/* Üst Sahne Spot Hüzmesi */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[90vw] h-[420px] opacity-25 blur-[130px] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: countdown !== null ? '#ef4444' : currentTheme.hex }}
      />

      {/* KUTUSUZ ÜST BİLGİ ŞERİDİ & ÇİFT LOGO (5555 + SCAP) */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <div className="relative w-20 h-20 md:w-28 md:h-28">
              <Image src="/5555.png" alt="Overheard Logo" fill className="object-contain" />
            </div>

            <span className="text-white/30 font-black text-lg md:text-2xl select-none">×</span>

            <div className="relative w-24 h-24 md:w-36 md:h-28">
              <Image
                src="/scap.png"
                alt="Scap Logo"
                fill
                className="object-contain brightness-0 invert drop-shadow-[0_0_14px_rgba(255,255,255,0.4)]"
              />
            </div>
          </div>

          <div className="pl-2 md:pl-3 border-l border-white/15">
            <span className="text-xs md:text-sm font-black tracking-[0.45em] text-red-500 uppercase block mb-1">
              ANONİM İTİRAF HATTI
            </span>
            <h1 className="text-xl md:text-3xl font-black tracking-[0.18em] uppercase text-white/95">
              GÜNAH ÇIKARMA GECESİ
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <span className="text-xs md:text-sm font-black tracking-[0.35em] text-white/60 uppercase">
            CANLI
          </span>
        </div>
      </header>

      {/* MERKEZ SAHNE: 3-2-1 SAYACI / DEV GÜNAH METNİ / BEKLEME EKRANI */}
      <section className="relative z-10 my-auto w-full max-w-[92vw] mx-auto text-center flex flex-col items-center justify-center">
        {countdown !== null ? (
          /* 3 - 2 - 1 DRAMATİK GERİ SAYIM */
          <div className="flex flex-col items-center justify-center">
            <span className="text-sm md:text-2xl font-black tracking-[0.55em] text-red-500 uppercase mb-2 animate-pulse">
              YENİ GÜNAH GELİYOR
            </span>

            <div className="relative flex items-center justify-center">
              <div
                key={`ring-${countdown}`}
                style={{ animation: 'shockwave 0.85s ease-out forwards' }}
                className="absolute w-56 h-56 md:w-96 md:h-96 rounded-full border-4 border-red-500/70 pointer-events-none"
              />

              <span
                key={`num-${countdown}`}
                style={{
                  animation: 'countdownSlam 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  textShadow: '0 0 80px rgba(220, 38, 38, 0.95), 0 0 160px rgba(220, 38, 38, 0.6)',
                }}
                className="text-[13rem] md:text-[22rem] font-black leading-none text-white tracking-tighter"
              >
                {countdown}
              </span>
            </div>
          </div>
        ) : displayedMessage ? (
          /* KUTUSUZ VE TIRNAKSIZ DEV SAHNE İTİRAFI */
          <div
            key={displayedMessage.id}
            style={{ animation: 'confessionReveal 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            className="w-full flex flex-col items-center"
          >
            <div className="flex items-center justify-center gap-4 mb-6 md:mb-10 w-full max-w-3xl">
              <div className={`h-[2px] flex-1 bg-gradient-to-r ${currentTheme.lineGradient} opacity-70`} />
              <div className={`flex items-center gap-2.5 text-base md:text-2xl font-black tracking-[0.35em] uppercase ${currentTheme.textAccent}`}>
                <CategoryIcon size={26} />
                <span>{currentTheme.label}</span>
              </div>
              <div className={`h-[2px] flex-1 bg-gradient-to-r ${currentTheme.lineGradient} opacity-70`} />
            </div>

            <blockquote
              style={{
                textShadow: `0 0 60px ${currentTheme.hex}55, 0 10px 40px rgba(0,0,0,0.95)`,
              }}
              className={`font-black text-white tracking-tight break-words max-w-[88vw] mx-auto ${getTextSizeClass(
                displayedMessage.content.length
              )}`}
            >
              {displayedMessage.content}
            </blockquote>

            <div className="mt-10 md:mt-14 flex items-center justify-center gap-4 text-white/50 text-xs md:text-lg font-black tracking-[0.35em] uppercase">
              <span>AFFEDİLİR Mİ? TELEFONDAN TEPKİ GÖNDER</span>
              <span className="text-xl md:text-2xl">🔥 😱 🙏 💀</span>
            </div>
          </div>
        ) : (
          /* KUTUSUZ BEKLEME EKRANI */
          <div className="flex flex-col items-center justify-center max-w-5xl mx-auto">
            <Flame
              size={64}
              className="text-red-600 mb-6 animate-pulse drop-shadow-[0_0_35px_rgba(220,38,38,0.8)]"
            />
            <h2
              style={{ textShadow: '0 0 70px rgba(220, 38, 38, 0.45)' }}
              className="text-5xl md:text-8xl font-black tracking-[0.12em] uppercase text-white mb-6 leading-none"
            >
              OVERHEARD - OFFDAY SUNAR!
            </h2>
            <p className="text-lg md:text-3xl text-white/60 font-bold tracking-wide max-w-3xl leading-relaxed">
              İçinde tuttuğun sırları ve en büyük günahlarını anonim gönder; dev ekranda yargılansın.
            </p>
          </div>
        )}
      </section>

      {/* KUTUSUZ ALT BİLGİ */}
      <footer className="relative z-10 text-center">
        <span className="text-white/30 font-black tracking-[0.45em] text-[10px] md:text-xs uppercase">
          TNKU OVERHEARD • OFFDAY SAHNE SİSTEMİ
        </span>
      </footer>

      <style jsx global>{`
        @keyframes floatUpDj {
          0% { transform: translateY(0px) scale(0.8); opacity: 1; }
          100% { transform: translateY(-480px) scale(1.7); opacity: 0; }
        }
        @keyframes countdownSlam {
          0% { opacity: 0; transform: scale(2.4); filter: blur(12px); }
          25% { opacity: 1; transform: scale(0.95); filter: blur(0px); }
          100% { opacity: 0.9; transform: scale(1.05); }
        }
        @keyframes shockwave {
          0% { opacity: 0.9; transform: scale(0.4); }
          100% { opacity: 0; transform: scale(2.6); }
        }
        @keyframes confessionReveal {
          0% { opacity: 0; transform: scale(1.18); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }
      `}</style>
    </main>
  );
}