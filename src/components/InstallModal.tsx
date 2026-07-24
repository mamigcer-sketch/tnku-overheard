"use client";

import { useState, useEffect } from 'react';
import { Download, Zap, Home, X, Share, PlusSquare, MoreVertical, Smartphone, Terminal, Rocket } from 'lucide-react';

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
    const triggerHandler = () => setShowModal(true); 
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowModal(false)}>
      
      {/* TAM ORTAYA SABİTLENMİŞ YENİ KUTU */}
      <div 
        className="w-full max-w-sm sm:max-w-md bg-[#050505] border-2 border-pink-500/40 rounded-[32px] shadow-[0_0_50px_rgba(236,72,153,0.2)] relative flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Kırmızı/Pembe Neon Çizgi */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 rounded-t-[32px] shadow-[0_0_30px_rgba(244,63,94,0.6)]" />
        
        {/* Yeni Tasarım Kapat Butonu */}
        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-rose-500/20 rounded-full transition-all cursor-pointer z-50">
          <X size={18} />
        </button>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Sürüm Etiketi - Güncellendiğini buradan anlayacaksın! */}
          <div className="flex justify-center mb-4">
            <span className="bg-pink-500/10 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span> v3.0 MODAL
            </span>
          </div>

          {/* ANDROID OTOMATİK YÜKLEME */}
          {deferredPrompt ? (
            <>
              <div className="flex flex-col items-center text-center mb-8 relative z-10">
                <img src="/logo.jpg" alt="Logo" className="w-24 h-24 object-cover rounded-3xl border-2 border-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.3)] mb-4" />
                <h3 className="text-white font-black text-3xl tracking-tighter mb-1">TNKU<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">OVERHEARD</span></h3>
                <p className="text-gray-400 text-sm font-medium mt-2">Kampüsün nabzını tek tıkla ana ekranından tut!</p>
              </div>

              <button 
                onClick={handleInstall}
                className="w-full py-5 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white text-sm font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(244,63,94,0.5)] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                <Rocket size={20} /> UYGULAMAYI YÜKLE
              </button>
            </>
          ) : (
            /* iPHONE / MANUEL YÜKLEME */
            <>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-pink-500/20 to-orange-500/10 rounded-2xl border border-pink-500/30">
                  <Terminal className="text-pink-400 w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-white font-black text-2xl tracking-tighter uppercase">Bağlantı Kur</h3>
                  <p className="text-gray-400 text-xs font-medium tracking-wide mt-1">Sisteme manuel giriş yapmalısın.</p>
                </div>
              </div>

              {/* iOS Yönergesi */}
              <div className="mb-6 bg-gradient-to-br from-blue-500/10 to-transparent p-5 rounded-2xl border border-blue-500/30 relative">
                <h4 className="text-blue-400 font-black text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span> Apple / iOS
                </h4>
                <ul className="space-y-4 text-sm text-gray-300 font-medium">
                  <li className="flex items-center gap-3 bg-black/60 p-3.5 rounded-xl border border-white/5">
                    <div className="text-blue-400 shrink-0"><Share size={18} /></div>
                    <span className="flex-1 text-xs sm:text-sm">Alt menüden <b className="text-white">Paylaş</b>'a dokun.</span>
                  </li>
                  <li className="flex items-center gap-3 bg-black/60 p-3.5 rounded-xl border border-white/5">
                    <div className="text-blue-400 shrink-0"><PlusSquare size={18} /></div>
                    <span className="flex-1 text-xs sm:text-sm"><b className="text-white">Ana Ekrana Ekle</b> seçeneğini seç.</span>
                  </li>
                </ul>
              </div>

              {/* Android Yönergesi */}
              <div className="mb-8 bg-gradient-to-br from-emerald-500/10 to-transparent p-5 rounded-2xl border border-emerald-500/30 relative">
                <h4 className="text-emerald-400 font-black text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span> Android / Chrome
                </h4>
                <ul className="space-y-4 text-sm text-gray-300 font-medium">
                  <li className="flex items-center gap-3 bg-black/60 p-3.5 rounded-xl border border-white/5">
                    <div className="text-emerald-400 shrink-0"><MoreVertical size={18} /></div>
                    <span className="flex-1 text-xs sm:text-sm">Sağ üstten <b className="text-white">Üç Nokta</b>'ya dokun.</span>
                  </li>
                  <li className="flex items-center gap-3 bg-black/60 p-3.5 rounded-xl border border-white/5">
                    <div className="text-emerald-400 shrink-0"><Smartphone size={18} /></div>
                    <span className="flex-1 text-xs sm:text-sm"><b className="text-white">Ana Ekrana Ekle</b>'yi seç.</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => setShowModal(false)} 
                className="w-full py-4.5 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/50 text-pink-300 font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                PENCEREYİ KAPAT
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}