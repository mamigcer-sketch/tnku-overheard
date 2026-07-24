"use client";

import { useState, useEffect } from 'react';
import { Download, Zap, Home, X, Share, PlusSquare, MoreVertical, Smartphone } from 'lucide-react';

export default function InstallModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Tarayıcı otomatik yükleme destekliyorsa (Genelde Android/Chrome) event'i yakala
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    // Menüdeki butona basıldığında modalı direkt aç (Alert ZIRVALIĞI KALKTI!)
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)}>
      <div 
        className="bg-[#0d0d12] border border-white/10 rounded-[24px] sm:rounded-[32px] w-full max-w-sm p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arka Plan Işıkları (Ortak) */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#4DA3FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4DA3FF] via-purple-500 to-pink-500" />
        
        {/* Ortak Kapat Butonu */}
        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer z-20">
          <X size={20} />
        </button>

        {/* 🚀 DURUM 1: CİHAZ OTOMATİK YÜKLEMEYİ DESTEKLİYORSA (Android) - Senin Tasarımın */}
        {deferredPrompt ? (
          <>
            <div className="flex flex-col items-center text-center mt-2 mb-6 relative z-10">
              <img src="/logo.jpg" alt="Logo" className="w-16 h-16 object-cover rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-4" />
              <h3 className="text-white font-black text-xl tracking-tight mb-1">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span>'ü Yükle</h3>
              <p className="text-gray-400 text-[13px] font-medium px-2">Kampüsün nabzını tek tıkla ana ekranından tut!</p>
            </div>

            <div className="space-y-4 mb-8 relative z-10">
              <div className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                <div className="bg-blue-500/10 p-2 rounded-lg"><Home className="text-[#4DA3FF] w-5 h-5" /></div>
                <div className="text-left"><p className="text-sm font-bold text-gray-200">Ana Ekrana Ekle</p><p className="text-[11px] text-gray-500">Tarayıcı açmadan direkt uygulamaya gir.</p></div>
              </div>
              <div className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                <div className="bg-purple-500/10 p-2 rounded-lg"><Zap className="text-purple-400 w-5 h-5" /></div>
                <div className="text-left"><p className="text-sm font-bold text-gray-200">Daha Hızlı ve Akıcı</p><p className="text-[11px] text-gray-500">Uygulama formatında sıfır kasma ile kullan.</p></div>
              </div>
            </div>

            <button 
              onClick={handleInstall}
              className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-[#4DA3FF] to-blue-600 text-white flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(77,163,255,0.4)] transition-all active:scale-95 uppercase tracking-wider relative z-10"
            >
              <Download size={18} /> Hemen Yükle
            </button>
          </>
        ) : (
          /* 🍏 DURUM 2: CİHAZ OTOMATİK YÜKLEMEYİ DESTEKLEMİYORSA (iPhone/Safari) - Yeni Modern Tasarım */
          <>
            <div className="flex items-center gap-4 mb-6 sm:mb-8 relative z-10 mt-2">
              <div className="p-3 sm:p-3.5 bg-[#4DA3FF]/10 rounded-2xl border border-[#4DA3FF]/20 shadow-[0_0_15px_rgba(77,163,255,0.15)]">
                <Smartphone className="text-[#4DA3FF] w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight">Uygulamayı Yükle</h3>
                <p className="text-gray-400 text-xs sm:text-sm font-medium mt-0.5">Tek tıkla, anında erişim.</p>
              </div>
            </div>

            {/* iOS Yönergesi */}
            <div className="mb-4 bg-white/[0.03] p-4 sm:p-5 rounded-2xl border border-white/5 relative z-10 hover:border-white/10 transition-colors">
              <h4 className="text-gray-300 font-bold text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span> iPhone / Safari
              </h4>
              <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-400 font-medium">
                <li className="flex items-center gap-3">
                  <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg text-white"><Share size={14} className="sm:w-4 sm:h-4"/></div>
                  <span>Alt menüden <b>Paylaş</b> simgesine dokun.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg text-white"><PlusSquare size={14} className="sm:w-4 sm:h-4"/></div>
                  <span><b>Ana Ekrana Ekle</b> seçeneğini seç.</span>
                </li>
              </ul>
            </div>

            {/* Android Yönergesi (Manuel) */}
            <div className="mb-6 sm:mb-8 bg-white/[0.03] p-4 sm:p-5 rounded-2xl border border-white/5 relative z-10 hover:border-white/10 transition-colors">
              <h4 className="text-gray-300 font-bold text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span> Android / Chrome
              </h4>
              <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-400 font-medium">
                <li className="flex items-center gap-3">
                  <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg text-white"><MoreVertical size={14} className="sm:w-4 sm:h-4"/></div>
                  <span>Sağ üst köşedeki <b>Üç Nokta</b>'ya dokun.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg text-white"><Smartphone size={14} className="sm:w-4 sm:h-4"/></div>
                  <span><b>Ana Ekrana Ekle</b>'yi seç.</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => setShowModal(false)} 
              className="w-full py-3.5 sm:py-4 bg-[#4DA3FF] hover:bg-[#3a8ce0] text-black text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl transition-all shadow-[0_0_20px_rgba(77,163,255,0.3)] hover:shadow-[0_0_25px_rgba(77,163,255,0.5)] uppercase tracking-wider relative z-10 cursor-pointer"
            >
              Anladım, Kapat
            </button>
          </>
        )}
      </div>
    </div>
  );
}