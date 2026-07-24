"use client";

import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, MoreVertical, Smartphone } from 'lucide-react';

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowModal(false)}>
      
      {/* MİNİMAL, KÜÇÜK VE ZARİF KUTU */}
      <div 
        className="w-full max-w-[320px] bg-[#121212] border border-white/10 rounded-[24px] shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat Butonu */}
        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-white bg-white/5 rounded-full transition-colors z-10">
          <X size={16} />
        </button>

        <div className="p-5 pt-6">
          
          {/* Ortak Başlık */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#4DA3FF]/10 rounded-xl flex items-center justify-center border border-[#4DA3FF]/20 shrink-0">
              <Download className="text-[#4DA3FF]" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold text-base leading-tight">Uygulamayı Yükle</h3>
              <p className="text-gray-400 text-[11px] mt-0.5">Daha hızlı bir deneyim için.</p>
            </div>
          </div>

          {/* ANDROID OTOMATİK YÜKLEME */}
          {deferredPrompt ? (
            <div className="mt-2">
              <p className="text-gray-300 text-xs mb-5">TNKU Overheard'ü telefonunuza kurarak tarayıcı kullanmadan tek tıkla erişebilirsiniz.</p>
              <button 
                onClick={handleInstall}
                className="w-full py-3 bg-[#4DA3FF] hover:bg-[#3a8ce0] text-black text-[13px] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(77,163,255,0.2)] flex items-center justify-center gap-2"
              >
                Hemen Yükle
              </button>
            </div>
          ) : (
            /* iPHONE / MANUEL YÜKLEME */
            <div className="space-y-3">
              
              {/* iOS Yönergesi */}
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">iPhone (Safari)</span>
                </div>
                <div className="flex flex-col gap-2 text-[11px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <Share size={12} className="text-blue-400 shrink-0"/> <span><b className="text-gray-200">Paylaş</b> butonuna dokun.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlusSquare size={12} className="text-blue-400 shrink-0"/> <span><b className="text-gray-200">Ana Ekrana Ekle</b>'yi seç.</span>
                  </div>
                </div>
              </div>

              {/* Android Yönergesi */}
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Android (Chrome)</span>
                </div>
                <div className="flex flex-col gap-2 text-[11px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <MoreVertical size={12} className="text-green-400 shrink-0"/> <span>Sağ üstteki <b className="text-gray-200">3 Nokta</b>'ya dokun.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone size={12} className="text-green-400 shrink-0"/> <span><b className="text-gray-200">Ana Ekrana Ekle</b>'yi seç.</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowModal(false)} 
                className="w-full mt-2 py-3 bg-white/5 hover:bg-white/10 text-white text-[13px] font-semibold rounded-xl border border-white/10 transition-colors"
              >
                Anladım, Kapat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}