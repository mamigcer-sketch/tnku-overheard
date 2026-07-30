"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Heart, ShieldAlert, BookOpen, ExternalLink, Download, VenetianMask, AlertCircle, CheckCircle2, Loader2, User } from 'lucide-react';
import Link from 'next/link';
import { updateCustomNickname } from '@/app/profile/actions';

export default function MobileMenu({ userUuid }: { userUuid?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState('/profil/ben');
  
  const [isNickModalOpen, setIsNickModalOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });
  
  const router = useRouter();

  // 🔥 Menü açıldığı veya bileşen yüklendiği an doğru yazar ID'sini sabitliyoruz
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Önce çerezden tnku_author_id'yi arayalım
      const match = document.cookie.match(new RegExp('(^| )tnku_author_id=([^;]+)'));
      let authorId = match ? match[2] : null;

      // 2. Çerezde yoksa localStorage'a bakalım
      if (!authorId) {
        authorId = localStorage.getItem('tnku_author_id');
      }

      // 3. Hiçbirinde yoksa props'tan gelen userUuid'yi hem state'e hem localStorage'a basalım ki sabitlensin
      if (!authorId && userUuid) {
        authorId = userUuid;
      }

      if (authorId) {
        localStorage.setItem('tnku_author_id', authorId);
        setProfileUrl(`/profil/${encodeURIComponent(authorId)}`);
      }
    }
  }, [userUuid]);

  useEffect(() => {
    if (isNickModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isNickModalOpen]);
  
  const menuItems = [
    { name: 'Beğendiklerim', icon: <Heart size={18} />, href: '/my-likes', isExternal: false, hideOnDesktop: true },
    { name: 'Topluluk Kuralları', icon: <BookOpen size={18} />, href: '/rules', isExternal: false },
    { name: 'Instagram', icon: <ExternalLink size={18} />, href: 'https://instagram.com/tnkuoverheard', isExternal: true },
    { name: 'Bildir / Şikayet', icon: <ShieldAlert size={18} />, href: 'https://instagram.com/tnkuoverheard', isExternal: true },
  ];

  const handleNickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: '' });

    const formData = new FormData();
    formData.append('nickname', nickname);

    const res = await updateCustomNickname(formData);

    if (res?.error) {
      setStatus({ type: 'error', msg: res.error });
    } else if (res?.success) {
      setStatus({ type: 'success', msg: 'Nickin başarıyla ayarlandı! 🎭' });
      setTimeout(() => {
        setIsNickModalOpen(false);
        setNickname('');
        setStatus({ type: null, msg: '' });
        router.refresh();
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 hover:bg-white/5 rounded-full transition-colors text-white cursor-pointer"
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute top-14 right-0 w-64 bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-[24px] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-0.5">
              
              {/* 🔥 Sabit ve Gerçek Profil Linki */}
              <Link 
                href={profileUrl}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-[#4DA3FF]/10 text-[#4DA3FF] transition-all font-bold text-sm cursor-pointer mb-1 border border-[#4DA3FF]/20 bg-[#4DA3FF]/5 shadow-inner"
              >
                <User size={18} /> Profilim
              </Link>

              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsNickModalOpen(true);
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-purple-500/10 text-purple-400 transition-all font-bold text-sm cursor-pointer mb-1 border border-purple-500/20 bg-purple-500/5 shadow-inner"
              >
                <VenetianMask size={18} /> Nickini Belirle
              </button>

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

              <button 
                onClick={() => {
                  setIsOpen(false); 
                  window.dispatchEvent(new Event('trigger-install-modal'));
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-[#4DA3FF]/10 text-[#4DA3FF] font-medium text-sm transition-all border-t border-white/5 mt-2 cursor-pointer"
              >
                <Download size={18} /> Uygulamayı Yükle
              </button>
            </div>
          </div>
        </>
      )}

      {isNickModalOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
          
          <div 
            className="relative w-full max-w-sm bg-[#121212]/95 backdrop-blur-2xl border border-white/10 p-6 rounded-[24px] shadow-2xl my-auto animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            <button 
              onClick={() => !loading && setIsNickModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center mb-4 shadow-inner">
              <VenetianMask size={20} />
            </div>

            <h2 className="text-xl font-black mb-1.5 tracking-tight text-white">Nickini Belirle</h2>
            <p className="text-gray-400 text-xs mb-3 leading-relaxed pr-4">
              İtiraflarında anonim hayvan isimleri yerine kendi seçtiğin özel bir nick kullan.
            </p>

            <div className="flex items-start gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] p-2.5 rounded-lg mb-6 shadow-inner">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span><strong>Aman diyim!</strong> Küfürlü veya hakaret içeren nickler anında sistemden uzaklaştırılır.</span>
            </div>

            <form onSubmit={handleNickSubmit} className="space-y-4">
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="yeni_nickin"
                  maxLength={15}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 group-hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 rounded-xl px-9 py-3.5 text-white text-sm outline-none transition-all shadow-inner"
                />
              </div>

              {status.type === 'error' && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-lg text-xs font-medium">
                  <AlertCircle size={14} className="shrink-0" /> {status.msg}
                </div>
              )}

              {status.type === 'success' && (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 rounded-lg text-xs font-medium">
                  <CheckCircle2 size={14} className="shrink-0" /> {status.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || status.type === 'success'}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:pointer-events-none text-sm cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Kimliğimi Güncelle'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}