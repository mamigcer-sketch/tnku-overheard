"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VenetianMask, X, AlertCircle, CheckCircle2, Loader2, Pencil } from 'lucide-react';
import { updateCustomNickname } from '@/app/profile/actions';

export default function ProfileNickEdit({ targetUuid, currentNick, isServerOwner }: { targetUuid: string, currentNick: string, isServerOwner: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });
  
  const router = useRouter();

  const [isOwner, setIsOwner] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // 🔥 1. Kontrol: Sunucu bu senin profilin diyorsa direkt göster!
    if (isServerOwner) {
      setIsOwner(true);
      return;
    }

    // 🔥 2. Kontrol: Sunucu göremezse diye LocalStorage yedek kontrolü
    const localChatId = localStorage.getItem('tnku_chat_anon_id');
    const localAnonId = localStorage.getItem('tnku_anon_id');

    if (targetUuid === localChatId || targetUuid === localAnonId || targetUuid === 'ben') {
      setIsOwner(true);
    }
  }, [targetUuid, isServerOwner]);

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: '' });

    const formData = new FormData();
    formData.append('nickname', nickname);
    
    // Gerçek UUID'yi alıp forma mühürlüyoruz
    let finalUuid = targetUuid;
    if (targetUuid === 'ben') {
      finalUuid = localStorage.getItem('tnku_chat_anon_id') || localStorage.getItem('tnku_anon_id') || '';
    }
      
    formData.append('userUuid', finalUuid);

    const res = await updateCustomNickname(formData);

    if (res?.error) {
      setStatus({ type: 'error', msg: res.error });
    } else if (res?.success) {
      setStatus({ type: 'success', msg: 'Nickin başarıyla ayarlandı! 🎭' });
      setTimeout(() => {
        setIsModalOpen(false);
        setNickname('');
        setStatus({ type: null, msg: '' });
        router.refresh();
      }, 2000);
    }
    setLoading(false);
  };

  if (!isMounted) return null;

  // 🔥 Sen değilsen butonu HİÇ ekrana basma!
  if (!isOwner) return null;

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        // 🔥 BUTON DİNAMİK YAPILDI
        className="mt-4 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-[#4DA3FF]/10 dark:hover:bg-[#4DA3FF]/20 text-blue-600 dark:text-[#4DA3FF] border border-blue-200 dark:border-[#4DA3FF]/30 px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 shadow-sm w-full sm:w-auto"
      >
        <Pencil size={14} /> Nick Belirle / Değiştir
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200 transition-colors" onClick={() => setIsModalOpen(false)}>
          <div className="relative w-full max-w-sm bg-white/95 dark:bg-[#121212]/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 p-6 rounded-[24px] shadow-xl dark:shadow-2xl transition-colors duration-300" onClick={e => e.stopPropagation()}>
            <button onClick={() => !loading && setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer">
              <X size={18} />
            </button>
            
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-500/20 dark:to-pink-500/20 border border-pink-200 dark:border-pink-500/30 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4 shadow-inner transition-colors duration-300">
              <VenetianMask size={20} />
            </div>
            
            <h2 className="text-xl font-black mb-1.5 text-gray-900 dark:text-white transition-colors duration-300">Profil Kimliği</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 leading-relaxed pr-4 transition-colors duration-300">Sistemde görünecek özel adını (nickini) belirle veya değiştir.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold transition-colors">@</span>
                <input 
                  type="text" 
                  value={nickname} 
                  onChange={(e) => setNickname(e.target.value)} 
                  placeholder={currentNick.includes(' ') ? "yeni_nickin" : currentNick} 
                  maxLength={15} 
                  required 
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 focus:border-purple-400 dark:focus:border-purple-500/50 rounded-xl px-9 py-3.5 text-gray-900 dark:text-white text-sm outline-none transition-all shadow-inner placeholder-gray-400 dark:placeholder-gray-500" 
                />
              </div>
              
              {status.type === 'error' && <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20 p-3 rounded-lg text-xs font-medium transition-colors duration-300"><AlertCircle size={14} className="shrink-0" /> {status.msg}</div>}
              {status.type === 'success' && <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 p-3 rounded-lg text-xs font-medium transition-colors duration-300"><CheckCircle2 size={14} className="shrink-0" /> {status.msg}</div>}

              <button type="submit" disabled={loading || status.type === 'success'} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(168,85,247,0.2)] dark:shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 text-sm cursor-pointer active:scale-95">
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Güncelle'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}