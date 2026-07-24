"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Baby } from "lucide-react";

export default function AnonymousPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isFilteredRef = useRef(false);

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

  // 🔥 KİM DİNLERSE DİNLESİN SESİ ANINDA ANONİmLEŞTİREN FİLTRE MOTORU
  const setupFilters = () => {
    if (isFilteredRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audio);

      // Bas sesleri ve orijinal gırtlak tonunu tamamen kesen highpass filtre
      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 500; 

      // Sese o karakteristik şirin/dijital tonu veren peaking filtre
      const peaking = ctx.createBiquadFilter();
      peaking.type = "peaking";
      peaking.frequency.value = 3500;
      peaking.Q.value = 2;
      peaking.gain.value = 10;

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

    // Hangi kullanıcı olursa olsun oynat tuşuna bastığı an filtreler devreye girer
    if (!isFilteredRef.current) {
      setupFilters();
    }

    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === "suspended") {
      await ctx.resume();
    }

    // Herkes için Helyum Etkisi (Hız ve pitch ayarı)
    audio.playbackRate = 1.45;
    if ('preservesPitch' in audio) {
      audio.preservesPitch = false;
    } else if ('webkitPreservesPitch' in audio as any) {
      (audio as any).webkitPreservesPitch = false;
    }

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
    <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 p-3 rounded-xl flex items-center gap-3 shadow-inner relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <audio ref={audioRef} src={audioUrl} preload="metadata" crossOrigin="anonymous" />
      
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          togglePlay();
        }}
        className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4DA3FF] to-purple-500 text-black flex items-center justify-center shadow-md transition-transform active:scale-95 shrink-0 cursor-pointer relative z-10"
      >
        {isPlaying ? <Pause size={14} className="fill-black" /> : <Play size={14} className="fill-black ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1 relative z-10">
        <div className="flex items-center justify-between text-[10px] font-bold text-gray-300">
          <span className="flex items-center gap-1.5 text-purple-400">
            <Baby size={12} className="animate-pulse" /> Gizli Şirin Ses
          </span>
          <span className="font-mono text-[9px] text-gray-400">15s</span>
        </div>

        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#4DA3FF] to-purple-500 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}