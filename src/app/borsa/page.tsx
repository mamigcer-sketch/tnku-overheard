"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Rocket, TrendingUp, Coins, Flame, Skull } from 'lucide-react';
import { getUserPoints, startCrashGame, claimCrashWin } from './actions';

export default function BorsaPage() {
  const [points, setPoints] = useState<number>(0);
  const [bet, setBet] = useState<number>(0);
  
  // 'idle' = Bekliyor, 'playing' = Yükseliyor, 'cashed_out' = Çekildi, 'crashed' = Çöktü
  const [status, setStatus] = useState<'idle' | 'playing' | 'cashed_out' | 'crashed'>('idle');
  
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashPoint, setCrashPoint] = useState<number>(0);
  const [winAmount, setWinAmount] = useState<number>(0);
  
  const reqRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    getUserPoints().then(p => setPoints(p));
  }, []);

  // 🔥 EKRANIN RENGİNİ VE OYUNU SIFIRLAYAN SİSTEM (Yeni Tur Hazırlığı) 🔥
  useEffect(() => {
    if (status === 'crashed' || status === 'cashed_out') {
      const timer = setTimeout(() => {
        setStatus('idle');
        setMultiplier(1.00);
      }, 2500); // 2.5 saniye ekranda kalıp siyah ekrana döner
      return () => clearTimeout(timer);
    }
  }, [status]);

  // 🔥 GÖRSEL YÜKSELİŞ ANİMASYONU (RequestAnimationFrame)
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentM = Math.max(1.00, Math.exp(elapsed * 0.0003)); 

      if (currentM >= crashPoint) {
        setMultiplier(crashPoint);
        setStatus('crashed');
      } else {
        setMultiplier(currentM);
        reqRef.current = requestAnimationFrame(tick);
      }
    };

    if (status === 'playing') {
      startTimeRef.current = Date.now();
      reqRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [status, crashPoint]);

  const handleBetChange = (amount: number) => {
    if (status === 'playing') return;
    
    // Miktar değiştirildiği an kırmızılığı/yeşilliği anında temizle!
    if (status !== 'idle') {
      setStatus('idle');
      setMultiplier(1.00);
    }

    if (amount > points) setBet(points);
    else if (amount < 0) setBet(0);
    else setBet(amount);
  };

  const handleStart = async () => {
    if (bet <= 0 || bet > points || status === 'playing') return;
    
    setStatus('idle');
    setMultiplier(1.00);
    setWinAmount(0);

    const res = await startCrashGame(bet);
    if (res.success && res.crashPoint) {
      setPoints(prev => prev - bet); 
      setCrashPoint(res.crashPoint);
      setStatus('playing');
    } else {
      alert(res.error);
    }
  };

  const handleCashOut = async () => {
    if (status !== 'playing') return;
    
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    
    const cashedMultiplier = multiplier;
    setStatus('cashed_out');
    
    const res = await claimCrashWin(bet, cashedMultiplier);
    if (res?.success) {
      setPoints(res.newPoints!);
      setWinAmount(res.winAmount!);
    }
  };

  return (
    <main className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${
      status === 'crashed' ? 'bg-red-950 animate-shake' : 
      status === 'cashed_out' ? 'bg-emerald-950' : 
      'bg-[#050505]'
    }`}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-2deg); }
          50% { transform: translateX(5px) rotate(2deg); }
          75% { transform: translateX(-5px) rotate(-2deg); }
        }
        .animate-shake { animation: shake 0.3s infinite; }
      `}} />

      <div className="absolute top-0 left-0 right-0 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050505] to-[#050505] pointer-events-none -z-10"></div>

      <header className="px-4 py-4 flex items-center justify-between relative z-10">
        <Link href="/" className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors border border-white/10">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full">
          <Flame size={16} className="text-amber-500" />
          <span className="font-black text-amber-500 tracking-wider">{points} XP</span>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-2 pb-20 relative z-10 flex flex-col items-center">
        
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black text-[#4DA3FF] tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(77,163,255,0.4)] flex items-center justify-center gap-3">
            <TrendingUp size={28} /> Borsa Çarpanı <TrendingUp size={28} />
          </h1>
          <p className="text-gray-500 text-xs mt-2 font-medium">Açgözlülük yaparsan her şeyini kaybedersin. Kırmızıya düşmeden parayı çek!</p>
        </div>

        {/* 📈 DEV ÇARPAN EKRANI 📈 */}
        <div className={`w-full h-56 rounded-[32px] border-4 flex flex-col items-center justify-center mb-8 relative overflow-hidden transition-all duration-300 shadow-2xl ${
          status === 'crashed' ? 'border-red-500 bg-red-900/20 shadow-[0_0_60px_rgba(239,68,68,0.5)]' :
          status === 'cashed_out' ? 'border-emerald-500 bg-emerald-900/20 shadow-[0_0_60px_rgba(16,185,129,0.5)]' :
          status === 'playing' ? 'border-[#4DA3FF] bg-[#4DA3FF]/10 shadow-[0_0_40px_rgba(77,163,255,0.3)]' :
          'border-white/10 bg-black/50'
        }`}>
          
          <div className="text-7xl font-black tracking-tighter font-mono z-10 flex items-end gap-1">
            <span className={`${
              status === 'crashed' ? 'text-red-500' :
              status === 'cashed_out' ? 'text-emerald-400' :
              'text-white'
            }`}>
              {multiplier.toFixed(2)}
            </span>
            <span className={`text-4xl pb-1.5 ${status === 'crashed' ? 'text-red-600' : 'text-gray-500'}`}>x</span>
          </div>

          <div className="h-10 mt-2 z-10">
            {status === 'crashed' && <div className="text-red-500 font-black text-2xl uppercase tracking-widest flex items-center gap-2"><Skull /> ÇÖKTÜ!</div>}
            {status === 'cashed_out' && <div className="text-emerald-400 font-black text-xl uppercase tracking-widest">+ {winAmount} XP KAZANDIN</div>}
            {status === 'playing' && <div className="text-[#4DA3FF] font-bold text-sm uppercase tracking-widest animate-pulse flex items-center gap-2"><Rocket size={16}/> Yükseliyor...</div>}
            {status === 'idle' && <div className="text-gray-500 font-bold text-sm uppercase tracking-widest">Bahsini Gir ve Fırlat</div>}
          </div>
        </div>

        {/* KONTROL PANELİ */}
        <div className={`w-full bg-[#0A0A0A] p-6 rounded-[32px] border border-white/5 shadow-xl transition-all duration-300`}>
          
          {status !== 'playing' && (
            <>
              <div className="mb-5">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-2 text-center">Yatırılacak XP</label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    type="number" 
                    value={bet || ''} 
                    onChange={(e) => handleBetChange(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-black border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 text-2xl font-black text-white text-center outline-none focus:border-[#4DA3FF] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-6">
                <button onClick={() => handleBetChange(bet + 10)} className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-white font-bold text-sm transition-colors">+10</button>
                <button onClick={() => handleBetChange(bet + 100)} className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-white font-bold text-sm transition-colors">+100</button>
                <button onClick={() => handleBetChange(Math.floor(points / 2))} className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-white font-bold text-sm transition-colors">YARISI</button>
                <button onClick={() => handleBetChange(points)} className="bg-[#4DA3FF]/10 hover:bg-[#4DA3FF]/20 border border-[#4DA3FF]/30 py-3 rounded-xl text-[#4DA3FF] font-black text-sm transition-colors">ALL IN</button>
              </div>

              <button 
                onClick={handleStart}
                disabled={bet <= 0 || bet > points}
                className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${
                  bet <= 0 || bet > points 
                  ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-400 hover:-translate-y-1'
                }`}
              >
                <Rocket size={24} /> Füzeyi Fırlat
              </button>
            </>
          )}

          {status === 'playing' && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-4">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Şu Anki Kazanç</span>
                <div className="text-3xl font-black text-emerald-400 mt-1">
                  +{Math.floor(bet * multiplier)} XP
                </div>
              </div>
              
              <button 
                onClick={handleCashOut}
                className="w-full py-6 rounded-2xl font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_40px_rgba(16,185,129,0.6)] border-2 border-emerald-300 hover:-translate-y-1 active:scale-95"
              >
                💰 PARAYI ÇEK 💰
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}