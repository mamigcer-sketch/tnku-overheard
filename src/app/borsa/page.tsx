"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Rocket, TrendingUp, Coins, Flame, Skull, Plane, CircleDollarSign, HandCoins } from 'lucide-react';
import { getUserPoints, startCrashGame, claimCrashWin } from './actions';

export default function BorsaPage() {
  const [points, setPoints] = useState<number>(0);
  const [bet, setBet] = useState<number>(0);
  
  // 'idle' = Bekliyor, 'playing' = Uçuyor, 'cashed_out' = Çekildi, 'crashed' = Çakıldı
  const [status, setStatus] = useState<'idle' | 'playing' | 'cashed_out' | 'crashed'>('idle');
  
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashPoint, setCrashPoint] = useState<number>(0);
  const [winAmount, setWinAmount] = useState<number>(0);
  
  const reqRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    getUserPoints().then(p => setPoints(p));
  }, []);

  // 🔥 EKRANI VE UÇAĞI SIFIRLAYAN SİSTEM 🔥
  useEffect(() => {
    if (status === 'crashed' || status === 'cashed_out') {
      const timer = setTimeout(() => {
        setStatus('idle');
        setMultiplier(1.00);
      }, 3000); // 3 saniye sonra yeni el başlar
      return () => clearTimeout(timer);
    }
  }, [status]);

  // 🔥 UÇAK YÜKSELİŞ ANİMASYONU 🔥
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentM = Math.max(1.00, Math.exp(elapsed * 0.00035)); // Yükseliş hızı

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

  // Uçağın ekrandaki dinamik konumu (Matematiksel yükseliş)
  const flightX = Math.min(80, (multiplier - 1) * 15);
  const flightY = Math.min(75, (multiplier - 1) * 10);

  return (
    <main className={`min-h-screen transition-all duration-700 relative overflow-hidden ${
      status === 'crashed' ? 'bg-red-950/80 animate-shake' : 
      status === 'cashed_out' ? 'bg-emerald-950/60' : 
      'bg-[#050505]'
    }`}>
      
      {/* TİTREME EFEKTİ */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-4px) rotate(-1deg); }
          50% { transform: translateY(4px) rotate(1deg); }
          75% { transform: translateY(-4px) rotate(-1deg); }
        }
        .animate-shake { animation: shake 0.2s infinite; }
      `}} />

      {/* ARKA PLAN */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050505] to-[#050505] pointer-events-none -z-10"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none -z-10"></div>

      <header className="px-4 py-4 flex items-center justify-between relative z-10">
        <Link href="/" className="p-2 bg-neutral-900 rounded-full text-gray-400 hover:text-white transition-colors border border-neutral-800 shadow-[0_4px_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2 bg-neutral-900 border-2 border-neutral-800 px-4 py-2 rounded-xl shadow-inner">
          <Flame size={16} className="text-amber-500" />
          <span className="font-black text-amber-500 font-mono tracking-widest">{points} XP</span>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-2 pb-20 relative z-10 flex flex-col items-center">
        
        {/* BAŞLIK */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black bg-gradient-to-b from-[#4DA3FF] to-blue-700 text-transparent bg-clip-text tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(77,163,255,0.4)] flex items-center justify-center gap-3">
            <TrendingUp size={28} className="text-[#4DA3FF]" /> AVİATOR <TrendingUp size={28} className="text-[#4DA3FF]" />
          </h1>
          <p className="text-blue-400/60 text-[10px] uppercase tracking-[0.2em] mt-2 font-black">Uçak Kaçmadan Parayı Çek</p>
        </div>

        {/* ✈️ DEV UÇUŞ EKRANI (RADAR) ✈️ */}
        <div className={`w-full h-64 rounded-[32px] border-[6px] mb-8 relative overflow-hidden transition-all duration-300 shadow-2xl ${
          status === 'crashed' ? 'border-red-600 bg-red-950/50 shadow-[0_0_60px_rgba(220,38,38,0.5)]' :
          status === 'cashed_out' ? 'border-emerald-500 bg-emerald-950/50 shadow-[0_0_60px_rgba(16,185,129,0.5)]' :
          status === 'playing' ? 'border-[#4DA3FF] bg-blue-950/30 shadow-[0_0_40px_rgba(77,163,255,0.3)]' :
          'border-neutral-800 bg-neutral-900'
        }`}>
          
          {/* Radar Grid Arka Planı */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

          {/* 💥 ÇARPAN YAZISI (TAM ORTADA) 💥 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <div className={`text-6xl font-black tracking-tighter font-mono flex items-end gap-1 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] ${
              status === 'crashed' ? 'text-red-500' :
              status === 'cashed_out' ? 'text-emerald-400' :
              'text-white'
            }`}>
              {multiplier.toFixed(2)}
              <span className={`text-4xl pb-1.5 ${status === 'crashed' ? 'text-red-600' : 'text-gray-400'}`}>x</span>
            </div>
            
            <div className="h-8 mt-2">
              {status === 'crashed' && <div className="text-red-500 font-black text-xl uppercase tracking-widest flex items-center gap-2"><Skull size={20} /> ÇAKILDI!</div>}
              {status === 'cashed_out' && <div className="text-emerald-400 font-black text-lg uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full border border-emerald-500/30">+ {winAmount} XP ALDIN</div>}
              {status === 'idle' && <div className="text-neutral-500 font-bold text-sm uppercase tracking-widest">BEKLENİYOR...</div>}
            </div>
          </div>

          {/* ✈️ UÇAK VE KUYRUĞU ✈️ */}
          <div 
            className="absolute transition-all duration-100 ease-linear z-20"
            style={{
              bottom: `${Math.max(10, flightY)}%`,
              left: `${Math.max(10, flightX)}%`,
            }}
          >
            {/* Uçağın Kuyruk İzi (Sadece uçarken) */}
            {status === 'playing' && (
              <div className="absolute top-1/2 right-1/2 w-48 h-3 bg-gradient-to-r from-transparent via-[#4DA3FF]/40 to-[#4DA3FF]/80 blur-sm origin-right -translate-y-1/2 translate-x-4 rotate-[15deg]"></div>
            )}
            
            <Plane 
              size={48} 
              className={`fill-current drop-shadow-2xl transition-all duration-300 ${
                status === 'crashed' ? 'text-red-600 rotate-[120deg] scale-125 opacity-0' : 
                status === 'cashed_out' ? 'text-emerald-500 -translate-y-[200px] translate-x-[200px] opacity-0' : 
                status === 'playing' ? 'text-[#4DA3FF] rotate-[15deg] scale-110 drop-shadow-[0_0_15px_rgba(77,163,255,0.8)]' : 
                'text-neutral-500 rotate-0'
              }`} 
            />
          </div>
        </div>

        {/* 🎛️ KUMAR BİLGİSAYARI (BAHİS PANELİ) 🎛️ */}
        <div className={`w-full bg-neutral-900 p-6 rounded-[32px] border-t-2 border-x border-neutral-700 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-opacity duration-300 ${
          status === 'cashed_out' || status === 'crashed' ? 'opacity-50 pointer-events-none' : 'opacity-100'
        }`}>
          
          {status !== 'playing' ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-2">Yatırılacak XP</label>
                  <span className="text-[10px] font-bold text-neutral-600 uppercase">Bakiye: {points}</span>
                </div>
                {/* LED EKRAN INPUT */}
                <div className="relative bg-[#050505] p-2 rounded-2xl border-[3px] border-neutral-950 shadow-[inset_0_4px_15px_rgba(0,0,0,1)]">
                  <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4DA3FF]/50" size={24} />
                  <input 
                    type="number" 
                    value={bet || ''} 
                    onChange={(e) => handleBetChange(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-transparent py-3 pl-12 pr-4 text-3xl font-black text-[#4DA3FF] font-mono text-center outline-none placeholder:text-blue-900/30"
                  />
                </div>
              </div>

              {/* FİZİKSEL CASİNO BUTONLARI (3D Efektli) */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-8">
                <button onClick={() => handleBetChange(bet + 10)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-b-[4px] border-neutral-950 active:border-b-0 active:translate-y-[4px] rounded-xl py-3.5 font-black text-xs transition-all shadow-lg">+10</button>
                <button onClick={() => handleBetChange(bet + 100)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-b-[4px] border-neutral-950 active:border-b-0 active:translate-y-[4px] rounded-xl py-3.5 font-black text-xs transition-all shadow-lg">+100</button>
                <button onClick={() => handleBetChange(Math.floor(points / 2))} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-b-[4px] border-neutral-950 active:border-b-0 active:translate-y-[4px] rounded-xl py-3.5 font-black text-xs transition-all shadow-lg">1/2</button>
                <button onClick={() => handleBetChange(points)} className="bg-blue-900 hover:bg-blue-800 text-blue-100 border-b-[4px] border-blue-950 active:border-b-0 active:translate-y-[4px] rounded-xl py-3.5 font-black text-xs transition-all shadow-lg">ALL IN</button>
              </div>

              {/* 🔵 FIRLAT BUTONU 🔵 */}
              <button 
                onClick={handleStart}
                disabled={bet <= 0 || bet > points}
                className={`w-full py-6 rounded-2xl font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-150 ${
                  bet <= 0 || bet > points 
                  ? 'bg-neutral-800 text-neutral-600 border-b-[6px] border-neutral-950 cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#4DA3FF] to-blue-700 text-white border-b-[6px] border-blue-950 hover:brightness-110 active:border-b-0 active:translate-y-[6px] shadow-[0_0_30px_rgba(77,163,255,0.4)]'
                }`}
              >
                <Rocket size={28} /> UÇUŞU BAŞLAT
              </button>
            </>
          ) : (
            
            /* 🟢 OYUN ESNASINDA: PARAYI ÇEK BUTONU 🟢 */
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-6 bg-[#050505] py-4 rounded-2xl border-2 border-neutral-800 shadow-[inset_0_4px_15px_rgba(0,0,0,1)]">
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Şu Anki Kazancın</span>
                <div className="text-4xl font-black text-emerald-400 font-mono">
                  {Math.floor(bet * multiplier)} XP
                </div>
              </div>
              
              <button 
                onClick={handleCashOut}
                className="w-full py-8 rounded-[24px] font-black text-3xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-150 bg-gradient-to-b from-emerald-400 to-emerald-600 text-black border-b-[8px] border-emerald-900 hover:brightness-110 active:border-b-0 active:translate-y-[8px] shadow-[0_0_50px_rgba(16,185,129,0.5)]"
              >
                <HandCoins size={36} /> PARAYI ÇEK
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}