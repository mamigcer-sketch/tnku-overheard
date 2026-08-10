"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import ProfileAvatarModal from "./ProfileAvatarModal";

export default function EditableAvatar({
  userUuid,
  currentAvatar,
  displayNickname,
  isOwnProfile
}: {
  userUuid: string;
  currentAvatar?: string;
  displayNickname: string;
  isOwnProfile: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => isOwnProfile && setIsModalOpen(true)}
        className={`relative w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-full p-[2px] bg-gradient-to-tr from-[#4DA3FF] via-purple-500 to-pink-500 shrink-0 transition-transform ${isOwnProfile ? 'cursor-pointer hover:scale-105' : ''}`}
      >
        <div className="w-full h-full rounded-full bg-[#121212] border-[3px] border-black flex items-center justify-center overflow-hidden relative group">
          {currentAvatar?.startsWith("data:image") ? (
            <img src={currentAvatar} alt="Profil" className="w-full h-full object-cover" />
          ) : currentAvatar ? (
            <span className="text-4xl sm:text-5xl">{currentAvatar}</span>
          ) : (
            <span className="text-[32px] font-black opacity-50 text-white">{displayNickname.charAt(0)}</span>
          )}

          {/* Kendi profiliyse hover olunca kamera ikonu çıkar */}
          {isOwnProfile && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white drop-shadow-lg" />
            </div>
          )}
        </div>
      </div>

      <ProfileAvatarModal
        userUuid={userUuid}
        currentAvatar={currentAvatar}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}