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

      // Eski mesajı kaldır
      setVisible(false);

      await delay(350);

      if (!mounted) return;

      // Yeni mesajı hazırla
      setMessage(newMsg);

      let transitionTitle = "YENİ İTİRAF";

      if (newMsg.location === "PARTY_REZIL") {
        transitionTitle = "YENİ REZİL@";
      }

      if (newMsg.location === "PARTY_OVERHEARD") {
        transitionTitle = "YENİ DUYDUM";
      }

      /*
       * =====================================================
       * 3
       * =====================================================
       */

      setTransitionStep("3");

      await delay(700);

      if (!mounted) return;

      /*
       * =====================================================
       * 2
       * =====================================================
       */

      setTransitionStep("2");

      await delay(700);

      if (!mounted) return;

      /*
       * =====================================================
       * 1
       * =====================================================
       */

      setTransitionStep("1");

      await delay(720);

      if (!mounted) return;

      /*
       * =====================================================
       * PATLAMA
       * =====================================================
       */

      setTransitionStep(null);
      setFlash(true);

      await delay(180);

      if (!mounted) return;

      setFlash(false);

      /*
       * =====================================================
       * ÇOK KISA MERAK EKRANI
       * =====================================================
       */

      setTransitionStep(transitionTitle);

      await delay(850);

      if (!mounted) return;

      /*
       * =====================================================
       * MESAJ PATLAMASI
       * =====================================================
       */

      setTransitionStep(null);

      setFlash(true);

      await delay(100);

      if (!mounted) return;

      setVisible(true);

      await delay(220);

      if (!mounted) return;

      setFlash(false);

      await delay(300);

      isTransitioning.current = false;
    };

    /*
     * =========================================================
     * API
     * =========================================================
     */

    const fetchMsg = async () => {
      try {
        if (isTransitioning.current) return;

        const res = await fetch("/api/parti?t=" + Date.now(), {
          cache: "no-store",
        });

        const data = await res.json();

        if (!mounted || !data?.message) return;

        if (lastMsgId.current !== data.message.id) {
          /*
           * İlk açılış
           */

          if (lastMsgId.current === null) {
            lastMsgId.current = data.message.id;

            setMessage(data.message);
            setVisible(true);
          } else {
            /*
             * Yeni mesaj
             */

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

  /*
   * =========================================================
   * PARTICLES
   * =========================================================
   */

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
      className="
        dj-screen
        relative
        min-h-screen
        overflow-hidden
        bg-[#030208]
        text-white
        flex
        flex-col
        justify-between
        p-6
        md:p-10
        select-none
      "
      style={
        {
          "--accent": accent,
        } as React.CSSProperties
      }
    >

      {/* ========================================================= */}
      {/* BACKGROUND */}
      {/* ========================================================= */}

      <div className="absolute inset-0 bg-[#030208]" />

      <div
        className="
          absolute
          inset-[-20%]
          animate-[premiumAmbient_12s_ease-in-out_infinite]
        "
        style={{
          background: `radial-gradient(
            ellipse at 50% 45%,
            ${accent}42 0%,
            ${accent}18 22%,
            transparent 58%
          )`,
        }}
      />

      <div
        className="
          absolute
          top-[-45%]
          left-[-18%]
          w-[65vw]
          h-[190vh]
          blur-[115px]
          opacity-[0.12]
          animate-[stageLightLeft_14s_ease-in-out_infinite]
        "
        style={{
          background: accent,
          transform: "rotate(-25deg)",
        }}
      />

      <div
        className="
          absolute
          top-[-45%]
          right-[-18%]
          w-[60vw]
          h-[190vh]
          blur-[125px]
          opacity-[0.10]
          animate-[stageLightRight_17s_ease-in-out_infinite]
        "
        style={{
          background: accent,
          transform: "rotate(25deg)",
        }}
      />

      <div
        className="
          absolute
          left-1/2
          top-1/2
          w-[34vw]
          h-[130vh]
          -translate-x-1/2
          -translate-y-1/2
          blur-[90px]
          opacity-[0.06]
          animate-[centerBeam_9s_ease-in-out_infinite]
        "
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${accent},
            transparent
          )`,
        }}
      />

      {/* LIGHT SWEEP */}

      <div
        className="
          absolute
          left-[-30%]
          top-[-60%]
          w-[45vw]
          h-[220vh]
          rotate-[25deg]
          blur-[80px]
          opacity-[0.035]
          animate-[lightSweep_11s_ease-in-out_infinite]
        "
        style={{
          background:
            "linear-gradient(90deg, transparent, white, transparent)",
        }}
      />

      {/* PARTICLES */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {particles.map((particle, index) => (
          <span
            key={index}
            className="
              absolute
              w-[3px]
              h-[3px]
              rounded-full
              opacity-20
              animate-[particleFloat_var(--duration)_ease-in-out_infinite]
            "
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

      {/* RADIAL RINGS */}

      <div
        className="
          absolute
          left-1/2
          top-1/2
          w-[72vw]
          aspect-square
          rounded-full
          border
          opacity-[0.035]
          -translate-x-1/2
          -translate-y-1/2
          animate-[slowPulse_10s_ease-in-out_infinite]
        "
        style={{
          borderColor: accent,
        }}
      />

      <div
        className="
          absolute
          left-1/2
          top-1/2
          w-[52vw]
          aspect-square
          rounded-full
          border
          opacity-[0.05]
          -translate-x-1/2
          -translate-y-1/2
          animate-[slowPulse_7s_ease-in-out_infinite_reverse]
        "
        style={{
          borderColor: accent,
        }}
      />

      {/* VIGNETTE */}

      <div
        className="
          absolute
          inset-0
          pointer-events-none
          z-[5]
        "
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.25) 68%, rgba(0,0,0,.78) 100%)",
        }}
      />

      {/* SCANLINES */}

      <div
        className="
          absolute
          inset-0
          pointer-events-none
          z-[6]
          opacity-[0.035]
        "
        style={{
          background:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(255,255,255,.8) 4px, transparent 5px)",
        }}
      />

      {/* GRAIN */}

      <div
        className="
          absolute
          inset-0
          pointer-events-none
          z-[7]
          opacity-[0.025]
          mix-blend-screen
          animate-[grain_.25s_steps(2)_infinite]
        "
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.8' /%3E%3C/svg%3E\")",
        }}
      />

      {/* ========================================================= */}
      {/* FLASH */}
      {/* ========================================================= */}

      <div
        className={`
          absolute
          inset-0
          z-[100]
          pointer-events-none
          transition-opacity
          duration-200
          ${flash ? "opacity-100" : "opacity-0"}
        `}
        style={{
          background: `
            radial-gradient(
              circle at center,
              white 0%,
              ${accent}ee 10%,
              ${accent}55 25%,
              transparent 65%
            )
          `,
        }}
      />

      {/* ========================================================= */}
      {/* 3 - 2 - 1 TRANSITION */}
      {/* ========================================================= */}

      {transitionStep && (
        <div
          className="
            absolute
            inset-0
            z-[90]
            flex
            items-center
            justify-center
            overflow-hidden
            bg-black/70
            backdrop-blur-md
          "
        >

          {/* GLOW */}

          <div
            className="
              absolute
              left-1/2
              top-1/2
              w-[25vw]
              aspect-square
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              blur-[100px]
              animate-[countdownGlow_1s_ease-out_forwards]
            "
            style={{
              background: accent,
            }}
          />

          {/* EXPANDING RING */}

          <div
            key={`ring-${transitionStep}`}
            className="
              absolute
              left-1/2
              top-1/2
              w-[10vw]
              aspect-square
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border-[2px]
              animate-[countdownRing_900ms_cubic-bezier(.16,1,.3,1)_forwards]
            "
            style={{
              borderColor: accent,
              boxShadow: `0 0 30px ${accent}, 0 0 80px ${accent}80`,
            }}
          />

          {/* SECOND RING */}

          <div
            key={`ring2-${transitionStep}`}
            className="
              absolute
              left-1/2
              top-1/2
              w-[4vw]
              aspect-square
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border
              opacity-60
              animate-[countdownRingSmall_800ms_ease-out_forwards]
            "
            style={{
              borderColor: accent,
            }}
          />

          {/* NUMBER */}

          <div
            key={`number-${transitionStep}`}
            className="
              relative
              flex
              items-center
              justify-center
              animate-[countdownNumber_700ms_cubic-bezier(.16,1,.3,1)_forwards]
            "
          >

            <span
              className="
                absolute
                font-black
                text-[clamp(12rem,32vw,32rem)]
                leading-none
                text-white/5
                blur-sm
              "
            >
              {transitionStep}
            </span>

            <span
              className="
                relative
                font-black
                text-[clamp(9rem,24vw,24rem)]
                leading-none
                text-white
              "
              style={{
                textShadow: `
                  0 0 20px ${accent},
                  0 0 50px ${accent},
                  0 0 110px ${accent}90,
                  0 0 180px ${accent}50
                `,
              }}
            >
              {transitionStep}
            </span>

          </div>

          {/* BOTTOM STATUS */}

          <div
            className="
              absolute
              bottom-[17%]
              left-1/2
              -translate-x-1/2
              flex
              items-center
              gap-3
              animate-[countdownStatus_700ms_ease-out_forwards]
            "
          >

            <span
              className="w-10 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${accent})`,
              }}
            />

            <span
              className="
                text-[9px]
                md:text-xs
                font-black
                tracking-[0.45em]
                pl-[0.45em]
                text-white/40
              "
            >
              YENİ GÖNDERİ
            </span>

            <span
              className="w-10 h-px"
              style={{
                background: `linear-gradient(90deg, ${accent}, transparent)`,
              }}
            />

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* MERAK YAZISI */}
      {/* ========================================================= */}

      {transitionStep &&
        transitionStep !== "3" &&
        transitionStep !== "2" &&
        transitionStep !== "1" && (
          <div
            className="
              absolute
              inset-0
              z-[95]
              flex
              items-center
              justify-center
              bg-black
              animate-[revealScreen_850ms_cubic-bezier(.16,1,.3,1)_forwards]
            "
          >

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                text-center
              "
            >

              <div
                className="
                  mb-5
                  h-px
                  w-16
                  animate-[mysteryLine_850ms_ease-out_forwards]
                "
                style={{
                  background: accent,
                  boxShadow: `0 0 20px ${accent}`,
                }}
              />

              <h2
                className="
                  font-black
                  uppercase
                  text-white
                  text-[clamp(3rem,7vw,8rem)]
                  tracking-[-0.04em]
                  animate-[mysteryText_850ms_cubic-bezier(.16,1,.3,1)_forwards]
                "
                style={{
                  textShadow: `
                    0 0 20px ${accent},
                    0 0 60px ${accent}80
                  `,
                }}
              >
                {transitionStep}
              </h2>

              <div
                className="
                  mt-5
                  text-[9px]
                  md:text-xs
                  tracking-[0.55em]
                  pl-[0.55em]
                  text-white/30
                "
              >
                MASADAN GELİYOR...
              </div>

            </div>

          </div>
        )}

      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <header className="relative z-20 flex justify-between items-start">

        {/* LOGO */}

        <div className="relative flex items-center justify-center">

          <div
            className="
              absolute
              w-44
              h-44
              md:w-64
              md:h-64
              rounded-full
              blur-3xl
              opacity-25
              animate-[logoHalo_5s_ease-in-out_infinite]
            "
            style={{
              background: accent,
            }}
          />

          <div
            className="
              absolute
              w-36
              h-36
              md:w-52
              md:h-52
              rounded-full
              border
              opacity-60
              animate-[logoRing_7s_ease-in-out_infinite]
            "
            style={{
              borderColor: accent,
              boxShadow: `0 0 20px ${accent}35, 0 0 65px ${accent}15`,
            }}
          />

          <div
            className="
              absolute
              w-32
              h-32
              md:w-48
              md:h-48
              rounded-full
              border
              opacity-25
              animate-[logoRingInner_5s_ease-in-out_infinite]
            "
            style={{
              borderColor: accent,
            }}
          />

          <div
            className="
              relative
              w-28
              h-28
              md:w-44
              md:h-44
              rounded-full
              bg-[#070707]
              border
              border-white/20
              p-3
              md:p-4
              shadow-[0_0_60px_rgba(0,0,0,.8)]
            "
          >

            <div
              className="
                absolute
                inset-2
                rounded-full
                border
                border-white/10
              "
            />

            <img
              src="/5555.png"
              alt="TNKU Logo"
              className="
                relative
                w-full
                h-full
                object-contain
                drop-shadow-[0_0_25px_rgba(255,255,255,.35)]
                animate-[logoBreath_5s_ease-in-out_infinite]
              "
            />

          </div>
        </div>

        {/* LIVE */}

        <div
          className="
            flex
            items-center
            gap-3
            rounded-full
            border
            border-white/10
            bg-black/60
            backdrop-blur-2xl
            px-5
            py-3
            shadow-[0_10px_50px_rgba(0,0,0,.45)]
          "
        >

          <span
            className={`
              w-2.5
              h-2.5
              rounded-full
              transition-all
              duration-300
              ${live ? "opacity-100 scale-100" : "opacity-30 scale-75"}
            `}
            style={{
              background: "#ff3038",
              boxShadow: "0 0 18px #ff3038",
            }}
          />

          <Radio
            size={17}
            className="text-red-500"
          />

          <span
            className="
              font-black
              tracking-[0.2em]
              text-[10px]
              md:text-sm
            "
          >
            CANLI PARTİ AKIŞI
          </span>

        </div>

      </header>

      {/* ========================================================= */}
      {/* MAIN */}
      {/* ========================================================= */}

      <section
        className="
          relative
          z-10
          flex-1
          flex
          items-center
          justify-center
          text-center
          px-3
        "
      >

        {message ? (

          <div
            key={message.id}
            className={`
              w-full
              flex
              flex-col
              items-center
              transition-all
              duration-700

              ${
                visible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-[.94] blur-md"
              }
            `}
          >

            {/* CATEGORY */}

            <div
              className="
                relative
                flex
                items-center
                gap-3
                rounded-full
                border
                px-7
                py-3
                mb-9
                md:mb-12
                backdrop-blur-2xl
                overflow-hidden
                animate-[badgePremium_1s_cubic-bezier(.16,1,.3,1)]
              "
              style={{
                borderColor: `${accent}90`,
                color: accent,
                background: `${accent}10`,
                boxShadow: `
                  0 0 35px ${accent}20,
                  inset 0 0 25px ${accent}08
                `,
              }}
            >

              <div
                className="
                  absolute
                  inset-y-0
                  left-[-80%]
                  w-[45%]
                  skew-x-[-20deg]
                  animate-[badgeSweep_4s_ease-in-out_infinite]
                "
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent)",
                }}
              />

              <Icon
                size={21}
                className="relative"
              />

              <span
                className="
                  relative
                  text-lg
                  md:text-2xl
                  font-black
                  tracking-[0.32em]
                  pl-[0.32em]
                "
              >
                {title}
              </span>

            </div>

            {/* MESSAGE */}

            <h1
              className="
                relative
                font-black
                uppercase
                leading-[1.02]
                tracking-[-0.065em]
                break-words
                max-w-[94vw]
                text-[clamp(4rem,10vw,11rem)]
                animate-[messageReveal_1.15s_cubic-bezier(.16,1,.3,1)_both]
              "
              style={{
                textShadow: `
                  0 0 18px ${accent}35,
                  0 0 55px ${accent}40,
                  0 0 110px ${accent}20
                `,
              }}
            >
              {message.content}
            </h1>

            {/* ENERGY */}

            <div
              className="
                relative
                mt-12
                md:mt-16
                h-px
                w-48
                md:w-80
                overflow-hidden
                rounded-full
              "
              style={{
                background: `${accent}28`,
                boxShadow: `0 0 25px ${accent}30`,
              }}
            >

              <div
                className="
                  absolute
                  inset-y-0
                  left-[-50%]
                  w-1/2
                  animate-[energyPremium_2.8s_ease-in-out_infinite]
                "
                style={{
                  background: `
                    linear-gradient(
                      90deg,
                      transparent,
                      ${accent},
                      white,
                      ${accent},
                      transparent
                    )
                  `,
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

          <div className="flex flex-col items-center gap-8">

            <div className="relative">

              <div
                className="
                  absolute
                  inset-[-50px]
                  rounded-full
                  blur-3xl
                  opacity-25
                  animate-pulse
                "
                style={{
                  background: accent,
                }}
              />

              <Sparkles
                size={75}
                className="
                  relative
                  animate-[sparkleFloat_4s_ease-in-out_infinite]
                "
              />

            </div>

            <h2
              className="
                text-3xl
                md:text-6xl
                font-black
                tracking-[0.25em]
                pl-[0.25em]
              "
            >
              BOMBA BEKLENİYOR
            </h2>

          </div>

        )}

      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <footer
        className="
          relative
          z-20
          flex
          justify-between
          items-end
          gap-4
        "
      >

        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-black/55
            backdrop-blur-2xl
            px-5
            py-4
            md:px-8
            md:py-5
            shadow-[0_10px_50px_rgba(0,0,0,.45)]
          "
        >

          <div className="flex flex-wrap items-center gap-3">

            <span
              className="
                text-gray-400
                font-bold
                tracking-[0.2em]
                text-[9px]
                md:text-xs
              "
            >
              MASADAN GÖNDER
            </span>

            <Zap
              size={17}
              style={{
                color: accent,
                filter: `drop-shadow(0 0 6px ${accent})`,
              }}
            />

            <span
              className="
                font-black
                text-sm
                md:text-xl
                tracking-wider
              "
            >
              OVERHEARDPARTI/PARTI
            </span>

          </div>

        </div>

        <div className="relative p-[1px] rounded-2xl overflow-hidden">

          <div
            className="
              absolute
              inset-[-100%]
              animate-[sponsorSweep_6s_linear_infinite]
            "
            style={{
              background: `
                conic-gradient(
                  from 0deg,
                  transparent 0deg,
                  transparent 100deg,
                  ${accent} 150deg,
                  white 175deg,
                  ${accent} 200deg,
                  transparent 250deg,
                  transparent 360deg
                )
              `,
            }}
          />

          <div
            className="
              relative
              bg-[#080808]
              rounded-2xl
              p-3
              md:p-4
            "
          >

            <img
              src="/D6.png"
              alt="D6 Sosyal"
              className="
                h-11
                md:h-16
                w-auto
                object-contain
              "
            />

          </div>

        </div>

      </footer>

      {/* ========================================================= */}
      {/* ANIMATION ENGINE */}
      {/* ========================================================= */}

      <style>{`

        /* ===================================================== */
        /* BACKGROUND */
        /* ===================================================== */

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

        /* ===================================================== */
        /* COUNTDOWN GLOW */
        /* ===================================================== */

        @keyframes countdownGlow {

          0% {
            transform: translate(-50%, -50%) scale(.35);
            opacity: 0;
          }

          35% {
            opacity: .35;
          }

          100% {
            transform: translate(-50%, -50%) scale(2.4);
            opacity: 0;
          }

        }

        /* ===================================================== */
        /* COUNTDOWN RING */
        /* ===================================================== */

        @keyframes countdownRing {

          0% {
            transform: translate(-50%, -50%) scale(.35);
            opacity: 0;
            border-width: 8px;
          }

          20% {
            opacity: 1;
          }

          100% {
            transform: translate(-50%, -50%) scale(5);
            opacity: 0;
            border-width: 1px;
          }

        }

        @keyframes countdownRingSmall {

          0% {
            transform: translate(-50%, -50%) scale(.4);
            opacity: 0;
          }

          25% {
            opacity: .8;
          }

          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }

        }

        /* ===================================================== */
        /* COUNTDOWN NUMBER */
        /* ===================================================== */

        @keyframes countdownNumber {

          0% {
            opacity: 0;
            transform: scale(2.2);
            filter: blur(18px);
          }

          18% {
            opacity: 1;
            transform: scale(.92);
            filter: blur(0);
          }

          35% {
            transform: scale(1.04);
          }

          55% {
            transform: scale(1);
          }

          78% {
            opacity: 1;
            transform: scale(1.02);
          }

          100% {
            opacity: 0;
            transform: scale(.72);
            filter: blur(10px);
          }

        }

        /* ===================================================== */
        /* COUNTDOWN STATUS */
        /* ===================================================== */

        @keyframes countdownStatus {

          0% {
            opacity: 0;
            transform: translateY(12px);
          }

          25% {
            opacity: 1;
          }

          75% {
            opacity: .45;
          }

          100% {
            opacity: 0;
            transform: translateY(-5px);
          }

        }

        /* ===================================================== */
        /* MYSTERY SCREEN */
        /* ===================================================== */

        @keyframes revealScreen {

          0% {
            opacity: 0;
          }

          18% {
            opacity: 1;
          }

          75% {
            opacity: 1;
          }

          100% {
            opacity: 0;
          }

        }

        @keyframes mysteryText {

          0% {
            opacity: 0;
            transform: scale(.72);
            filter: blur(20px);
            letter-spacing: .12em;
          }

          30% {
            opacity: 1;
            transform: scale(1.05);
            filter: blur(0);
            letter-spacing: -.04em;
          }

          60% {
            transform: scale(1);
          }

          100% {
            opacity: 0;
            transform: scale(1.08);
            filter: blur(10px);
          }

        }

        @keyframes mysteryLine {

          0% {
            width: 0;
            opacity: 0;
          }

          35% {
            width: 4rem;
            opacity: 1;
          }

          100% {
            width: 9rem;
            opacity: 0;
          }

        }

        /* ===================================================== */
        /* MESSAGE */
        /* ===================================================== */

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

        /* ===================================================== */
        /* LOGO */
        /* ===================================================== */

        @keyframes logoHalo {

          0%, 100% {
            transform: scale(.95);
            opacity: .18;
          }

          50% {
            transform: scale(1.12);
            opacity: .34;
          }

        }

        @keyframes logoBreath {

          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.025);
          }

        }

        @keyframes logoRing {

          0%, 100% {
            transform: scale(.96);
            opacity: .28;
          }

          50% {
            transform: scale(1.05);
            opacity: .72;
          }

        }

        @keyframes logoRingInner {

          0%, 100% {
            transform: scale(1);
            opacity: .18;
          }

          50% {
            transform: scale(.94);
            opacity: .45;
          }

        }

        /* ===================================================== */
        /* PARTICLES */
        /* ===================================================== */

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

        /* ===================================================== */
        /* RINGS */
        /* ===================================================== */

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

        /* ===================================================== */
        /* SPONSOR */
        /* ===================================================== */

        @keyframes sponsorSweep {

          to {
            transform: rotate(360deg);
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

        /* ===================================================== */
        /* GRAIN */
        /* ===================================================== */

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

        /* ===================================================== */
        /* REDUCED MOTION */
        /* ===================================================== */

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