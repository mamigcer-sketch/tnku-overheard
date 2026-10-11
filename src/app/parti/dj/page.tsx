"use client";

import { useEffect, useRef, useState } from "react";

import {
  Flame,
  EyeOff,
  Ear,
  Radio,
  Zap,
} from "lucide-react";

export default function DjScreen() {
  const [message, setMessage] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);
  const [live, setLive] = useState(true);

  const [transitionStep, setTransitionStep] = useState<string | null>(null);

  const isTransitioning = useRef(false);
  const lastMsgId = useRef<string | null>(null);

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
          return;
        }

        if (lastMsgId.current !== data.message.id) {
          if (lastMsgId.current === null) {
            lastMsgId.current = data.message.id;
            setMessage(data.message);
            setVisible(true);
          } else {
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
   * KATEGORİ RENKLERİ VE İKONLARI (REDFLAG KONSEPTİ)
   * =========================================================
   */

  // 🚩 REDFLAG TEMA: Çok daha yırtıcı ve koyu bir kırmızı tonu
  let accent = "#ff0015";
  let title = "REDFLAG";
  let Icon = Flame;

  if (
    message?.location?.includes("LINC") ||
    message?.location?.includes("LİNÇ") ||
    message?.location?.includes("REZIL")
  ) {
    accent = "#ed48ff";
    title = "LİNÇ@";
    Icon = EyeOff;
  }

  if (message?.location?.includes("OVERHEARD")) {
    accent = "#00e5ff";
    title = "DUYDUM";
    Icon = Ear;
  }

  // 🚀 AKILLI YAZI BOYUTU (TAŞMAYI SIFIRLAMAK İÇİN KARAKTER KONTROLÜ)
  const getContentFontSize = (text: string) => {
    const len = text ? text.length : 0;
    if (len > 180) return "text-[1.2rem] md:text-[1.7rem] lg:text-[2.2rem] tracking-tight leading-[1.1] max-w-[94vw]";
    if (len > 120) return "text-[1.5rem] md:text-[2.2rem] lg:text-[2.9rem] tracking-tight leading-[1.05] max-w-[94vw]";
    if (len > 80) return "text-[2rem] md:text-[2.8rem] lg:text-[3.6rem] leading-[1.05] max-w-[94vw]";
    if (len > 40) return "text-[2.8rem] md:text-[3.9rem] lg:text-[5.2rem] leading-[1.02] max-w-[94vw]";
    return "text-[clamp(3.5rem,7.5vw,8.5rem)] leading-[0.98] max-w-[94vw]";
  };

  const particles = [
    { left: "7%", top: "18%", delay: "0s", duration: "7s" },
    { left: "15%", top: "67%", delay: "1.5s", duration: "9s" },
    { left: "24%", top: "31%", delay: "3s", duration: "8s" },
    { left: "33%", top: "79%", delay: "2s", duration: "10s" },
    { left: "42%", top: "13%", delay: "4s", duration: "7s" },
    { left: "52%", top: "72%", delay: "1s", duration: "11s" },
    { left: "61%", top: "24%", delay: "2.5s", duration: "8s" },
    { left: "70%", top: "83%", delay: "4.5s", duration: "10s" },
    { left: "79%", top: "38%", delay: "1.2s", duration: "9s" },
    { left: "88%", top: "70%", delay: "3.8s", duration: "8s" },
    { left: "94%", top: "20%", delay: "2.2s", duration: "11s" },
  ];

  return (
    <main
      className="dj-screen relative min-h-screen max-h-screen overflow-hidden bg-[#050000] text-white flex flex-col justify-between p-4 md:p-10 select-none"
      style={{ "--accent": accent } as any}
    >
      <div className="absolute inset-0 bg-[#050000]" />

      {/* REDFLAG AMBİYANS IŞIĞI */}
      <div
        className="absolute inset-[-20%] animate-[premiumAmbient_12s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(ellipse at 50% 45%, ${accent}55 0%, ${accent}15 35%, transparent 65%)`,
        }}
      />

      <div
        className="absolute top-[-45%] left-[-18%] w-[65vw] h-[190vh] blur-[115px] opacity-[0.15] animate-[stageLightLeft_14s_ease-in-out_infinite]"
        style={{
          background: accent,
          transform: "rotate(-25deg)",
        }}
      />

      <div
        className="absolute top-[-45%] right-[-18%] w-[60vw] h-[190vh] blur-[125px] opacity-[0.15] animate-[stageLightRight_17s_ease-in-out_infinite]"
        style={{
          background: accent,
          transform: "rotate(25deg)",
        }}
      />

      <div
        className="absolute left-1/2 top-1/2 w-[34vw] h-[130vh] -translate-x-1/2 -translate-y-1/2 blur-[90px] opacity-[0.08] animate-[centerBeam_9s_ease-in-out_infinite]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      <div
        className="absolute left-[-30%] top-[-60%] w-[45vw] h-[220vh] rotate-[25deg] blur-[80px] opacity-[0.04] animate-[lightSweep_11s_ease-in-out_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent, white, transparent)",
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="absolute w-[3px] h-[3px] rounded-full opacity-30 animate-[particleFloat_var(--duration)_ease-in-out_infinite]"
            style={
              {
                left: particle.left,
                top: particle.top,
                background: accent,
                boxShadow: `0 0 15px ${accent}`,
                "--delay": particle.delay,
                "--duration": particle.duration,
                animationDelay: particle.delay,
              } as any
            }
          />
        ))}
      </div>

      <div
        className="absolute left-1/2 top-1/2 w-[72vw] aspect-square rounded-full border opacity-[0.04] -translate-x-1/2 -translate-y-1/2 animate-[slowPulse_10s_ease-in-out_infinite]"
        style={{ borderColor: accent }}
      />

      <div
        className="absolute left-1/2 top-1/2 w-[52vw] aspect-square rounded-full border opacity-[0.06] -translate-x-1/2 -translate-y-1/2 animate-[slowPulse_7s_ease-in-out_infinite_reverse]"
        style={{ borderColor: accent }}
      />

      <div
        className="absolute left-1/2 top-1/2 w-[30vw] aspect-square rounded-full border opacity-[0.04] -translate-x-1/2 -translate-y-1/2 animate-[slowPulse_5s_ease-in-out_infinite]"
        style={{ borderColor: accent }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(5,0,0,.45) 68%, rgba(5,0,0,.85) 100%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-[6] opacity-[0.035]"
        style={{
          background:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(255,0,0,.8) 4px, transparent 5px)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-[7] opacity-[0.035] mix-blend-screen animate-[grain_.25s_steps(2)_infinite]"
        style={{
          backgroundImage:
            `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.8' /%3E%3C/svg%3E")`,
        }}
      />

      <div
        className={`absolute inset-0 z-[100] pointer-events-none transition-opacity duration-200 ${
          flash ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(circle at center, white 0%, ${accent}ff 15%, ${accent}66 35%, transparent 75%)`,
        }}
      />

      {transitionStep && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/85 backdrop-blur-3xl">
          <div
            className="absolute w-[40vw] aspect-square rounded-full blur-[120px] opacity-40 animate-[transitionGlow_2s_ease-in-out_infinite]"
            style={{ background: accent }}
          />

          {transitionStep === "PARTY" ? (
            <div className="relative flex flex-col items-center justify-center">
              <div
                className="absolute w-[42vw] max-w-[760px] aspect-[2.7/1] rounded-full blur-[90px] animate-[partyIntroGlow_1.5s_ease-out_forwards]"
                style={{
                  background: accent,
                  opacity: 0.25,
                }}
              />

              <div className="relative w-[50vw] max-w-[700px] flex flex-col items-center animate-[partyIntroLogo_1.5s_cubic-bezier(.16,1,.3,1)_forwards]">
                {/* SADECE SCAP LOGOSU */}
                <div className="relative w-56 md:w-80 h-16 md:h-24 flex items-center justify-center">
                  <img
                    src="/scap.png"
                    alt="SCAP"
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                    className="w-full h-full object-contain animate-pulse flex-shrink-0"
                    style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 25px ${accent}80)` }}
                  />
                  <span className="hidden font-serif italic text-4xl md:text-6xl font-extrabold tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] animate-pulse">SCAP</span>
                </div>
              </div>

              <div className="mt-8 text-[12px] md:text-base font-black tracking-[0.65em] pl-[0.65em] text-red-500/70 animate-pulse">
                REDFLAG PARTY
              </div>
            </div>
          ) : transitionStep === "3" ||
            transitionStep === "2" ||
            transitionStep === "1" ? (
            <div className="relative flex items-center justify-center">
              <div className="absolute w-[24vw] max-w-[340px] aspect-square rounded-full border border-red-500/20" />

              <div className="absolute w-[20vw] max-w-[290px] aspect-square rounded-full border border-red-500/10 animate-[countdownOrbit_2.1s_linear_infinite]" />

              <div
                key={`ring-${transitionStep}`}
                className="absolute w-[16vw] max-w-[240px] aspect-square rounded-full border-2 animate-[cinematicRing_700ms_ease-out_forwards]"
                style={{
                  borderColor: accent,
                }}
              />

              <div
                key={`tick-${transitionStep}`}
                className="absolute w-[26vw] max-w-[380px] aspect-square rounded-full animate-[countdownPulse_700ms_ease-out_forwards]"
                style={{
                  border: `1px solid ${accent}`,
                  opacity: 0.4,
                }}
              />

              <h1
                key={`num-${transitionStep}`}
                className="relative z-10 font-black text-white leading-none animate-[countdownThump_700ms_cubic-bezier(.16,1,.3,1)_forwards]"
                style={{
                  fontSize: "clamp(11rem, 28vw, 28rem)",
                  WebkitTextStroke: "2px rgba(255,0,0,.3)",
                  textShadow: `0 0 20px ${accent}, 0 0 60px ${accent}90, 0 0 140px ${accent}50`,
                }}
              >
                {transitionStep}
              </h1>

              <div className="absolute -bottom-24 md:-bottom-28 flex items-center gap-3 text-[9px] md:text-xs font-black tracking-[0.5em] pl-[0.5em] text-white/50">
                <span
                  className="w-10 md:w-16 h-px"
                  style={{
                    background: `linear-gradient(to right, transparent, ${accent})`,
                  }}
                />

                HAZIR OL

                <span
                  className="w-10 md:w-16 h-px"
                  style={{
                    background: `linear-gradient(to left, transparent, ${accent})`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              <div
                className="mb-6 h-px animate-[cinematicLine_1.8s_ease-out_forwards]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                }}
              />

              <h2
                key={`text-${transitionStep}`}
                className="relative font-black uppercase text-center text-white animate-[cinematicText_1.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                style={{
                  fontSize: "clamp(3rem, 7vw, 7rem)",
                  textShadow: `0 0 40px ${accent}90`,
                }}
              >
                {transitionStep}
              </h2>

              <div
                className="mt-6 h-px animate-[cinematicLine_1.8s_ease-out_forwards]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                }}
              />

              <span className="absolute -bottom-14 text-xs font-bold tracking-[0.6em] pl-[0.6em] text-red-500/60 animate-pulse">
                HAZIRLAN
              </span>
            </div>
          )}
        </div>
      )}

      {message && (
        <header className="relative z-20 flex justify-between items-start animate-[messageReveal_1s_cubic-bezier(.16,1,.3,1)]">
          {/* SOL GRUP TAMAMEN KALDIRILDI */}
          <div className="w-1/4"></div>

          {/* 🚀 ORTA GRUP: SCAP LOGOSU (TAM MERKEZDE) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 md:top-1 flex flex-col items-center justify-center z-30">
            <div className="relative w-48 md:w-68 lg:w-80 h-14 md:h-20 flex items-center justify-center">
              <img
                src="/scap.png"
                alt="SCAP"
                onError={(e: any) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
                className="w-full h-full object-contain animate-[logoFloat_7s_ease-in-out_infinite] flex-shrink-0"
                style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 15px ${accent}90)` }}
              />
              <span className="hidden font-serif italic text-3xl md:text-5xl font-extrabold tracking-widest text-white/90 drop-shadow-[0_0_12px_rgba(255,0,0,0.7)] animate-[logoFloat_7s_ease-in-out_infinite]">SCAP</span>
            </div>
          </div>

          {/* SAĞ GRUP: CANLI PARTİ AKIŞI */}
          <div className="relative group w-1/4 flex justify-end">
            <div className="absolute inset-0 rounded-full blur-xl opacity-30 bg-red-600" />

            <div className="relative flex items-center gap-3 rounded-full border border-red-500/20 bg-black/60 backdrop-blur-xl px-4 md:px-5 py-2.5 md:py-3 shadow-[0_15px_50px_rgba(255,0,0,.25)]">
              <span
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  live
                    ? "opacity-100 scale-100"
                    : "opacity-30 scale-75"
                }`}
                style={{
                  background: "#ff0015",
                  boxShadow: "0 0 15px #ff0015",
                }}
              />

              <Radio size={15} className="text-[#ff0015]" />

              <span className="font-black tracking-[0.22em] text-[9px] md:text-xs text-white/90">
                CANLI PARTİ AKIŞI
              </span>
            </div>
          </div>
        </header>
      )}

      {/* TAŞMAYI VE ASAGI KAYDIRMAYI %100 ENGELLEYEN MERKEZ ALAN */}
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
            <div
              className="relative flex items-center gap-3 rounded-full border px-6 md:px-8 py-2 md:py-3.5 mb-5 md:mb-8 backdrop-blur-2xl overflow-hidden flex-shrink-0 animate-[badgePremium_1s_cubic-bezier(.16,1,.3,1)]"
              style={{
                borderColor: `${accent}90`,
                color: accent,
                background: `${accent}15`,
                boxShadow: `0 0 40px ${accent}25, inset 0 0 30px ${accent}10`,
              }}
            >
              <div
                className="absolute inset-y-0 left-[-80%] w-[45%] skew-x-[-20deg] animate-[badgeSweep_4s_ease-in-out_infinite]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent)",
                }}
              />

              <Icon size={20} className="relative md:scale-125" />

              <span className="relative text-base md:text-3xl font-black tracking-[0.32em] pl-[0.32em]">
                {title}
              </span>
            </div>

            {/* AKILLI, MAX BOYUTLANDIRILMIŞ VE ASLA TAŞMAYAN H1 */}
            <h1
              className={`relative font-black uppercase tracking-[-0.04em] break-words max-w-[94vw] max-h-[42vh] overflow-hidden flex items-center justify-center px-1 select-none ${getContentFontSize(message.content)} animate-[messageReveal_1.15s_cubic-bezier(.16,1,.3,1)_both]`}
              style={{
                textShadow: `0 0 20px ${accent}45, 0 0 65px ${accent}50, 0 0 130px ${accent}30`,
                display: "-webkit-box",
                WebkitLineClamp: 5,
                WebkitBoxOrient: "vertical",
              }}
            >
              {message.content}
            </h1>

            <div
              className="relative mt-6 md:mt-10 h-[2px] w-36 md:w-64 overflow-hidden rounded-full flex-shrink-0"
              style={{
                background: `${accent}35`,
                boxShadow: `0 0 30px ${accent}40`,
              }}
            >
              <div
                className="absolute inset-y-0 left-[-50%] w-1/2 animate-[energyPremium_2.8s_ease-in-out_infinite]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accent}, white, ${accent}, transparent)`,
                  boxShadow: `0 0 25px ${accent}`,
                }}
              />
            </div>

            <div className="mt-4 flex items-center gap-1.5 opacity-50 flex-shrink-0">
              <span
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: accent, animationDelay: "0ms" }}
              />

              <span
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: accent, animationDelay: "150ms" }}
              />

              <span
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: accent, animationDelay: "300ms" }}
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full p-6 z-50 animate-[idleEntrance_2s_cubic-bezier(.16,1,.3,1)_both]">
            
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[800px] aspect-square rounded-full blur-[140px] opacity-25 animate-[cinematicBreathe_8s_ease-in-out_infinite]" 
              style={{ background: accent }} 
            />

            <div className="relative w-[85vw] md:w-[65vw] max-w-[900px] flex flex-col items-center animate-[cinematicLevitate_12s_ease-in-out_infinite] flex-shrink-0">
              {/* BOŞ EKRAN MERKEZİ - SCAP LOGOSU */}
              <div className="relative w-56 md:w-80 h-16 md:h-24 flex items-center justify-center">
                <img
                  src="/scap.png"
                  alt="SCAP"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                  className="w-full h-full object-contain animate-pulse flex-shrink-0"
                  style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 25px ${accent}80)` }}
                />
                <span className="hidden font-serif italic text-5xl md:text-7xl font-extrabold tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] animate-pulse">SCAP</span>
              </div>
            </div>

            <div className="mt-12 md:mt-20 relative group animate-[badgePremium_1.5s_cubic-bezier(.16,1,.3,1)_both] flex-shrink-0" style={{ animationDelay: "0.4s" }}>
              
              <div
                className="absolute -inset-1 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 animate-pulse"
                style={{ background: accent }}
              />

              <div className="relative flex items-center rounded-full border border-red-500/20 bg-black/50 backdrop-blur-3xl p-2 md:p-3 shadow-[0_30px_60px_rgba(255,0,0,0.25)]">
                
                <div className="relative flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/[0.03] border border-white/10 shadow-inner">
                  <Flame
                    size={28}
                    style={{
                      color: accent,
                      filter: `drop-shadow(0 0 10px ${accent})`,
                    }}
                  />
                </div>

                <div className="w-[1px] h-10 md:h-12 bg-white/[0.08] mx-4 md:mx-6" />

                <div className="flex flex-col justify-center pr-6 md:pr-10 text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse"
                      style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
                    />
                    <span className="text-[8px] md:text-[11px] font-black tracking-[0.4em] text-white/60 uppercase">
                      REDFLAG YAYINI
                    </span>
                  </div>
                  <span
                    className="text-lg md:text-4xl font-black tracking-widest text-white leading-none mt-1"
                    style={{ textShadow: `0 0 20px ${accent}50` }}
                  >
                    overheardparty.xyz/parti
                  </span>
                </div>

              </div>
            </div>

          </div>
        )}
      </section>

      {message && (
        <footer className="relative z-20 flex justify-between items-end gap-4 animate-[messageReveal_1s_cubic-bezier(.16,1,.3,1)]">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
            
            {/* SOL ALT LOGO TAMAMEN KALDIRILDI, SADECE MASADAN GÖNDER BUTONU KALDI */}
            
            <a
              href="https://overheardparty.xyz/parti"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group block"
              aria-label="Partiye mesaj gönder"
            >
              <div
                className="absolute -inset-3 rounded-2xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                style={{
                  background: accent,
                }}
              />

              <div
                className="relative flex items-center gap-3 md:gap-5 rounded-2xl border border-red-500/20 bg-black/50 backdrop-blur-xl px-3 md:px-6 py-2.5 md:py-4 transition-all duration-500 group-hover:border-red-500/40 group-hover:bg-red-950/20"
                style={{
                  boxShadow: "0 10px 40px rgba(255,0,0,.15)",
                }}
              >
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 md:h-10 rounded-full"
                  style={{
                    background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`,
                    boxShadow: `0 0 14px ${accent}`,
                  }}
                />

                <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl border border-white/[0.08] bg-white/[0.035]">
                  <Flame
                    size={18}
                    style={{
                      color: accent,
                      filter: `drop-shadow(0 0 10px ${accent})`,
                    }}
                  />

                  <span
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: `inset 0 0 18px ${accent}30`,
                    }}
                  />
                </div>

                <div className="flex flex-col gap-0.5 md:gap-1 min-w-0 text-left">
                  <span className="text-[6px] md:text-[8px] font-bold tracking-[0.35em] text-white/50">
                    MASADAN GÖNDER
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs md:text-lg tracking-[0.08em] text-white">
                      overheardparty.xyz/parti
                    </span>

                    <span
                      className="text-xs md:text-base opacity-80 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                      style={{
                        color: accent,
                      }}
                    >
                      ↗
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex ml-2 w-7 h-7 items-center justify-center rounded-full border border-red-500/20 text-white/40 group-hover:text-white/90 group-hover:border-red-500/50 transition-all duration-500">
                  →
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1.5 ml-2 opacity-40 group-hover:opacity-80 transition-opacity duration-500">
                <span
                  className="w-1 h-1 rounded-full"
                  style={{
                    background: accent,
                  }}
                />

                <span className="text-[6px] md:text-[7px] font-bold tracking-[0.28em] text-red-500/80">
                  REDFLAG'E KATIL
                </span>
              </div>
            </a>
          </div>

          <div className="relative group">
            <div
              className="absolute inset-0 rounded-xl blur-xl opacity-15"
              style={{
                background: accent,
              }}
            />

            <div className="relative flex items-center gap-3">
              <span className="hidden md:block text-[7px] font-bold tracking-[0.35em] text-white/30">
                PARTNER
              </span>

              <div className="relative flex items-center justify-center min-w-[70px] md:min-w-[105px] h-[32px] md:h-[46px] rounded-xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl px-2.5 overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(110deg, transparent 20%, rgba(255,0,0,.15) 48%, transparent 62%)",
                    backgroundSize: "240% 100%",
                    animation: "sponsorShine 4.5s ease-in-out infinite",
                  }}
                />

                <img
                  src="/D6.png"
                  alt="D6 Sosyal"
                  className="relative z-10 h-5 md:h-8 w-auto max-w-[85px] object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                />
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* TÜM HATALARI ENGELLEYEN HIZLI & GÜVENLİ CSS ENJEKSİYONU */}
      <style dangerouslySetInnerHTML={{ __html: stylesCSS }} />
    </main>
  );
}

