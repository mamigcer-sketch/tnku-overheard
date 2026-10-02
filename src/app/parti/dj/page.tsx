"use client";

import { useEffect, useState, useRef } from "react";
import {
  Flame,
  EyeOff,
  Ear,
  Radio,
  Zap,
  Sparkles,
} from "lucide-react";

export default function DjScreen() {
  const [message, setMessage] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);
  const [live, setLive] = useState(true);
  
  // Geri sayım ve geçiş durumlarını tutacağımız state
  const [transitionStep, setTransitionStep] = useState<string | null>(null);

  // Arka planda işlemleri birbirine karıştırmamak için Ref'ler
  const isTransitioning = useRef(false);
  const lastMsgId = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    // Bekleme işlemlerini kolaylaştırmak için yardımcı fonksiyon
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    // Yeni mesaj geldiğinde çalışacak SİNEMATİK GEÇİŞ FONKSİYONU
    const runTransition = async (newMsg: any) => {
      if (!mounted) return;
      isTransitioning.current = true;

      // 1. Eski mesajı yavaşça gizle
      setVisible(false);
      await delay(500);

      // 2. Mesajı arka planda değiştir ki, kulübün lazerleri ve ışıkları
      // hemen gelecek olan mesajın temasına (kırmızı, mor, mavi) bürünsün!
      setMessage(newMsg);

      let tTitle = "İTİRAF";
      if (newMsg.location === "PARTY_REZIL") tTitle = "REZİL@";
      if (newMsg.location === "PARTY_OVERHEARD") tTitle = "DUYDUM";

      // 3. Ekrana devasa YENİ İTİRAF yazısı fırlat
      setTransitionStep(`YENİ ${tTitle}`);
      await delay(1500);

      // 4. Geri Sayım Şovu (3, 2, 1)
      setTransitionStep("3");
      await delay(1000);
      setTransitionStep("2");
      await delay(1000);
      setTransitionStep("1");
      await delay(1000);

      if (!mounted) return;

      // 5. Geri sayımı kapat, Flaşı patlat!
      setTransitionStep(null);
      setFlash(true);
      await delay(300);

      if (!mounted) return;
      
      // 6. Ve yeni mesajı ekranda belirginleştir
      setVisible(true);
      setFlash(false);
      
      // Geçiş bitti, sistemi yeni mesajlara aç
      isTransitioning.current = false;
    };

    const fetchMsg = async () => {
      try {
        // Eğer geri sayım animasyonu oynuyorsa veritabanı sorgusunu beklet (şovu bölmesin)
        if (isTransitioning.current) return;

        const res = await fetch("/api/parti?t=" + Date.now(), { cache: "no-store" });
        const data = await res.json();

        if (!mounted || !data?.message) return;

        // Ekrana yansıyan son mesajdan FARKLI yepyeni bir mesaj geldiyse:
        if (lastMsgId.current !== data.message.id) {
          
          // Eğer DJ ekranı ilk kez açılıyorsa direkt göstersin (geri sayım yapmasın)
          if (lastMsgId.current === null) {
            lastMsgId.current = data.message.id;
            setMessage(data.message);
            setVisible(true);
          } else {
            // Canlı yayındayken yeni mesaj düştüyse şovu başlat!
            lastMsgId.current = data.message.id;
            runTransition(data.message);
          }
        }
      } catch (error) {
        console.error("Mesaj çekilemedi", error);
      }
    };

    fetchMsg();

    const interval = setInterval(fetchMsg, 3000);
    const liveInterval = setInterval(() => setLive((v) => !v), 900);

    return () => {
      mounted = false;
      clearInterval(interval);
      clearInterval(liveInterval);
    };
  }, []);

  let accent = "#ff3038";
  let title = "İTİRAF";
  let Icon = Flame;

  if (message?.location === "PARTY_REZIL") {
    accent = "#ed48ff";
    title = "REZİL@";
    Icon = EyeOff;
  }

  if (message?.location === "PARTY_OVERHEARD") {
    accent = "#00e5ff";
    title = "DUYDUM";
    Icon = Ear;
  }

  return (
    <main
      className="dj-screen relative min-h-screen overflow-hidden bg-[#030303] text-white flex flex-col justify-between p-6 md:p-10"
      style={{ "--accent": accent } as React.CSSProperties}
    >

      {/* ATMOSFERİK ARKA PLAN */}
      <div className="absolute inset-0 bg-[#030303]" />

      <div
        className="absolute inset-0 animate-[ambient_9s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(ellipse at 50% 48%, ${accent}55 0%, ${accent}20 32%, transparent 72%)`,
        }}
      />

      {/* HAREKETLİ IŞIK HÜZMESİ */}
      <div
        className="absolute w-[65vw] h-[150vh] top-[-30%] left-[15%] blur-[100px] opacity-[0.12] rotate-[-25deg] animate-[laser_12s_ease-in-out_infinite]"
        style={{ background: accent }}
      />

      <div
        className="absolute w-[45vw] h-[130vh] top-[-20%] right-[-20%] blur-[120px] opacity-[0.09] rotate-[35deg] animate-[laser_15s_ease-in-out_infinite_reverse]"
        style={{ background: accent }}
      />

      {/* MERKEZ HALKALARI */}
      <div
        className="absolute left-1/2 top-1/2 w-[65vw] aspect-square rounded-full border opacity-[0.08] animate-[orbit_35s_linear_infinite]"
        style={{ borderColor: accent }}
      />

      <div
        className="absolute left-1/2 top-1/2 w-[45vw] aspect-square rounded-full border opacity-[0.10] animate-[orbit_24s_linear_infinite_reverse]"
        style={{ borderColor: accent }}
      />

      {/* IŞIK PATLAMASI (Flaş Efekti) */}
      <div
        className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-500 ${
          flash ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(circle at center, white 0%, ${accent}bb 15%, transparent 65%)`,
        }}
      />

      {/* GERİ SAYIM / SİNEMATİK GEÇİŞ EKRANI */}
      {transitionStep && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-2xl">
          <h1
            key={transitionStep}
            className="font-black text-center uppercase tracking-widest text-white"
            style={{
              // Geri sayım sayıları daha büyük, yazılar biraz daha sığacak boyutta
              fontSize: transitionStep.length > 2 ? 'clamp(4rem, 10vw, 12rem)' : 'clamp(10rem, 25vw, 25rem)',
              textShadow: `0 0 50px ${accent}90, 0 0 120px ${accent}50`,
              animation: `countdownPop ${transitionStep.length > 2 ? '1.5s' : '1s'} cubic-bezier(0.16, 1, 0.3, 1) forwards`,
            }}
          >
            {transitionStep}
          </h1>
        </div>
      )}

      {/* ÜST BAR */}
      <header className="relative z-20 flex justify-between items-start">
        {/* PREMIUM LOGO */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-44 h-44 md:w-64 md:h-64 rounded-full blur-3xl opacity-30 animate-pulse"
            style={{ background: accent }}
          />

          <div
            className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full border-2 opacity-50 animate-[orbit_12s_linear_infinite]"
            style={{
              borderColor: accent,
              borderTopColor: "transparent",
              boxShadow: `0 0 35px ${accent}60`,
            }}
          />

          <div className="relative w-28 h-28 md:w-44 md:h-44 rounded-full bg-[#080808] border-2 border-white/20 p-3 md:p-4 shadow-[0_0_50px_rgba(255,255,255,0.12)]">
            <div className="absolute inset-2 rounded-full border border-white/10" />
            <img
              src="/5555.png"
              alt="TNKU Logo"
              className="relative w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.35)] animate-[spin_35s_linear_infinite]"
            />
          </div>
        </div>

        {/* CANLI YAYIN */}
        <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/70 backdrop-blur-xl px-5 py-3 shadow-2xl">
          <span
            className={`w-3 h-3 rounded-full transition-opacity ${
              live ? "opacity-100" : "opacity-30"
            }`}
            style={{
              background: "#ff3038",
              boxShadow: "0 0 18px #ff3038",
            }}
          />
          <Radio size={17} className="text-red-500" />
          <span className="font-black tracking-[0.2em] text-xs md:text-sm">
            CANLI PARTİ AKIŞI
          </span>
        </div>
      </header>

      {/* ANA SAHNE */}
      <section className="relative z-10 flex-1 flex items-center justify-center text-center px-3">
        {message ? (
          <div
            key={message.id}
            className={`w-full flex flex-col items-center transition-all duration-700 ${
              visible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-10 scale-90 blur-sm"
            }`}
          >
            {/* KATEGORİ ETİKETİ */}
            <div
              className="relative flex items-center gap-3 rounded-full border px-8 py-3 mb-10 md:mb-14 backdrop-blur-xl animate-[badgeIn_1s_ease-out]"
              style={{
                borderColor: `${accent}90`,
                color: accent,
                background: `${accent}15`,
                boxShadow: `0 0 35px ${accent}30, inset 0 0 20px ${accent}10`,
              }}
            >
              <Icon size={24} />
              <span className="text-xl md:text-3xl font-black tracking-[0.35em]">
                {title}
              </span>
            </div>

            {/* MESAJ */}
            <h1
              className="font-black uppercase leading-[1.03] tracking-[-0.065em] break-words max-w-[94vw] text-[clamp(4rem,10vw,11rem)]"
              style={{
                textShadow: `
                  0 0 20px ${accent}35,
                  0 0 65px ${accent}45,
                  0 0 120px ${accent}25
                `,
                animation: "messageReveal 1.1s cubic-bezier(.16,1,.3,1) both",
              }}
            >
              {message.content}
            </h1>

            {/* ALT ENERJİ ÇİZGİSİ */}
            <div
              className="relative mt-12 h-1 w-48 md:w-80 overflow-hidden rounded-full"
              style={{
                background: `${accent}30`,
                boxShadow: `0 0 25px ${accent}50`,
              }}
            >
              <div
                className="absolute inset-y-0 w-1/2 animate-[energy_2s_ease-in-out_infinite]"
                style={{
                  background: accent,
                  boxShadow: `0 0 25px ${accent}`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div
                className="absolute inset-[-40px] rounded-full blur-3xl opacity-30 animate-pulse"
                style={{ background: accent }}
              />
              <Sparkles size={75} className="relative animate-[spin_15s_linear_infinite]" />
            </div>

            <h2 className="text-3xl md:text-6xl font-black tracking-[0.25em]">
              BOMBA BEKLENİYOR
            </h2>
          </div>
        )}
      </section>

      {/* ALT BAR */}
      <footer className="relative z-20 flex justify-between items-end gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl px-5 py-4 md:px-8 md:py-5 shadow-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-gray-400 font-bold tracking-widest text-[10px] md:text-sm">
              MASADAN GÖNDER
            </span>
            <Zap size={18} style={{ color: accent }} />
            <span className="font-black text-sm md:text-2xl tracking-wider">
              OVERHEARDPARTI/PARTI
            </span>
          </div>
        </div>

        {/* SPONSOR */}
        <div className="relative p-[1px] rounded-2xl overflow-hidden">
          <div
            className="absolute inset-[-100%] animate-[spin_5s_linear_infinite]"
            style={{
              background: `conic-gradient(transparent, ${accent}, transparent 35%)`,
            }}
          />
          <div className="relative bg-[#080808] rounded-2xl p-4 md:p-5">
            <img
              src="/d6.png"
              alt="D6 Sosyal"
              className="h-12 md:h-16 w-auto object-contain"
            />
          </div>
        </div>
      </footer>

      {/* ANİMASYON MOTORU */}
      <style jsx global>{`
        @keyframes ambient {
          0%, 100% { transform: scale(1); opacity: .65; }
          50% { transform: scale(1.2); opacity: 1; }
        }

        @keyframes laser {
          0%, 100% { transform: translateX(-10%) rotate(-25deg); }
          50% { transform: translateX(25%) rotate(-15deg); }
        }

        @keyframes orbit {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes messageReveal {
          0% {
            opacity: 0;
            transform: scale(.65) translateY(50px);
            filter: blur(25px);
          }
          65% {
            opacity: 1;
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes badgeIn {
          from {
            opacity: 0;
            transform: translateY(-25px) scale(.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes energy {
          0% { left: -50%; }
          100% { left: 110%; }
        }

        /* YENİ EKLENEN: GERİ SAYIM PATLAMA EFEKTİ */
        @keyframes countdownPop {
          0% {
            opacity: 0;
            transform: scale(0.3);
            filter: blur(40px);
          }
          20% {
            opacity: 1;
            transform: scale(1.1);
            filter: blur(0px);
          }
          80% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
          100% {
            opacity: 0;
            transform: scale(1.4);
            filter: blur(20px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

    </main>
  );
}