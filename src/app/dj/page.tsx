"use client";

import { useEffect, useState, useRef } from 'react';
import { getActiveMessage } from '../admin/actions';
import { Sparkles, Camera, Volume2 } from 'lucide-react';
import Image from 'next/image';

export default function DjOverheardScreen() {
  const [displayedMessage, setDisplayedMessage] = useState<any>(null);
  const [pendingRevealMessage, setPendingRevealMessage] = useState<any>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [photoState, setPhotoState] = useState<{ active: boolean; photoUrl: string | null }>({
    active: false,
    photoUrl: null,
  });

  // Tam Ekran Intro / Loop Video State
  const [videoState, setVideoState] = useState<{ active: boolean; loop: boolean; startedAt: number }>({
    active: false,
    loop: false,
    startedAt: 0,
  });
  const [isVideoMutedFallback, setIsVideoMutedFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const lastMessageIdRef = useRef<string | null>(null);
  const isFirstFetchRef = useRef<boolean>(true);
  const processedReactionIds = useRef<Set<number>>(new Set());

  // Aktif itirafı kontrol et ve yeni mesaj geldiyse 3-2-1 sayacını başlat
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

  // Intro / Loop Video Modu Kontrolü
  useEffect(() => {
    const fetchVideoState = async () => {
      try {
        const res = await fetch('/api/video?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        if (data && typeof data.active === 'boolean') {
          setVideoState((prev) => {
            if (
              prev.active !== data.active ||
              prev.loop !== data.loop ||
              prev.startedAt !== data.startedAt
            ) {
              return data;
            }
            return prev;
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchVideoState();
    const interval = setInterval(fetchVideoState, 1000);
    return () => clearInterval(interval);
  }, []);

  // Video başladığında sesiyle oynatmayı dene, Chrome engellerse sessiz başlat
  useEffect(() => {
    if (!videoState.active || !videoRef.current) return;
    const vid = videoRef.current;

    const startPlayback = async () => {
      try {
        vid.currentTime = 0;
        vid.muted = false;
        setIsVideoMutedFallback(false);
        await vid.play();
      } catch {
        try {
          vid.muted = true;
          setIsVideoMutedFallback(true);
          await vid.play();
        } catch (err) {
          console.error('Video oynatma hatası:', err);
        }
      }
    };

    startPlayback();
  }, [videoState.active, videoState.startedAt]);

  const handleVideoEnded = async () => {
    setVideoState({ active: false, loop: false, startedAt: 0 });
    try {
      await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnmuteVideo = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsVideoMutedFallback(false);
    }
  };

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

  // LED Ekran için dev punto ölçekleme
  const getTextSizeClass = (len: number) => {
    if (len <= 45) return 'text-6xl md:text-[7.5rem] leading-[1.08]';
    if (len <= 110) return 'text-4xl md:text-7xl leading-[1.15]';
    if (len <= 200) return 'text-3xl md:text-6xl leading-[1.2]';
    return 'text-2xl md:text-5xl leading-[1.25]';
  };

  return (
    <main className="h-screen w-screen bg-[#02040a] text-white flex flex-col justify-between px-8 py-6 md:px-14 md:py-8 select-none relative overflow-hidden">
      {/* 🎬 TAM EKRAN INTRO / LOOP VİDEO MODU */}
      {videoState.active && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <video
            key={videoState.startedAt}
            ref={videoRef}
            src="/intro.mp4"
            preload="auto"
            muted={isVideoMutedFallback}
            loop={videoState.loop}
            playsInline
            onEnded={videoState.loop ? undefined : handleVideoEnded}
            className="w-screen h-screen object-contain bg-black"
          />
          {isVideoMutedFallback && (
            <button
              onClick={handleUnmuteVideo}
              className="fixed bottom-8 right-8 z-50 px-5 py-3 rounded-full bg-blue-600 text-white font-black text-xs tracking-widest uppercase flex items-center gap-2 shadow-2xl animate-bounce cursor-pointer"
            >
              <Volume2 size={18} /> SESİ AÇ
            </button>
          )}
        </div>
      )}

      {/* CANLI FOTOĞRAF MODU */}
      {!videoState.active && photoState.active && photoState.photoUrl && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
          <span className="text-sm md:text-base font-black tracking-[0.4em] text-blue-400 uppercase mb-4 flex items-center gap-2">
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
              ? 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.45) 0%, rgba(2, 4, 10, 1) 70%)'
              : 'radial-gradient(circle at 50% 52%, rgba(37, 99, 235, 0.26) 0%, rgba(2, 4, 10, 1) 68%)',
        }}
      />

      {/* Üst Sahne Spot Hüzmesi */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[90vw] h-[420px] opacity-25 blur-[130px] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: countdown !== null ? '#3b82f6' : '#2563eb' }}
      />

      {/* KUTUSUZ ÜST BİLGİ ŞERİDİ & BÜYÜK OVERHEARD LOGOSU */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-5 md:gap-7">
          <div className="relative w-28 h-28 md:w-40 md:h-40 shrink-0">
            <Image
              src="/5555.png"
              alt="Overheard Logo"
              fill
              priority
              className="object-contain drop-shadow-[0_0_24px_rgba(59,130,246,0.45)]"
            />
          </div>

          <div className="pl-4 md:pl-6 border-l border-white/15">
            <span className="text-xs md:text-sm font-black tracking-[0.45em] text-blue-400 uppercase block mb-1.5">
              ANONİM İTİRAF HATTI
            </span>
            <h1 className="text-2xl md:text-4xl font-black tracking-[0.18em] uppercase text-white/95">
              OVERHEARD PARTY
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <span className="text-xs md:text-sm font-black tracking-[0.35em] text-white/60 uppercase">
            CANLI
          </span>
        </div>
      </header>

      {/* MERKEZ SAHNE: 3-2-1 SAYACI / DEV İTİRAF METNİ / BEKLEME EKRANI */}
      <section className="relative z-10 my-auto w-full max-w-[92vw] mx-auto text-center flex flex-col items-center justify-center">
        {countdown !== null ? (
          /* 3 - 2 - 1 DRAMATİK GERİ SAYIM */
          <div className="flex flex-col items-center justify-center">
            <span className="text-sm md:text-2xl font-black tracking-[0.55em] text-blue-400 uppercase mb-2 animate-pulse">
              YENİ İTİRAF GELİYOR
            </span>

            <div className="relative flex items-center justify-center">
              <div
                key={`ring-${countdown}`}
                style={{ animation: 'shockwave 0.85s ease-out forwards' }}
                className="absolute w-56 h-56 md:w-96 md:h-96 rounded-full border-4 border-blue-500/70 pointer-events-none"
              />

              <span
                key={`num-${countdown}`}
                style={{
                  animation: 'countdownSlam 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  textShadow: '0 0 80px rgba(59, 130, 246, 0.95), 0 0 160px rgba(37, 99, 235, 0.65)',
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
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70" />
              <div className="flex items-center gap-2.5 text-base md:text-2xl font-black tracking-[0.35em] uppercase text-blue-400">
                <Sparkles size={26} />
                <span>ANONİM İTİRAF</span>
              </div>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70" />
            </div>

            <blockquote
              style={{
                textShadow: '0 0 60px rgba(59, 130, 246, 0.45), 0 10px 40px rgba(0,0,0,0.95)',
              }}
              className={`font-black text-white tracking-tight break-words max-w-[88vw] mx-auto ${getTextSizeClass(
                displayedMessage.content.length
              )}`}
            >
              {displayedMessage.content}
            </blockquote>

            <div className="mt-10 md:mt-14 flex items-center justify-center gap-4 text-white/50 text-xs md:text-lg font-black tracking-[0.35em] uppercase">
              <span>NE DİYORSUN? TELEFONDAN TEPKİ GÖNDER</span>
              <span className="text-xl md:text-2xl">🔥 😱 😂 💀</span>
            </div>
          </div>
        ) : (
          /* KUTUSUZ BEKLEME EKRANI */
          <div className="flex flex-col items-center justify-center max-w-5xl mx-auto">
            <Sparkles
              size={64}
              className="text-blue-500 mb-6 animate-pulse drop-shadow-[0_0_35px_rgba(59,130,246,0.85)]"
            />
            <h2
              style={{ textShadow: '0 0 70px rgba(59, 130, 246, 0.5)' }}
              className="text-5xl md:text-8xl font-black tracking-[0.14em] uppercase text-white mb-6 leading-none"
            >
              OVERHEARD PARTY
            </h2>
            <p className="text-lg md:text-3xl text-white/60 font-bold tracking-wide max-w-3xl leading-relaxed">
              İçinde tuttuğun her şeyi anonim gönder; dev ekranda herkes görsün.
            </p>
          </div>
        )}
      </section>

      {/* KUTUSUZ ALT BİLGİ */}
      <footer className="relative z-10 text-center">
        <span className="text-white/30 font-black tracking-[0.45em] text-[10px] md:text-xs uppercase">
          TNKU OVERHEARD • CANLI SAHNE SİSTEMİ
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