const stylesCSS = `
  @keyframes premiumAmbient {
    0%, 100% {
      transform: scale(1);
      opacity: .52;
    }

    50% {
      transform: scale(1.16);
      opacity: .9;
    }
  }

  @keyframes stageLightLeft {
    0%, 100% {
      transform: translateX(-12%) rotate(-25deg) scale(1);
      opacity: .08;
    }

    50% {
      transform: translateX(18%) rotate(-17deg) scale(1.08);
      opacity: .17;
    }
  }

  @keyframes stageLightRight {
    0%, 100% {
      transform: translateX(12%) rotate(25deg) scale(1);
      opacity: .07;
    }

    50% {
      transform: translateX(-18%) rotate(17deg) scale(1.08);
      opacity: .15;
    }
  }

  @keyframes centerBeam {
    0%, 100% {
      transform: translate(-50%, -50%) scaleX(.65);
      opacity: .03;
    }

    50% {
      transform: translate(-50%, -50%) scaleX(1.25);
      opacity: .09;
    }
  }

  @keyframes lightSweep {
    0% {
      transform: translateX(-20%) rotate(25deg);
      opacity: 0;
    }

    25% {
      opacity: .04;
    }

    50% {
      opacity: .06;
    }

    80% {
      opacity: .02;
    }

    100% {
      transform: translateX(280%) rotate(25deg);
      opacity: 0;
    }
  }

  @keyframes countdownThump {
    0% {
      opacity: 0;
      transform: scale(1.8);
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
      transform: scale(.8);
      filter: blur(10px);
    }
  }

  @keyframes cinematicRing {
    0% {
      opacity: 1;
      transform: scale(.2);
      border-width: 10px;
    }

    100% {
      opacity: 0;
      transform: scale(2.2);
      border-width: 0;
    }
  }

  @keyframes cinematicText {
    0% {
      opacity: 0;
      transform: scale(.85);
      filter: blur(15px);
      letter-spacing: .1em;
      padding-left: .1em;
    }

    15% {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
      letter-spacing: .28em;
      padding-left: .28em;
    }

    85% {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
      letter-spacing: .28em;
      padding-left: .28em;
    }

    100% {
      opacity: 0;
      transform: scale(1.1);
      filter: blur(10px);
      letter-spacing: .35em;
      padding-left: .35em;
    }
  }

  @keyframes cinematicLine {
    0% {
      width: 0;
      opacity: 0;
    }

    15% {
      width: 250px;
      opacity: 1;
    }

    85% {
      width: 250px;
      opacity: 1;
    }

    100% {
      width: 350px;
      opacity: 0;
    }
  }

  @keyframes transitionGlow {
    0%, 100% {
      transform: scale(.75);
      opacity: .1;
    }

    50% {
      transform: scale(1.15);
      opacity: .35;
    }
  }

  @keyframes countdownOrbit {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes countdownPulse {
    0% {
      opacity: .85;
      transform: scale(.35);
      box-shadow: 0 0 0 rgba(255,0,0,0);
    }

    55% {
      opacity: .45;
      transform: scale(1);
      box-shadow: 0 0 80px rgba(255,0,0,.35);
    }

    100% {
      opacity: 0;
      transform: scale(1.65);
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

  @keyframes logoAura {
    0%, 100% {
      transform: scale(.88);
      opacity: .12;
    }

    55% {
      transform: scale(1.12);
      opacity: .28;
    }
  }

  @keyframes logoGlow {
    0%, 100% {
      transform: scale(.985);
      opacity: .25;
      filter: brightness(1.1) saturate(1.2) blur(18px);
    }

    45% {
      transform: scale(1.015);
      opacity: .48;
      filter: brightness(1.45) saturate(1.6) blur(16px);
    }

    52% {
      transform: scale(1.02);
      opacity: .6;
      filter: brightness(1.7) saturate(1.8) blur(13px);
    }

    60% {
      transform: scale(1);
      opacity: .3;
      filter: brightness(1.2) saturate(1.3) blur(18px);
    }
  }

  @keyframes logoFloat {
    0%, 100% {
      transform: translateY(0) scale(1);
    }

    50% {
      transform: translateY(-3px) scale(1.012);
    }
  }

  @keyframes particleFloat {
    0%, 100% {
      transform: translate3d(0,0,0);
      opacity: 0;
    }

    20% {
      opacity: .35;
    }

    50% {
      transform: translate3d(12px,-35px,0);
      opacity: .6;
    }

    80% {
      opacity: .25;
    }
  }

  @keyframes slowPulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(.96);
      opacity: .035;
    }

    50% {
      transform: translate(-50%, -50%) scale(1.04);
      opacity: .08;
    }
  }

  @keyframes grain {
    0% {
      transform: translate(0,0);
    }

    25% {
      transform: translate(2%,-1%);
    }

    50% {
      transform: translate(-1%,2%);
    }

    75% {
      transform: translate(-2%,-1%);
    }

    100% {
      transform: translate(0,0);
    }
  }

  @keyframes messageReveal {
    0% {
      opacity: 0;
      transform: scale(.68) translateY(50px);
      filter: blur(24px);
    }

    45% {
      opacity: 1;
      transform: scale(1.035) translateY(-6px);
      filter: blur(0);
    }

    65% {
      transform: scale(.985);
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
      transform: translateY(-22px) scale(.82);
      filter: blur(8px);
    }

    70% {
      opacity: 1;
      transform: translateY(2px) scale(1.02);
      filter: blur(0);
    }

    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes badgeSweep {
    0% {
      left: -80%;
    }

    45%, 100% {
      left: 140%;
    }
  }

  @keyframes energyPremium {
    0% {
      left: -55%;
      opacity: 0;
    }

    20% {
      opacity: 1;
    }

    75% {
      opacity: 1;
    }

    100% {
      left: 110%;
      opacity: 0;
    }
  }

  @keyframes sponsorShine {
    0%, 65% {
      background-position: 200% 0;
      opacity: 0;
    }

    75% {
      opacity: .7;
    }

    100% {
      background-position: -50% 0;
      opacity: 0;
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