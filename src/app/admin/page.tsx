"use client";

import { useEffect, useState } from 'react';
import { adminAddVote, getVoteStats, resetVotes } from '../parti/actions';
import { ShieldAlert, Flame, Disc, Music2, RefreshCw, Trash2, PlusCircle } from 'lucide-react';

export default function PartyAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const data = await getVoteStats();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    const auth = sessionStorage.getItem('tnku_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchStats();
      const interval = setInterval(fetchStats, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "admin2026") {
      setIsAuthenticated(true);
      sessionStorage.setItem('tnku_admin_auth', 'true');
      fetchStats();
    } else {
      alert("Yanlış Şifre!");
    }
  };

  const handleAddVote = async (genre: 'POP' | 'RAP' | 'ROCK') => {
    await adminAddVote(genre);
    fetchStats();
  };

  const handleReset = async () => {
    if (confirm("Tüm oyları sıfırlamak istediğine emin misin?")) {
      await resetVotes();
      fetchStats();
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-black mb-8 tracking-widest">DJ & ADMIN GİRİŞİ</h1>
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <input 
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Admin Şifresi"
            className="w-full bg-[#111] border border-white/20 rounded-xl p-4 text-center text-xl tracking-widest outline-none focus:border-red-500 transition-colors"
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all">GİRİŞ YAP</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8 pb-24">
      <div className="max-w-xl mx-auto">
        
        <header className="flex items-center justify-between py-6 border-b border-white/10 mb-8">
          <h1 className="text-xl font-black tracking-widest text-red-500 flex items-center gap-2">
            <ShieldAlert size={24} /> OY KONTROL PANELİ 
          </h1>
          
          <button 
            onClick={fetchStats}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-gray-400" />
          </button>
        </header>

        {/* Canlı Sayaç Özeti */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-8 text-center">
          <span className="text-xs text-gray-400 font-bold tracking-widest block mb-1">TOPLAM OY SAYISI</span>
          <h2 className="text-5xl font-black text-white">{stats?.totalVotes || 0}</h2>
        </div>

        {/* Manuel Oy Ekleme Butonları (Manipülasyon) */}
        <h3 className="text-sm font-black tracking-widest text-gray-400 mb-4 uppercase">⚡ Manuel Oy Ekle (Manipüle Et)</h3>
        <div className="space-y-4 mb-8">
          
          <button 
            onClick={() => handleAddVote('POP')}
            className="w-full flex items-center justify-between bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/40 p-4 rounded-xl transition-all font-black text-pink-400"
          >
            <div className="flex items-center gap-3"><Flame size={20} /> TÜRKÇE POP'A OY EKLE</div>
            <PlusCircle size={20} />
          </button>

          <button 
            onClick={() => handleAddVote('RAP')}
            className="w-full flex items-center justify-between bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 p-4 rounded-xl transition-all font-black text-purple-400"
          >
            <div className="flex items-center gap-3"><Disc size={20} /> TÜRKÇE RAP'E OY EKLE</div>
            <PlusCircle size={20} />
          </button>

          <button 
            onClick={() => handleAddVote('ROCK')}
            className="w-full flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 p-4 rounded-xl transition-all font-black text-amber-400"
          >
            <div className="flex items-center gap-3"><Music2 size={20} /> TÜRKÇE ROCK'A OY EKLE</div>
            <PlusCircle size={20} />
          </button>

        </div>

        {/* Sıfırlama Butonu */}
        <button 
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-600 border border-red-500/40 text-red-200 py-4 rounded-xl font-black tracking-widest transition-all"
        >
          <Trash2 size={20} /> TÜM OYLARI SIFIRLA
        </button>

      </div>
    </main>
  );
}