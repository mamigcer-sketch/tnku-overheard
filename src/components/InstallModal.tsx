"use client";

import { useState, useEffect } from 'react';
import { Download, Zap, Home, X, Share, PlusSquare, MoreVertical, Smartphone, Terminal, ArrowRight } from 'lucide-react';

export default function InstallModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const triggerHandler = () => {
      setShowModal(true); 
    };
    window.addEventListener('trigger-install-modal', triggerHandler);
    return () => window.removeEventListener('trigger-install-modal', triggerHandler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowModal(false);
      }
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#050505]/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)}>
      {/* 
        🔥 BURASI KRİTİK: max-h-[90dvh] ve overflow-y-auto eklendi.
        Artık ekran küçük olsa bile yukarı taşmayacak, kendi içinde kaydırılabilecek! 
      */}
      <div 
        className="w-full max-w-md max-h-[90dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-[#0a0a0f] border border-purple-500/30 rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.15)] relative animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Cyberpunk Çizgi ve Sistem Yazısı */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
        <span className="absolute top-4 left-5 text-[9px] font-mono text-purple-400/60 tracking-widest hidden sm:inline-block">SYS.APP_INSTALL_v2.0</span>
        
        {/* Kapat Butonu */}
        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-purple-500/20 rounded-xl transition-all cursor-pointer z-20 group">
          <X size={20} className="group-hover:scale-110 transition-transform" />
        </button>

        <div className="p-6 sm:p-8 pt-10 sm:pt-12">
          {/* 🚀 DURUM 1: ANDROID OTOMATİK YÜKLEME */}
          {deferredPrompt ? (
            <>
              <div className="flex flex-col items-center text-center mb-8 relative z-10">
                <div className="relative mb-5">
                  <div className="absolute inset-0 bg-[#4DA3FF] blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <img src="/logo.jpg" alt="Logo" className="relative w-20 h-20 object-cover rounded-2xl border border-white/10 shadow-2xl" />
                </div>
                <h3 className="text-white font-black text-2xl tracking-tighter mb-2">TNKU<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4DA3FF] to-purple-400">OVERHEARD</span></h3>
                <p className="text-gray-400 text-sm font-medium">Sisteme doğrudan bağlan. Kampüsün nabzını ana ekranından tut!</p>
              </div>

              <div className="space-y-3 mb-8 relative z-10">
                <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 hover:border-[#4DA3FF]/30 transition-colors group">
                  <div className="bg-[#4DA3FF]/10 p-2.5 rounded-xl group-hover:scale-110 transition-transform"><Home className="text-[#4DA3FF] w-5 h-5" /></div>
                  <div className="text-left"><p className="text-sm font-extrabold text-white">Ana Ekrana Sabitle</p><p className="text-xs text-gray-500 mt-0.5">Tarayıcı ile uğraşmadan direkt gir.</p></div>
                </div>
                <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors group">
                  <div className="bg-purple-500/10 p-2.5 rounded-xl group-hover:scale-110 transition-transform"><Zap className="text-purple-400 w-5 h-5" /></div>
                  <div className="text-left"><p className="text-sm font-extrabold text-white">Ultra Hız & Akıcılık</p><p className="text-xs text-gray-500 mt-0.5">Sıfır kasma, native uygulama hissi.</p></div>
                </div>
              </div>

              <button 
                onClick={handleInstall}
                className="w-full py-4 bg-gradient-to-r from-[#4DA3FF] via-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white text-sm font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(77,163,255,0.4)] hover:shadow-[0_0_30px_rgba(77,163,255,0.6)] uppercase tracking-widest relative overflow-hidden active:scale-95 flex items-center justify-center gap-2"
              >
                <Download size={18} /> SİSTEME KUR
              </button>
            </>
          ) : (
            /* 🍏 DURUM 2: iPHONE / MANUEL YÜKLEME (Neon Cyberpunk Tasarım) */
            <>
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="p-3.5 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-2xl border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <Terminal className="text-purple-400 w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-white font-black text-xl tracking-tighter uppercase">Bağlantı Kur</h3>
                  <p className="text-gray-400 text-xs font-medium tracking-wide mt-1">Uygulamayı sisteme manuel ekle.</p>
                </div>
              </div>

              {/* iOS Yönergesi */}
              <div className="mb-5 bg-gradient-to-br from-cyan-500/5 to-transparent p-5 rounded-2xl border border-cyan-500/20 relative group overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500/5 blur-xl transition-all group-hover:bg-cyan-500/10"></div>
                <h4 className="text-cyan-400 font-black text-xs mb-4 flex items-center gap-2 uppercase tracking-widest relative z-10">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse"></span> iOS / Safari
                </h4>
                <ul className="space-y-4 text-sm text-gray-300 font-medium relative z-10">
                  <li className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400"><Share size={16} /></div>
                    <span className="flex-1 text-xs sm:text-sm">Alt menüden <b className="text-white">Paylaş</b> ikonuna dokun.</span>
                  </li>
                  <li className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400"><PlusSquare size={16} /></div>
                    <span className="flex-1 text-xs sm:text-sm"><b className="text-white">Ana Ekrana Ekle</b> seçeneğini işaretle.</span>
                  </li>
                </ul>
              </div>

              {/* Android Yönergesi */}
              <div className="mb-8 bg-gradient-to-br from-green-500/5 to-transparent p-5 rounded-2xl border border-green-500/20 relative group overflow-hidden">
                <div className="absolute inset-0 bg-green-500/5 blur-xl transition-all group-hover:bg-green-500/10"></div>
                <h4 className="text-green-400 font-black text-xs mb-4 flex items-center gap-2 uppercase tracking-widest relative z-10">
                  <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse"></span> Android / Chrome
                </h4>
                <ul className="space-y-4 text-sm text-gray-300 font-medium relative z-10">
                  <li className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="bg-green-500/10 p-2 rounded-lg text-green-400"><MoreVertical size={16} /></div>
                    <span className="flex-1 text-xs sm:text-sm">Sağ üstten <b className="text-white">Üç Nokta</b>'ya dokun.</span>
                  </li>
                  <li className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="bg-green-500/10 p-2 rounded-lg text-green-400"><Smartphone size={16} /></div>
                    <span className="flex-1 text-xs sm:text-sm"><b className="text-white">Ana Ekrana Ekle</b>'yi seç.</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => setShowModal(false)} 
                className="w-full py-4 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 text-xs font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Anladım, Kapat <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}