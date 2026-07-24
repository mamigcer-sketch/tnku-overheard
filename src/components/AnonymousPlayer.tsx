"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Sparkles } from "lucide-react";

export default function AnonymousPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

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

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // 🔥 Web Audio API ile ses değiştirme (İnce/Hacker Sesi için playbackRate'i artırıyoruz)
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
        try {
          sourceNodeRef.current = audioCtxRef.current.createMediaElementSource(audio);
          sourceNodeRef.current.connect(audioCtxRef.current.destination);
        } catch (e) {
          // Zaten bağlıysa hata vermesin
        }
      }
    }

    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    // 🔥 Sesi inceleştirmek (hacker efekti) için hızı hafif artırıyoruz (örn: 1.25x - 1.3x)
    audio.playbackRate = 1.25; 
    audio.preservesPitch = false; // Sesi chipmunk gibi inceltirken tonu korumasın, iyice hacker yapsın

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Oynatma hatası:", err);
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500/10 via-black/40 to-[#4DA3FF]/10 border border-purple-500/30 p-3.5 rounded-2xl flex items-center gap-3.5 shadow-inner backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <audio ref={audioRef} src={audioUrl} preload="metadata" crossOrigin="anonymous" />
      
      <button
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4DA3FF] to-purple-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(77,163,255,0.4)] transition-transform active:scale-95 shrink-0 cursor-pointer relative z-10"
      >
        {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-300">
          <span className="flex items-center gap-1.5 text-purple-400">
            <Sparkles size={13} className="animate-spin" /> Anonim İnce Ses (Hacker Modu)
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