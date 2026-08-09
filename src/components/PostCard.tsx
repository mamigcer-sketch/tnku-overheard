"use client";

import { useState, useEffect, useRef } from "react";
import CommentForm from "./CommentForm";
import AnonymousPlayer from "./AnonymousPlayer";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import { incrementView, submitReport } from "@/app/post/actions";
import { playPopSound, playClickSound } from "@/utils/sounds";

const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare", "Deli", "Çılgın", "Bıkkın", "Dalgın", "Ters", "Şüpheli", "Kuşkulu", "Durgun", "Hızlı", "Yavaş", "Donuk", "Parlak", "Sinsi", "Kurnaz", "Tatlı", "Sert", "Yabani", "Yalnız", "Suskun", "Coşkulu"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek", "Tavuk", "Maymun", "Keçi", "Sincap", "Kurbağa", "Kaplan", "Koala", "Tilki", "Kurt", "Aslan", "Şahin", "Karga", "Köstebek", "Koyun", "İnek", "At", "Eşek", "Fok", "Penguen", "Kirpi", "Sazan", "Yengeç", "Ahtapot", "Kertenkele", "Koala"];

const getAnonymousData = (id: string, customNickname?: string) => {
  if (!id) return { name: "Gizemli Yolcu" };
  if (customNickname) return { name: customNickname };
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  return { name: `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}` };
};

const getRelativeTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Saniyeler önce";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} DAKİKA ÖNCE`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} SAAT ÖNCE`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "DÜN";
  if (diffInDays < 7) return `${diffInDays} GÜN ÖNCE`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }).toUpperCase();
};

