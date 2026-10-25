"use client";



import { useEffect, useRef, useState } from "react";



import {

  HelpCircle,

  MessageCircle,

  Radio,

  Zap,

  Skull,

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



      setTransitionStep("YENİ MESAJ");



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

   * KATEGORİ RENKLERİ (KIRMIZI VE YEŞİL BAYRAK TEMASI)

   * =========================================================

   */



  let accentRed = "#ff6a00";

  let accentGreen = "#7c3aed";

  let title = "SORU";

  let Icon = HelpCircle;



  const getContentFontSize = (text: string) => {

    const len = text ? text.length : 0;

    if (len > 180) return "text-[1.2rem] md:text-[1.7rem] lg:text-[2.2rem] tracking-tight leading-[1.1] max-w-[94vw]";

    if (len > 120) return "text-[1.5rem] md:text-[2.2rem] lg:text-[2.9rem] tracking-tight leading-[1.05] max-w-[94vw]";

    if (len > 80) return "text-[2rem] md:text-[2.8rem] lg:text-[3.6rem] leading-[1.05] max-w-[94vw]";

    if (len > 40) return "text-[2.8rem] md:text-[3.9rem] lg:text-[5.2rem] leading-[1.02] max-w-[94vw]";

    return "text-[clamp(3.5rem,7.5vw,8.5rem)] leading-[0.98] max-w-[94vw]";

  };



  const backgroundFlags = [

    { left: "8%", top: "15%", delay: "0s", duration: "12s", color: accentRed },

    { left: "82%", top: "20%", delay: "2s", duration: "14s", color: accentGreen },

    { left: "22%", top: "75%", delay: "4s", duration: "15s", color: accentGreen },

    { left: "75%", top: "82%", delay: "1s", duration: "13s", color: accentRed },

    { left: "45%", top: "12%", delay: "5s", duration: "11s", color: accentRed },

    { left: "55%", top: "85%", delay: "3s", duration: "16s", color: accentGreen },

    { left: "12%", top: "50%", delay: "6s", duration: "14s", color: accentRed },

    { left: "88%", top: "45%", delay: "2.5s", duration: "12s", color: accentGreen },

  ];



  return (

    <main

      className="dj-screen relative min-h-screen max-h-screen overflow-hidden bg-[#08030b] text-white flex flex-col justify-between p-4 md:p-10 select-none"

    >

      <div className="absolute inset-0 bg-[#08030b]" />



      <div

        className="absolute inset-[-20%] animate-[premiumAmbient_12s_ease-in-out_infinite]"

        style={{

          background: `radial-gradient(ellipse at 50% 45%, rgba(255,106,0,0.07) 0%, transparent 65%)`,

        }}

      />



      <div

        className="absolute top-[-45%] left-[-18%] w-[65vw] h-[190vh] blur-[115px] opacity-[0.15] animate-[stageLightLeft_14s_ease-in-out_infinite]"

        style={{

          background: accentRed,

          transform: "rotate(-25deg)",

        }}

      />



      <div

        className="absolute top-[-45%] right-[-18%] w-[60vw] h-[190vh] blur-[125px] opacity-[0.12] animate-[stageLightRight_17s_ease-in-out_infinite]"

        style={{

          background: accentGreen,

          transform: "rotate(25deg)",

        }}

      />



      <div

        className="absolute left-1/2 top-1/2 w-[34vw] h-[130vh] -translate-x-1/2 -translate-y-1/2 blur-[90px] opacity-[0.05] animate-[centerBeam_9s_ease-in-out_infinite]"

        style={{

          background: `linear-gradient(90deg, transparent, white, transparent)`,

        }}

      />



      <div

        className="absolute left-[-30%] top-[-60%] w-[45vw] h-[220vh] rotate-[25deg] blur-[80px] opacity-[0.04] animate-[lightSweep_11s_ease-in-out_infinite]"

        style={{

          background:

            "linear-gradient(90deg, transparent, white, transparent)",

        }}

      />



      {/* HALLOWEEN ATMOSPHERE: moon, drifting fog, ravens, ghosts and bats */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden halloween-world">
        <div className="halloween-moon" />
        <div className="halloween-fog halloween-fog-one" />
        <div className="halloween-fog halloween-fog-two" />

        {/* Flying ravens — kept behind the message so the screen stays readable */}
        <svg className="halloween-raven raven-one" viewBox="0 0 120 70" aria-hidden="true">
          <path d="M4 48 Q22 13 43 34 Q51 41 59 38 Q68 29 79 22 L72 39 L94 30 L83 43 L113 47 L91 53 L72 49 Q61 65 48 52 Q28 62 4 48Z" fill="currentColor" />
          <path d="M43 34 Q27 7 14 8 Q28 29 37 43 M60 39 Q75 4 94 5 Q80 27 69 45" fill="currentColor" />
          <circle cx="83" cy="39" r="1.8" fill="#ff6a00" />
        </svg>
        <svg className="halloween-raven raven-two" viewBox="0 0 120 70" aria-hidden="true">
          <path d="M4 48 Q22 13 43 34 Q51 41 59 38 Q68 29 79 22 L72 39 L94 30 L83 43 L113 47 L91 53 L72 49 Q61 65 48 52 Q28 62 4 48Z" fill="currentColor" />
          <path d="M43 34 Q27 7 14 8 Q28 29 37 43 M60 39 Q75 4 94 5 Q80 27 69 45" fill="currentColor" />
          <circle cx="83" cy="39" r="1.8" fill="#ff6a00" />
        </svg>
        <svg className="halloween-raven raven-three" viewBox="0 0 120 70" aria-hidden="true">
          <path d="M4 48 Q22 13 43 34 Q51 41 59 38 Q68 29 79 22 L72 39 L94 30 L83 43 L113 47 L91 53 L72 49 Q61 65 48 52 Q28 62 4 48Z" fill="currentColor" />
          <path d="M43 34 Q27 7 14 8 Q28 29 37 43 M60 39 Q75 4 94 5 Q80 27 69 45" fill="currentColor" />
          <circle cx="83" cy="39" r="1.8" fill="#ff6a00" />
        </svg>

        <div className="halloween-ghost ghost-one"><svg viewBox="0 0 80 100"><path d="M12 92V38C12 17 24 5 40 5S68 17 68 38V92L54 82L41 93L27 82Z" fill="currentColor"/><ellipse cx="30" cy="39" rx="4" ry="7" fill="#100811"/><ellipse cx="50" cy="39" rx="4" ry="7" fill="#100811"/><ellipse cx="40" cy="55" rx="7" ry="5" fill="#100811"/></svg></div>
        <div className="halloween-ghost ghost-two"><svg viewBox="0 0 80 100"><path d="M12 92V38C12 17 24 5 40 5S68 17 68 38V92L54 82L41 93L27 82Z" fill="currentColor"/><ellipse cx="30" cy="39" rx="4" ry="7" fill="#100811"/><ellipse cx="50" cy="39" rx="4" ry="7" fill="#100811"/><ellipse cx="40" cy="55" rx="7" ry="5" fill="#100811"/></svg></div>
        <div className="halloween-bat bat-one">🦇</div>
        <div className="halloween-bat bat-two">🦇</div>
        <div className="halloween-bat bat-three">🦇</div>
        <div className="halloween-ember ember-one" />
        <div className="halloween-ember ember-two" />
        <div className="halloween-ember ember-three" />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {backgroundFlags.map((flag, index) => (

          <div

            key={index}

            className="absolute opacity-15 animate-[floatFlag_var(--duration)_ease-in-out_infinite]"

            style={

              {

                left: flag.left,

                top: flag.top,

                "--delay": flag.delay,

                "--duration": flag.duration,

                animationDelay: flag.delay,

              } as any

            }

          >

            <Skull

              size={48}

              color={flag.color}

              fill={flag.color}

              style={{ filter: `drop-shadow(0 0 15px ${flag.color})` }}

            />

          </div>

        ))}

      </div>



      <div

        className="absolute left-1/2 top-1/2 w-[72vw] aspect-square rounded-full border opacity-[0.04] -translate-x-1/2 -translate-y-1/2 animate-[slowPulse_10s_ease-in-out_infinite]"

        style={{ borderColor: "white" }}

      />



      <div

        className="absolute left-1/2 top-1/2 w-[52vw] aspect-square rounded-full border opacity-[0.06] -translate-x-1/2 -translate-y-1/2 animate-[slowPulse_7s_ease-in-out_infinite_reverse]"

        style={{ borderColor: "white" }}

      />



      <div

        className="absolute left-1/2 top-1/2 w-[30vw] aspect-square rounded-full border opacity-[0.04] -translate-x-1/2 -translate-y-1/2 animate-[slowPulse_5s_ease-in-out_infinite]"

        style={{ borderColor: "white" }}

      />



      <div

        className="absolute inset-0 pointer-events-none z-[5]"

        style={{

          background:

            "radial-gradient(ellipse at center, transparent 30%, rgba(8,3,11,.48) 68%, rgba(8,3,11,.92) 100%)",

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

          background: `radial-gradient(circle at center, white 0%, rgba(255,106,0,0.72) 15%, transparent 75%)`,

        }}

      />



      {transitionStep && (

        <div className="absolute inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/85 backdrop-blur-3xl">

          <div

            className="absolute w-[40vw] aspect-square rounded-full blur-[120px] opacity-20 animate-[transitionGlow_2s_ease-in-out_infinite]"

            style={{ background: accentRed }}

          />



          {transitionStep === "3" || transitionStep === "2" || transitionStep === "1" ? (

            <div className="relative flex items-center justify-center">

              <div className="absolute w-[24vw] max-w-[340px] aspect-square rounded-full border border-orange-500/35" />



              <div className="absolute w-[20vw] max-w-[290px] aspect-square rounded-full border border-purple-500/25 animate-[countdownOrbit_2.1s_linear_infinite]" />



              <div

                key={`ring-${transitionStep}`}

                className="absolute w-[16vw] max-w-[240px] aspect-square rounded-full border-2 animate-[cinematicRing_700ms_ease-out_forwards]"

                style={{

                  borderColor: accentRed,

                }}

              />



              <div

                key={`tick-${transitionStep}`}

                className="absolute w-[26vw] max-w-[380px] aspect-square rounded-full animate-[countdownPulse_700ms_ease-out_forwards]"

                style={{

                  border: `1px solid ${accentRed}`,

                  opacity: 0.3,

                }}

              />



              <h1

                key={`num-${transitionStep}`}

                className="relative z-10 font-black text-white leading-none animate-[countdownThump_700ms_cubic-bezier(.16,1,.3,1)_forwards]"

                style={{

                  fontSize: "clamp(11rem, 28vw, 28rem)",

                  WebkitTextStroke: `2px ${accentRed}`,

                  textShadow: `0 0 20px ${accentRed}, 0 0 60px rgba(255,106,0,0.65)`,

                }}

              >

                {transitionStep}

              </h1>



              <div className="absolute -bottom-24 md:-bottom-28 flex items-center gap-3 text-[9px] md:text-xs font-black tracking-[0.5em] pl-[0.5em] text-orange-400/80">

                <span

                  className="w-10 md:w-16 h-px"

                  style={{

                    background: `linear-gradient(to right, transparent, ${accentRed})`,

                  }}

                />



                GECE BAŞLIYOR



                <span

                  className="w-10 md:w-16 h-px"

                  style={{

                    background: `linear-gradient(to left, transparent, ${accentRed})`,

                  }}

                />

              </div>

            </div>

          ) : (

            <div className="relative flex flex-col items-center">

              <div

                className="mb-6 h-px animate-[cinematicLine_1.8s_ease-out_forwards]"

                style={{

                  background: `linear-gradient(90deg, transparent, ${accentRed}, transparent)`,

                }}

              />



              <h2

                key={`text-${transitionStep}`}

                className="relative font-black uppercase text-center text-white animate-[cinematicText_1.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"

                style={{

                  fontSize: "clamp(3rem, 7vw, 7rem)",

                  textShadow: `0 0 40px ${accentRed}`,

                }}

              >

                {transitionStep}

              </h2>



              <div

                className="mt-6 h-px animate-[cinematicLine_1.8s_ease-out_forwards]"

                style={{

                  background: `linear-gradient(90deg, transparent, ${accentRed}, transparent)`,

                }}

              />



              <span className="absolute -bottom-14 text-xs font-bold tracking-[0.6em] pl-[0.6em] text-orange-400/70 animate-pulse">

                KORKMAYA HAZIRLAN

              </span>

            </div>

          )}

        </div>

      )}



      {message && (

        <header className="relative z-20 flex justify-between items-start animate-[messageReveal_1s_cubic-bezier(.16,1,.3,1)]">

          <div className="w-1/4"></div>



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

                style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 18px rgba(255,106,0,0.45))` }}

              />

              <span className="hidden font-serif italic text-3xl md:text-5xl font-extrabold tracking-widest text-white/90 drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] animate-[logoFloat_7s_ease-in-out_infinite]">SCAP</span>

            </div>

          </div>



          <div className="relative group w-1/4 flex justify-end">

            <div className="absolute inset-0 rounded-full blur-xl opacity-20 bg-white" />



            <div className="relative flex items-center gap-3 rounded-full border border-white/20 bg-black/60 backdrop-blur-xl px-4 md:px-5 py-2.5 md:py-3 shadow-[0_15px_50px_rgba(255,255,255,.15)]">

              <span

                className={`w-2 h-2 rounded-full transition-all duration-300 ${

                  live

                    ? "opacity-100 scale-100"

                    : "opacity-30 scale-75"

                }`}

                style={{

                  background: accentRed,

                  boxShadow: `0 0 15px ${accentRed}`,

                }}

              />



              <Radio size={15} className="text-white" />



              <span className="font-black tracking-[0.22em] text-[9px] md:text-xs text-white/90">

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

            <div

              className="relative flex items-center gap-3 rounded-full border px-6 md:px-8 py-2 md:py-3.5 mb-5 md:mb-8 backdrop-blur-2xl overflow-hidden flex-shrink-0 animate-[badgePremium_1s_cubic-bezier(.16,1,.3,1)]"

              style={{

                borderColor: `rgba(255,106,0,0.24)`,

                color: "white",

                background: `linear-gradient(90deg, rgba(255,106,0,0.22), rgba(168,85,247,0.18))`,

                boxShadow: `0 0 40px rgba(255,106,0,0.12), inset 0 0 30px rgba(255,106,0,0.07)`,

              }}

            >

              <div

                className="absolute inset-y-0 left-[-80%] w-[45%] skew-x-[-20deg] animate-[badgeSweep_4s_ease-in-out_infinite]"

                style={{

                  background:

                    "linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent)",

                }}

              />



              <Icon size={20} className="relative md:scale-125" />



              <span className="relative text-base md:text-3xl font-black tracking-[0.32em] pl-[0.32em]">

                {title}

              </span>

            </div>



            <h1

              className={`relative font-black uppercase tracking-[-0.04em] break-words max-w-[94vw] max-h-[42vh] overflow-hidden flex items-center justify-center px-1 select-none ${getContentFontSize(message.content)} animate-[messageReveal_1.15s_cubic-bezier(.16,1,.3,1)_both]`}

              style={{

                textShadow: `0 0 20px rgba(255,255,255,0.3), 0 0 65px rgba(255,106,0,0.24)`,

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

                background: `rgba(255,106,0,0.24)`,

                boxShadow: `0 0 30px rgba(255,255,255,0.3)`,

              }}

            >

              <div

                className="absolute inset-y-0 left-[-50%] w-1/2 animate-[energyPremium_2.8s_ease-in-out_infinite]"

                style={{

                  background: `linear-gradient(90deg, transparent, white, white, white, transparent)`,

                  boxShadow: `0 0 25px white`,

                }}

              />

            </div>



            <div className="mt-4 flex items-center gap-1.5 opacity-50 flex-shrink-0">

              <span

                className="w-1.5 h-1.5 rounded-full animate-bounce"

                style={{ background: "white", animationDelay: "0ms" }}

              />



              <span

                className="w-1.5 h-1.5 rounded-full animate-bounce"

                style={{ background: "white", animationDelay: "150ms" }}

              />



              <span

                className="w-1.5 h-1.5 rounded-full animate-bounce"

                style={{ background: "white", animationDelay: "300ms" }}

              />

            </div>

          </div>

        ) : (

          <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full p-6 z-50 animate-[idleEntrance_2s_cubic-bezier(.16,1,.3,1)_both]">

           

            <div

              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[800px] aspect-square rounded-full blur-[140px] opacity-15 animate-[cinematicBreathe_8s_ease-in-out_infinite]"

              style={{ background: "#ff6a00" }}

            />



            <div className="relative w-[85vw] md:w-[65vw] max-w-[900px] flex flex-col items-center animate-[cinematicLevitate_12s_ease-in-out_infinite] flex-shrink-0">

              <div className="relative w-56 md:w-80 h-16 md:h-24 flex items-center justify-center">

                <img

                  src="/scap.png"

                  alt="SCAP"

                  onError={(e: any) => {

                    e.target.style.display = 'none';

                    e.target.nextSibling.style.display = 'block';

                  }}

                  className="w-full h-full object-contain animate-pulse flex-shrink-0"

                  style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 25px rgba(255,106,0,0.5))` }}

                />

                <span className="hidden font-serif italic text-5xl md:text-7xl font-extrabold tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse">SCAP</span>

              </div>

            </div>



            <div className="mt-12 md:mt-20 relative group animate-[badgePremium_1.5s_cubic-bezier(.16,1,.3,1)_both] flex-shrink-0" style={{ animationDelay: "0.4s" }}>

             

              <div

                className="absolute -inset-1 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse"

                style={{ background: "#ff6a00" }}

              />



              <div className="relative flex items-center rounded-full border border-white/20 bg-black/50 backdrop-blur-3xl p-2 md:p-3 shadow-[0_30px_60px_rgba(255,106,0,0.12)]">

               

                <div className="relative flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/[0.05] border border-white/20 shadow-inner">

                  <HelpCircle

                    size={28}

                    style={{

                      color: "white",

                      filter: `drop-shadow(0 0 10px white)`,

                    }}

                  />

                </div>



                <div className="w-[1px] h-10 md:h-12 bg-white/[0.15] mx-4 md:mx-6" />



                <div className="flex flex-col justify-center pr-6 md:pr-10 text-left">

                  <div className="flex items-center gap-2 mb-0.5">

                    <span

                      className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse"

                      style={{ background: "#ff6a00", boxShadow: `0 0 10px #ff6a00` }}

                    />

                    <span className="text-[8px] md:text-[11px] font-black tracking-[0.4em] text-white/70 uppercase">

                      KARANLIK AKIŞ

                    </span>

                  </div>

                  <span

                    className="text-lg md:text-4xl font-black tracking-widest text-white leading-none mt-1"

                    style={{ textShadow: `0 0 20px rgba(255,106,0,0.5)` }}

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

                  background: "white",

                }}

              />



              <div

                className="relative flex items-center gap-3 md:gap-5 rounded-2xl border border-white/20 bg-black/50 backdrop-blur-xl px-3 md:px-6 py-2.5 md:py-4 transition-all duration-500 group-hover:border-white/40 group-hover:bg-white/10"

                style={{

                  boxShadow: "0 10px 40px rgba(255,255,255,.05)",

                }}

              >

                <div

                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 md:h-10 rounded-full"

                  style={{

                    background: `linear-gradient(to bottom, transparent, white, transparent)`,

                    boxShadow: `0 0 14px white`,

                  }}

                />



                <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl border border-white/[0.15] bg-white/[0.05]">

                  <MessageCircle

                    size={18}

                    style={{

                      color: "white",

                      filter: `drop-shadow(0 0 10px white)`,

                    }}

                  />



                  <span

                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"

                    style={{

                      boxShadow: `inset 0 0 18px rgba(255,255,255,0.3)`,

                    }}

                  />

                </div>



                <div className="flex flex-col gap-0.5 md:gap-1 min-w-0 text-left">

                  <span className="text-[6px] md:text-[8px] font-bold tracking-[0.35em] text-white/60">

                    MASADAN GÖNDER

                  </span>



                  <div className="flex items-center gap-2">

                    <span className="font-black text-xs md:text-lg tracking-[0.08em] text-white">

                      overheardparty.xyz/parti

                    </span>



                    <span

                      className="text-xs md:text-base opacity-80 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"

                      style={{ color: "white" }}

                    >

                      ↗

                    </span>

                  </div>

                </div>



                <div className="hidden md:flex ml-2 w-7 h-7 items-center justify-center rounded-full border border-white/20 text-white/60 group-hover:text-white group-hover:border-white/50 transition-all duration-500">

                  →

                </div>

              </div>



              <div className="flex items-center gap-2 mt-1.5 ml-2 opacity-50 group-hover:opacity-100 transition-opacity duration-500">

                <span

                  className="w-1 h-1 rounded-full"

                  style={{ background: "#ff6a00" }}

                />



                <span className="text-[6px] md:text-[7px] font-bold tracking-[0.28em] text-white/90">

                  SORU GÖNDER

                </span>

              </div>

            </a>

          </div>



          <div className="relative group">

            <div

              className="absolute inset-0 rounded-xl blur-xl opacity-15"

              style={{ background: "#ff6a00" }}

            />



            <div className="relative flex items-center gap-3">

              <span className="hidden md:block text-[7px] font-bold tracking-[0.35em] text-white/40">

                PARTNER

              </span>



              <div className="relative flex items-center justify-center min-w-[70px] md:min-w-[105px] h-[32px] md:h-[46px] rounded-xl border border-white/[0.1] bg-white/[0.05] backdrop-blur-xl px-2.5 overflow-hidden">

                <div

                  className="absolute inset-0 pointer-events-none"

                  style={{

                    background:

                      "linear-gradient(110deg, transparent 20%, rgba(255,255,255,.2) 48%, transparent 62%)",

                    backgroundSize: "240% 100%",

                    animation: "sponsorShine 4.5s ease-in-out infinite",

                  }}

                />



                <img

                  src="/D6.png"

                  alt="D6 Sosyal"

                  className="relative z-10 h-5 md:h-8 w-auto max-w-[85px] object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500 filter grayscale brightness-200"

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

  .halloween-world { color: #050407; }
  .halloween-moon {
    position: absolute; top: 3%; right: 15%; width: clamp(90px, 12vw, 190px); aspect-ratio: 1;
    border-radius: 50%; opacity: .46;
    background: radial-gradient(circle at 38% 34%, #e9e2d2 0%, #aaa69c 37%, #4d4a4b 63%, transparent 72%);
    box-shadow: 0 0 45px rgba(190,180,165,.12), 0 0 120px rgba(160,150,140,.08);
    animation: moonPulse 8s ease-in-out infinite;
  }
  .halloween-fog { position:absolute; width:75vw; height:32vh; border-radius:50%; filter:blur(55px); opacity:.12; background:linear-gradient(90deg,transparent,#7d7484,transparent); }
  .halloween-fog-one { left:-18%; bottom:5%; animation:fogCrawl 22s ease-in-out infinite alternate; }
  .halloween-fog-two { right:-25%; top:28%; opacity:.08; animation:fogCrawl 27s ease-in-out infinite alternate-reverse; }
  .halloween-raven { position:absolute; width:clamp(50px,7vw,115px); color:#020203; opacity:0; filter:drop-shadow(0 0 8px rgba(0,0,0,.95)); }
  .raven-one { top:15%; left:-15%; animation:ravenFlight 17s linear infinite; }
  .raven-two { top:34%; left:-20%; width:clamp(35px,4.5vw,75px); animation:ravenFlight 23s linear 5s infinite; }
  .raven-three { top:9%; left:-18%; width:clamp(28px,3.5vw,58px); animation:ravenFlight 19s linear 10s infinite; }
  .halloween-ghost { position:absolute; width:clamp(42px,5vw,78px); color:#d7d1dc; opacity:0; filter:drop-shadow(0 0 18px rgba(198,183,210,.3)); }
  .ghost-one { left:7%; top:26%; animation:ghostDrift 13s ease-in-out infinite; }
  .ghost-two { right:8%; top:20%; animation:ghostDrift 16s ease-in-out 4s infinite reverse; }
  .halloween-bat { position:absolute; font-size:clamp(22px,3vw,44px); opacity:0; filter:grayscale(1) brightness(.2); }
  .bat-one { top:23%; left:-8%; animation:batFlight 12s linear 1s infinite; }
  .bat-two { top:43%; left:-8%; font-size:clamp(16px,2vw,30px); animation:batFlight 15s linear 6s infinite; }
  .bat-three { top:12%; left:-8%; font-size:clamp(18px,2.4vw,36px); animation:batFlight 14s linear 9s infinite; }
  .halloween-ember { position:absolute; width:3px; height:3px; border-radius:50%; background:#ff6a00; box-shadow:0 0 12px 3px rgba(255,90,0,.5); opacity:0; }
  .ember-one { left:19%; bottom:14%; animation:emberRise 8s linear infinite; }
  .ember-two { left:74%; bottom:8%; animation:emberRise 11s linear 3s infinite; }
  .ember-three { left:48%; bottom:12%; animation:emberRise 9s linear 5s infinite; }
  @keyframes ravenFlight {
    0% { transform:translate3d(-5vw,0,0) scale(.65) rotate(-5deg); opacity:0; }
    8% { opacity:.82; }
    42% { transform:translate3d(48vw,-7vh,0) scale(1) rotate(3deg); opacity:.9; }
    78% { opacity:.78; }
    100% { transform:translate3d(125vw,5vh,0) scale(.75) rotate(-4deg); opacity:0; }
  }
  @keyframes batFlight {
    0% { transform:translate3d(-10vw,0,0) scale(.65) rotate(-8deg); opacity:0; }
    10% { opacity:.72; }
    50% { transform:translate3d(55vw,-5vh,0) scale(1.1) rotate(5deg); opacity:.85; }
    90% { opacity:.65; }
    100% { transform:translate3d(120vw,7vh,0) scale(.75) rotate(-5deg); opacity:0; }
  }
  @keyframes ghostDrift {
    0%,100% { transform:translateY(12px) rotate(-4deg); opacity:.08; }
    45% { transform:translateY(-22px) rotate(4deg); opacity:.27; }
    70% { opacity:.18; }
  }
  @keyframes fogCrawl { from { transform:translateX(-8%) translateY(0) scale(.9); } to { transform:translateX(20%) translateY(-20px) scale(1.2); } }
  @keyframes moonPulse { 0%,100% { opacity:.35; filter:brightness(.8); } 50% { opacity:.55; filter:brightness(1.08); } }
  @keyframes emberRise { 0% { transform:translateY(0) translateX(0) scale(.5); opacity:0; } 15% { opacity:.9; } 100% { transform:translateY(-65vh) translateX(45px) scale(0); opacity:0; } }


  @keyframes halloweenHaze {
    0%, 100% { transform: translate3d(-2%, 0, 0) scale(.92); opacity: .55; }
    50% { transform: translate3d(3%, 5%, 0) scale(1.12); opacity: 1; }
  }

  @keyframes spookyDrift {
    0%, 100% { transform: translateY(0) rotate(-8deg); opacity: .45; }
    50% { transform: translateY(-24px) rotate(8deg); opacity: .9; }
  }

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



  @keyframes floatFlag {

    0%, 100% {

      transform: translateY(0) rotate(0deg);

      opacity: 0.05;

    }



    50% {

      transform: translateY(-40px) rotate(15deg);

      opacity: 0.15;

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

      box-shadow: 0 0 0 rgba(255,255,255,0);

    }



    55% {

      opacity: .45;

      transform: scale(1);

      box-shadow: 0 0 80px rgba(255,106,0,.38);

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