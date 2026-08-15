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
    // 🔥 ARKA PLAN FLULAŞTIRMASI DİNAMİK YAPILDI
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 transition-colors" onClick={() => setShowModal(false)}>
      
      {/* MİNİMAL, KÜÇÜK VE ZARİF KUTU */}
      <div 
        className="w-full max-w-[320px] bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-[24px] shadow-xl dark:shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat Butonu */}
        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-gray-500 dark:hover:text-white dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors z-10">
          <X size={16} />
        </button>

        <div className="p-5 pt-6">
          
          {/* Ortak Başlık */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-50 dark:bg-[#4DA3FF]/10 rounded-xl flex items-center justify-center border border-blue-100 dark:border-[#4DA3FF]/20 shrink-0 transition-colors">
              <Download className="text-[#4DA3FF]" size={20} />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold text-base leading-tight transition-colors">Uygulamayı Yükle</h3>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 transition-colors">Daha hızlı bir deneyim için.</p>
            </div>
          </div>

          {/* ANDROID OTOMATİK YÜKLEME */}
          {deferredPrompt ? (
            <div className="mt-2">
              <p className="text-gray-600 dark:text-gray-300 text-xs mb-5 transition-colors">TNKU Overheard'ü telefonunuza kurarak tarayıcı kullanmadan tek tıkla erişebilirsiniz.</p>
              <button 
                onClick={handleInstall}
                className="w-full py-3 bg-[#4DA3FF] hover:bg-[#3a8ce0] text-white dark:text-black text-[13px] font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(77,163,255,0.3)] dark:shadow-[0_0_15px_rgba(77,163,255,0.2)] flex items-center justify-center gap-2"
              >
                Hemen Yükle
              </button>
            </div>
          ) : (
            /* iPHONE / MANUEL YÜKLEME */
            <div className="space-y-3">
              
              {/* iOS Yönergesi */}
              <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 border border-gray-100 dark:border-white/5 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors">iPhone (Safari)</span>
                </div>
                <div className="flex flex-col gap-2 text-[11px] text-gray-500 dark:text-gray-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <Share size={12} className="text-blue-500 dark:text-blue-400 shrink-0"/> <span><b className="text-gray-900 dark:text-gray-200">Paylaş</b> butonuna dokun.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlusSquare size={12} className="text-blue-500 dark:text-blue-400 shrink-0"/> <span><b className="text-gray-900 dark:text-gray-200">Ana Ekrana Ekle</b>'yi seç.</span>
                  </div>
                </div>
              </div>

              {/* Android Yönergesi */}
              <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 border border-gray-100 dark:border-white/5 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors">Android (Chrome)</span>
                </div>
                <div className="flex flex-col gap-2 text-[11px] text-gray-500 dark:text-gray-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <MoreVertical size={12} className="text-green-500 dark:text-green-400 shrink-0"/> <span>Sağ üstteki <b className="text-gray-900 dark:text-gray-200">3 Nokta</b>'ya dokun.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone size={12} className="text-green-500 dark:text-green-400 shrink-0"/> <span><b className="text-gray-900 dark:text-gray-200">Ana Ekrana Ekle</b>'yi seç.</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowModal(false)} 
                className="w-full mt-2 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-white text-[13px] font-semibold rounded-xl border border-gray-200 dark:border-white/10 transition-colors"
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