"use client";

import { useState } from 'react';
import { Menu, X, Heart, ShieldAlert, BookOpen, FileText, ExternalLink, Download, Share, PlusSquare, MoreVertical, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  // 🔥 Yeni State: Modalın açık/kapalı durumunu kontrol edecek
  const [showInstallModal, setShowInstallModal] = useState(false);

  // "Beğendiklerim" için hideOnDesktop özelliği ekledik ki masaüstünde 2 kere gözükmesin
  const menuItems = [
    { name: 'Paylaşımlarım', icon: <FileText size={18} />, href: '/my-posts', isExternal: false },
    { name: 'Beğendiklerim', icon: <Heart size={18} />, href: '/my-likes', isExternal: false, hideOnDesktop: true },
    { name: 'Topluluk Kuralları', icon: <BookOpen size={18} />, href: '/rules', isExternal: false },
    { name: 'Instagram', icon: <ExternalLink size={18} />, href: 'https://instagram.com/tnkuoverheard', isExternal: true },
    { name: 'Bildir / Şikayet', icon: <ShieldAlert size={18} />, href: 'https://instagram.com/tnkuoverheard', isExternal: true },
  ];

  return (
    <>
      <div className="relative z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {isOpen && (
          <>
            {/* Arka plan karartma */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            
            <div className="absolute top-14 right-0 w-64 bg-[#121212] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-0.5">
                {menuItems.map((item) => (
                  item.isExternal ? (
                    <a 
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-[#4DA3FF] transition-all font-medium text-sm ${item.hideOnDesktop ? 'sm:hidden' : ''}`}
                    >
                      {item.icon} {item.name}
                    </a>
                  ) : (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-[#4DA3FF] transition-all font-medium text-sm ${item.hideOnDesktop ? 'sm:hidden' : ''}`}
                    >
                      {item.icon} {item.name}
                    </Link>
                  )
                ))}

                {/* 🔥 GÜNCELLENDİ: Özel Modalı Tetikleyen Buton */}
                <button 
                  onClick={() => {
                    setIsOpen(false); // Menüyü kapatır
                    setShowInstallModal(true); // Modalı açar
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-[#4DA3FF]/10 text-[#4DA3FF] font-medium text-sm transition-all border-t border-white/5 mt-2 cursor-pointer"
                >
                  <Download size={18} /> Uygulamayı Yükle
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 🔥 İŞTE O MODERN UYGULAMA YÜKLEME MODALI */}
      {showInstallModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300"
          onClick={() => setShowInstallModal(false)}
        >
          <div 
            className="bg-[#0d0d12] border border-white/10 rounded-[24px] sm:rounded-[32px] w-full max-w-sm p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Arka Plan Işıkları */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#4DA3FF]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Kapat Butonu */}
            <button 
              onClick={() => setShowInstallModal(false)} 
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer z-20"
            >
              <X size={20} />
            </button>

            {/* Başlık */}
            <div className="flex items-center gap-4 mb-6 sm:mb-8 relative z-10">
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

            {/* Android Yönergesi */}
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

            {/* Kapatma Butonu */}
            <button 
              onClick={() => setShowInstallModal(false)} 
              className="w-full py-3.5 sm:py-4 bg-[#4DA3FF] hover:bg-[#3a8ce0] text-black text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl transition-all shadow-[0_0_20px_rgba(77,163,255,0.3)] hover:shadow-[0_0_25px_rgba(77,163,255,0.5)] uppercase tracking-wider relative z-10 cursor-pointer"
            >
              Anladım, Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}