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

    const runTransition = async (newMsg: any) => {
      if (!mounted) return;

      isTransitioning.current = true;

      setVisible(false);

      await delay(350);

      if (!mounted) return;

      setMessage(newMsg);

      let transitionTitle = "YENİ İTİRAF";

      // 🔥 HATA BURADAYDI: Veritabanından gelen tüm ihtimalleri (REZIL, LINC, LİNÇ) kapsadık
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
   * KATEGORİ RENKLERİ VE İKONLARI
   * =========================================================
   */

  let accent = "#ff3038";
  let title = "İTİRAF";
  let Icon = Flame;

  // 🔥 HATA BURADAYDI: Ekranda gösterilen rengi/başlığı belirleyen kısma da tüm ihtimalleri ekledik
  if (
    message?.location === "PARTY_LİNÇ" ||
    message?.location === "PARTY_LINC" ||
    message?.location === "PARTY_REZIL"
  ) {
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

      <div
        className={`absolute inset-0 z-[100] pointer-events-none transition-opacity duration-200 ${
          flash ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(circle at center, white 0%, ${accent}ee 10%, ${accent}55 25%, transparent 65%)`,
        }}
      />

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

      {message && (
        <header className="relative z-20 flex justify-between items-start animate-[messageReveal_1s_cubic-bezier(.16,1,.3,1)]">
          <div className="relative group">
            <div
              className="absolute -inset-12 rounded-full blur-[55px] opacity-20 animate-[logoAura_6s_ease-in-out_infinite]"
              style={{
                background: `radial-gradient(circle, ${accent} 0%, transparent 68%)`,
              }}
            />

            <div className="relative w-64 md:w-80 lg:w-[390px]">
              <img
                src="/overheard-party.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-auto object-contain blur-[18px] opacity-35 animate-[logoGlow_4.5s_ease-in-out_infinite]"
                style={{
                  filter: `
                    brightness(1.3)
                    saturate(1.5)
                    drop-shadow(0 0 25px ${accent})
                  `,
                }}
              />

              <img
                src="/overheard-party.png"
                alt="OVERHEARD PARTY"
                className="relative z-10 w-full h-auto object-contain animate-[logoFloat_7s_ease-in-out_infinite]"
                style={{
                  filter: `
                    brightness(1.08)
                    contrast(1.08)
                    drop-shadow(0 0 4px rgba(255,255,255,.5))
                    drop-shadow(0 0 12px ${accent}b0)
                    drop-shadow(0 0 32px ${accent}55)
                  `,
                }}
              />

              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    background: accent,
                    boxShadow: `0 0 12px ${accent}`,
                  }}
                />

                <span className="text-[7px] md:text-[8px] font-bold tracking-[0.48em] pl-[0.48em] text-white/35">
                  LIVE EXPERIENCE
                </span>
              </div>
            </div>
          </div>

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
      )}

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

            <h1
              className="relative font-black uppercase leading-[1.02] tracking-[-0.065em] break-words max-w-[94vw] text-[clamp(4rem,10vw,11rem)] animate-[messageReveal_1.15s_cubic-bezier(.16,1,.3,1)_both]"
              style={{
                textShadow: `0 0 18px ${accent}35, 0 0 55px ${accent}40, 0 0 110px ${accent}20`,
              }}
            >
              {message.content}
            </h1>

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
          <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full p-6 z-50 animate-[idleEntrance_2s_cubic-bezier(.16,1,.3,1)_both]">
            
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[800px] aspect-square rounded-full blur-[140px] opacity-20 animate-[cinematicBreathe_8s_ease-in-out_infinite]" 
              style={{ background: accent }} 
            />

            <div className="relative w-[85vw] md:w-[65vw] max-w-[900px] animate-[cinematicLevitate_12s_ease-in-out_infinite]">
              <img
                src="/overheard-party.png"
                alt="Overheard Party"
                className="relative z-10 w-full h-auto object-contain"
                style={{ filter: `drop-shadow(0 0 35px ${accent}50)` }}
              />
            </div>

            <div className="mt-16 md:mt-24 relative group animate-[badgePremium_1.5s_cubic-bezier(.16,1,.3,1)_both]" style={{ animationDelay: "0.4s" }}>
              
              <div
                className="absolute -inset-1 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse"
                style={{ background: accent }}
              />

              <div className="relative flex items-center rounded-full border border-white/[0.08] bg-black/40 backdrop-blur-3xl p-2 md:p-3 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                
                <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/[0.03] border border-white/10 shadow-inner">
                  <img
                    src="/5555.png"
                    alt="TNKU"
                    className="w-10 h-10 md:w-14 md:h-14 object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  />
                </div>

                <div className="w-[1px] h-10 md:h-12 bg-white/[0.08] mx-4 md:mx-6" />

                <div className="flex flex-col justify-center pr-6 md:pr-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse"
                      style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
                    />
                    <span className="text-[9px] md:text-[11px] font-black tracking-[0.4em] text-white/50 uppercase">
                      Canlı Yayın • Katıl
                    </span>
                  </div>
                  <span
                    className="text-2xl md:text-4xl font-black tracking-widest text-white leading-none mt-1"
                    style={{ textShadow: `0 0 20px ${accent}40` }}
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
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            
            <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl p-2 shadow-[0_10px_30px_rgba(0,0,0,.5)] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="/5555.png"
                alt="TNKU Logo"
                className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,.2)]"
              />
            </div>

            <a
              href="https://overheardparty.xyz/parti"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group block"
              aria-label="Partiye mesaj gönder"
            >
              <div
                className="absolute -inset-3 rounded-2xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{
                  background: accent,
                }}
              />

              <div
                className="relative flex items-center gap-4 md:gap-5 rounded-2xl border border-white/[0.08] bg-black/35 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/[0.045]"
                style={{
                  boxShadow: "0 10px 40px rgba(0,0,0,.3)",
                }}
              >
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 md:h-10 rounded-full"
                  style={{
                    background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`,
                    boxShadow: `0 0 14px ${accent}`,
                  }}
                />

                <div className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl border border-white/[0.08] bg-white/[0.035]">
                  <Zap
                    size={17}
                    style={{
                      color: accent,
                      filter: `drop-shadow(0 0 8px ${accent})`,
                    }}
                  />

                  <span
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: `inset 0 0 18px ${accent}20`,
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[7px] md:text-[8px] font-bold tracking-[0.35em] text-white/35">
                    MASADAN GÖNDER
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm md:text-lg tracking-[0.08em] text-white">
                      overheardparty.xyz/parti
                    </span>

                    <span
                      className="text-sm md:text-base opacity-70 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                      style={{
                        color: accent,
                      }}
                    >
                      ↗
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex ml-2 w-7 h-7 items-center justify-center rounded-full border border-white/[0.08] text-white/30 group-hover:text-white/80 transition-all duration-500">
                  →
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 ml-2 opacity-30 group-hover:opacity-60 transition-opacity duration-500">
                <span
                  className="w-1 h-1 rounded-full"
                  style={{
                    background: accent,
                  }}
                />

                <span className="text-[7px] font-bold tracking-[0.28em]">
                  PARTİ AKIŞINA KATIL
                </span>
              </div>
            </a>
          </div>

          <div className="relative group">
            <div
              className="absolute inset-0 rounded-xl blur-xl opacity-10"
              style={{
                background: accent,
              }}
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
                    animation: "sponsorShine 4.5s ease-in-out infinite",
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
      )}

      <style>{`
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
            opacity: .28;
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
            opacity: 0.3;
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

          50% {
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

        @keyframes logoFlash {
          0%, 38%, 100% {
            opacity: 0;
            transform: scale(.96);
          }

          43% {
            opacity: .16;
            transform: scale(1);
          }

          47% {
            opacity: 0;
            transform: scale(1.035);
          }
        }

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