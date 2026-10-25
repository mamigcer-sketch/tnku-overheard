"use client";

import { useEffect, useRef, useState } from "react";
import { Skull, Ghost, Zap, Radio, MessageCircle } from "lucide-react";

type PartyMessage = {
  id: string | number;
  content: string;
  location?: string | null;
};

const PARTICLES = [
  ["10%", "80%", "0s", "4s", "w-[4px] h-[4px]"],
  ["25%", "90%", "1.5s", "5s", "w-[6px] h-[6px]"],
  ["45%", "70%", "0.5s", "3s", "w-[3px] h-[3px]"],
  ["60%", "85%", "2s", "4.5s", "w-[5px] h-[5px]"],
  ["80%", "75%", "1s", "3.5s", "w-[4px] h-[4px]"],
  ["90%", "88%", "0.8s", "5s", "w-[7px] h-[7px]"],
  ["35%", "60%", "2.5s", "4s", "w-[3px] h-[3px]"],
] as const;

export default function DjScreen() {
  const [message, setMessage] = useState<PartyMessage | null>(null);
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);
  const [live, setLive] = useState(true);
  const [transitionStep, setTransitionStep] = useState<string | null>(null);
  
  const isTransitioning = useRef(false);
  const lastMsgId = useRef<string | number | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    let mounted = true;
    const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    const runTransition = async (newMsg: PartyMessage) => {
      if (!mounted) return;
      isTransitioning.current = true;
      setVisible(false);
      await delay(350);
      
      if (!mounted) return;
      setMessage(newMsg);

      let transitionTitle = "YENİ İTİRAF";
      if (["PARTY_LİNÇ", "PARTY_LINC", "PARTY_REZIL"].includes(newMsg.location ?? "")) {
        transitionTitle = "YENİ LİNÇ@";
      }
      if (newMsg.location === "PARTY_OVERHEARD") transitionTitle = "YENİ DUYDUM";
      
      setTransitionStep(transitionTitle);
      await delay(1500);
      
      if (!mounted) return;
      for (const number of ["3", "2", "1"]) {
        setTransitionStep(number);
        await delay(700);
        if (!mounted) return;
      }
      
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
        const res = await fetch("/api/parti?t=" + Date.now(), { cache: "no-store" });
        const data = await res.json();
        
        if (!mounted) return;

        if (!data?.message) {
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
            void runTransition(data.message);
          }
        }
        isInitialLoad.current = false;
      } catch (error) {
        console.error("Mesaj çekilemedi", error);
      }
    };

    void fetchMsg();
    const interval = window.setInterval(fetchMsg, 3000);
    const liveInterval = window.setInterval(() => setLive((v) => !v), 900);
    
    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.clearInterval(liveInterval);
    };
  }, []);

  const location = message?.location ?? "";
  let accent = "#ff2200"; 
  let title = "İTİRAF";
  let Icon = Skull;

  if (location.includes("LINC") || location.includes("LİNÇ") || location.includes("REZIL")) {
    accent = "#8a00e6"; 
    title = "LİNÇ@";
    Icon = Ghost;
  } else if (location.includes("OVERHEARD")) {
    accent = "#00ff22"; 
    title = "DUYDUM";
    Icon = Zap;
  }

  const content = message?.content ?? "";
  const getContentFontSize = (text: string) => {
    const len = text.length;
    if (len > 180) return "clamp(1.1rem, 2.2vw, 2.2rem)";
    if (len > 120) return "clamp(1.4rem, 2.9vw, 2.9rem)";
    if (len > 80) return "clamp(1.8rem, 3.6vw, 3.6rem)";
    if (len > 40) return "clamp(2.4rem, 5.2vw, 5.2rem)";
    return "clamp(3.5rem, 7.5vw, 8.5rem)";
  };

  return (
    <main 
      className="dj-screen relative flex min-h-screen max-h-screen flex-col justify-between overflow-hidden bg-black p-4 text-white md:p-10 select-none" 
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: "url('/halloween-bg.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-black/60 mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 pointer-events-none" />
      <div className="absolute inset-0 z-0 radial-vignette pointer-events-none" />

      <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
        {PARTICLES.map(([left, top, delay, duration, size], i) => (
          <span 
            key={i} 
            className={`absolute ${size} rounded-full bg-[#ff2200] opacity-80 animate-[emberFloat_var(--duration)_ease-in-out_infinite]`} 
            style={{ 
              left, 
              top, 
              boxShadow: `0 0 15px #ff2200, 0 0 30px #ff0000`, 
              animationDelay: delay, 
              "--duration": duration 
            } as React.CSSProperties} 
          />
        ))}
      </div>

      <div className="absolute inset-0 z-[6] pointer-events-none opacity-[.035] mix-blend-screen halloween-grain" />

      <div 
        className={`absolute inset-0 z-[100] pointer-events-none transition-opacity duration-200 ${flash ? "opacity-100" : "opacity-0"}`} 
        style={{ background: `radial-gradient(circle at center, white 0%, ${accent}99 15%, transparent 80%)` }} 
      />

      {transitionStep && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/85 backdrop-blur-md">
          {transitionStep === "PARTY" ? (
            <div className="relative flex flex-col items-center justify-center">
              <div className="relative w-[50vw] max-w-[700px] flex flex-col items-center animate-[partyIntroLogo_1.5s_cubic-bezier(.16,1,.3,1)_forwards]">
                <div className="relative mt-8 w-48 md:w-68 lg:w-80 h-14 md:h-20 flex items-center justify-center">
                  <img
                    src="/scap.png"
                    alt="SCAP"
                    onError={(e: any) => { e.currentTarget.style.display = "none"; }}
                    className="w-full h-full object-contain animate-pulse flex-shrink-0"
                    style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 25px ${accent})` }}
                  />
                </div>
              </div>
            </div>
          ) : ["3", "2", "1"].includes(transitionStep) ? (
            <div className="relative flex items-center justify-center">
              <h1
                key={`num-${transitionStep}`}
                className="relative z-10 font-black text-[#ffeaeb] leading-none animate-[countdownThump_700ms_cubic-bezier(.16,1,.3,1)_forwards]"
                style={{
                  fontSize: "clamp(12rem, 30vw, 30rem)",
                  textShadow: `0 4px 10px #000, 0 0 35px ${accent}, 0 0 80px #ff0000`,
                }}
              >
                {transitionStep}
              </h1>
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              <h2
                key={`text-${transitionStep}`}
                className="relative font-black uppercase text-center text-[#ffeaeb] animate-[cinematicText_1.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                style={{
                  fontSize: "clamp(4rem, 9vw, 9rem)",
                  textShadow: `0 4px 10px #000, 0 0 40px ${accent}, 0 0 90px #ff0000`,
                }}
              >
                {transitionStep}
              </h2>
            </div>
          )}
        </div>
      )}

      {message && (
        <header className="relative z-20 flex items-start justify-between animate-[messageReveal_1s_cubic-bezier(.16,1,.3,1)]">
          
          {/* BÜYÜTÜLEN SOL ÜST LOGO EKLENTİSİ */}
          <div className="relative flex w-1/4 justify-start">
            <div className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl p-2 md:p-3 shadow-[0_10px_30px_rgba(255,106,0,.2)] overflow-hidden">
              <img src="/5555.png" alt="5555" className="relative z-10 h-full w-full object-contain" style={{ filter: `drop-shadow(0 0 10px ${accent}80)` }} />
            </div>
          </div>
          
          <div className="absolute left-1/2 top-0 z-30 flex -translate-x-1/2 flex-col items-center md:top-1">
            <div className="flex h-12 w-40 items-center justify-center md:h-16 md:w-60 lg:w-72">
              <img 
                src="/scap.png" 
                alt="SCAP" 
                className="h-full w-full object-contain flex-shrink-0 opacity-90" 
                style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 15px ${accent})` }} 
                onError={(e) => { e.currentTarget.style.display = "none"; }} 
              />
            </div>
          </div>
          <div className="relative flex w-1/4 justify-end">
            <div className="relative flex items-center gap-3 rounded-full border border-white/10 bg-black/80 px-4 py-2.5 backdrop-blur-xl md:px-5 md:py-3" style={{ boxShadow: `0 10px 30px ${accent}40` }}>
              <span className={`h-2 w-2 rounded-full transition-all ${live ? "scale-100 opacity-100" : "scale-75 opacity-30"}`} style={{ background: accent, boxShadow: `0 0 15px ${accent}` }} />
              <Radio size={15} style={{ color: accent }} />
              <span className="text-[9px] font-black tracking-[.22em] text-white/90 md:text-xs">HALLOWEEN YAYINI</span>
            </div>
          </div>
        </header>
      )}

      <section className="relative z-10 flex max-h-[58vh] flex-1 flex-col items-center justify-center overflow-hidden px-4 text-center">
        {message ? (
          <div key={message.id} className={`flex max-h-full w-full flex-col items-center justify-center transition-all duration-700 ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-[.94] blur-md opacity-0"}`}>
            
            <div className="relative mb-5 flex flex-shrink-0 items-center gap-3 overflow-hidden rounded-full border px-6 py-2 backdrop-blur-md md:mb-8 md:px-8 md:py-3.5 bg-black/70" style={{ borderColor: `${accent}80`, color: accent, boxShadow: `0 0 35px ${accent}40, inset 0 0 20px ${accent}20` }}>
              <div className="absolute inset-y-0 left-[-80%] w-[45%] skew-x-[-20deg] animate-[badgeSweep_4s_ease-in-out_infinite]" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)" }} />
              <Icon size={20} className="relative md:scale-125" style={{ filter: `drop-shadow(0 0 8px ${accent})` }} />
              <span className="relative pl-[.32em] text-base font-black tracking-[.32em] md:text-2xl" style={{ textShadow: `0 0 15px ${accent}` }}>{title}</span>
            </div>

            <h1 
              className={`relative flex max-h-[42vh] max-w-[94vw] items-center justify-center overflow-hidden break-words px-1 font-black uppercase leading-[.98] tracking-[-.02em] animate-[messageReveal_1.15s_cubic-bezier(.16,1,.3,1)_both]`} 
              style={{ 
                color: "#fffaee",
                fontSize: getContentFontSize(content), 
                textShadow: `0px 4px 8px rgba(0,0,0,0.9), 0 0 25px ${accent}, 0 0 50px ${accent}, 0 0 90px #ff0000, 0 0 140px #aa0000`, 
                display: "-webkit-box", 
                WebkitLineClamp: 5, 
                WebkitBoxOrient: "vertical" 
              }}
            >
              {content}
            </h1>
            
            <div className="relative mt-6 h-[2px] w-36 flex-shrink-0 overflow-hidden rounded-full md:mt-10 md:w-64" style={{ background: `${accent}40`, boxShadow: `0 0 35px ${accent}60` }}>
              <div className="absolute inset-y-0 left-[-50%] w-1/2 animate-[energyPremium_2.8s_ease-in-out_infinite]" style={{ background: `linear-gradient(90deg,transparent,${accent},white,${accent},transparent)`, boxShadow: `0 0 30px ${accent}` }} />
            </div>
            
            <div className="mt-4 flex flex-shrink-0 items-center gap-1.5 opacity-60">
              {[0, 150, 300].map((delay) => <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ background: accent, animationDelay: `${delay}ms` }} />)}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 z-50 flex h-full w-full flex-col items-center justify-center p-6 animate-[idleEntrance_2s_cubic-bezier(.16,1,.3,1)_both]">
            <div className="relative flex w-[85vw] max-w-[900px] flex-shrink-0 flex-col items-center md:w-[65vw]">
              <div className="flex h-20 w-64 items-center justify-center md:h-32 md:w-96">
                <img 
                  src="/scap.png" 
                  alt="SCAP" 
                  className="h-full w-full object-contain animate-pulse flex-shrink-0" 
                  style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 45px ${accent})` }} 
                  onError={(e) => { e.currentTarget.style.display = "none"; }} 
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {message && (
        <footer className="relative z-20 flex items-end justify-between gap-4 animate-[messageReveal_1s_cubic-bezier(.16,1,.3,1)]">
          <div className="flex flex-col items-start gap-3 md:items-end">
            <a href="https://overheardparty.xyz/parti" target="_blank" rel="noopener noreferrer" aria-label="Partiye mesaj gönder" className="relative group block">
              <div className="absolute -inset-3 rounded-2xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30" style={{ background: accent }} />
              <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-black/80 px-3 py-2.5 backdrop-blur-xl transition-all duration-500 group-hover:border-white/30 md:gap-5 md:px-6 md:py-4" style={{ boxShadow: "0 10px 40px rgba(0,0,0,.5)" }}>
                <div className="absolute left-0 top-1/2 h-8 w-[2px] -translate-y-1/2 rounded-full md:h-10" style={{ background: `linear-gradient(to bottom,transparent,${accent},transparent)`, boxShadow: `0 0 14px ${accent}` }} />
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/5 md:h-10 md:w-10"><MessageCircle size={18} style={{ color: accent }} /></div>
                <div className="flex min-w-0 flex-col gap-0.5 text-left md:gap-1">
                  <span className="text-[6px] font-bold tracking-[.35em] text-white/50 md:text-[8px]">MASADAN GÖNDER</span>
                  <div className="flex items-center gap-2"><span className="text-xs font-black tracking-[.04em] text-white md:text-lg">overheardparty.xyz/parti</span><span className="text-xs md:text-base" style={{ color: accent }}>↗</span></div>
                </div>
                <div className="ml-2 hidden h-7 w-7 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all group-hover:border-white/50 md:flex">→</div>
              </div>
            </a>
          </div>
          
          <div className="w-1/4"></div>
        </footer>
      )}

      <style dangerouslySetInnerHTML={{ __html: stylesCSS }} />
    </main>
  );
}

const stylesCSS = `
  .halloween-grain {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.8'/%3E%3C/svg%3E");
    animation: grain .25s steps(2) infinite;
  }
  
  .radial-vignette {
    background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%);
  }

  @keyframes emberFloat {
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
    10% { opacity: 1; }
    50% { transform: translateY(-50vh) translateX(20px) scale(1.2); }
    100% { transform: translateY(-100vh) translateX(-20px) scale(0.5); opacity: 0; }
  }

  @keyframes countdownThump {
    0% { opacity: 0; transform: scale(2.5); filter: blur(20px); }
    25% { opacity: 1; transform: scale(1); filter: blur(0); }
    75% { opacity: 1; transform: scale(.95); filter: blur(0); }
    100% { opacity: 0; transform: scale(.5); filter: blur(15px); }
  }

  @keyframes cinematicText {
    0% { opacity: 0; transform: scale(.7); filter: blur(20px); letter-spacing: .0em; }
    20% { opacity: 1; transform: scale(1); filter: blur(0); letter-spacing: .15em; }
    80% { opacity: 1; transform: scale(1.05); filter: blur(0); letter-spacing: .15em; }
    100% { opacity: 0; transform: scale(1.2); filter: blur(15px); letter-spacing: .25em; }
  }

  @keyframes transitionGlow { 0%,100%{transform:scale(.75);opacity:.2} 50%{transform:scale(1.3);opacity:.5} }
  @keyframes idleEntrance { 0%{opacity:0;transform:scale(.9);filter:blur(20px)} 100%{opacity:1;transform:scale(1);filter:blur(0)} }
  @keyframes cinematicBreathe { 0%,100%{opacity:.15;transform:translate(-50%,-50%) scale(.9)} 50%{opacity:.35;transform:translate(-50%,-50%) scale(1.1)} }
  @keyframes cinematicLevitate { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
  @keyframes logoFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-3px) scale(1.012)} }
  @keyframes grain { 0%{transform:translate(0,0)} 25%{transform:translate(2%,-1%)} 50%{transform:translate(-1%,2%)} 75%{transform:translate(-2%,-1%)} 100%{transform:translate(0,0)} }
  @keyframes messageReveal { 0%{opacity:0;transform:scale(.6) translateY(60px);filter:blur(30px)} 45%{opacity:1;transform:scale(1.05) translateY(-10px);filter:blur(0)} 65%{transform:scale(.98)} 100%{opacity:1;transform:scale(1) translateY(0);filter:blur(0)} }
  @keyframes badgePremium { 0%{opacity:0;transform:translateY(-30px) scale(.8);filter:blur(10px)} 70%{opacity:1;transform:translateY(5px) scale(1.05);filter:blur(0)} 100%{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes badgeSweep { 0%{left:-80%} 45%,100%{left:140%} }
  @keyframes energyPremium { 0%{left:-55%;opacity:0} 20%{opacity:1} 75%{opacity:1} 100%{left:110%;opacity:0} }

  @media (prefers-reduced-motion: reduce) {
    *,*::before,*::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; }
  }
`;