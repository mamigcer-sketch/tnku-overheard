"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Dices, Skull, Flame, AlertTriangle, Zap, Coins } from 'lucide-react';
import { getUserPoints, rollRoulette } from './actions';

export default function KaranlikOdaPage() {
  const [points, setPoints] = useState<number>(0);
  const [bet, setBet] = useState<number>(0);
  const [isRolling, setIsRolling] = useState(false);
  const [slotNumber, setSlotNumber] = useState("00000");
  const [result, setResult] = useState<{ isWin: boolean; amount: number; newTotal: number } | null>(null);

  useEffect(() => {
    getUserPoints().then(p => setPoints(p));
  }, []);

  // Slot makinesi gibi sayıları döndürme efekti
  useEffect(() => {
    let interval: any;
    if (isRolling) {
      interval = setInterval(() => {
        setSlotNumber((Math.floor(Math.random() * 90000) + 10000).toString());
      }, 50);
    } else {
      setSlotNumber("00000");
    }
    return () => clearInterval(interval);
  }, [isRolling]);

  const handleBetChange = (amount: number) => {
    if (isRolling) return;
    if (amount > points) setBet(points);
    else if (amount < 0) setBet(0);
    else setBet(amount);
  };

  const handleRoll = async () => {
    if (bet <= 0 || bet > points || isRolling) return;
    
    setIsRolling(true);
    setResult(null);

    // Sunucuya zarı at
    const res = await rollRoulette(bet);

    // ŞOV İÇİN EKRANI 2.5 SANİYE BEKLETİYORUZ (Heyecan Yaratma)
    setTimeout(() => {
      setIsRolling(false);
      if (res.success) {
        setPoints(res.newPoints!);
        setResult({ isWin: res.isWin!, amount: res.betAmount!, newTotal: res.newPoints! });
        setBet(0);
      } else {
        alert(res.error);
      }
    }, 2500);
  };

  return (
    <main className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${
      isRolling ? 'bg-red-950 animate-shake' : result?.isWin ? 'bg-emerald-950' : result?.isWin === false ? 'bg-[#050000]' : 'bg-[#050505]'
    }`}>
      
      {/* CSS ANİMASYONLARI (Titreme Efekti İçin) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px) rotate(-1deg); }
          50% { transform: translateX(4px) rotate(1deg); }
          75% { transform: translateX(-4px) rotate(-1deg); }
        }
        .animate-shake { animation: shake 0.3s infinite; }
      `}} />

      {/* ARKA PLAN IŞIKLARI */}
      <div className="absolute top-0 left-0 right-0 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#050505] to-[#050505] pointer-events-none -z-10"></div>

      <header className="px-4 py-4 flex items-center justify-between relative z-10">
        <Link href="/" className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors border border-white/10">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full">
          <Flame size={16} className="text-amber-500" />
          <span className="font-black text-amber-500 tracking-wider">{points} XP</span>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-4 pb-20 relative z-10 flex flex-col items-center">
        
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black text-red-500 tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center gap-3">
            <Skull size={28} className={isRolling ? "animate-spin" : ""} /> Karanlık Oda <Skull size={28} className={isRolling ? "animate-spin" : ""} />
          </h1>
          <p className="text-gray-500 text-xs mt-2 font-medium">Masada dönen XP'nin garantisi yoktur. Kasa her zaman kazanır.</p>
        </div>

        {/* 🎰 DEV SLOT EKRANI 🎰 */}
        <div className={`w-full h-40 rounded-[32px] border-4 flex items-center justify-center mb-8 relative overflow-hidden transition-all duration-300 shadow-2xl ${
          isRolling ? 'border-red-500 bg-red-900/20 shadow-[0_0_50px_rgba(239,68,68,0.4)]' :
          result?.isWin ? 'border-emerald-500 bg-emerald-900/20 shadow-[0_0_50px_rgba(16,185,129,0.4)]' :
          result?.isWin === false ? 'border-red-600 bg-black shadow-[0_0_50px_rgba(220,38,38,0.2)]' :
          'border-white/10 bg-black/50'
        }`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
          
          {isRolling ? (
            <div className="text-6xl font-black text-red-500 tracking-widest font-mono blur-[1px]">
              {slotNumber}
            </div>
          ) : result ? (
            <div className="text-center animate-in zoom-in duration-300">
              <h2 className={`text-4xl font-black uppercase tracking-widest drop-shadow-lg ${result.isWin ? 'text-emerald-400' : 'text-red-500'}`}>
                {result.isWin ? 'KAZANDIN!' : 'KAYBETTİN'}
              </h2>
              <p className={`text-xl font-bold mt-2 ${result.isWin ? 'text-emerald-300' : 'text-red-400'}`}>
                {result.isWin ? '+' : '-'}{result.amount} XP
              </p>
            </div>
          ) : (
            <div className="text-4xl font-black text-white/20 tracking-widest font-mono">
              [ 00000 ]
            </div>
          )}
        </div>

        {/* BAHİS PANELİ */}
        <div className={`w-full bg-[#0A0A0A] p-6 rounded-[32px] border border-white/5 shadow-xl transition-opacity duration-300 ${isRolling ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="mb-5">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-2 text-center">Masaya Koyulacak XP</label>
            <div className="relative">
              <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="number" 
                value={bet || ''} 
                onChange={(e) => handleBetChange(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-black border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 text-2xl font-black text-white text-center outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            <button onClick={() => handleBetChange(bet + 100)} className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-white font-bold text-sm transition-colors">+100</button>
            <button onClick={() => handleBetChange(bet + 500)} className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-white font-bold text-sm transition-colors">+500</button>
            <button onClick={() => handleBetChange(Math.floor(points / 2))} className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-white font-bold text-sm transition-colors">1/2</button>
            <button onClick={() => handleBetChange(points)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 py-3 rounded-xl text-red-500 font-black text-sm transition-colors">MAX</button>
          </div>

          <button 
            onClick={handleRoll}
            disabled={bet <= 0 || bet > points || isRolling}
            className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${
              bet <= 0 || bet > points 
              ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:shadow-[0_0_50px_rgba(220,38,38,0.8)] border border-red-400 hover:-translate-y-1'
            }`}
          >
            {isRolling ? <Zap className="animate-pulse" /> : <Dices size={24} />}
            {isRolling ? 'Kader Çiziliyor...' : 'Zarı At'}
          </button>
        </div>

      </div>
    </main>
  );
}