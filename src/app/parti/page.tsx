"use client";

import { useEffect, useState } from 'react';
import { castVote } from '../actions';
import { Sparkles, CheckCircle2, Music2, Flame, Disc } from 'lucide-react';

export default function PartyVotePage() {
  const [userUuid, setUserUuid] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('tnku_vote_uuid');
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('tnku_vote_uuid', id);
    }
    return id;
  });

  const [userVote, setUserVote] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [flyingEmojis, setFlyingEmojis] = useState<{ id: number; emoji: string }[]>([]);

  const fetchStats = async () => {
    if (!userUuid) return;
    try {
      const res = await fetch(`/api/parti?uuid=${userUuid}&t=${Date.now()}`);
      const data = await res.json();
      if (data) {
        setStats(data.stats);
        setUserVote(data.userVote);
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  };

  useEffect(() => {
    if (!userUuid) return;
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [userUuid]);

  const handleVote = async (genre: 'POP' | 'RAP' | 'ROCK') => {
    if (loading || !userUuid) return;
    setLoading(true);
    setUserVote(genre); 
    
    try {
      const result = await castVote(userUuid, genre);
      if (result && result.error) {
        console.error("Server error:", result.error);
      }
      await fetchStats();
    } catch (err) {
      console.error("Voting error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendEmojiReaction = async (emoji: string) => {
    // Local animation sa sariling screen
    const id = Date.now() + Math.random();
    setFlyingEmojis((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFlyingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 1500);

    // Ipadala sa server para lumabas sa DJ Screen
    try {
      await fetch('/api/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
    } catch (e) {
      console.error("Reaction send error:", e);
    }
  };

  const options = [
    { id: 'POP', title: 'TÜRKÇE POP', icon: Flame, color: 'from-pink-500 to-rose-600', border: 'border-pink-500', bg: 'bg-pink-500/10' },
    { id: 'RAP', title: 'TÜRKÇE RAP', icon: Disc, color: 'from-purple-500 to-indigo-600', border: 'border-purple-500', bg: 'bg-purple-500/10' },
    { id: 'ROCK', title: 'TÜRKÇE ROCK', icon: Music2, color: 'from-amber-500 to-red-600', border: 'border-amber-500', bg: 'bg-amber-500/10' }
  ];

  const reactionEmojis = [
    { emoji: '🔥', label: 'Ateş' },
    { emoji: '🕺', label: 'Oynatır' },
    { emoji: '🍅', label: 'Domates' },
    { emoji: '🗑️', label: 'Çöp' },
  ];

  const getAmbientGlow = () => {
    if (userVote === 'POP') return 'bg-pink-600/15';
    if (userVote === 'RAP') return 'bg-purple-600/15';
    if (userVote === 'ROCK') return 'bg-amber-600/15';
    return 'bg-purple-900/20';
  };

  return (
    <main className="min-h-screen bg-[#050208] text-white flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden select-none">
      <div className={`fixed inset-0 transition-colors duration-700 bg-gradient-to-b ${getAmbientGlow()} to-[#030303] pointer-events-none blur-3xl`} />

      {/* Local flying emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
        {flyingEmojis.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-12 text-4xl"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              animation: 'floatUp 1.5s ease-out forwards'
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      <div className="w-full max-w-[500px] bg-[#09070c]/85 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-7 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-3 text-purple-400 shadow-inner">
            <Sparkles size={28} className="animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-wider text-white mb-1">
            PARTİDE NE ÇALSIN?
          </h1>
          <p className="text-gray-400 text-xs font-medium">Tarzını seç, oyunu kullan! İstediğin an değiştirebilirsin.</p>
        </div>

        {/* Voting Options */}
        <div className="space-y-3 mb-6">
          {options.map((item) => {
            const isSelected = userVote === item.id;
            const percent = stats ? stats[item.id]?.percent || 0 : 0;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleVote(item.id as any)}
                className={`w-full group relative overflow-hidden rounded-2xl p-4 border text-left transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                  isSelected 
                    ? `${item.border} ${item.bg} shadow-[0_0_35px_rgba(168,85,247,0.25)] scale-[1.02]` 
                    : 'border-white/10 bg-black/40 hover:border-white/20 hover:bg-black/60'
                }`}
              >
                <div 
                  className={`absolute left-0 top-0 bottom-0 opacity-20 bg-gradient-to-r ${item.color} transition-all duration-700 ease-out`}
                  style={{ width: `${percent}%` }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-colors duration-300 ${isSelected ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-white/80 group-hover:bg-white/10'}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-base tracking-wide text-white">{item.title}</h3>
                      {isSelected && (
                        <span className="text-[10px] font-black tracking-widest text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={12} /> SENİN OYUN
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black tracking-tight text-white">{percent}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Reaction Emoji Buttons */}
        <div className="border-t border-white/10 pt-5">
          <p className="text-center text-[11px] text-gray-400 font-bold tracking-widest uppercase mb-3">
            Şarkıya Anlık Tepki Patlat ⚡
          </p>
          <div className="grid grid-cols-4 gap-2">
            {reactionEmojis.map((item, idx) => (
              <button
                key={idx}
                onClick={() => sendEmojiReaction(item.emoji)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 active:scale-90 transition-all cursor-pointer group"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">{item.emoji}</span>
                <span className="text-[9px] font-bold text-gray-400 mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      <style jsx global>{`
        @keyframes floatUp {
          0% { transform: translateY(0px) scale(0.8); opacity: 1; }
          100% { transform: translateY(-250px) scale(1.4); opacity: 0; }
        }
      `}</style>
    </main>
  );
}