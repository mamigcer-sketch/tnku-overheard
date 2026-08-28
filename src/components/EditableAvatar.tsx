"use client";

import { useState } from 'react';
import { Pencil, Upload, X, Loader2 } from 'lucide-react';
import { updateProfileAvatar } from '@/app/post/actions'; 
import { useRouter } from 'next/navigation';

const PRESET_AVATARS = ["🎭", "🦊", "🐺", "🦁", "🐱", "🦉", "🥷", "👻", "👾", "👑", "🔥", "⚡"];

export default function EditableAvatar({ userUuid, currentAvatar, displayNickname, isOwnProfile }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400; 
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSelect = async (avatarValue: string) => {
    setIsLoading(true);
    try {
      // 🔥 SENİN ORİJİNAL FONKSİYONUNA FORM DATA İLE GÖNDERİYORUZ 🔥
      const formData = new FormData();
      formData.append('userUuid', userUuid);
      formData.append('avatarUrl', avatarValue);

      await updateProfileAvatar(formData);
      
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const compressedBase64 = await compressImage(file);
      
      // 🔥 YÜKLENEN FOTOĞRAFI FORM DATA İLE GÖNDERİYORUZ 🔥
      const formData = new FormData();
      formData.append('userUuid', userUuid);
      formData.append('avatarUrl', compressedBase64);

      await updateProfileAvatar(formData);
      
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Yükleme hatası:", error);
      alert("Fotoğraf yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => isOwnProfile && setIsOpen(true)}>
        <div className="w-[84px] h-[84px] rounded-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-[#1A1A1A] border-2 border-gray-200 dark:border-white/10 shadow-inner">
          {currentAvatar?.startsWith('data:image') ? (
            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : currentAvatar ? (
            <span className="text-[40px] leading-none">{currentAvatar}</span>
          ) : (
            <span className="text-[32px] font-black text-gray-400 dark:text-gray-500 uppercase">{displayNickname?.charAt(0)}</span>
          )}
        </div>
        
        {isOwnProfile && (
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#4DA3FF] rounded-full border-[3px] border-white dark:border-[#0A0A0A] flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110">
            <Pencil size={14} className="fill-white" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isLoading && setIsOpen(false)}></div>
          
          <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-sm rounded-[32px] p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10 shadow-2xl">
            {!isLoading && (
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            )}

            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Profil Resmi Seç</h2>
              <p className="text-[12px] font-medium text-gray-500 mt-1">Karakterini belirle veya galerinden yükle.</p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-[#4DA3FF]/30 p-1 flex items-center justify-center bg-gray-50 dark:bg-[#121212] shadow-[0_0_20px_rgba(77,163,255,0.2)]">
                 {currentAvatar?.startsWith('data:image') ? (
                  <img src={currentAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : currentAvatar ? (
                  <span className="text-[48px] leading-none drop-shadow-md">{currentAvatar}</span>
                ) : (
                  <span className="text-[40px] font-black text-gray-400 dark:text-gray-600 uppercase">{displayNickname?.charAt(0)}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2 mb-6 bg-gray-50 dark:bg-[#050505] p-3 rounded-2xl border border-gray-200 dark:border-white/5">
              {PRESET_AVATARS.map((emoji) => (
                <button 
                  key={emoji} 
                  disabled={isLoading}
                  onClick={() => handleSelect(emoji)}
                  className="aspect-square flex items-center justify-center text-[24px] bg-white dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 hover:scale-110 active:scale-95 transition-all shadow-sm dark:shadow-none disabled:opacity-50"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="relative">
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
              <button 
                disabled={isLoading}
                className={`w-full py-4 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isLoading 
                    ? 'bg-[#4DA3FF] text-white cursor-wait' 
                    : 'bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 active:scale-95'
                }`}
              >
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Yükleniyor...</> : <><Upload size={18} /> Galeriden Fotoğraf Seç</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}