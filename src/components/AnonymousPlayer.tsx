"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Baby } from "lucide-react";

export default function AnonymousPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isFilteredRef = useRef(false); // 🔥 Filtrelerin sadece 1 kez kurulmasını sağlar

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      // 🔥 DİKKAT: Tarayıcı bug'ını tetiklememek için burada başa sarmıyoruz!
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const setupFilters = () => {
    if (isFilteredRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audio);

      // 🔥 KİMLİĞİ GİZLEYEN ANA FİLTRE: Gırtlak ve bas seslerini tamamen yok eder
      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 500; 

      // 🔥 ANONİM PARLAKLIK FİLTRESİ: Sese dijital ve şirin bir efekt katar
      const peaking = ctx.createBiquadFilter();
      peaking.type = "peaking";
      peaking.frequency.value = 3500;
      peaking.Q.value = 2;
      peaking.gain.value = 10;

      // Kabloları BİR KERE bağla ve mühürle
      source.connect(highpass);
      highpass.connect(peaking);
      peaking.connect(ctx.destination);

      isFilteredRef.current = true;
    } catch (error) {
      console.error("Filtre kurulum hatası:", error);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // İlk oynatmada Web Audio maskesini giydir
    if (!isFilteredRef.current) {
      setupFilters();
    }

    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === "suspended") {
      await ctx.resume();
    }

    // Anonimleşme Etkisi (Helyum hızlandırması)
    audio.playbackRate = 1.45;
    if ('preservesPitch' in audio) {
      audio.preservesPitch = false;
    } else if ('webkitPreservesPitch' in audio as any) {
      (audio as any).webkitPreservesPitch = false;
    }

    // 🚀 İŞTE KARIŞMAYI ÇÖZEN SİHİRLİ DOKUNUŞ:
    // Eğer ses bittiyse tam 0'a değil, 0.05'e sarıyoruz. 
    // Tarayıcı bu sayede eski sesi hafızada tutmuyor ve sesler ASLA üst üste binmiyor!
    if (audio.currentTime >= audio.duration || audio.ended) {
      audio.currentTime = 0.05;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Oynatma hatası:", err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500/10 via-black/40 to-[#4DA3FF]/10 border border-purple-500/30 p-3.5 rounded-2xl flex items-center gap-3.5 shadow-inner backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* crossOrigin CORS takılmalarını engeller */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" crossOrigin="anonymous" />
      
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          togglePlay();
        }}
        className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4DA3FF] to-purple-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(77,163,255,0.4)] transition-transform active:scale-95 shrink-0 cursor-pointer relative z-10"
      >
        {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-300">
          <span className="flex items-center gap-1.5 text-purple-400">
            <Baby size={14} className="animate-pulse" /> Tam Korumalı Şirin Ses
          </span>
          <span className="font-mono text-[10px] text-gray-400">15s</span>
        </div>

        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#4DA3FF] to-purple-500 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}