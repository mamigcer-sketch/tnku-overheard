"use client";

import { useState, useEffect, useRef } from "react";
import CommentForm from "./CommentForm";
import { Heart, Eye, MapPin, Clock, Users, User, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { incrementView } from "@/app/post/actions";

// 🚀 40x40 (1.600 Kombinasyon) Kısa, Net ve Komik Kampüs Lakap Havuzu
const adjectives = [
  "Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", 
  "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", 
  "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", 
  "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare", 
  "Deli", "Çılgın", "Bıkkın", "Dalgın", "Ters", 
  "Şüpheli", "Kuşkulu", "Durgun", "Hızlı", "Yavaş", 
  "Donuk", "Parlak", "Sinsi", "Kurnaz", "Tatlı", 
  "Sert", "Yabani", "Yalnız", "Suskun", "Coşkulu"
];

const animals = [
  "Kedi", "Köpek", "Panda", "Rakun", "Baykuş", 
  "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", 
  "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek", 
  "Tavuk", "Maymun", "Keçi", "Sincap", "Kurbağa", 
  "Kaplan", "Koala", "Tilki", "Kurt", "Aslan", 
  "Şahin", "Karga", "Köstebek", "Koyun", "İnek", 
  "At", "Eşek", "Fok", "Penguen", "Kirpi", 
  "Sazan", "Yengeç", "Ahtapot", "Kertenkele", "Koala"
];

// ID'ye göre stabil rastgele isim türeten fonksiyon
const getAnonymousName = (id: string) => {
  if (!id) return "Gizemli Yolcu";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const positiveHash = Math.abs(hash);
  const adj = adjectives[positiveHash % adjectives.length];
  const ani = animals[Math.floor(positiveHash / adjectives.length) % animals.length];
  return `${adj} ${ani}`;
};

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
        alert('Link kopyalandı!');
      }
    } catch (err) {
      console.error('Paylaşım hatası:', err);
    }
  };

  const isConfession = post.type === 'CONFESSION';
  const hoverGlow = isConfession 
    ? 'hover:shadow-[0_0_30px_rgba(168,85,247,0.06)] hover:border-purple-500/20' 
    : 'hover:shadow-[0_0_30px_rgba(77,163,255,0.06)] hover:border-[#4DA3FF]/20';

  const authorNickname = getAnonymousName(post.id);

  return (
    <div ref={cardRef} className={`group bg-[#121212]/60 backdrop-blur-2xl border border-white/[0.04] p-5 sm:p-6 rounded-[24px] transition-all duration-500 ${hoverGlow}`}>
      <Link href={`/post/${post.id}`} className="block">
        
        {/* Üst Bilgi Çubuğu */}
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="flex flex-wrap gap-2 text-[10px] font-bold tracking-wider items-center">
            <span className={`px-2.5 py-1 rounded-md uppercase ${isConfession ? 'bg-purple-500/10 text-purple-400' : 'bg-[#4DA3FF]/10 text-[#4DA3FF]'}`}>
              {isConfession ? 'İTİRAF' : 'OVERHEARD'}
            </span>

            {/* 🔥 Komik Anonim Yazar Rozeti */}
            <span className="bg-white/[0.05] text-gray-300 px-2.5 py-1 rounded-md border border-white/[0.05]">
              @{authorNickname}
            </span>
            
            {post.location && (
              <span className="flex items-center gap-1 bg-white/[0.03] text-gray-400 px-2.5 py-1 rounded-md">
                <MapPin className="w-3 h-3" /> {post.location}
              </span>
            )}

            {post.time && (
              <span className="flex items-center gap-1 bg-white/[0.03] text-gray-400 px-2.5 py-1 rounded-md">
                <Clock className="w-3 h-3" /> {post.time}
              </span>
            )}

            {post.people && (
              <span className="flex items-center gap-1 bg-white/[0.03] text-gray-400 px-2.5 py-1 rounded-md">
                <Users className="w-3 h-3" /> {post.people}
              </span>
            )}

            {post.gender && (
              <span className="flex items-center gap-1 bg-white/[0.03] text-gray-400 px-2.5 py-1 rounded-md">
                <User className="w-3 h-3" /> {post.gender}
              </span>
            )}
          </div>
          
          <span className="shrink-0 text-[11px] text-gray-500 font-medium">
            {getRelativeTime(post.createdAt)}
          </span>
        </div>
        
        {/* İçerik */}
        <p className="text-gray-100 text-[14px] sm:text-[15px] leading-relaxed mb-4 sm:mb-5 font-medium break-words tracking-wide">
          {post.content}
        </p>
      </Link>

      {/* Modern Alt Etkileşim Çubuğu */}
      <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 text-gray-400">
        <div className="flex items-center gap-6">
          {/* Beğeni Butonu */}
          <form action={incrementLike}>
            <input type="hidden" name="id" value={post.id} />
            <button type="submit" disabled={isLiked} className={`flex items-center gap-1.5 transition-colors group-button ${isLiked ? 'text-pink-500' : 'hover:text-pink-400'}`}>
              <Heart size={18} className={`transition-transform ${isLiked ? 'fill-pink-500 scale-110' : 'active:scale-95'}`} /> 
              <span className="text-[13px] font-bold">{post.likes}</span>
            </button>
          </form>
          
          {/* Yorum Butonu */}
          <button 
            onClick={() => setShowComment(!showComment)}
            className={`flex items-center gap-1.5 transition-colors ${showComment ? 'text-[#4DA3FF]' : 'hover:text-[#4DA3FF]'}`}
          >
            <MessageCircle size={18} className={`${showComment ? 'fill-[#4DA3FF]/20' : ''}`} /> 
            <span className="text-[13px] font-bold">{post.comments?.length || 0}</span>
          </button>

          {/* Görüntülenme */}
          <div className="flex items-center gap-1.5 opacity-70">
            <Eye size={18} /> 
            <span className="text-[13px] font-bold">{post.views}</span>
          </div>
        </div>

        {/* Paylaş Butonu */}
        <button onClick={handleShare} className="hover:text-white transition-colors bg-white/[0.03] p-2 rounded-full hover:bg-white/[0.08]">
          <Share2 size={16} />
        </button>
      </div>

      {/* Yorum Formu (Açılır/Kapanır Akordeon) */}
      <div className={`grid transition-all duration-300 ease-in-out ${showComment ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-white/[0.04] pt-4">
            <CommentForm postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
}