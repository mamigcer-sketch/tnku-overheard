"use client";

import { useState, useEffect } from "react";
import { Heart, Reply } from "lucide-react";
import { toggleCommentLike } from "@/app/post/actions";

const getRelativeTime = (dateString: string | Date) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Az önce";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Dün";
  if (diffInDays < 7) return `${diffInDays} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

export default function CommentItem({ 
  comment, 
  commentAuthor, 
  isPostAuthor, 
  isInitiallyLiked = false, 
  onReply, 
  isReply = false 
}: any) {
  const [localLiked, setLocalLiked] = useState(isInitiallyLiked);
  const [localLikesCount, setLocalLikesCount] = useState(comment.likes || 0);
  const [isLikingAnimation, setIsLikingAnimation] = useState(false);

  // 🔥 Sunucudan gelen güncel props verilerini state ile senkronize ediyoruz
  useEffect(() => {
    setLocalLiked(isInitiallyLiked);
  }, [isInitiallyLiked]);

  useEffect(() => {
    setLocalLikesCount(comment.likes || 0);
  }, [comment.likes]);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleLike = async () => {
    triggerHaptic();

    const nextLikedState = !localLiked;
    setLocalLiked(nextLikedState);
    setLocalLikesCount((prev: number) => nextLikedState ? prev + 1 : Math.max(0, prev - 1));

    if (nextLikedState) {
      setIsLikingAnimation(true);
      setTimeout(() => setIsLikingAnimation(false), 1000);
    }

    try {
      await toggleCommentLike(comment.id, comment.postId);
    } catch (err) {
      console.error("Beğeni güncellenemedi:", err);
      setLocalLiked(!nextLikedState);
      setLocalLikesCount((prev: number) => !nextLikedState ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  return (
    <div className={`bg-white/[0.02] backdrop-blur-md border border-white/[0.05] p-4 sm:p-5 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all hover:border-white/[0.1] hover:bg-white/[0.04] ${
      isReply ? 'ml-6 sm:ml-10 border-l-2 border-l-[#4DA3FF]/40 bg-white/[0.01]' : ''
    }`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 flex items-center justify-center rounded-md bg-gradient-to-br ${commentAuthor.gradient} text-[12px] shadow-inner`}>
            {commentAuthor.emoji}
          </div>
          <span className="font-bold text-[12px] text-gray-200 tracking-wide">@{commentAuthor.name}</span>
          
          {isPostAuthor && (
            <span className="bg-[#4DA3FF]/10 text-[#4DA3FF] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#4DA3FF]/20 shadow-sm">
              Yazar
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-500 font-medium">{getRelativeTime(comment.createdAt)}</span>
      </div>
      
      <p className="text-gray-300 text-[14px] leading-relaxed break-words mb-4">{comment.content}</p>
      
      <div className="flex items-center gap-4 pt-3 border-t border-white/[0.02] text-gray-400">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-all duration-300 rounded-lg px-2 py-1 -ml-2 ${localLiked ? 'text-pink-500' : 'hover:text-pink-400 hover:bg-pink-500/10'}`}
        >
          <div className="relative flex items-center justify-center">
            {isLikingAnimation && <span className="absolute w-6 h-6 bg-pink-500 rounded-full animate-ping opacity-60"></span>}
            <Heart 
              size={14} 
              className={`relative z-10 transition-all duration-500 ease-out ${
                isLikingAnimation ? 'fill-pink-500 scale-150 drop-shadow-[0_0_15px_rgba(236,72,153,1)]' 
                : localLiked ? 'fill-pink-500 scale-110 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'active:scale-50'
              }`} 
            />
          </div>
          <span className="text-[11px] font-bold">{localLikesCount}</span>
        </button>

        {onReply && (
          <button 
            onClick={() => { triggerHaptic(); onReply(comment.id, commentAuthor.name); }}
            className="flex items-center gap-1.5 transition-all duration-300 hover:text-[#4DA3FF] hover:bg-[#4DA3FF]/10 rounded-lg px-2 py-1 -ml-2 active:scale-90"
          >
            <Reply size={14} />
            <span className="text-[11px] font-bold">Yanıtla</span>
          </button>
        )}
      </div>
    </div>
  );
}