"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Camera, Check, Upload, Loader2 } from "lucide-react";
import { updateProfileAvatar } from "@/app/profile/actions";
import { useRouter } from "next/navigation";

const PRESET_AVATARS = [
  "🎭", "🦊", "🐺", "🦁", "🐱", "🦉", 
  "🥷", "👻", "👾", "👑", "🔥", "⚡"
];

export default function ProfileAvatarModal({
  userUuid,
  currentAvatar,
  isOpen,
  onClose,
}: {
  userUuid: string;
  currentAvatar?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔥 PORTAL İÇİN MOUNT KONTROLÜ VE ARKA PLAN KAYDIRMA KİLİDİ
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Fotoğraf boyutu maksimum 2MB olabilir!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedAvatar) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("userUuid", userUuid);
    formData.append("avatarUrl", selectedAvatar);

    const res = await updateProfileAvatar(formData);

    if (res?.success) {
      router.refresh();
      onClose();
    } else if (res?.error) {
      alert(res.error);
    }
    setLoading(false);
  };

  // 🔥 MODALI CREATEPORTAL İLE DİREKT BODY'YE IŞINLIYORUZ (Asla kesilmez)
  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-sm overflow-y-auto flex p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="m-auto relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 p-6 rounded-[28px] shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-black text-white mt-2 mb-1 tracking-tight">Profil Resmi Seç</h2>
        <p className="text-gray-400 text-xs mb-6 pr-8 leading-relaxed">
          Karakterini belirle veya galerinden yükle.
        </p>

        {/* ÖN İZLEME */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 rounded-full border-2 border-[#4DA3FF] p-1 bg-black/40 flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(77,163,255,0.2)]">
            {selectedAvatar?.startsWith("data:image") ? (
              <img src={selectedAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : selectedAvatar ? (
              <span className="text-4xl">{selectedAvatar}</span>
            ) : (
              <Camera size={32} className="text-gray-500" />
            )}
          </div>
        </div>

        {/* HAZIR AVATARLAR */}
        <div className="grid grid-cols-6 gap-2 mb-6">
          {PRESET_AVATARS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedAvatar(emoji)}
              className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                selectedAvatar === emoji 
                  ? "bg-[#4DA3FF]/20 border-2 border-[#4DA3FF] scale-105 shadow-[0_0_15px_rgba(77,163,255,0.3)]" 
                  : "bg-white/[0.04] hover:bg-white/10 border border-white/5"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* GALERİDEN YÜKLE & KAYDET */}
        <div className="space-y-3">
          <label className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95">
            <Upload size={16} />
            <span>Galeriden Fotoğraf Seç</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedAvatar}
            className="w-full py-3.5 bg-[#4DA3FF] hover:bg-blue-400 text-black font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Resmini Güncelle</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}