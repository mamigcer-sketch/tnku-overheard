"use client";

import { useState, useEffect } from 'react';
import { Download, Zap, Home, X } from 'lucide-react';

export default function InstallModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Tarayıcı yükleme eventini yakala ve arka planda hazır beklet
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    // Hamburger menüden gelen tetikleyiciyi dinle
    const triggerHandler = () => {
      if (deferredPrompt) {
        setShowModal(true);
      } else {
        alert("Kanka, iPhone kullanıyorsan tarayıcının altından 'Paylaş' simgesine basıp 'Ana Ekrana Ekle' de. Android'de isen cihazın bu özelliği zaten otomatik destekliyor olabilir!");
      }
    };
    window.addEventListener('trigger-install-modal', triggerHandler);
    return () => window.removeEventListener('trigger-install-modal', triggerHandler);
  }, [deferredPrompt]);

  const handleInstall = async () => {
    setShowModal(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)}>
      <div 
        className="bg-[#121212] border border-white/[0.08] rounded-[24px] w-full max-w-sm p-6 shadow-[0_0_50px_rgba(77,163,255,0.15)] relative overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4DA3FF] via-purple-500 to-pink-500" />
        
        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white bg-white/[0.05] rounded-full p-1.5 transition-colors">
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <img src="/logo.jpg" alt="Logo" className="w-16 h-16 object-cover rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-4" />
          <h3 className="text-white font-black text-xl tracking-tight mb-1">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span>'ü Yükle</h3>
          <p className="text-gray-400 text-[13px] font-medium px-2">Kampüsün nabzını tek tıkla ana ekranından tut!</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
            <div className="bg-blue-500/10 p-2 rounded-lg"><Home className="text-[#4DA3FF] w-5 h-5" /></div>
            <div className="text-left"><p className="text-sm font-bold text-gray-200">Ana Ekrana Ekle</p><p className="text-[11px] text-gray-500">Tarayıcı açmadan direkt uygulamaya gir.</p></div>
          </div>
          <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
            <div className="bg-purple-500/10 p-2 rounded-lg"><Zap className="text-purple-400 w-5 h-5" /></div>
            <div className="text-left"><p className="text-sm font-bold text-gray-200">Daha Hızlı ve Akıcı</p><p className="text-[11px] text-gray-500">Uygulama formatında sıfır kasma ile kullan.</p></div>
          </div>
        </div>

        <button 
          onClick={handleInstall}
          className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#4DA3FF] to-blue-600 text-white flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(77,163,255,0.4)] transition-all active:scale-95"
        >
          <Download size={18} />
          Hemen Yükle
        </button>
      </div>
    </div>
  );
}