export default function PostCard({ post, isLiked, incrementLike, customNickname, userBadge, customNicknamesMap = {}, userBadgesMap = {} }: any) {
  const router = useRouter();
  const [showComment, setShowComment] = useState(false);
  const cardRef = useRef(null);
  const [hasViewed, setHasViewed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = post.content && post.content.length > 250; 

  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes);
  const [isLikingAnimation, setIsLikingAnimation] = useState(false);
  
  const [isSaved, setIsSaved] = useState(false);
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
      text: 'Şu fısıltıya bakmalısın!',
      url: `${window.location.origin}/post/${post.id}`,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Bağlantı kopyalandı!');
      }
    } catch (err) { console.error('Paylaşım hatası:', err); }
  };

  const triggerLike = () => {
    if (localLiked) return;
    playPopSound();
    setLocalLiked(true);
    setLocalLikesCount((prev: number) => prev + 1);
    setIsLikingAnimation(true);
    setTimeout(() => setIsLikingAnimation(false), 1000);
    
    const formData = new FormData();
    formData.append('id', post.id);
    incrementLike(formData);
  };

  const handleLikeClick = (e: React.FormEvent) => {
    e.preventDefault();
    triggerLike();
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('.audio-player')) return;

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      
      playPopSound();
      setShowBigHeart(true); 
      setTimeout(() => setShowBigHeart(false), 900); 
      triggerLike();
    } else {
      clickTimeout.current = setTimeout(() => {
        router.push(`/post/${post.id}`);
        clickTimeout.current = null;
      }, 250);
    }
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

  const authorData = getAnonymousData(post.authorUuid || post.id, customNickname);
  const tagText = isConfession ? 'İtiraf' : isBosYap ? 'Boş Yap' : 'Overheard';
  const subText = [tagText, post.location, post.time].filter(Boolean).join(' • ');

  return (
    <>
      <div 
        ref={cardRef} 
        className={`w-full bg-[#000000] sm:bg-[#121212] sm:border sm:border-white/10 sm:rounded-xl mb-4 sm:mb-6 overflow-hidden transition-all duration-300 ease-out will-change-[opacity,transform] ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* 1. HEADER */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link 
            href={`/profil/${encodeURIComponent(post.authorUuid || post.id)}`}
            onClick={(e) => { e.stopPropagation(); playClickSound(); }}
            className="flex items-center gap-3 group"
          >
            <div className={`w-10 h-10 rounded-full p-[2px] ${isEphemeral ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500' : 'bg-white/10'}`}>
              <div className="w-full h-full rounded-full bg-[#121212] border border-black flex items-center justify-center overflow-hidden">
                <span className="text-[15px] font-black opacity-60">{authorData.name.charAt(0)}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white text-[14px] tracking-tight group-hover:text-gray-300 transition-colors">
                  {authorData.name}
                </span>
                {userBadge && (
                  <span className="bg-amber-500/20 text-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                    {userBadge}
                  </span>
                )}
              </div>
              <span className="text-[12px] text-gray-400 tracking-wide mt-0.5">
                {subText}
              </span>
            </div>
          </Link>
          
          <button onClick={() => setShowReportModal(true)} className="p-2 text-white hover:opacity-50 transition-opacity">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* 2. ANA METİN (Çift Tıklama Alanı) */}
        <div 
          onClick={handleDoubleTap}
          className="px-4 py-2 relative select-none cursor-pointer"
        >
          {/* Çift Tıklama Kalp Efekti */}
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50 transition-all duration-300 ease-out ${
            showBigHeart ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.3]'
          }`}>
            <Heart size={80} className="text-white drop-shadow-2xl fill-white" />
          </div>

          {post.content && (
            <p className={`text-white text-[15px] leading-relaxed break-words ${!isExpanded && isLongText ? 'line-clamp-6' : ''}`}>
              {post.content}
            </p>
          )}

          {!isExpanded && isLongText && (
            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }} className="text-gray-400 text-[14px] mt-1 hover:text-white transition-colors">
              devamını gör
            </button>
          )}

          {post.audioUrl && (
            <div onClick={(e) => e.stopPropagation()} className="mt-4 w-full max-w-[250px] audio-player">
              <AnonymousPlayer audioUrl={post.audioUrl} />
            </div>
          )}
        </div>

        {/* 3. İKONLAR */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <form action={incrementLike} onSubmit={handleLikeClick}>
              <input type="hidden" name="id" value={post.id} />
              <button type="submit" disabled={localLiked} className="group relative transition-transform active:scale-75">
                <Heart size={26} className={`transition-all duration-300 ${isLikingAnimation ? 'scale-125' : ''} ${localLiked ? 'fill-red-500 text-red-500' : 'text-white hover:text-gray-400'}`} />
              </button>
            </form>
            
            <button onClick={() => { playClickSound(); setShowComment(!showComment); }} className="transition-transform active:scale-75">
              <MessageCircle size={26} className="text-white hover:text-gray-400 transform -scale-x-100" />
            </button>
            
            <button onClick={handleShare} className="transition-transform active:scale-75">
              <Send size={26} className="text-white hover:text-gray-400 transform -rotate-12 -mt-1" />
            </button>
          </div>
          
          <button onClick={() => setIsSaved(!isSaved)} className="transition-transform active:scale-75">
            <Bookmark size={26} className={isSaved ? 'fill-white text-white' : 'text-white hover:text-gray-400'} />
          </button>
        </div>

        {/* 4. BEĞENİ VE SAAT (Metin Tekrarı Silindi) */}
        <div className="px-4 pb-4">
          <div className="font-semibold text-white text-[14px] mb-1.5 cursor-default">
            {localLikesCount} beğenme
          </div>
          
          {(post._count?.comments > 0 || post.comments?.length > 0) && (
            <button 
              onClick={() => setShowComment(!showComment)}
              className="text-gray-400 text-[14px] font-medium hover:text-white transition-colors block"
            >
              {post._count?.comments || post.comments?.length} yorumun tümünü gör
            </button>
          )}

          <div className="text-gray-500 text-[10px] uppercase mt-1.5 tracking-widest font-medium">
            {getRelativeTime(post.createdAt)}
          </div>
        </div>

        {/* YORUM FORMU */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden px-4 ${showComment ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-white/10 pt-3">
            <CommentForm postId={post.id} />
          </div>
        </div>
      </div>

      {/* ŞİKAYET MODALI */}
      {showReportModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowReportModal(false)}
        >
          <div 
            className="bg-[#262626] rounded-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center p-6 border-b border-white/10">
              <ShieldAlert className="text-red-500 w-12 h-12 mb-3" />
              <h3 className="text-white font-semibold text-lg">Şikayet Et</h3>
              <p className="text-gray-400 text-[13px] text-center mt-1">Bu gönderi neden kaldırılmalı?</p>
            </div>
            
            <div className="p-4">
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Şikayet sebebiniz..."
                className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-[14px] text-white focus:outline-none focus:border-red-500/50 resize-none h-24 mb-4"
              />
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={submitReportAction}
                  disabled={!reportReason.trim() || isSubmittingReport}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmittingReport ? 'İletiliyor...' : 'Şikayeti Gönder'}
                </button>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white hover:bg-white/5 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}