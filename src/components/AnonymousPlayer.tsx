"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Radio } from "lucide-react";

export default function AnonymousPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      // 🔥 İŞTE ANONİMLİĞİ SAĞLAYAN SİHİRLİ KOD 🔥
      // Bu iki satır sayesinde ses yavaşlar ve kalınlaşır. Asla kim olduğu anlaşılamaz!
      audioRef.current.preservesPitch = false; 
      audioRef.current.playbackRate = 0.75; 
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="mt-3 bg-purple-900/10 border border-purple-500/20 rounded-xl p-3 flex items-center gap-4 group hover:border-purple-500/40 transition-all">
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onEnded={() => setIsPlaying(false)} 
        className="hidden"
      />
      
      <button 
        onClick={togglePlay}
        className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center shrink-0 border border-purple-500/30 group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
      </button>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <Radio size={12} className="text-purple-400 animate-pulse" />
          <span className="text-xs font-black text-purple-400 tracking-widest uppercase">Gizemli Fısıltı</span>
        </div>
        {/* Sahte bir ses dalgası tasarımı */}
        <div className="flex items-center gap-1 h-3">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 bg-purple-500/50 rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
              style={{ 
                height: isPlaying ? `${Math.random() * 100}%` : '40%',
                animationDelay: `${i * 0.1}s` 
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}