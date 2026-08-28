"use client";

import { useState } from 'react';
import { Pencil, X, VenetianMask, Loader2, CheckCircle2 } from 'lucide-react';
import { updateCustomNickname } from '@/app/post/actions'; 
import { useRouter } from 'next/navigation';

export default function ProfileNickEdit({ targetUuid, currentNick, isServerOwner }: { targetUuid: string, currentNick: string, isServerOwner: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNickname] = useState(currentNick);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  if (!isServerOwner) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setIsLoading(true);

    try {
      // 🔥 SENİN ORİJİNAL FONKSİYONUNA FORM DATA İLE GÖNDERİYORUZ 🔥
      const formData = new FormData();
      formData.append('userUuid', targetUuid);
      formData.append('nickname', nickname.trim());

      await updateCustomNickname(formData);
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 border border-[#4DA3FF]/30 bg-[#4DA3FF]/10 text-[#4DA3FF] font-bold text-[14px] hover:bg-[#4DA3FF]/20 active:scale-95 transition-all shadow-inner"
      >
        <Pencil size={16} /> Nick Belirle / Değiştir
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsOpen(false)}></div>
          
          <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-sm rounded-[32px] p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10 shadow-2xl">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl text-white shadow-lg shadow-purple-500/30">
                <VenetianMask size={24} />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Profil Kimliği</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">@</span>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Yeni nick..."
                    maxLength={20}
                    className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-10 pr-4 text-gray-900 dark:text-white font-bold outline-none focus:border-purple-500 transition-colors shadow-inner"
                  />
                </div>
                <p className="text-[10px] text-gray-500 font-medium mt-2 px-1">En fazla 20 karakter. Küfürlü isimler sistem tarafından kalıcı banlanır.</p>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || isSuccess || !nickname.trim() || nickname === currentNick}
                className={`w-full py-4 rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : isLoading ? 'bg-gray-200 dark:bg-white/10 text-gray-500 cursor-not-allowed shadow-none'
                  : !nickname.trim() || nickname === currentNick ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 text-white shadow-purple-500/30 active:scale-95'
                }`}
              >
                {isSuccess ? <><CheckCircle2 size={20} /> Güncellendi!</> : isLoading ? <><Loader2 size={20} className="animate-spin" /> Kaydediliyor...</> : 'Güncelle'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}