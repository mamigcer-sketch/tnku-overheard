"use client";

import { useState, useEffect, useRef } from "react";
import CommentForm from "./CommentForm";
import { Heart, Eye, MapPin, Clock, Users, User, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { incrementView } from "@/app/post/actions";

// Ne kadar zaman önce paylaşıldığını hesaplayan fonksiyon
const getRelativeTime = (dateString: string) => {
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

export default function PostCard({ post, isLiked, incrementLike }: any) {
  const [showComment, setShowComment] = useState(false);
  const cardRef = useRef(null);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasViewed) {
          incrementView(post.id);
          setHasViewed(true);
        }
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [post.id, hasViewed]);

  const handleShare = async () => {
    const shareData = {
      title: 'TNKU Overheard',
      text: 'Şu paylaşıma bakmalısın!',
      url: `${window.location.origin}/post/${post.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link kopyalandı kanka!');
      }
    } catch (err) {
      console.error('Paylaşım hatası:', err);
    }
  };

  return (
    <div ref={cardRef} className="group bg-[#121212]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 rounded-[24px] hover:bg-[#1a1a1a]/90 hover:border-white/10 transition-all duration-300 shadow-lg">
      <Link href={`/post/${post.id}`} className="block">
        
        {/* Üst Bilgi Çubuğu (Etiketler ve Zaman) */}
        <div className="flex justify-between items-start gap-3 mb-3 sm:mb-4">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-gray-400">
            <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border tracking-wide ${post.type === 'CONFESSION' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-[#4DA3FF]/10 border-[#4DA3FF]/20 text-[#4DA3FF]'}`}>
              {post.type === 'CONFESSION' ? 'İTİRAF' : 'OVERHEARD'}
            </span>
            
            {post.location && (
              <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/5">
                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {post.location}
              </span>
            )}

            {post.time && (
              <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/5">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {post.time}
              </span>
            )}

            {post.people && (
              <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/5">
                <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {post.people}
              </span>
            )}

            {post.gender && (
              <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/5">
                <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {post.gender}
              </span>
            )}
          </div>
          
          {/* Gönderi Zamanı (Mobilde sağ üstte sabit kalması için shrink-0) */}
          <span className="shrink-0 text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap bg-white/5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full mt-0">
            {getRelativeTime(post.createdAt)}
          </span>
        </div>
        
        {/* Metin Boyutu Mobilde Tık Daha Küçültüldü */}
        <p className="text-white text-[15px] sm:text-[16px] leading-relaxed mb-5 sm:mb-6 font-normal break-words">{post.content}</p>
      </Link>

      {/* Alt Etkileşim Çubuğu */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3 sm:pt-4 text-gray-400">
        <div className="flex items-center gap-4 sm:gap-5">
          <form action={incrementLike}>
            <input type="hidden" name="id" value={post.id} />
            <button type="submit" disabled={isLiked} className={`flex items-center gap-1.5 transition-all group-button ${isLiked ? 'text-red-500' : 'hover:text-red-400'}`}>
              <Heart size={18} className={`transition-transform ${isLiked ? 'fill-red-500 scale-110' : 'active:scale-95'}`} /> 
              <span className="text-[13px] sm:text-sm font-medium">{post.likes}</span>
            </button>
          </form>
          
          <div className="flex items-center gap-1.5">
            <Eye size={18} /> <span className="text-[13px] sm:text-sm font-medium">{post.views}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <MessageCircle size={18} /> <span className="text-[13px] sm:text-sm font-medium">{post.comments?.length || 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={(e) => {
              e.preventDefault();
              setShowComment(!showComment);
            }}
            className={`text-[11px] sm:text-xs font-medium px-3 sm:px-4 py-1.5 rounded-full transition-all flex items-center gap-1 border ${showComment ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-[#4DA3FF]/10 text-[#4DA3FF] border-[#4DA3FF]/20 hover:bg-[#4DA3FF]/20'}`}
          >
            {showComment ? "Vazgeç" : "Yorum Yap"}
          </button>

          <button onClick={handleShare} className="hover:text-white transition-colors bg-white/5 p-1.5 rounded-full hover:bg-white/10">
            <Share2 size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Yorum Formu (Akordeon gibi açılır) */}
      <div className={`grid transition-all duration-300 ease-in-out ${showComment ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-white/5 pt-4">
            <CommentForm postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
}