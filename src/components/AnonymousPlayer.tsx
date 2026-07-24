"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

export default function AnonymousPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Mobil oynatma hatası:", err);
        alert("Ses çalınamadı, tarayıcınız bu formatı desteklemiyor olabilir.");
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500/10 via-black/40 to-[#4DA3FF]/10 border border-white/10 p-3.5 rounded-2xl flex items-center gap-3.5 shadow-inner backdrop-blur-xl">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <button
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4DA3FF] to-purple-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(77,163,255,0.4)] transition-transform active:scale-95 shrink-0 cursor-pointer"
      >
        {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-300">
          <span className="flex items-center gap-1 text-[#4DA3FF]">
            <Volume2 size={13} className="animate-pulse" /> Anonim Sesli Fısıltı
          </span>
          <span className="font-mono text-[10px] text-gray-400">15s</span>
        </div>

        {/* İlerleme Çubuğu */}
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