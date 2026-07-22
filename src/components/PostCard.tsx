"use client";

import { useState, useEffect, useRef } from "react";
import CommentForm from "./CommentForm";
import { Heart, Eye, MapPin, Clock, Users, User, MessageCircle, Share2, Flame, Flag, ShieldAlert, BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { incrementView, submitReport } from "@/app/post/actions";
import { playPopSound, playClickSound } from "@/utils/sounds";

const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare", "Deli", "Çılgın", "Bıkkın", "Dalgın", "Ters", "Şüpheli", "Kuşkulu", "Durgun", "Hızlı", "Yavaş", "Donuk", "Parlak", "Sinsi", "Kurnaz", "Tatlı", "Sert", "Yabani", "Yalnız", "Suskun", "Coşkulu"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek", "Tavuk", "Maymun", "Keçi", "Sincap", "Kurbağa", "Kaplan", "Koala", "Tilki", "Kurt", "Aslan", "Şahin", "Karga", "Köstebek", "Koyun", "İnek", "At", "Eşek", "Fok", "Penguen", "Kirpi", "Sazan", "Yengeç", "Ahtapot", "Kertenkele", "Koala"];
const emojis = ["🦊", "🐼", "🦉", "🦝", "🐨", "🦁", "🐸", "🐙", "🦋", "🦖", "🦄", "🐧", "🐱", "🐶", "🐰", "🐯"];
const gradients = [
  "from-blue-400 to-indigo-600",
  "from-pink-400 to-rose-600",
  "from-purple-400 to-fuchsia-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-cyan-400 to-blue-600"
];

