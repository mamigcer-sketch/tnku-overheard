"use client";

import { useEffect, useRef, useState } from "react";

import {
  Skull,
  Ghost,
  Zap,
  Radio,
  MessageCircle,
} from "lucide-react";

export default function DjScreen() {
  const [message, setMessage] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);
  const [live, setLive] = useState(true);

  const [transitionStep, setTransitionStep] = useState<string | null>(null);

  const isTransitioning = useRef(false);
  const lastMsgId = useRef<string | null>(null);
  
  const isInitialLoad = useRef(true); 

  useEffect(() => {
    let mounted = true;

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const runTransition = async (newMsg: any) => {
      if (!mounted) return;

      isTransitioning.current = true;

      setVisible(false);

      await delay(350);

      if (!mounted) return;

      setMessage(newMsg);

      let transitionTitle = "YENİ İTİRAF";

      if (
        newMsg.location === "PARTY_LİNÇ" ||
        newMsg.location === "PARTY_LINC" ||
        newMsg.location === "PARTY_REZIL"
      ) {
        transitionTitle = "YENİ LİNÇ@";
      }

      if (newMsg.location === "PARTY_OVERHEARD") {
        transitionTitle = "YENİ DUYDUM";
      }

      setTransitionStep(transitionTitle);

      await delay(1800);

      if (!mounted) return;

      setTransitionStep("3");

      await delay(700);

      if (!mounted) return;

      setTransitionStep("2");

      await delay(700);

      if (!mounted) return;

      setTransitionStep("1");

      await delay(720);

      if (!mounted) return;

      setTransitionStep(null);

      setFlash(true);

      await delay(180);

      if (!mounted) return;

      setVisible(true);

      await delay(220);

      if (!mounted) return;

      setFlash(false);

      await delay(300);

      isTransitioning.current = false;
    };

    const fetchMsg = async () => {
      try {
        if (isTransitioning.current) return;

        const res = await fetch("/api/parti?t=" + Date.now(), {
          cache: "no-store",
        });

        const data = await res.json();

        if (!mounted) return;

        if (!data || !data.message) {
          if (lastMsgId.current !== null) {
            setVisible(false);
            setTimeout(() => {
              if (mounted) {
                setMessage(null);
                lastMsgId.current = null;
              }
            }, 500);
          }
          isInitialLoad.current = false;
          return;
        }

        if (lastMsgId.current !== data.message.id) {
          lastMsgId.current = data.message.id;

          if (isInitialLoad.current) {
            setMessage(data.message);
            setVisible(true);
          } else {
            runTransition(data.message);
          }
        }

        isInitialLoad.current = false;
      } catch (error) {
        console.error("Mesaj çekilemedi", error);
      }
    };

    fetchMsg();

    const interval = setInterval(fetchMsg, 3000);

    const liveInterval = setInterval(() => {
      setLive((value) => !value);
    }, 900);

    return () => {
      mounted = false;

      clearInterval(interval);
      clearInterval(liveInterval);
    };
  }, []);

  /*
   * =========================================================
   * KATEGORİ RENKLERİ (HALLOWEEN TEMASI)
   * =========================================================
   */

  let accent = "#ff5500"; // Ateşli Balkabağı Turuncusu
  let title = "İTİRAF";
  let Icon = Skull; 

  if (
    message?.location?.includes("LINC") ||
    message?.location?.includes("LİNÇ") ||
    message?.location?.includes("REZIL")
  ) {
    accent = "#9d00ff"; 
    title = "LİNÇ@";
    Icon = Ghost; 
  }

  if (message?.location?.includes("OVERHEARD")) {
    accent = "#00ff33"; 
    title = "DUYDUM";
    Icon = Zap; 
  }

  const getContentFontSize = (text: string) => {
    const len = text ? text.length : 0;
    if (len > 180) return "text-[1.5rem] md:text-[2.2rem] lg:text-[2.8rem] tracking-tight leading-[1.1] max-w-[94vw]";
    if (len > 120) return "text-[2rem] md:text-[2.8rem] lg:text-[3.5rem] tracking-tight leading-[1.05] max-w-[94vw]";
    if (len > 80) return "text-[2.8rem] md:text-[3.8rem] lg:text-[4.8rem] leading-[1.05] max-w-[94vw]";
    if (len > 40) return "text-[3.5rem] md:text-[4.8rem] lg:text-[6.5rem] leading-[1.02] max-w-[94vw]";
    return "text-[clamp(4.5rem,9.5vw,10.5rem)] leading-[0.98] max-w-[94vw]";
  };

  // Arkada uçuşan korkunç közler/kıvılcımlar (Ateş efekti)
  const particles = [
    { left: "10%", top: "80%", delay: "0s", duration: "4s", size: "w-[4px] h-[4px]" },
    { left: "25%", top: "90%", delay: "1.5s", duration: "5s", size: "w-[6px] h-[6px]" },
    { left: "45%", top: "70%", delay: "0.5s", duration: "3s", size: "w-[3px] h-[3px]" },
    { left: "60%", top: "85%", delay: "2s", duration: "4.5s", size: "w-[5px] h-[5px]" },
    { left: "80%", top: "75%", delay: "1s", duration: "3.5s", size: "w-[4px] h-[4px]" },
    { left: "90%", top: "88%", delay: "0.8s", duration: "5s", size: "w-[7px] h-[7px]" },
    { left: "35%", top: "60%", delay: "2.5s", duration: "4s", size: "w-[3px] h-[3px]" },
  ];

  return (
    <main
      className="dj-screen relative min-h-screen max-h-screen overflow-hidden bg-black text-white flex flex-col justify-between p-4 md:p-10 select-none"
      style={{ "--accent": accent } as any}
    >
      {/* 🚀 ARKA PLAN RESMİ VE KARARTMA */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/halloween-bg.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-black/40 mix-blend-multiply" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />

      {/* Köz/Kıvılcım Efektleri */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((particle, index) => (
          <span
            key={index}
            className={`absolute ${particle.size} rounded-full bg-[#ff4500] opacity-80 animate-[emberFloat_var(--duration)_ease-in-out_infinite]`}
            style={
              {
                left: particle.left,
                top: particle.top,
                boxShadow: `0 0 15px #ff4500, 0 0 30px #ff0000`,
                "--delay": particle.delay,
                "--duration": particle.duration,
                animationDelay: particle.delay,
              } as any
            }
          />
        ))}
      </div>

      <div
        className="absolute inset-0 pointer-events-none z-[7] opacity-[0.06] mix-blend-screen animate-[grain_.25s_steps(2)_infinite]"
        style={{
          backgroundImage:
            `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.8' /%3E%3C/svg%3E")`,
        }}
      />

      {transitionStep && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/80 backdrop-blur-md">
          {transitionStep === "PARTY" ? (
            <div className="relative flex flex-col items-center justify-center">
              <div className="relative w-[50vw] max-w-[700px] flex flex-col items-center animate-[partyIntroLogo_1.5s_cubic-bezier(.16,1,.3,1)_forwards]">
                <div className="relative mt-8 w-48 md:w-68 lg:w-80 h-14 md:h-20 flex items-center justify-center">
                  <img
                    src="/scap.png"
                    alt="SCAP"
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                    className="w-full h-full object-contain animate-pulse flex-shrink-0"
                    style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 25px ${accent})` }}
                  />
                  <span className="hidden font-serif italic text-4xl md:text-6xl font-extrabold tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,106,0,0.8)] animate-pulse">SCAP</span>
                </div>
              </div>
            </div>
          ) : transitionStep === "3" ||
            transitionStep === "2" ||
            transitionStep === "1" ? (
            <div className="relative flex items-center justify-center">
              <h1
                key={`num-${transitionStep}`}
                className="relative z-10 font-black text-[#ffaa00] leading-none animate-[countdownThump_700ms_cubic-bezier(.16,1,.3,1)_forwards]"
                style={{
                  fontSize: "clamp(12rem, 30vw, 30rem)",
                  textShadow: `0 0 30px #ff3300, 0 0 80px #ff0000, 2px 5px 0px #4a0000`,
                }}
              >
                {transitionStep}
              </h1>
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              <h2
                key={`text-${transitionStep}`}
                className="relative font-black uppercase text-center text-[#ffaa00] animate-[cinematicText_1.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                style={{
                  fontSize: "clamp(4rem, 9vw, 9rem)",
                  textShadow: `0 0 30px #ff3300, 0 0 80px #ff0000`,
                }}
              >
                {transitionStep}
              </h2>
            </div>
          )}
        </div>
      )}

      {message && (
        <header className="relative z-20 flex justify-between items-start animate-[messageReveal_1s_cubic-bezier(.16,1,.3,1)]">
          <div className="w-1/4"></div>

          <div className="absolute left-1/2 -translate-x-1/2 top-0 md:top-1 flex flex-col items-center justify-center z-30">
            <div className="relative w-40 md:w-60 lg:w-72 h-12 md:h-16 flex items-center justify-center">
              <img
                src="/scap.png"
                alt="SCAP"
                onError={(e: any) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
                className="w-full h-full object-contain flex-shrink-0 opacity-90"
                style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 10px rgba(255,100,0,0.6))` }}
              />
              <span className="hidden font-serif italic text-3xl md:text-5xl font-extrabold tracking-widest text-white/90 drop-shadow-[0_0_15px_rgba(255,106,0,0.8)]">SCAP</span>
            </div>
          </div>

          <div className="relative group w-1/4 flex justify-end">
            <div className="relative flex items-center gap-3 rounded-full border border-[#ff6a00]/40 bg-black/80 backdrop-blur-xl px-4 md:px-5 py-2.5 md:py-3 shadow-[0_10px_30px_rgba(255,106,0,.4)]">
              <span
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  live ? "opacity-100 scale-100" : "opacity-30 scale-75"
                }`}
                style={{
                  background: "#ff6a00",
                  boxShadow: "0 0 15px #ff6a00",
                }}
              />
              <Radio size={15} className="text-[#ff6a00]" />
              <span className="font-black tracking-[0.22em] text-[9px] md:text-xs text-[#ff6a00]">
                HALLOWEEN YAYINI
              </span>
            </div>
          </div>
        </header>
      )}

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 overflow-hidden max-h-[58vh]">
        {message ? (
          <div
            key={message.id}
            className={`w-full flex flex-col items-center justify-center transition-all duration-700 max-h-full ${
              visible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-[.94] blur-md"
            }`}
          >
            {/* ETİKET KUTUSU */}
            <div
              className="relative flex items-center gap-3 rounded-full border px-6 md:px-8 py-2 md:py-3.5 mb-5 md:mb-8 bg-black/60 backdrop-blur-md overflow-hidden flex-shrink-0 animate-[badgePremium_1s_cubic-bezier(.16,1,.3,1)]"
              style={{
                borderColor: `${accent}80`,
                color: accent,
                boxShadow: `0 0 30px ${accent}40, inset 0 0 20px ${accent}20`,
              }}
            >
              <Icon size={20} className="relative md:scale-125" style={{ filter: `drop-shadow(0 0 8px ${accent})` }} />
              <span className="relative text-base md:text-2xl font-black tracking-[0.32em] pl-[0.32em]" style={{ textShadow: `0 0 15px ${accent}` }}>
                {title}
              </span>
            </div>

            {/* 🔥 ATEŞLİ KANLI ANA YAZI 🔥 */}
            <h1
              className={`relative font-black uppercase tracking-[-0.02em] break-words max-w-[94vw] max-h-[42vh] overflow-hidden flex items-center justify-center px-1 select-none text-white ${getContentFontSize(message.content)} animate-[messageReveal_1.15s_cubic-bezier(.16,1,.3,1)_both]`}
              style={{
                // Resimdeki gibi kırmızı/turuncu şiddetli ateş efekti gölgesi
                textShadow: `0px 2px 2px #4a0000, 0 0 20px #ff3300, 0 0 40px #ff0000, 0 0 80px #ff0000, 0 0 120px #ff0000`,
                display: "-webkit-box",
                WebkitLineClamp: 5,
                WebkitBoxOrient: "vertical",
                color: "#fffaee", // Hafif kirli sarımsı beyaz (ateşin içi)
              }}
            >
              {message.content}
            </h1>
            
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full p-6 z-50 animate-[idleEntrance_2s_cubic-bezier(.16,1,.3,1)_both]">
            
            {/* BOŞ EKRANDA DAHA BÜYÜK LOGO */}
            <div className="relative w-[85vw] md:w-[65vw] max-w-[900px] flex flex-col items-center animate-[cinematicLevitate_12s_ease-in-out_infinite] flex-shrink-0">
              <div className="relative w-64 md:w-96 h-20 md:h-32 flex items-center justify-center">
                <img
                  src="/scap.png"
                  alt="SCAP"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                  className="w-full h-full object-contain animate-pulse flex-shrink-0"
                  style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 40px ${accent})` }}
                />
                <span className="hidden font-serif italic text-6xl md:text-8xl font-extrabold tracking-widest text-white drop-shadow-[0_0_30px_rgba(255,106,0,0.9)] animate-pulse">SCAP</span>
              </div>
            </div>
            
          </div>
        )}
      </section>

      {message && (
        <footer className="relative z-20 flex justify-between items-end gap-4 animate-[messageReveal_1s_cubic-bezier(.16,1,.3,1)]">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
            <a
              href="https://overheardparty.xyz/parti"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group block"
              aria-label="Partiye mesaj gönder"
            >
              <div
                className="relative flex items-center gap-3 md:gap-5 rounded-2xl border border-[#ff6a00]/40 bg-black/80 backdrop-blur-xl px-3 md:px-6 py-2.5 md:py-4 transition-all duration-500 hover:border-[#ff6a00] hover:bg-black"
                style={{
                  boxShadow: "0 10px 40px rgba(255,106,0,.2)",
                }}
              >
                <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl border border-[#ff6a00]/30 bg-[#ff6a00]/10">
                  <MessageCircle
                    size={18}
                    style={{
                      color: accent,
                      filter: `drop-shadow(0 0 10px ${accent})`,
                    }}
                  />
                </div>

                <div className="flex flex-col gap-0.5 md:gap-1 min-w-0 text-left">
                  <span className="text-[6px] md:text-[8px] font-bold tracking-[0.35em] text-[#ff6a00]/80">
                    MASADAN GÖNDER
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs md:text-lg tracking-[0.08em] text-white">
                      overheardparty.xyz/parti
                    </span>
                    <span
                      className="text-xs md:text-base opacity-80 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                      style={{ color: accent }}
                    >
                      ↗
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </div>

          <div className="relative group">
            <div className="relative flex items-center gap-3">
              <span className="hidden md:block text-[7px] font-bold tracking-[0.35em] text-white/50">
                PARTNER
              </span>

              <div className="relative flex items-center justify-center min-w-[70px] md:min-w-[105px] h-[32px] md:h-[46px] rounded-xl border border-white/20 bg-black/60 backdrop-blur-xl px-2.5 overflow-hidden">
                <img
                  src="/D6.png"
                  alt="D6 Sosyal"
                  className="relative z-10 h-5 md:h-8 w-auto max-w-[85px] object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500 filter sepia hue-rotate-[-20deg] saturate-200"
                />
              </div>
            </div>
          </div>
        </footer>
      )}

      <style dangerouslySetInnerHTML={{ __html: stylesCSS }} />
    </main>
  );
}

const stylesCSS = `
  @keyframes emberFloat {
    0% {
      transform: translateY(0) translateX(0) scale(1);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    50% {
      transform: translateY(-50vh) translateX(20px) scale(1.2);
    }
    100% {
      transform: translateY(-100vh) translateX(-20px) scale(0.5);
      opacity: 0;
    }
  }

  @keyframes countdownThump {
    0% {
      opacity: 0;
      transform: scale(2.5);
      filter: blur(20px);
    }
    25% {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
    }
    75% {
      opacity: 1;
      transform: scale(.95);
      filter: blur(0);
    }
    100% {
      opacity: 0;
      transform: scale(.5);
      filter: blur(15px);
    }
  }

  @keyframes cinematicText {
    0% {
      opacity: 0;
      transform: scale(.7);
      filter: blur(20px);
      letter-spacing: .0em;
    }
    20% {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
      letter-spacing: .15em;
    }
    80% {
      opacity: 1;
      transform: scale(1.05);
      filter: blur(0);
      letter-spacing: .15em;
    }
    100% {
      opacity: 0;
      transform: scale(1.2);
      filter: blur(15px);
      letter-spacing: .25em;
    }
  }

  @keyframes transitionGlow {
    0%, 100% {
      transform: scale(.75);
      opacity: .2;
    }
    50% {
      transform: scale(1.3);
      opacity: .5;
    }
  }

  @keyframes idleEntrance {
    0% {
      opacity: 0;
      transform: scale(0.9);
      filter: blur(20px);
    }
    100% {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
    }
  }

  @keyframes cinematicBreathe {
    0%, 100% {
      opacity: 0.15;
      transform: translate(-50%, -50%) scale(0.9);
    }
    50% {
      opacity: 0.35;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  @keyframes cinematicLevitate {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
  }

  @keyframes logoFloat {
    0%, 100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-3px) scale(1.02);
    }
  }

  @keyframes grain {
    0% { transform: translate(0,0); }
    25% { transform: translate(2%,-1%); }
    50% { transform: translate(-1%,2%); }
    75% { transform: translate(-2%,-1%); }
    100% { transform: translate(0,0); }
  }

  @keyframes messageReveal {
    0% {
      opacity: 0;
      transform: scale(.6) translateY(60px);
      filter: blur(30px);
    }
    45% {
      opacity: 1;
      transform: scale(1.05) translateY(-10px);
      filter: blur(0);
    }
    65% {
      transform: scale(.98);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
      filter: blur(0);
    }
  }

  @keyframes badgePremium {
    0% {
      opacity: 0;
      transform: translateY(-30px) scale(.8);
      filter: blur(10px);
    }
    70% {
      opacity: 1;
      transform: translateY(5px) scale(1.05);
      filter: blur(0);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
  }
`;