"use client";

import { useEffect, useState } from 'react';
import { castVote } from './actions';
import { Sparkles, CheckCircle2, Music2, Flame, Disc } from 'lucide-react';

export default function PartyVotePage() {
  const [userUuid, setUserUuid] = useState<string>('');
  const [userVote, setUserVote] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem('tnku_vote_uuid');
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('tnku_vote_uuid', id);
    }
    setUserUuid(id);
  }, []);

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
      console.error("Veri çekme hatası:", e);
    }
  };

  useEffect(() => {
    if (!userUuid) return;
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [userUuid]);

  const handleVote = async (genre: 'POP' | 'RAP' | 'ROCK') => {
    if (loading) return;
    setLoading(true);
    setUserVote(genre); // Anında görsel tepki (optimistic update)
    
    try {
      await castVote(userUuid, genre);
      await fetchStats();
    } catch (err) {
      console.error("Oy verme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const options = [
    { id: 'POP', title: 'TÜRKÇE POP', icon: Flame, color: 'from-pink-500 to-rose-600', border: 'border-pink-500', bg: 'bg-pink-500/10' },
    { id: 'RAP', title: 'TÜRKÇE RAP', icon: Disc, color: 'from-purple-500 to-indigo-600', border: 'border-purple-500', bg: 'bg-purple-500/10' },
    { id: 'ROCK', title: 'TÜRKÇE ROCK', icon: Music2, color: 'from-amber-500 to-red-600', border: 'border-amber-500', bg: 'bg-amber-500/10' }
  ];

  return (
    <main className="min-h-screen bg-[#050208] text-white flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/20 to-[#030303] pointer-events-none" />

      <div className="w-full max-w-[500px] bg-[#09070c]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-7 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-3 text-purple-400">
            <Sparkles size={28} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-wider text-white mb-1">
            PARTİDE NE ÇALSIN?
          </h1>
          <p className="text-gray-400 text-xs font-medium">Tarzını seç, oyunu kullan! Dilediğin zaman oyunu değiştirebilirsin.</p>
        </div>

        {/* Oylama Seçenekleri */}
        <div className="space-y-4">
          {options.map((item) => {
            const isSelected = userVote === item.id;
            const percent = stats ? stats[item.id]?.percent || 0 : 0;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleVote(item.id as any)}
                className={`w-full relative overflow-hidden rounded-2xl p-5 border text-left transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                  isSelected 
                    ? `${item.border} ${item.bg} shadow-[0_0_30px_rgba(168,85,247,0.2)]` 
                    : 'border-white/10 bg-black/40 hover:border-white/20'
                }`}
              >
                {/* Yüzde Doluluk Barı */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 opacity-15 bg-gradient-to-r ${item.color} transition-all duration-700`}
                  style={{ width: `${percent}%` }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-white text-black' : 'bg-white/5 text-white/70'}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-lg tracking-wide">{item.title}</h3>
                      {isSelected && (
                        <span className="text-[10px] font-black tracking-widest text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={12} /> SENİN OYUN
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black tracking-tight">{percent}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {userVote && (
          <p className="text-center text-xs text-gray-500 mt-6 font-bold tracking-widest uppercase">
            💡 Tıklayarak oyunu istediğin an değiştirebilirsin
          </p>
        )}

      </div>
    </main>
  );
}