const getAnonymousData = (id: string, customNickname?: string) => {
  if (!id) return { name: "Gizemli Yolcu", emoji: "👤", gradient: gradients[0] };
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  
  if (customNickname) {
    return {
      name: customNickname,
      emoji: emojis[positiveHash % emojis.length], 
      gradient: gradients[Math.floor(positiveHash / emojis.length) % gradients.length]
    };
  }

  return {
    name: `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}`,
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

export default function PostCard({ post, isLiked, incrementLike, customNickname, userBadge, customNicknamesMap = {}, userBadgesMap = {} }: any) {
  const router = useRouter();
  const [showComment, setShowComment] = useState(false);
  const cardRef = useRef(null);
  const [hasViewed, setHasViewed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = post.content.length > 250; 

  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes);
  const [isLikingAnimation, setIsLikingAnimation] = useState(false);
  const [reported, setReported] = useState(false); 
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  
  const [showBigHeart, setShowBigHeart] = useState(false);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const isEphemeral = !!post.expiresAt;
  const isConfession = post.type === 'CONFESSION';
  const isBosYap = post.type === 'BOSYAP';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          if (!hasViewed) {
            incrementView(post.id);
            setHasViewed(true);
          }
        }
      },
      { threshold: 0.15 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    
    return () => {
      observer.disconnect();
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
    };
  }, [post.id, hasViewed]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    const shareData = {
      title: 'TNKU Overheard',
      text: 'Şu paylaşıma bakmalısın!',
      url: `${window.location.origin}/post/${post.id}`,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link kopyalandı!');
      }
    } catch (err) { console.error('Paylaşım hatası:', err); }
  };

  const handleLikeClick = (e: React.FormEvent) => {
    if (localLiked) return;
    playPopSound();
    setLocalLiked(true);
    setLocalLikesCount((prev: number) => prev + 1);
    setIsLikingAnimation(true);
    setTimeout(() => setIsLikingAnimation(false), 1000);
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reported) return;
    playClickSound();
    setShowReportModal(true);
  };

  const submitReportAction = async () => {
    if (!reportReason.trim()) return;
    setIsSubmittingReport(true);
    try {
      await submitReport('POST', post.id, reportReason.trim());
      setReported(true);
      setShowReportModal(false);
      setReportReason("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleCardInteraction = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('form') || target.closest('.interactive-zone') || showReportModal) return;

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      
      playPopSound();
      setShowBigHeart(true); 
      setTimeout(() => setShowBigHeart(false), 900); 

      if (!localLiked) {
        setLocalLiked(true);
        setLocalLikesCount((prev: number) => prev + 1);
        setIsLikingAnimation(true);
        setTimeout(() => setIsLikingAnimation(false), 1000);
        
        const formData = new FormData();
        formData.append('id', post.id);
        incrementLike(formData);
      }
    } else {
      clickTimeout.current = setTimeout(() => {
        router.push(`/post/${post.id}`);
        clickTimeout.current = null;
      }, 250);
    }
  };

  const isTrending = post.likes >= 10; 

  const hoverGlow = isEphemeral
    ? 'hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:border-amber-500/40 border-amber-500/20 bg-amber-500/[0.01]'
    : isConfession 
      ? 'hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:border-purple-500/30' 
      : isBosYap
        ? 'hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:border-emerald-500/30'
        : 'hover:shadow-[0_0_40px_rgba(77,163,255,0.15)] hover:border-[#4DA3FF]/30';

  const authorData = getAnonymousData(post.authorUuid || post.id, customNickname);

  // Yorum önizlemesi için yazar verisi
  const firstComment = post.comments && post.comments.length > 0 ? post.comments[0] : null;
  const commentAuthorUuid = firstComment ? (firstComment.authorId || firstComment.id) : null;
  const commentCustomNick = commentAuthorUuid ? customNicknamesMap[commentAuthorUuid] : undefined;
  const commentAuthorData = commentAuthorUuid ? getAnonymousData(commentAuthorUuid, commentCustomNick) : null;

  return (
    <>
      <div 
        ref={cardRef} 
        onClick={handleCardInteraction} 
        className={`relative group backdrop-blur-2xl border p-5 sm:p-6 rounded-[24px] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-700 ease-out will-change-[opacity,transform] select-none cursor-pointer ${hoverGlow} ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.98]'
        } ${!isEphemeral ? 'bg-white/[0.02] border-white/[0.05]' : ''}`}
      >
        {isTrending && !isEphemeral && (
          <div className={`absolute -inset-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-md -z-10 bg-gradient-to-r ${
            isConfession ? 'from-purple-500/30 to-pink-500/30' 
            : isBosYap ? 'from-emerald-500/30 to-teal-500/30'
            : 'from-[#4DA3FF]/30 to-blue-500/30'
          }`} />
        )}

        {isEphemeral && (
          <div className="absolute -inset-[1px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-md -z-10 bg-gradient-to-r from-amber-500/40 to-orange-500/40" />
        )}

        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50 transition-all duration-500 ease-out ${
          showBigHeart ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.3] translate-y-8'
        }`}>
          <Heart size={100} className="text-pink-500 drop-shadow-[0_0_40px_rgba(236,72,153,0.8)] fill-pink-500" />
        </div>

        <div className="block relative z-10">
          <div className="flex justify-between items-start gap-3 mb-4">
            <div className="flex flex-wrap gap-2 text-[10px] font-bold tracking-wider items-center">
              
              {isEphemeral ? (
                <span className="px-2.5 py-1 rounded-md uppercase flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                  <Clock size={12} /> 24 Saatlik {isConfession ? 'İtiraf' : 'Fısıltı'} ⏳
                </span>
              ) : (
                <span className={`px-2.5 py-1 rounded-md uppercase flex items-center gap-1 ${
                  isConfession ? 'bg-purple-500/10 text-purple-400' 
                  : isBosYap ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-[#4DA3FF]/10 text-[#4DA3FF]'
                }`}>
                  {isTrending && <Flame size={12} className="animate-pulse" />}
                  {/* 🔥 DÜZELTME BURADA YAPILDI: Boş yap rozeti artık doğru basılıyor */}
                  {isConfession ? 'İTİRAF' : isBosYap ? 'BOŞ YAP' : 'OVERHEARD'}
                </span>
              )}

              <div className="flex items-center gap-2">
                {userBadge && (
                  <span className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.15)] flex items-center">
                    {userBadge}
                  </span>
                )}
                
                <span className={`flex items-center gap-1.5 bg-white/[0.04] text-gray-200 pr-3 pl-1.5 py-1 rounded-lg border shadow-sm hover:bg-white/[0.08] transition-colors ${customNickname ? 'border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 'border-white/[0.05]'}`}>
                  <div className={`w-5 h-5 flex items-center justify-center rounded-md ${customNickname ? 'bg-gradient-to-br from-amber-500/20 to-pink-500/20 border border-pink-500/30 text-pink-400' : `${authorData.gradient} text-[10px]`} shadow-inner`}>
                    {customNickname ? (
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    ) : (
                      authorData.emoji
                    )}
                  </div>
                  <span className="font-semibold text-[11px] tracking-wide">
                    @{authorData.name}
                  </span>
                </span>
              </div>
              
              {post.location && <span className="flex items-center gap-1 bg-white/[0.03] text-gray-400 px-2.5 py-1 rounded-md"><MapPin className="w-3 h-3" /> {post.location}</span>}
              {post.time && <span className="flex items-center gap-1 bg-white/[0.03] text-gray-400 px-2.5 py-1 rounded-md"><Clock className="w-3 h-3" /> {post.time}</span>}
              {post.people && <span className="flex items-center gap-1 bg-white/[0.03] text-gray-400 px-2.5 py-1 rounded-md"><Users className="w-3 h-3" /> {post.people}</span>}
              {post.gender && <span className="flex items-center gap-1 bg-white/[0.03] text-gray-400 px-2.5 py-1 rounded-md"><User className="w-3 h-3" /> {post.gender}</span>}
            </div>
            <span className="shrink-0 text-[11px] text-gray-500 font-medium">{getRelativeTime(post.createdAt)}</span>
          </div>

          <div className="mb-4 sm:mb-5 relative z-10 transition-all duration-300">
            <p className={`text-gray-100 text-[15px] sm:text-[16px] leading-relaxed font-medium break-words tracking-wide ${!isExpanded && isLongText ? 'line-clamp-4' : ''}`}>
              {post.content}
            </p>
            {!isExpanded && isLongText && (
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  playClickSound();
                  setIsExpanded(true); 
                }}
                className={`font-bold text-[13px] sm:text-[14px] mt-1 transition-colors active:scale-95 inline-block ${
                  isEphemeral ? 'text-amber-400 hover:text-amber-300' : 'text-[#4DA3FF] hover:text-blue-400'
                }`}
              >
                Devamını Oku...
              </button>
            )}
          </div>
        </div>

        {firstComment && firstComment.content && commentAuthorData && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              router.push(`/post/${post.id}`);
            }}
            className="mt-3 mb-2 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 flex gap-2.5 items-start cursor-pointer hover:bg-white/[0.05] transition-colors shadow-inner relative z-10"
          >
            <span className="text-[13px] opacity-60 mt-0.5">💬</span>
            <div className="text-[13px] text-gray-400 line-clamp-2 leading-relaxed">
              <span className="font-bold text-gray-200 mr-1.5">
                @{commentAuthorData.name}:
              </span>
              {firstComment.content}
            </div>
          </div>
        )}

        <div 
          onClick={(e) => e.stopPropagation()} 
          className="interactive-zone flex items-center justify-between border-t border-white/[0.04] pt-4 text-gray-400 relative z-10 cursor-default"
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <form action={incrementLike} onSubmit={handleLikeClick}>
              <input type="hidden" name="id" value={post.id} />
              <button 
                type="submit" 
                disabled={localLiked} 
                className={`group/like relative flex items-center gap-2 transition-all duration-300 rounded-xl px-2 py-1 -ml-2 ${
                  localLiked ? 'text-pink-500' : 'hover:text-pink-400 hover:bg-pink-500/10'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  {isLikingAnimation && <span className="absolute w-8 h-8 bg-pink-500 rounded-full animate-ping opacity-60"></span>}
                  <Heart size={18} className={`relative z-10 transition-all duration-500 ease-out ${isLikingAnimation ? 'fill-pink-500 scale-150 drop-shadow-[0_0_20px_rgba(236,72,153,1)]' : localLiked ? 'fill-pink-500 scale-110 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'active:scale-50 group-hover/like:scale-110'}`} /> 
                </div>
                <span className={`text-[13px] font-bold transition-all duration-300 ${isLikingAnimation ? 'scale-125 text-pink-400' : ''}`}>{localLikesCount}</span>
              </button>
            </form>
            
            <button onClick={() => { playClickSound(); setShowComment(!showComment); }} className={`flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-xl transition-all duration-300 ${showComment ? (isEphemeral ? 'text-amber-400 bg-amber-500/10' : 'text-[#4DA3FF] bg-[#4DA3FF]/10') : (isEphemeral ? 'hover:text-amber-400 hover:bg-amber-500/10' : 'hover:text-[#4DA3FF] hover:bg-[#4DA3FF]/10')} active:scale-90`}>
              <MessageCircle size={18} className={`${showComment ? (isEphemeral ? 'fill-amber-400/20' : 'fill-[#4DA3FF]/20') : ''}`} /> 
              <span className="text-[13px] font-bold">{post._count?.comments || post.comments?.length || 0}</span>
            </button>

            <div className="flex items-center gap-1.5 opacity-70 cursor-default">
              <Eye size={18} /> 
              <span className="text-[13px] font-bold">{post.views}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={handleReportClick}
              className={`flex items-center gap-1.5 transition-all duration-300 hover:text-red-400 hover:bg-red-500/10 rounded-full px-3 py-2 ${reported ? 'text-red-500 bg-red-500/10' : 'bg-white/[0.03] text-gray-400'}`}
            >
              <Flag size={14} />
              <span className="text-[11px] font-bold hidden sm:inline">{reported ? 'İletildi' : 'Şikayet Et'}</span>
            </button>

            <button 
              onClick={handleShare} 
              className="group/share flex items-center justify-center text-gray-400 transition-all duration-300 bg-white/[0.03] p-2.5 rounded-full border border-transparent hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:scale-110 active:scale-75 shadow-sm"
            >
              <Share2 size={16} className="transition-transform duration-300 group-hover/share:-rotate-12" />
            </button>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()} className={`interactive-zone grid transition-all duration-500 ease-in-out relative z-10 cursor-default ${showComment ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
          <div className="overflow-hidden">
            <div className="border-t border-white/[0.04] pt-4">
              <CommentForm postId={post.id} />
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); setShowReportModal(false); }}
        >
          <div 
            className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/10 p-3 rounded-2xl border border-red-500/20">
                <ShieldAlert className="text-red-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Şikayet Et</h3>
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">Gizli & Güvenli</p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Bu gönderiyi neden şikayet ediyorsunuz? Lütfen kısaca belirtin. (Spam, Hakaret, vb.)
            </p>
            
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Şikayet sebebiniz..."
              className="w-full bg-[#0B0B0B] border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none h-28 mb-5"
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-sm bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={submitReportAction}
                disabled={!reportReason.trim() || isSubmittingReport}
                className="flex-1 py-3 rounded-2xl font-bold text-sm bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmittingReport ? 'İletiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}