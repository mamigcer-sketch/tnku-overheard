"use client";

import { useEffect, useRef, useState } from "react";

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

  const [transitionStep, setTransitionStep] = useState<string | null>(null);

  const isTransitioning = useRef(false);
  const lastMsgId = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    /*
     * =========================================================
     * PARTİ MESAJ GEÇİŞİ
     * =========================================================
     */

    const runTransition = async (newMsg: any) => {
      if (!mounted) return;

      isTransitioning.current = true;

      setVisible(false);

      await delay(350);

      if (!mounted) return;

      setMessage(newMsg);

      let transitionTitle = "YENİ İTİRAF";

      if (newMsg.location === "PARTY_LİNÇ") {
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

        const res = await fetch(
          "/api/parti?t=" + Date.now(),
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!mounted || !data?.message) return;

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
   * KATEGORİ
   * =========================================================
   */

  let accent = "#ff3038";
  let title = "İTİRAF";
  let Icon = Flame;

  if (message?.location === "PARTY_LİNÇ") {
    accent = "#ed48ff";
    title = "LİNÇ@";
    Icon = EyeOff;
  }

  if (message?.location === "PARTY_OVERHEARD") {
    accent = "#00e5ff";
    title = "DUYDUM";
    Icon = Ear;
  }

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
      className="dj-screen relative min-h-screen overflow-hidden bg-[#030208] text-white flex flex-col justify-between p-6 md:p-10 select-none"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {/* BACKGROUND */}

      <div className="absolute inset-0 bg-[#030208]" />

      <div
        className="absolute inset-[-20%] animate-[premiumAmbient_12s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(ellipse at 50% 45%, ${accent}42 0%, ${accent}18 22%, transparent 58%)`,
        }}
      />

      <div
        className="absolute top-[-45%] left-[-18%] w-[65vw] h-[190vh] blur-[115px] opacity-[0.12] animate-[stageLightLeft_14s_ease-in-out_infinite]"
        style={{
          background: accent,
          transform: "rotate(-25deg)",
        }}
      />

      <div
        className="absolute top-[-45%] right-[-18%] w-[60vw] h-[190vh] blur-[125px] opacity-[0.10] animate-[stageLightRight_17s_ease-in-out_infinite]"
        style={{
          background: accent,
          transform: "rotate(25deg)",
        }}
      />

      <div
        className="absolute left-1/2 top-1/2 w-[34vw] h-[130vh] -translate-x-1/2 -translate-y-1/2 blur-[90px] opacity-[0.06] animate-[centerBeam_9s_ease-in-out_infinite]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      <div
        className="absolute left-[-30%] top-[-60%] w-[45vw] h-[220vh] rotate-[25deg] blur-[80px] opacity-[0.035] animate-[lightSweep_11s_ease-in-out_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent, white, transparent)",
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="absolute w-[3px] h-[3px] rounded-full opacity-20 animate-[particleFloat_var(--duration)_ease-in-out_infinite]"
            style={
              {
                left: particle.left,
                top: particle.top,
                background: accent,
                boxShadow: `0 0 12px ${accent}`,
                "--delay": particle.delay,
                "--duration": particle.duration,
                animationDelay: particle.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div
        className="absolute left-1/2 top-1/2 w-[72vw] aspect-square rounded-full border opacity-[0.035] -translate-x-1/2 -translate-y-1/2 animate-[slowPulse_10s_ease-in-out_infinite]"
        style={{ borderColor: accent }}
      />

      <div
        className="absolute left-1/2 top-1/2 w-[52vw] aspect-square rounded-full border opacity-[0.05] -translate-x-1/2 -translate-y-1/2 animate-[slowPulse_7s_ease-in-out_infinite_reverse]"
        style={{ borderColor: accent }}
      />

      <div
        className="absolute left-1/2 top-1/2 w-[30vw] aspect-square rounded-full border opacity-[0.035] -translate-x-1/2 -translate-y-1/2 animate-[slowPulse_5s_ease-in-out_infinite]"
        style={{ borderColor: accent }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.25) 68%, rgba(0,0,0,.78) 100%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-[6] opacity-[0.035]"
        style={{
          background:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(255,255,255,.8) 4px, transparent 5px)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-[7] opacity-[0.025] mix-blend-screen animate-[grain_.25s_steps(2)_infinite]"
        style={{
          backgroundImage:
            `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.8' /%3E%3C/svg%3E")`,
        }}
      />

      {/* FLASH */}

      <div
        className={`absolute inset-0 z-[100] pointer-events-none transition-opacity duration-200 ${
          flash ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(circle at center, white 0%, ${accent}ee 10%, ${accent}55 25%, transparent 65%)`,
        }}
      />

      {/* ========================================================= */}
      {/* SİNEMATİK GEÇİŞ VE COUNTDOWN */}
      {/* ========================================================= */}

      {transitionStep && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/80 backdrop-blur-2xl">
          <div
            className="absolute w-[40vw] aspect-square rounded-full blur-[120px] opacity-30 animate-[transitionGlow_2s_ease-in-out_infinite]"
            style={{ background: accent }}
          />

          {transitionStep === "PARTY" ? (
            <div className="relative flex flex-col items-center justify-center">
              <div
                className="absolute w-[42vw] max-w-[760px] aspect-[2.7/1] rounded-full blur-[90px] animate-[partyIntroGlow_1.5s_ease-out_forwards]"
                style={{
                  background: accent,
                  opacity: 0.2,
                }}
              />

              <div className="relative w-[50vw] max-w-[700px] animate-[partyIntroLogo_1.5s_cubic-bezier(.16,1,.3,1)_forwards]">
                <img
                  src="/overheard-party.png"
                  alt="OVERHEARD PARTY"
                  className="relative w-full h-auto object-contain"
                  style={{
                    filter: `drop-shadow(0 0 25px ${accent}80)`,
                  }}
                />

                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,.8)_45%,transparent_58%)] bg-[length:240%_100%] animate-[partyLogoShine_1.5s_ease-in-out_infinite]" />
              </div>

              <div className="mt-5 text-[10px] md:text-sm font-black tracking-[0.65em] pl-[0.65em] text-white/50 animate-pulse">
                PARTİ AKIYOR
              </div>
            </div>
          ) : transitionStep === "3" ||
            transitionStep === "2" ||
            transitionStep === "1" ? (
            <div className="relative flex items-center justify-center">
              <div className="absolute w-[24vw] max-w-[340px] aspect-square rounded-full border border-white/10" />

              <div className="absolute w-[20vw] max-w-[290px] aspect-square rounded-full border border-white/5 animate-[countdownOrbit_2.1s_linear_infinite]" />

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
                  opacity: 0.3,
                }}
              />

              <h1
                key={`num-${transitionStep}`}
                className="relative z-10 font-black text-white leading-none animate-[countdownThump_700ms_cubic-bezier(.16,1,.3,1)_forwards]"
                style={{
                  fontSize: "clamp(11rem, 28vw, 28rem)",
                  WebkitTextStroke: "1px rgba(255,255,255,.18)",
                  textShadow: `0 0 18px ${accent}, 0 0 55px ${accent}90, 0 0 130px ${accent}40`,
                }}
              >
                {transitionStep}
              </h1>

              <div className="absolute -bottom-24 md:-bottom-28 flex items-center gap-3 text-[9px] md:text-xs font-black tracking-[0.5em] pl-[0.5em] text-white/40">
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
                  textShadow: `0 0 40px ${accent}80`,
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

              <span className="absolute -bottom-14 text-xs font-bold tracking-[0.6em] pl-[0.6em] text-white/50 animate-pulse">
                HAZIRLAN
              </span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <header className="relative z-20 flex justify-between items-start">
        {/* PREMIUM OVERHEARD PARTY LOGO */}

        <div className="relative group">
          <div
            className="absolute -inset-8 rounded-full blur-[45px] opacity-20 animate-[logoAmbient_5s_ease-in-out_infinite]"
            style={{
              background: `radial-gradient(circle, ${accent}, transparent 70%)`,
            }}
          />

          <div className="relative w-64 md:w-80 lg:w-[390px]">
            {/* Logo arkasındaki yumuşak premium glow */}

            <div
              className="absolute inset-0 blur-[20px] opacity-30 animate-[logoGlow_4s_ease-in-out_infinite]"
              style={{
                background: accent,
              }}
            />

            {/* ANA LOGO */}

            <img
              src="/overheard-party.png"
              alt="OVERHEARD PARTY"
              className="relative z-10 w-full h-auto object-contain"
              style={{
                filter: `
                  drop-shadow(0 0 5px rgba(255,255,255,.45))
                  drop-shadow(0 0 14px ${accent}90)
                  drop-shadow(0 0 35px ${accent}45)
                `,
              }}
            />

            {/* Sinematik ışık taraması */}

            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-[-80%] w-[32%] skew-x-[-18deg] animate-[logoShine_5s_ease-in-out_infinite]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,.75), transparent)",
                }}
              />
            </div>

            {/* Küçük premium alt yazı */}

            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap opacity-45">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  background: accent,
                  boxShadow: `0 0 10px ${accent}`,
                }}
              />

              <span className="text-[7px] md:text-[8px] font-bold tracking-[0.45em] pl-[0.45em]">
                LIVE EXPERIENCE
              </span>
            </div>
          </div>
        </div>

        {/* LIVE INDICATOR */}

        <div className="relative group">
          <div className="absolute inset-0 rounded-full blur-xl opacity-20 bg-red-500" />

          <div className="relative flex items-center gap-3 rounded-full border border-white/[0.08] bg-black/40 backdrop-blur-xl px-4 md:px-5 py-2.5 md:py-3 shadow-[0_15px_50px_rgba(0,0,0,.35)]">
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                live
                  ? "opacity-100 scale-100"
                  : "opacity-30 scale-75"
              }`}
              style={{
                background: "#ff3038",
                boxShadow: "0 0 15px #ff3038",
              }}
            />

            <Radio size={15} className="text-red-500" />

            <span className="font-black tracking-[0.22em] text-[9px] md:text-xs text-white/80">
              CANLI PARTİ AKIŞI
            </span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN STAGE */}
      {/* ========================================================= */}

      <section className="relative z-10 flex-1 flex items-center justify-center text-center px-3">
        {message ? (
          <div
            key={message.id}
            className={`w-full flex flex-col items-center transition-all duration-700 ${
              visible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-[.94] blur-md"
            }`}
          >
            {/* CATEGORY BADGE */}

            <div
              className="relative flex items-center gap-3 rounded-full border px-8 py-3.5 mb-9 md:mb-12 backdrop-blur-2xl overflow-hidden animate-[badgePremium_1s_cubic-bezier(.16,1,.3,1)]"
              style={{
                borderColor: `${accent}90`,
                color: accent,
                background: `${accent}10`,
                boxShadow: `0 0 35px ${accent}20, inset 0 0 25px ${accent}08`,
              }}
            >
              <div
                className="absolute inset-y-0 left-[-80%] w-[45%] skew-x-[-20deg] animate-[badgeSweep_4s_ease-in-out_infinite]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent)",
                }}
              />

              <Icon size={24} className="relative" />

              <span className="relative text-xl md:text-3xl font-black tracking-[0.32em] pl-[0.32em]">
                {title}
              </span>
            </div>

            {/* MESSAGE TEXT */}

            <h1
              className="relative font-black uppercase leading-[1.02] tracking-[-0.065em] break-words max-w-[94vw] text-[clamp(4rem,10vw,11rem)] animate-[messageReveal_1.15s_cubic-bezier(.16,1,.3,1)_both]"
              style={{
                textShadow: `0 0 18px ${accent}35, 0 0 55px ${accent}40, 0 0 110px ${accent}20`,
              }}
            >
              {message.content}
            </h1>

            {/* ENERGY BAR */}

            <div
              className="relative mt-12 md:mt-16 h-px w-48 md:w-80 overflow-hidden rounded-full"
              style={{
                background: `${accent}28`,
                boxShadow: `0 0 25px ${accent}30`,
              }}
            >
              <div
                className="absolute inset-y-0 left-[-50%] w-1/2 animate-[energyPremium_2.8s_ease-in-out_infinite]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accent}, white, ${accent}, transparent)`,
                  boxShadow: `0 0 20px ${accent}`,
                }}
              />
            </div>

            <div className="mt-6 flex items-center gap-2 opacity-40">
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: accent }}
              />

              <span
                className="w-1 h-1 rounded-full"
                style={{ background: accent }}
              />

              <span
                className="w-1 h-1 rounded-full"
                style={{ background: accent }}
              />
            </div>
          </div>
        ) : (
          /* EMPTY STATE */

          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div
                className="absolute inset-[-50px] rounded-full blur-3xl opacity-25 animate-pulse"
                style={{ background: accent }}
              />

              <Sparkles
                size={75}
                className="relative animate-[sparkleFloat_4s_ease-in-out_infinite]"
              />
            </div>

            <h2 className="text-3xl md:text-6xl font-black tracking-[0.25em] pl-[0.25em]">
              BOMBA BEKLENİYOR
            </h2>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <footer className="relative z-20 flex justify-between items-end gap-4">
        {/* MASADAN GÖNDER */}

        <div className="relative group">
          <div
            className="absolute -inset-3 rounded-2xl blur-2xl opacity-10"
            style={{ background: accent }}
          />

          <div className="relative flex items-center gap-4">
            {/* İnce premium çizgi */}

            <div
              className="w-[2px] h-10 rounded-full"
              style={{
                background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`,
                boxShadow: `0 0 12px ${accent}`,
              }}
            />

            <div className="flex flex-col gap-1.5">
              <span className="text-[7px] md:text-[9px] font-bold tracking-[0.35em] text-white/35">
                MASADAN GÖNDER
              </span>

              <div className="flex items-center gap-2.5">
                <Zap
                  size={14}
                  style={{
                    color: accent,
                    filter: `drop-shadow(0 0 7px ${accent})`,
                  }}
                />

                <span className="font-black text-sm md:text-lg tracking-[0.08em] text-white/90">
                  OVERHEARDPARTI
                </span>

                <span className="text-white/25 text-xs">
                  /
                </span>

                <span className="font-bold text-xs md:text-sm tracking-[0.12em] text-white/45">
                  PARTİ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* D6 SPONSOR */}

        <div className="relative group">
          <div
            className="absolute inset-0 rounded-xl blur-xl opacity-10"
            style={{ background: accent }}
          />

          <div className="relative flex items-center gap-3">
            <span className="hidden md:block text-[7px] font-bold tracking-[0.35em] text-white/25">
              PARTNER
            </span>

            <div className="relative flex items-center justify-center min-w-[82px] md:min-w-[105px] h-[38px] md:h-[46px] rounded-xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl px-3 overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 20%, rgba(255,255,255,.14) 48%, transparent 62%)",
                  backgroundSize: "240% 100%",
                  animation:
                    "sponsorShine 4.5s ease-in-out infinite",
                }}
              />

              <img
                src="/D6.png"
                alt="D6 Sosyal"
                className="relative z-10 h-7 md:h-8 w-auto max-w-[85px] object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-500"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* ANIMASYON MOTORU */}
      {/* ========================================================= */}

      <style>{`

        /* BACKGROUND & LIGHTS */

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

          20% {
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

        /* SİNEMATİK COUNTDOWN */

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
            transform: scale(0.95);
            filter: blur(0);
          }

          100% {
            opacity: 0;
            transform: scale(0.8);
            filter: blur(10px);
          }
        }

        @keyframes cinematicRing {
          0% {
            opacity: 1;
            transform: scale(0.2);
            border-width: 10px;
          }

          100% {
            opacity: 0;
            transform: scale(2.2);
            border-width: 0px;
          }
        }

        @keyframes cinematicText {
          0% {
            opacity: 0;
            transform: scale(0.85);
            filter: blur(15px);
            letter-spacing: 0.1em;
            padding-left: 0.1em;
          }

          15% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
            letter-spacing: 0.28em;
            padding-left: 0.28em;
          }

          85% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
            letter-spacing: 0.28em;
            padding-left: 0.28em;
          }

          100% {
            opacity: 0;
            transform: scale(1.1);
            filter: blur(10px);
            letter-spacing: 0.35em;
            padding-left: 0.35em;
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
            transform: scale(0.75);
            opacity: 0.1;
          }

          50% {
            transform: scale(1.15);
            opacity: 0.28;
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
            box-shadow: 0 0 0 rgba(0,102,255,0);
          }

          55% {
            opacity: .35;
            transform: scale(1);
            box-shadow: 0 0 70px rgba(0,102,255,.25);
          }

          100% {
            opacity: 0;
            transform: scale(1.65);
          }
        }

        /* PARTY LOGO ANİMASYONLARI */

        @keyframes partyLogoShine {
          0% {
            background-position: 180% 0;
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          60%, 100% {
            background-position: -80% 0;
            opacity: 0;
          }
        }

        @keyframes partyIntroLogo {
          0% {
            opacity: 0;
            transform: scale(.72);
            filter: blur(18px);
          }

          35% {
            opacity: 1;
            transform: scale(1.025);
            filter: blur(0);
          }

          70% {
            transform: scale(.99);
          }

          100% {
            opacity: 0;
            transform: scale(1.08);
            filter: blur(8px);
          }
        }

        @keyframes partyIntroGlow {
          0% {
            opacity: 0;
            transform: scale(.55);
          }

          35% {
            opacity: 1;
            transform: scale(1);
          }

          100% {
            opacity: 0;
            transform: scale(1.35);
          }
        }

        /* PREMIUM HEADER / SPONSOR */

        @keyframes logoAmbient {
          0%, 100% {
            transform: scale(.9);
            opacity: .12;
          }

          50% {
            transform: scale(1.12);
            opacity: .28;
          }
        }

        @keyframes logoGlow {
          0%, 100% {
            transform: scale(.96);
            opacity: .22;
          }

          50% {
            transform: scale(1.05);
            opacity: .48;
          }
        }

        @keyframes logoShine {
          0% {
            left: -80%;
            opacity: 0;
          }

          15% {
            opacity: .9;
          }

          45% {
            left: 130%;
            opacity: 0;
          }

          100% {
            left: 130%;
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

        /* DİĞER DETAYLAR */

        @keyframes particleFloat {
          0%, 100% {
            transform: translate3d(0,0,0);
            opacity: 0;
          }

          20% {
            opacity: .25;
          }

          50% {
            transform: translate3d(12px,-35px,0);
            opacity: .5;
          }

          80% {
            opacity: .15;
          }
        }

        @keyframes slowPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(.96);
            opacity: .025;
          }

          50% {
            transform: translate(-50%, -50%) scale(1.04);
            opacity: .07;
          }
        }

        @keyframes sparkleFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-10px) rotate(8deg);
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

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }

      `}</style>
    </main>
  );
}