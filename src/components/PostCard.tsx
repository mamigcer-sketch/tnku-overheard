"use client";

import { useState, useEffect, useRef } from "react";
import CommentForm from "./CommentForm";
import { Heart, Eye, MapPin, Clock, Users, User, MessageCircle, Share2, Flame } from "lucide-react";
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

const emojis = ["🦊", "🐼", "🦉", "🦝", "🐨", "🦁", "🐸", "🐙", "🦋", "🦖", "🦄", "🐧", "🐱", "🐶", "🐰", "🐯"];
const gradients = [
  "from-blue-400 to-indigo-600",
  "from-pink-400 to-rose-600",
  "from-purple-400 to-fuchsia-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-cyan-400 to-blue-600"
];

// Verilen ID'ye göre stabil rastgele isim ve avatar türeten fonksiyon
const getAnonymousData = (id: string) => {
  if (!id) return { name: "Gizemli Yolcu", emoji: "👤", gradient: gradients[0] };
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const positiveHash = Math.abs(hash);
  
  const adj = adjectives[positiveHash % adjectives.length];
  const ani = animals[Math.floor(positiveHash / adjectives.length) % animals.length];
  
  return {
    name: `${adj} ${ani}`,
    emoji: emojis[positiveHash % emojis.length],
    gradient: gradients[Math.floor(positiveHash / emojis.length) % gradients.length]
  };
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
  
  // 🔥 10 beğeni alması VE atıldığı andan itibaren 24 saat (86.400.000 ms) geçmemiş olması şartı eklendi
  const isTrending = post.likes >= 10 && (new Date().getTime() - new Date(post.createdAt).getTime() < 24 * 60 * 60 * 1000); 

  const hoverGlow = isConfession 
    ? 'hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:border-purple-500/30' 
    : 'hover:shadow-[0_0_40px_rgba(77,163,255,0.15)] hover:border-[#4DA3FF]/30';

  // Yazar Bilgileri (İsim + Renk + Emoji)
  const authorData = getAnonymousData(post.authorUuid || post.id);

  return (
    <div 
      ref={cardRef} 
      className={`relative group bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] p-5 sm:p-6 rounded-[24px] transition-all duration-500 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] ${hoverGlow}`}
    >
      {/* 🔥 Trend Olan Gönderiler İçin Arka Plan Yansıması */}
      {isTrending && (
        <div className={`absolute -inset-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-md -z-10 bg-gradient-to-r ${isConfession ? 'from-purple-500/30 to-pink-500/30' : 'from-[#4DA3FF]/30 to-blue-500/30'}`} />
      )}

      <Link href={`/post/${post.id}`} className="block relative z-10">
        
        {/* Üst Bilgi Çubuğu */}
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="flex flex-wrap gap-2 text-[10px] font-bold tracking-wider items-center">
            
            {/* Kategori Etiketi */}
            <span className={`px-2.5 py-1 rounded-md uppercase flex items-center gap-1 ${isConfession ? 'bg-purple-500/10 text-purple-400' : 'bg-[#4DA3FF]/10 text-[#4DA3FF]'}`}>
              {isTrending && <Flame size={12} className="animate-pulse" />}
              {isConfession ? 'İTİRAF' : 'OVERHEARD'}
            </span>

            {/* 🎨 Rastgele Avatar & İsim Rozeti */}
            <span className="flex items-center gap-1.5 bg-white/[0.04] text-gray-200 pr-3 pl-1.5 py-1 rounded-lg border border-white/[0.05] shadow-sm hover:bg-white/[0.08] transition-colors">
              <div className={`w-5 h-5 flex items-center justify-center rounded-md bg-gradient-to-br ${authorData.gradient} text-[10px] shadow-inner`}>
                {authorData.emoji}
              </div>
              <span className="font-semibold text-[11px] tracking-wide">@{authorData.name}</span>
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
        <p className="text-gray-100 text-[15px] sm:text-[16px] leading-relaxed mb-4 sm:mb-5 font-medium break-words tracking-wide">
          {post.content}
        </p>
      </Link>

      {/* Modern Alt Etkileşim Çubuğu */}
      <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 text-gray-400 relative z-10">
        <div className="flex items-center gap-6">
          {/* Beğeni Butonu */}
          <form action={incrementLike}>
            <input type="hidden" name="id" value={post.id} />
            <button type="submit" disabled={isLiked} className={`flex items-center gap-1.5 transition-all group-button ${isLiked ? 'text-pink-500' : 'hover:text-pink-400'}`}>
              <Heart size={18} className={`transition-all duration-300 ${isLiked ? 'fill-pink-500 scale-110 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'active:scale-75'}`} /> 
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
        <button onClick={handleShare} className="hover:text-white transition-all duration-300 bg-white/[0.03] p-2 rounded-full hover:bg-white/[0.08] hover:scale-110 active:scale-95">
          <Share2 size={16} />
        </button>
      </div>

      {/* Yorum Formu (Açılır/Kapanır Akordeon) */}
      <div className={`grid transition-all duration-300 ease-in-out relative z-10 ${showComment ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-white/[0.04] pt-4">
            <CommentForm postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
}