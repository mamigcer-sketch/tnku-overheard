
"use client";

import { useEffect, useState } from "react";
import {
  Flame,
  EyeOff,
  Ear,
  Sparkles,
  Radio,
  Zap,
} from "lucide-react";

export default function DjScreen() {
  const [message, setMessage] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const fetchMsg = async () => {
      try {
        const res = await fetch(
          "/api/parti?t=" + Date.now(),
          { cache: "no-store" }
        );

        const data = await res.json();

        if (data?.message) {
          setMessage((prev: any) => {
            if (prev?.id !== data.message.id) {
              setIsAnimating(false);

              clearTimeout(timeout);

              timeout = setTimeout(() => {
                setIsAnimating(true);
              }, 100);

              return data.message;
            }

            return prev;
          });
        }
      } catch (e) {
        console.error("Mesaj çekilemedi", e);
      }
    };

    fetchMsg();

    const interval = setInterval(fetchMsg, 3000);

    const liveInterval = setInterval(() => {
      setIsLive((prev) => !prev);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(liveInterval);
      clearTimeout(timeout);
    };
  }, []);

  let accent = "#ef4444";
  let theme = "red";
  let title = "İTİRAF";
  let IconComponent = Flame;

  if (message?.location === "PARTY_REZIL") {
    accent = "#e879f9";
    theme = "pink";
    title = "REZİL@";
    IconComponent = EyeOff;
  }

  if (message?.location === "PARTY_OVERHEARD") {
    accent = "#22d3ee";
    theme = "cyan";
    title = "DUYDUM";
    IconComponent = Ear;
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#030303] text-white flex flex-col justify-between p-6 md:p-10 font-sans"
      style={{ "--accent": accent } as React.CSSProperties}
    >

      {/* ANİMASYONLU ARKA PLAN */}

      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `
            radial-gradient(
              ellipse at 50% 45%,
              ${accent}30 0%,
              transparent 55%
            ),
            radial-gradient(
              ellipse at 10% 10%,
              ${accent}15 0%,
              transparent 50%
            ),
            #030303
          `,
        }}
      />

      <div className="absolute inset-0 opacity-20 animate-[pulse_5s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(circle at center, ${accent}30, transparent 70%)`,
        }}
      />

      {/* IŞIK HÜZMESİ */}

      <div
        className="absolute w-[70vw] h-[120vh] top-[-10%] left-[15%] opacity-[0.07] blur-[100px] rotate-12 animate-[pulse_7s_ease-in-out_infinite]"
        style={{ background: accent }}
      />

      {/* GRAIN */}

      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

      {/* ÜST BAR */}

      <header className="relative z-10 flex justify-between items-start">

        <div className="relative group">
          <div
            className="absolute inset-[-8px] rounded-full blur-xl opacity-30 animate-pulse"
            style={{ background: accent }}
          />

          <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full bg-black/60 border border-white/10 p-3 backdrop-blur-xl shadow-2xl">
            <img
              src="/5555.png"
              alt="TNKU Logo"
              className="w-full h-full object-contain animate-[spin_30s_linear_infinite]"
            />
          </div>
        </div>

        <div
          className="flex items-center gap-3 rounded-full px-5 py-3 backdrop-blur-xl border transition-colors duration-700"
          style={{
            borderColor: `${accent}55`,
            background: "#080808cc",
          }}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full transition-opacity ${
              isLive ? "opacity-100" : "opacity-30"
            }`}
            style={{
              background: accent,
              boxShadow: `0 0 15px ${accent}`,
            }}
          />

          <Radio size={16} style={{ color: accent }} />

          <span className="text-xs md:text-sm font-black tracking-[0.2em] uppercase">
            CANLI PARTİ AKIŞI
          </span>
        </div>
      </header>

      {/* MERKEZ */}

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-3">

        {message ? (
          <div
            key={message.id}
            className={`w-full flex flex-col items-center transition-all duration-700 ${
              isAnimating
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-90"
            }`}
          >

            {/* KATEGORİ */}

            <div
              className="inline-flex items-center gap-3 px-7 py-3 rounded-full border backdrop-blur-xl mb-8 md:mb-12 animate-[fadeIn_1s_ease-out]"
              style={{
                color: accent,
                borderColor: `${accent}80`,
                background: `${accent}15`,
                boxShadow: `0 0 35px ${accent}25`,
              }}
            >
              <IconComponent size={22} />

              <span className="font-black text-lg md:text-2xl tracking-[0.35em]">
                {title}
              </span>
            </div>

            {/* ANA MESAJ */}

            <h1
              className="font-black uppercase leading-[1.02] tracking-[-0.065em] break-words max-w-[95vw] text-[clamp(3rem,9vw,9rem)]"
              style={{
                textShadow: `
                  0 0 20px ${accent}35,
                  0 0 70px ${accent}25
                `,
                animation: "messageEnter 1s cubic-bezier(.16,1,.3,1) both",
              }}
            >
              {message.content}
            </h1>

            {/* ALT IŞIK ÇİZGİSİ */}

            <div
              className="mt-10 h-[3px] w-32 md:w-56 rounded-full animate-[pulse_2s_ease-in-out_infinite]"
              style={{
                background: accent,
                boxShadow: `0 0 25px ${accent}`,
              }}
            />

          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 opacity-60">
            <div className="relative">
              <div
                className="absolute inset-[-30px] rounded-full blur-2xl animate-pulse"
                style={{ background: accent }}
              />
              <Sparkles size={65} className="relative animate-[spin_12s_linear_infinite]" />
            </div>

            <h2 className="text-3xl md:text-5xl font-black tracking-[0.3em]">
              BOMBA BEKLENİYOR
            </h2>
          </div>
        )}

      </section>

      {/* ALT BAR */}

      <footer className="relative z-10 flex justify-between items-end gap-4">

        <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl px-5 py-4 md:px-8 md:py-5 shadow-2xl">

          <div className="flex flex-wrap items-center gap-2 md:gap-4">

            <span className="text-gray-400 font-bold text-[10px] md:text-sm tracking-widest uppercase">
              MASADAN GÖNDER
            </span>

            <Zap size={16} style={{ color: accent }} />

            <span className="text-white font-black text-sm md:text-2xl tracking-wider">
              OVERHEARDPARTI/PARTI
            </span>

          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl p-3 md:p-5 shadow-2xl transition-transform duration-500 hover:scale-110">
          <img
            src="/D6.png"
            alt="Sponsor Logo"
            className="h-10 md:h-16 w-auto object-contain"
          />
        </div>

      </footer>

      {/* ÖZEL ANİMASYONLAR */}

      <style jsx global>{`
        @keyframes messageEnter {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.88);
            filter: blur(15px);
          }
          60% {
            opacity: 1;
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

    </main>
  );
}