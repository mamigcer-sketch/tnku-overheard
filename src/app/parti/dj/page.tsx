"use client";

import { useEffect, useRef, useState } from "react";
import { Skull, Ghost, Zap, Radio, MessageCircle, Camera } from "lucide-react";

type PartyMessage = {
  id: string | number;
  content: string;
  location?: string | null;
};

const PARTICLES = [
  ["7%", "18%", "0s", "7s"], ["15%", "67%", "1.5s", "9s"],
  ["24%", "31%", "3s", "8s"], ["33%", "79%", "2s", "10s"],
  ["42%", "13%", "4s", "7s"], ["52%", "72%", "1s", "11s"],
  ["61%", "24%", "2.5s", "8s"], ["70%", "83%", "4.5s", "10s"],
  ["79%", "38%", "1.2s", "9s"], ["88%", "70%", "3.8s", "8s"],
  ["94%", "20%", "2.2s", "11s"],
] as const;

function Crow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 70" aria-hidden="true">
      <path
        d="M5 47 C18 34 27 31 39 35 L23 12 C43 18 52 27 58 36 C65 22 80 13 99 12 L83 35 L113 30 L94 47 C77 55 65 53 56 48 C43 57 26 56 5 47Z"
        fill="#050407"
      />
      <circle cx="91" cy="37" r="1.8" fill="#ff6a00" opacity=".85" />
    </svg>
  );
}

function GhostSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 100" aria-hidden="true">
      <path d="M10 91V38C10 17 23 5 40 5S70 17 70 38V91L56 81L45 91L33 81L21 91Z" fill="#c9c0d1" />
      <ellipse cx="29" cy="39" rx="5" ry="8" fill="#332a38" />
      <ellipse cx="51" cy="39" rx="5" ry="8" fill="#332a38" />
      <ellipse cx="40" cy="56" rx="7" ry="5" fill="#332a38" />
    </svg>
  );
}

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
      if (newMsg.location === "PARTY_PHOTO") {
        transitionTitle = "GÜNÜN KARESİ 📸";
      } else if (["PARTY_LİNÇ", "PARTY_LINC", "PARTY_REZIL"].includes(newMsg.location ?? "")) {
        transitionTitle = "YENİ LİNÇ@";
      } else if (newMsg.location === "PARTY_OVERHEARD") {
        transitionTitle = "YENİ DUYDUM";
      }

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
  const isPhoto = location === "PARTY_PHOTO" || message?.content?.startsWith("data:image");

  let accent = "#ff6a00";
  let title = "İTİRAF";
  let Icon: any = Skull;

  if (isPhoto) {
    accent = "#ffaa00";
    title = "CANLI YAYIN";
    Icon = Camera;
  } else if (location.includes("LINC") || location.includes("LİNÇ") || location.includes("REZIL")) {
    accent = "#a36bff";
    title = "LİNÇ@";
    Icon = Ghost;
  } else if (location.includes("OVERHEARD")) {
    accent = "#9ee7ff";
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
    <main className="dj-screen relative flex min-h-screen max-h-screen flex-col justify-between overflow-hidden bg-[#08060b] p-4 text-white md:p-10 select-none" style={{ "--accent": accent } as React.CSSProperties}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_42%,rgba(104,42,19,.32),transparent_44%),radial-gradient(ellipse_at_82%_40%,rgba(45,25,77,.42),transparent_48%),linear-gradient(115deg,#100907,#08060b_52%,#0a0711)]" />
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 45%, ${accent}18, transparent 62%)` }} />

      {/* Moon and haunted silhouettes */}
      <div className="halloween-moon"><div className="halloween-moon-halo" /><div className="halloween-moon-core" /></div>
      <svg className="halloween-castle" viewBox="0 0 1600 420" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 420V300H90V240H125V185H160V270H205V220H245V285H330V175H360V125H390V175H425V300H510V255H560V190H590V255H650V330H770V275H820V210H850V165H880V210H915V300H1010V230H1055V175H1085V230H1120V315H1210V260H1255V205H1285V260H1330V320H1430V220H1470V165H1500V220H1535V290H1600V420Z" fill="#030206" />
        <path d="M0 390H1600V420H0Z" fill="#020104" />
      </svg>
      <div className="halloween-fog halloween-fog-one" />
      <div className="halloween-fog halloween-fog-two" />
      <div className="halloween-ground-mist" />

      <div className="halloween-birds">
        <Crow className="halloween-crow halloween-crow-1" />
        <Crow className="halloween-crow halloween-crow-2" />
        <Crow className="halloween-crow halloween-crow-3" />
        <Crow className="halloween-crow halloween-crow-4" />
        <Crow className="halloween-crow halloween-crow-5" />
      </div>
      <GhostSilhouette className="halloween-ghost halloween-ghost-left" />
      <GhostSilhouette className="halloween-ghost halloween-ghost-right" />

      <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
        {PARTICLES.map(([left, top, delay, duration], i) => (
          <span key={i} className="absolute h-1 w-1 rounded-full animate-[particleFloat_var(--duration)_ease-in-out_infinite]" style={{ left, top, background: accent, boxShadow: `0 0 14px ${accent}`, animationDelay: delay, "--duration": duration } as React.CSSProperties} />
        ))}
      </div>
      <div className="absolute inset-0 z-[4] pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 25%, rgba(3,2,6,.42) 68%, rgba(3,2,6,.88) 100%)" }} />
      <div className="absolute inset-0 z-[5] pointer-events-none opacity-[.055]" style={{ background: "repeating-linear-gradient(to bottom, transparent 0, transparent 3px, rgba(255,255,255,.16) 4px, transparent 5px)" }} />
      <div className="absolute inset-0 z-[6] pointer-events-none opacity-[.035] mix-blend-screen halloween-grain" />

      <div className={`absolute inset-0 z-[100] pointer-events-none transition-opacity duration-200 ${flash ? "opacity-100" : "opacity-0"}`} style={{ background: `radial-gradient(circle at center, white 0%, ${accent}99 15%, transparent 75%)` }} />

      {transitionStep && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center overflow-hidden bg-[#050309]/95 backdrop-blur-2xl">
          <div className="absolute h-[40vw] w-[40vw] rounded-full blur-[120px] opacity-30 animate-[transitionGlow_2s_ease-in-out_infinite]" style={{ background: accent }} />
          {["3", "2", "1"].includes(transitionStep) ? (
            <div className="relative flex items-center justify-center">
              <div className="absolute h-[24vw] w-[24vw] max-w-[340px] rounded-full border border-white/15" />
              <div className="absolute h-[20vw] w-[20vw] max-w-[290px] rounded-full border border-white/10 animate-[countdownOrbit_2.1s_linear_infinite]" />
              <div key={transitionStep} className="absolute h-[17vw] w-[17vw] max-w-[240px] rounded-full border-2 animate-[cinematicRing_700ms_ease-out_forwards]" style={{ borderColor: accent }} />
              <h1 key={`number-${transitionStep}`} className="relative z-10 font-black leading-none animate-[countdownThump_700ms_cubic-bezier(.16,1,.3,1)_forwards]" style={{ fontSize: "clamp(11rem, 28vw, 28rem)", WebkitTextStroke: `2px ${accent}`, textShadow: `0 0 25px ${accent}, 0 0 70px ${accent}90` }}>{transitionStep}</h1>
              <div className="absolute -bottom-24 flex items-center gap-3 text-[9px] font-black tracking-[.5em] text-white/65 md:text-xs"><span className="h-px w-12" style={{ background: accent }} />HAZIR OL<span className="h-px w-12" style={{ background: accent }} /></div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center px-6">
              <div className="mb-6 h-px w-48 animate-[cinematicLine_1.8s_ease-out_forwards]" style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
              <h2 key={transitionStep} className="text-center text-4xl font-black uppercase tracking-[.2em] animate-[cinematicText_1.8s_cubic-bezier(.16,1,.3,1)_forwards] md:text-7xl" style={{ textShadow: `0 0 50px ${accent}` }}>{transitionStep}</h2>
              <div className="mt-6 h-px w-48 animate-[cinematicLine_1.8s_ease-out_forwards]" style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
              <span className="absolute -bottom-14 text-xs font-bold tracking-[.6em] text-white/55">HALLOWEEN</span>
            </div>
          )}
        </div>
      )}

      {message && (
        <header className="relative z-20 flex items-start justify-between animate-[messageReveal_1s_cubic-bezier(.16,1,.3,1)]">
          <div className="relative flex w-1/4 justify-start">
            <div className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl p-2 md:p-3 shadow-[0_10px_30px_rgba(255,106,0,.2)] overflow-hidden">
              <img src="/5555.png" alt="5555" className="relative z-10 h-full w-full object-contain" style={{ filter: `drop-shadow(0 0 10px ${accent}80)` }} />
            </div>
          </div>
          
          <div className="absolute left-1/2 top-0 z-30 flex -translate-x-1/2 flex-col items-center md:top-1">
            <div className="flex h-14 w-48 items-center justify-center md:h-20 md:w-68">
              <img src="/scap.png" alt="SCAP" className="h-full w-full object-contain animate-[logoFloat_7s_ease-in-out_infinite]" style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 20px ${accent})` }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
          </div>
          <div className="relative flex w-1/4 justify-end">
            <div className="absolute inset-0 rounded-full bg-[#ff6a00] opacity-25 blur-xl" />
            <div className="relative flex items-center gap-3 rounded-full border border-white/15 bg-black/70 px-4 py-2.5 backdrop-blur-xl md:px-5 md:py-3">
              <span className={`h-2 w-2 rounded-full transition-all ${live ? "scale-100 opacity-100" : "scale-75 opacity-30"}`} style={{ background: "#ff6a00", boxShadow: "0 0 15px #ff6a00" }} />
              <Radio size={15} className="text-[#ff8a3d]" />
              <span className="text-[9px] font-black tracking-[.22em] text-white/85 md:text-xs">HALLOWEEN YAYINI</span>
            </div>
          </div>
        </header>
      )}

      {/* MERKEZ ALAN (METİN VEYA YATAY FOTOĞRAF) */}
      <section className="relative z-10 flex max-h-[64vh] flex-1 flex-col items-center justify-center overflow-hidden px-4 text-center">
        {message ? (
          <div key={message.id} className={`flex max-h-full w-full flex-col items-center justify-center transition-all duration-700 ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-[.94] blur-md opacity-0"}`}>
            
            <div className="relative mb-4 flex flex-shrink-0 items-center gap-3 overflow-hidden rounded-full border px-6 py-2 backdrop-blur-2xl md:mb-6 md:px-8 md:py-3" style={{ borderColor: `${accent}90`, color: accent, background: `${accent}15`, boxShadow: `0 0 45px ${accent}30, inset 0 0 35px ${accent}15` }}>
              <div className="absolute inset-y-0 left-[-80%] w-[45%] skew-x-[-20deg] animate-[badgeSweep_4s_ease-in-out_infinite]" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent)" }} />
              <Icon size={20} className="relative md:scale-125" />
              <span className="relative pl-[.32em] text-base font-black tracking-[.32em] md:text-2xl">{title}</span>
            </div>

            {isPhoto ? (
              /* 📸 YATAY FOTOĞRAF SAHNE ÇERÇEVESİ */
              <div className="relative max-h-[48vh] w-auto max-w-[90vw] aspect-video rounded-3xl overflow-hidden border-2 border-white/20 p-2 bg-black/60 backdrop-blur-xl shadow-[0_0_80px_rgba(255,106,0,0.35)] animate-[messageReveal_1.15s_cubic-bezier(.16,1,.3,1)_both]">
                <img 
                  src={content} 
                  alt="Sahne Fotoğrafı" 
                  className="w-full h-full object-contain rounded-2xl" 
                />
              </div>
            ) : (
              /* NORMAL METİN */
              <h1 className="relative flex max-h-[42vh] max-w-[94vw] items-center justify-center overflow-hidden break-words px-1 font-black uppercase leading-[.98] tracking-[-.04em] animate-[messageReveal_1.15s_cubic-bezier(.16,1,.3,1)_both]" style={{ fontSize: getContentFontSize(content), textShadow: `0 0 25px ${accent}50, 0 0 75px ${accent}40, 0 0 150px ${accent}30`, display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical" }}>{content}</h1>
            )}

            <div className="relative mt-5 h-[2px] w-36 flex-shrink-0 overflow-hidden rounded-full md:mt-8 md:w-64" style={{ background: `${accent}40`, boxShadow: `0 0 35px ${accent}50` }}>
              <div className="absolute inset-y-0 left-[-50%] w-1/2 animate-[energyPremium_2.8s_ease-in-out_infinite]" style={{ background: `linear-gradient(90deg,transparent,${accent},white,${accent},transparent)`, boxShadow: `0 0 30px ${accent}` }} />
            </div>
            <div className="mt-4 flex flex-shrink-0 items-center gap-1.5 opacity-60">
              {[0, 150, 300].map((delay) => <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ background: accent, animationDelay: `${delay}ms` }} />)}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 z-50 flex h-full w-full flex-col items-center justify-center p-6 animate-[idleEntrance_2s_cubic-bezier(.16,1,.3,1)_both]">
            <div className="absolute left-1/2 top-1/2 aspect-square w-[70vw] max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] animate-[cinematicBreathe_8s_ease-in-out_infinite]" style={{ background: accent, opacity: .2 }} />
            <div className="relative flex w-[85vw] max-w-[900px] flex-shrink-0 flex-col items-center md:w-[65vw]">
              <div className="flex h-16 w-56 items-center justify-center md:h-24 md:w-80">
                <img src="/scap.png" alt="SCAP" className="h-full w-full object-contain" style={{ filter: `brightness(0) invert(1) drop-shadow(0 0 35px ${accent}90)` }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
            </div>
            <a href="https://overheardparty.xyz/parti" target="_blank" rel="noopener noreferrer" className="relative group mt-12 flex-shrink-0 animate-[badgePremium_1.5s_cubic-bezier(.16,1,.3,1)_both] md:mt-20">
              <div className="absolute -inset-1 rounded-full opacity-30 blur-xl transition-opacity duration-700 group-hover:opacity-50" style={{ background: accent }} />
              <div className="relative flex items-center rounded-full border border-white/15 bg-black/65 p-2 shadow-[0_30px_60px_rgba(0,0,0,.4)] backdrop-blur-3xl md:p-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 md:h-20 md:w-20"><Skull size={28} style={{ color: accent, filter: `drop-shadow(0 0 12px ${accent})` }} /></div>
                <div className="mx-4 h-10 w-px bg-white/15 md:mx-6 md:h-12" />
                <div className="flex flex-col justify-center pr-4 text-left md:pr-10">
                  <span className="mb-1 text-[8px] font-black uppercase tracking-[.35em] text-white/55 md:text-[11px]">HALLOWEEN YAYINI</span>
                  <span className="mt-1 text-sm font-black tracking-wide text-white md:text-3xl">overheardparty.xyz/parti</span>
                </div>
              </div>
            </a>
          </div>
        )}
      </section>

      {message && (
        <footer className="relative z-20 flex items-end justify-between gap-4 animate-[messageReveal_1s_cubic-bezier(.16,1,.3,1)]">
          <div className="flex flex-col items-start gap-3 md:items-end">
            <a href="https://overheardparty.xyz/parti" target="_blank" rel="noopener noreferrer" aria-label="Partiye mesaj gönder" className="relative group block">
              <div className="absolute -inset-3 rounded-2xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30" style={{ background: accent }} />
              <div className="relative flex items-center gap-3 rounded-2xl border border-white/15 bg-black/65 px-3 py-2.5 backdrop-blur-xl transition-all duration-500 group-hover:border-white/30 md:gap-5 md:px-6 md:py-4" style={{ boxShadow: "0 10px 40px rgba(0,0,0,.3)" }}>
                <div className="absolute left-0 top-1/2 h-8 w-[2px] -translate-y-1/2 rounded-full md:h-10" style={{ background: `linear-gradient(to bottom,transparent,${accent},transparent)`, boxShadow: `0 0 14px ${accent}` }} />
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/5 md:h-10 md:w-10"><MessageCircle size={18} style={{ color: accent }} /></div>
                <div className="flex min-w-0 flex-col gap-0.5 text-left md:gap-1">
                  <span className="text-[6px] font-bold tracking-[.35em] text-white/50 md:text-[8px]">MASADAN GÖNDER</span>
                  <div className="flex items-center gap-2"><span className="text-xs font-black tracking-[.04em] text-white md:text-lg">overheardparty.xyz/parti</span><span className="text-xs md:text-base" style={{ color: accent }}>↗</span></div>
                </div>
                <div className="ml-2 hidden h-7 w-7 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all group-hover:border-white/50 md:flex">→</div>
              </div>
              <div className="ml-2 mt-1.5 flex items-center gap-2 opacity-65"><span className="h-1 w-1 rounded-full" style={{ background: accent }} /><span className="text-[6px] font-bold tracking-[.28em] text-white/55 md:text-[7px]">İTİRAF GÖNDER</span></div>
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

  .halloween-moon { position:absolute; top:3%; right:10%; width:clamp(90px,12vw,190px); aspect-ratio:1; z-index:0; pointer-events:none; animation:moonDrift 12s ease-in-out infinite; }
  .halloween-moon-halo { position:absolute; inset:-45%; border-radius:50%; background:radial-gradient(circle,rgba(255,224,190,.12),rgba(137,103,130,.06) 40%,transparent 72%); filter:blur(14px); }
  .halloween-moon-core { position:absolute; inset:0; border-radius:50%; background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.72),transparent 40%),radial-gradient(circle at 65% 70%,#8b7f86,#4b434d 70%,#25212c); opacity:.55; box-shadow:0 0 65px rgba(184,158,178,.12); }
  .halloween-castle { position:absolute; z-index:0; bottom:0; left:0; width:100%; height:37%; pointer-events:none; opacity:.6; }
  .halloween-fog { position:absolute; z-index:1; left:-35%; width:170%; height:24%; pointer-events:none; filter:blur(32px); opacity:.2; background:linear-gradient(180deg,transparent,rgba(118,111,132,.2),rgba(92,65,75,.12),transparent); will-change:transform; }
  .halloween-fog-one { bottom:8%; animation:fogTravelOne 27s linear infinite alternate; }
  .halloween-fog-two { bottom:22%; opacity:.12; animation:fogTravelTwo 34s linear infinite alternate; }
  .halloween-ground-mist { position:absolute; z-index:2; inset:auto 0 0; height:28%; pointer-events:none; background:linear-gradient(to top,rgba(16,10,17,.8),rgba(48,31,39,.17) 45%,transparent); }
  .halloween-birds { position:absolute; inset:0; z-index:2; overflow:hidden; pointer-events:none; }
  .halloween-crow { position:absolute; width:clamp(35px,5vw,82px); height:auto; opacity:0; filter:drop-shadow(0 0 5px rgba(0,0,0,.9)); will-change:transform; }
  .halloween-crow-1 { top:13%; animation:crowFlightOne 19s linear infinite; }
  .halloween-crow-2 { top:26%; animation:crowFlightTwo 25s linear infinite; animation-delay:-9s; }
  .halloween-crow-3 { top:9%; animation:crowFlightThree 22s linear infinite; animation-delay:-14s; }
  .halloween-crow-4 { top:38%; animation:crowFlightOne 28s linear infinite; animation-delay:-18s; width:clamp(25px,3vw,52px); }
  .halloween-crow-5 { top:19%; animation:crowFlightTwo 31s linear infinite; animation-delay:-5s; width:clamp(22px,2.5vw,42px); }
  .halloween-ghost { position:absolute; z-index:2; width:clamp(35px,4.5vw,75px); pointer-events:none; opacity:0; filter:blur(.5px) drop-shadow(0 0 20px rgba(174,155,190,.08)); will-change:transform,opacity; }
  .halloween-ghost-left { left:7%; top:24%; animation:ghostAppearLeft 18s ease-in-out infinite; }
  .halloween-ghost-right { right:8%; top:17%; animation:ghostAppearRight 23s ease-in-out infinite; animation-delay:-11s; }

  @keyframes moonDrift { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
  @keyframes fogTravelOne { from{transform:translateX(-8%) scaleY(.9)} to{transform:translateX(8%) scaleY(1.2)} }
  @keyframes fogTravelTwo { from{transform:translateX(7%) scaleY(1.1)} to{transform:translateX(-9%) scaleY(.85)} }
  @keyframes crowFlightOne { 0%{transform:translate3d(-15vw,0,0) rotate(-5deg) scale(.7);opacity:0} 8%{opacity:.8} 45%{transform:translate3d(48vw,-5vh,0) rotate(3deg) scale(1)} 90%{opacity:.65} 100%{transform:translate3d(120vw,3vh,0) rotate(-4deg) scale(.75);opacity:0} }
  @keyframes crowFlightTwo { 0%{transform:translate3d(115vw,0,0) scaleX(-1) scale(.8);opacity:0} 10%{opacity:.7} 50%{transform:translate3d(45vw,4vh,0) scaleX(-1) scale(1.1)} 90%{opacity:.6} 100%{transform:translate3d(-20vw,-2vh,0) scaleX(-1) scale(.7);opacity:0} }
  @keyframes crowFlightThree { 0%{transform:translate3d(-10vw,0,0) scale(.55);opacity:0} 12%{opacity:.5} 50%{transform:translate3d(55vw,7vh,0) scale(.8)} 90%{opacity:.4} 100%{transform:translate3d(120vw,-2vh,0) scale(.5);opacity:0} }
  @keyframes ghostAppearLeft { 0%,100%{opacity:0;transform:translate3d(-10px,15px,0) scale(.9)} 15%,35%{opacity:.4;transform:translate3d(5px,-5px,0) scale(1)} 55%{opacity:.15;transform:translate3d(25px,-15px,0) scale(1.08)} 70%{opacity:0} }
  @keyframes ghostAppearRight { 0%,100%{opacity:0;transform:translate3d(12px,12px,0) scale(.85)} 18%,38%{opacity:.35;transform:translate3d(-8px,-8px,0) scale(1)} 58%{opacity:.12;transform:translate3d(-25px,-18px,0) scale(1.1)} 75%{opacity:0} }

  @keyframes premiumAmbient { 0%,100%{transform:scale(1);opacity:.52} 50%{transform:scale(1.16);opacity:.9} }
  @keyframes stageLightLeft { 0%,100%{transform:translateX(-12%) rotate(-25deg) scale(1);opacity:.08} 50%{transform:translateX(18%) rotate(-17deg) scale(1.08);opacity:.17} }
  @keyframes stageLightRight { 0%,100%{transform:translateX(12%) rotate(25deg) scale(1);opacity:.07} 50%{transform:translateX(-18%) rotate(17deg) scale(1.08);opacity:.15} }
  @keyframes centerBeam { 0%,100%{transform:translate(-50%,-50%) scaleX(.65);opacity:.03} 50%{transform:translate(-50%,-50%) scaleX(1.25);opacity:.09} }
  @keyframes lightSweep { 0%{transform:translateX(-20%) rotate(25deg);opacity:0} 25%{opacity:.04} 50%{opacity:.06} 80%{opacity:.02} 100%{transform:translateX(280%) rotate(25deg);opacity:0} }
  @keyframes countdownThump { 0%{opacity:0;transform:scale(1.8);filter:blur(20px)} 25%{opacity:1;transform:scale(1);filter:blur(0)} 75%{opacity:1;transform:scale(.95);filter:blur(0)} 100%{opacity:0;transform:scale(.8);filter:blur(10px)} }
  @keyframes cinematicRing { 0%{opacity:1;transform:scale(.2);border-width:10px} 100%{opacity:0;transform:scale(2.2);border-width:0} }
  @keyframes cinematicText { 0%{opacity:0;transform:scale(.85);filter:blur(15px);letter-spacing:.1em;padding-left:.1em} 15%{opacity:1;transform:scale(1);filter:blur(0);letter-spacing:.28em;padding-left:.28em} 85%{opacity:1;transform:scale(1);filter:blur(0);letter-spacing:.28em;padding-left:.28em} 100%{opacity:0;transform:scale(1.1);filter:blur(10px);letter-spacing:.35em;padding-left:.35em} }
  @keyframes cinematicLine { 0%{width:0;opacity:0} 15%{width:250px;opacity:1} 85%{width:250px;opacity:1} 100%{width:350px;opacity:0} }
  @keyframes transitionGlow { 0%,100%{transform:scale(.75);opacity:.1} 50%{transform:scale(1.15);opacity:.35} }
  @keyframes countdownOrbit { to{transform:rotate(360deg)} }
  @keyframes idleEntrance { 0%{opacity:0;transform:scale(.9);filter:blur(20px)} 100%{opacity:1;transform:scale(1);filter:blur(0)} }
  @keyframes cinematicBreathe { 0%,100%{opacity:.15;transform:translate(-50%,-50%) scale(.9)} 50%{opacity:.35;transform:translate(-50%,-50%) scale(1.1)} }
  @keyframes logoFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-3px) scale(1.012)} }
  @keyframes particleFloat { 0%,100%{transform:translate3d(0,0,0);opacity:0} 20%{opacity:.45} 50%{transform:translate3d(12px,-35px,0);opacity:.8} 80%{opacity:.35} }
  @keyframes grain { 0%{transform:translate(0,0)} 25%{transform:translate(2%,-1%)} 50%{transform:translate(-1%,2%)} 75%{transform:translate(-2%,-1%)} 100%{transform:translate(0,0)} }
  @keyframes messageReveal { 0%{opacity:0;transform:scale(.68) translateY(50px);filter:blur(24px)} 45%{opacity:1;transform:scale(1.035) translateY(-6px);filter:blur(0)} 65%{transform:scale(.985)} 100%{opacity:1;transform:scale(1) translateY(0);filter:blur(0)} }
  @keyframes badgePremium { 0%{opacity:0;transform:translateY(-22px) scale(.82);filter:blur(8px)} 70%{opacity:1;transform:translateY(2px) scale(1.02);filter:blur(0)} 100%{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes badgeSweep { 0%{left:-80%} 45%,100%{left:140%} }
  @keyframes energyPremium { 0%{left:-55%;opacity:0} 20%{opacity:1} 75%{opacity:1} 100%{left:110%;opacity:0} }
  @keyframes sponsorShine { 0%,65%{background-position:200% 0;opacity:0} 75%{opacity:.7} 100%{background-position:-50% 0;opacity:0} }

  @media (prefers-reduced-motion: reduce) {
    *,*::before,*::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; }
    .halloween-crow,.halloween-ghost { opacity:.25; }
  }
`;