"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Dices, Skull, Flame, Coins, CircleDollarSign } from 'lucide-react';
import { getUserPoints, rollRoulette } from './actions';

export default function KaranlikOdaPage() {
  const [points, setPoints] = useState<number>(0);
  const [bet, setBet] = useState<number>(0);
  
  const [isRolling, setIsRolling] = useState(false);
  const [slotNumbers, setSlotNumbers] = useState([0, 0, 0]);
  const [result, setResult] = useState<{ isWin: boolean; amount: number; newTotal: number } | null>(null);

  useEffect(() => {
    getUserPoints().then(p => setPoints(p));
  }, []);

  // 🔥 MEKANİK SLOT ÇARKI ANİMASYONU 🔥
  useEffect(() => {
    let interval: any;
    if (isRolling) {
      interval = setInterval(() => {
        setSlotNumbers([
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10)
        ]);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRolling]);

  // Yeni tura hazırlık (Kırmızılığı/Yeşilliği silme)
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setResult(null);
      }, 3000); // 3 saniye sonra masa temizlenir
      return () => clearTimeout(timer);
    }
  }, [result]);

  const handleBetChange = (amount: number) => {
    if (isRolling) return;
    if (result) setResult(null); // Bahse dokunulduğu an makineyi sıfırla
    
    if (amount > points) setBet(points);
    else if (amount < 0) setBet(0);
    else setBet(amount);
  };

  const handleRoll = async () => {
    if (bet <= 0 || bet > points || isRolling) return;
    
    setIsRolling(true);
    setResult(null);

    const res = await rollRoulette(bet);

    // 🎲 KUMAR HEYECANI İÇİN 2.5 SANİYE ÇARK DÖNER 🎲
    setTimeout(() => {
      setIsRolling(false);
      if (res.success) {
        setPoints(res.newPoints!);
        setResult({ isWin: res.isWin!, amount: res.betAmount!, newTotal: res.newPoints! });
        setBet(0);
        
        // Kazandıysa 7-7-7 çak, kaybettiyse alakasız sayılar bırak
        if (res.isWin) {
          setSlotNumbers([7, 7, 7]);
        } else {
          setSlotNumbers([
            Math.floor(Math.random() * 6),
            Math.floor(Math.random() * 5) + 1,
            Math.floor(Math.random() * 4) + 2
          ]);
        }
      } else {
        alert(res.error);
      }
    }, 2500);
  };

  return (
    <main className={`min-h-screen transition-all duration-700 relative overflow-hidden ${
      isRolling ? 'bg-red-950/80 animate-shake' : 
      result?.isWin ? 'bg-amber-900/40' : 
      result?.isWin === false ? 'bg-[#050000]' : 'bg-[#050505]'
    }`}>
      
      {/* 🔴 SİBERPUNK TİTREME EFEKTİ 🔴 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-3px) rotate(-1deg); }
          50% { transform: translateY(3px) rotate(1deg); }
          75% { transform: translateY(-3px) rotate(-1deg); }
        }
        .animate-shake { animation: shake 0.2s infinite; }
      `}} />

      {/* ARKA PLAN IŞIKLARI */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/30 via-[#050505] to-[#050505] pointer-events-none -z-10"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none -z-10"></div>

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
        
        {/* 💀 CASİNO TABELASI 💀 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black bg-gradient-to-b from-red-400 via-red-600 to-red-900 text-transparent bg-clip-text tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(220,38,38,0.6)] flex items-center justify-center gap-3">
            <Skull size={32} className={`text-red-500 ${isRolling ? "animate-spin" : ""}`} /> 
            KARANLIK ODA 
            <Skull size={32} className={`text-red-500 ${isRolling ? "animate-spin" : ""}`} />
          </h1>
          <p className="text-red-500/60 text-[10px] uppercase tracking-[0.3em] mt-2 font-black">Kasa Her Zaman Kazanır</p>
        </div>

        {/* 🎰 DEV SLOT MAKİNESİ (CASİNO KASASI) 🎰 */}
        <div className={`w-full p-4 rounded-[32px] border-[6px] mb-8 relative overflow-hidden transition-all duration-300 ${
          isRolling ? 'border-red-600 bg-neutral-900 shadow-[0_0_60px_rgba(220,38,38,0.5)]' :
          result?.isWin ? 'border-amber-400 bg-neutral-900 shadow-[0_0_80px_rgba(251,191,36,0.6)]' :
          result?.isWin === false ? 'border-red-950 bg-black shadow-[0_0_40px_rgba(220,38,38,0.2)]' :
          'border-neutral-800 bg-neutral-900 shadow-2xl'
        }`}>
          {/* Makinenin iç camı */}
          <div className="bg-[#050505] rounded-2xl py-8 px-4 border-y-4 border-black shadow-[inset_0_10px_30px_rgba(0,0,0,1)] relative flex justify-center gap-3 sm:gap-6">
            
            {/* Cam Parlaması (Reflection) */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-2xl pointer-events-none z-20"></div>

            {/* ÇARKLAR */}
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-20 h-28 bg-gradient-to-b from-neutral-300 via-white to-neutral-400 rounded-xl flex items-center justify-center border-4 border-neutral-950 shadow-[inset_0_15px_15px_rgba(0,0,0,0.5)] relative overflow-hidden z-10">
                <span className={`text-6xl font-black font-mono transition-all ${
                  result?.isWin ? 'text-amber-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]' : 'text-neutral-900'
                }`}>
                  {slotNumbers[i]}
                </span>
                {/* Mekanik silindir gölgesi */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none"></div>
              </div>
            ))}

            {/* SONUÇ YAZISI OVERLAY */}
            {result && (
              <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300 rounded-2xl">
                <div className="text-center">
                  <h2 className={`text-5xl font-black uppercase tracking-widest drop-shadow-[0_0_20px_rgba(0,0,0,1)] ${result.isWin ? 'text-amber-400' : 'text-red-600'}`}>
                    {result.isWin ? 'JACKPOT!' : 'ÇÖP OLDU'}
                  </h2>
                  <p className={`text-2xl font-black mt-2 bg-black/50 inline-block px-4 py-1 rounded-full border ${result.isWin ? 'text-amber-300 border-amber-500/30' : 'text-red-500 border-red-900/50'}`}>
                    {result.isWin ? '+' : '-'}{result.amount} XP
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🎛️ KUMAR BİLGİSAYARI (BAHİS PANELİ) 🎛️ */}
        <div className={`w-full bg-neutral-900 p-6 rounded-[32px] border-t-2 border-x border-neutral-700 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-opacity duration-300 ${isRolling ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-2">Yatırılacak Tutar</label>
              <span className="text-[10px] font-bold text-neutral-600 uppercase">Bakiye: {points}</span>
            </div>
            {/* LED EKRAN INPUT */}
            <div className="relative bg-[#050505] p-2 rounded-2xl border-[3px] border-neutral-950 shadow-[inset_0_4px_15px_rgba(0,0,0,1)]">
              <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50" size={24} />
              <input 
                type="number" 
                value={bet || ''} 
                onChange={(e) => handleBetChange(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-transparent py-3 pl-12 pr-4 text-3xl font-black text-amber-500 font-mono text-center outline-none placeholder:text-amber-900/30"
              />
            </div>
          </div>

          {/* FİZİKSEL CASİNO BUTONLARI (3D Efektli) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-8">
            <button onClick={() => handleBetChange(bet + 10)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-b-[4px] border-neutral-950 active:border-b-0 active:translate-y-[4px] rounded-xl py-3.5 font-black text-xs transition-all shadow-lg">+10</button>
            <button onClick={() => handleBetChange(bet + 100)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-b-[4px] border-neutral-950 active:border-b-0 active:translate-y-[4px] rounded-xl py-3.5 font-black text-xs transition-all shadow-lg">+100</button>
            <button onClick={() => handleBetChange(Math.floor(points / 2))} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-b-[4px] border-neutral-950 active:border-b-0 active:translate-y-[4px] rounded-xl py-3.5 font-black text-xs transition-all shadow-lg">1/2</button>
            <button onClick={() => handleBetChange(points)} className="bg-red-900 hover:bg-red-800 text-red-100 border-b-[4px] border-red-950 active:border-b-0 active:translate-y-[4px] rounded-xl py-3.5 font-black text-xs transition-all shadow-lg">MAX</button>
          </div>

          {/* DEV ZARI AT BUTONU */}
          <button 
            onClick={handleRoll}
            disabled={bet <= 0 || bet > points || isRolling}
            className={`w-full py-6 rounded-2xl font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-150 ${
              bet <= 0 || bet > points 
              ? 'bg-neutral-800 text-neutral-600 border-b-[6px] border-neutral-950 cursor-not-allowed'
              : 'bg-gradient-to-b from-red-500 to-red-700 text-white border-b-[6px] border-red-950 hover:brightness-110 active:border-b-0 active:translate-y-[6px] shadow-[0_0_30px_rgba(220,38,38,0.4)]'
            }`}
          >
            {isRolling ? <Dices size={28} className="animate-bounce" /> : <Dices size={28} />}
            {isRolling ? 'ÇARK DÖNÜYOR...' : 'ZARI AT'}
          </button>
        </div>

      </div>
    </main>
  );
}