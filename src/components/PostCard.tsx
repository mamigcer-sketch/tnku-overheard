"use client";

import { useState, useEffect, useRef } from "react";
import AnonymousPlayer from "./AnonymousPlayer";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ShieldAlert, Eye, Hourglass, Sparkles } from "lucide-react";
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
  if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Dün";
  if (diffInDays < 7) return `${diffInDays} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

export default function PostCard({ post, isLiked, incrementLike, customNickname, userBadge, userAvatar }: any) {
  const router = useRouter();
  const cardRef = useRef(null);
  const [hasViewed, setHasViewed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = post.content && post.content.length > 250; 

  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes);
  const [isLikingAnimation, setIsLikingAnimation] = useState(false);
  
  const [isSaved, setIsSaved] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  
  const [showBigHeart, setShowBigHeart] = useState(false);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const isEphemeral = !!post.expiresAt;
  const isConfession = post.type === 'CONFESSION';
  const isBosYap = post.type === 'BOSYAP';

  const tagText = isConfession ? 'İtiraf' : isBosYap ? 'Boş Yap' : 'Overheard';
  
  // 🔥 TANRI PARÇACIĞI KONTROLÜ (GOD MODE) 🔥
  const isGodMode = ["KURUCU", "GOD", "SİSTEM"].includes(userBadge?.toUpperCase());

  // TEMALAR (Gündüz/Gece uyumlu)
  const themeClasses = isConfession 
    ? { 
        border: 'hover:border-purple-300 dark:hover:border-purple-500/30', 
        badge: 'text-purple-600 bg-purple-100 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20', 
        text: 'text-purple-600 dark:text-purple-400' 
      }
    : isBosYap 
    ? { 
        border: 'hover:border-emerald-300 dark:hover:border-emerald-500/30', 
        badge: 'text-emerald-600 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20', 
        text: 'text-emerald-600 dark:text-emerald-400' 
      }
    : { 
        border: 'hover:border-blue-300 dark:hover:border-[#4DA3FF]/30', 
        badge: 'text-blue-600 bg-blue-100 border-blue-200 dark:text-[#4DA3FF] dark:bg-[#4DA3FF]/10 dark:border-[#4DA3FF]/20', 
        text: 'text-blue-600 dark:text-[#4DA3FF]' 
      };

  // 🔥 GOD MODE ARKA PLAN EFEKTİ 🔥
  const cardBorderClass = isGodMode 
    ? 'border-transparent shadow-[0_0_30px_rgba(234,179,8,0.25)] dark:shadow-[0_0_40px_rgba(234,179,8,0.15)] ring-1 ring-yellow-400/50 bg-gradient-to-br from-yellow-50/50 to-white dark:from-yellow-500/5 dark:to-white/[0.02]'
    : isEphemeral 
    ? 'border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-400 dark:border-amber-500/30 dark:shadow-[0_0_20px_rgba(245,158,11,0.08)] dark:hover:border-amber-500/50 bg-white dark:bg-white/[0.02]' 
    : `border-gray-200 shadow-sm hover:shadow-md dark:border-white/[0.04] bg-white dark:bg-white/[0.02] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] ${themeClasses.border}`;

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
      return '';
    };
    const savedList = getCookie('saved_posts').split(',').filter(Boolean);
    if (savedList.includes(post.id)) setIsSaved(true);
  }, [post.id]);

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
    return () => { observer.disconnect(); if (clickTimeout.current) clearTimeout(clickTimeout.current); };
  }, [post.id, hasViewed]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    const shareData = { title: 'TNKU Overheard', text: 'Şu fısıltıya bakmalısın!', url: `${window.location.origin}/post/${post.id}` };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(shareData.url); alert('Bağlantı kopyalandı!'); }
    } catch (err) {}
  };

  const triggerLike = () => {
    if (localLiked) return;
    playPopSound();
    setLocalLiked(true);
    setLocalLikesCount((prev: number) => prev + 1);
    setIsLikingAnimation(true);
    setTimeout(() => setIsLikingAnimation(false), 500);
    const formData = new FormData();
    formData.append('id', post.id);
    incrementLike(formData);
  };

  const handleLikeClick = (e: React.FormEvent) => { e.preventDefault(); triggerLike(); };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    const newState = !isSaved;
    setIsSaved(newState);
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
      return '';
    };
    let savedList = getCookie('saved_posts').split(',').filter(Boolean);
    if (newState) { if (!savedList.includes(post.id)) savedList.push(post.id); } 
    else { savedList = savedList.filter(id => id !== post.id); }
    document.cookie = `saved_posts=${savedList.join(',')}; path=/; max-age=${60 * 60 * 24 * 365}`;
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
    try { await submitReport('POST', post.id, reportReason.trim()); setShowReportModal(false); setReportReason(""); } 
    catch (err) {} 
    finally { setIsSubmittingReport(false); }
  };

  const authorData = getAnonymousData(post.authorUuid || post.id, customNickname);
  const commentCount = post._count?.comments || post.comments?.length || 0;
  const subText = [post.location, post.people, post.time].filter(Boolean).join(' • ');

  return (
    <>
      <article 
        ref={cardRef} 
        className={`group w-full backdrop-blur-xl rounded-[24px] mb-5 p-4 sm:p-5 border transition-all duration-500 ease-out relative ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${cardBorderClass}`}
      >
        <div className="flex items-start justify-between mb-4 relative z-10">
          <Link href={`/profil/${encodeURIComponent(post.authorUuid || post.id)}`} onClick={(e) => { e.stopPropagation(); playClickSound(); }} className="flex items-center gap-3">
            
            {/* 🔥 GOD MODE AVATAR HALKASI 🔥 */}
            <div className={`relative w-11 h-11 shrink-0 rounded-full p-[2px]`}>
              {isGodMode ? (
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 animate-[spin_3s_linear_infinite] opacity-90 shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              ) : (
                <div className={`absolute inset-0 rounded-full ${isEphemeral ? 'bg-amber-300 dark:bg-amber-500/30' : 'bg-gray-200 dark:bg-white/[0.1]'}`} />
              )}
              <div className="relative w-full h-full rounded-full bg-gray-100 dark:bg-[#121212] flex items-center justify-center overflow-hidden z-10">
                {userAvatar?.startsWith("data:image") ? (
                  <img src={userAvatar} alt="Profil" className="w-full h-full object-cover" />
                ) : userAvatar ? (
                  <span className="text-[22px]">{userAvatar}</span>
                ) : (
                  <span className="text-[16px] font-black opacity-80 text-gray-500 dark:text-white">{authorData.name.charAt(0)}</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                {/* 🔥 GOD MODE HOLOGRAFİK İSİM 🔥 */}
                <span className={`text-[15px] tracking-tight ${isGodMode ? 'bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-500 dark:from-yellow-300 dark:via-amber-400 dark:to-yellow-300 animate-pulse drop-shadow-md font-black' : 'font-bold text-gray-900 dark:text-white'}`}>
                  {authorData.name}
                </span>
                
                {/* 🔥 GOD MODE GLITCH ROZET 🔥 */}
                {userBadge && (
                  <span className={`${isGodMode ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse' : 'bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-500 dark:border-transparent'} text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1`}>
                    {isGodMode && <Sparkles size={8} />} {userBadge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium mt-0.5">
                {isEphemeral ? (
                  <span className="flex items-center gap-1 text-amber-600 bg-amber-100 border border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase font-bold">
                    <Hourglass size={10} className="animate-pulse" /> 24s
                  </span>
                ) : (
                  <span className={`${isGodMode ? 'text-yellow-600/70 dark:text-yellow-400/70 font-bold' : 'text-gray-500'}`}>{getRelativeTime(post.createdAt)}</span>
                )}
                
                {subText && (
                  <>
                    <span className={`w-1 h-1 rounded-full ${isGodMode ? 'bg-yellow-400/50' : 'bg-gray-400 dark:bg-gray-600'}`}></span>
                    <span className={`truncate max-w-[150px] ${isGodMode ? 'text-yellow-600/70 dark:text-yellow-400/70 font-bold' : 'text-gray-500'}`}>{subText}</span>
                  </>
                )}
              </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${themeClasses.badge}`}>
              {tagText}
            </span>
            <button onClick={() => setShowReportModal(true)} className="p-1.5 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-gray-500 dark:hover:text-white transition-colors dark:bg-white/5 rounded-full dark:hover:bg-white/10">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        <div onClick={handleDoubleTap} className="relative z-10 cursor-pointer select-none pl-1">
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50 transition-all duration-300 ease-out ${showBigHeart ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.3]'}`}>
            {/* Çift tıklama kalbi (Gündüz pembe, gece beyaz) */}
            <Heart size={80} className={`${isGodMode ? 'text-yellow-400 fill-yellow-400' : 'text-pink-500 dark:text-white drop-shadow-2xl fill-pink-500 dark:fill-white'}`} />
          </div>

          {post.content && (
            <p className={`text-[15.5px] leading-relaxed break-words whitespace-pre-wrap ${isGodMode ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-800 dark:text-gray-100'} ${!isExpanded && isLongText ? 'line-clamp-6' : ''}`}>
              {post.content}
            </p>
          )}

          {!isExpanded && isLongText && (
            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }} className={`text-[13px] mt-1 font-medium hover:underline transition-colors ${themeClasses.text}`}>
              Devamını oku...
            </button>
          )}

          {post.audioUrl && (
            <div onClick={(e) => e.stopPropagation()} className="mt-4 w-full max-w-[280px] audio-player">
              <AnonymousPlayer audioUrl={post.audioUrl} />
            </div>
          )}
        </div>

        <div className={`mt-5 flex items-center justify-between border rounded-full px-4 py-3 transition-colors duration-300 ${isGodMode ? 'bg-yellow-50/50 border-yellow-200/50 dark:bg-yellow-500/10 dark:border-yellow-500/20' : 'bg-gray-50 dark:bg-white/[0.06] border-gray-100 dark:border-white/[0.1] shadow-inner dark:shadow-none'}`}>
          <div className="flex items-center gap-5">
            <form action={incrementLike} onSubmit={handleLikeClick} className="flex items-center">
              <input type="hidden" name="id" value={post.id} />
              <button type="submit" disabled={localLiked} className={`flex items-center gap-1.5 transition-colors ${localLiked ? (isGodMode ? 'text-yellow-500' : 'text-pink-500') : (isGodMode ? 'text-yellow-600/50 hover:text-yellow-500 dark:text-yellow-500/50 dark:hover:text-yellow-400' : 'text-gray-500 hover:text-pink-500 dark:text-gray-300 dark:hover:text-pink-500')}`}>
                <Heart size={19} className={`transition-transform ${isLikingAnimation ? 'scale-125' : ''} ${localLiked ? (isGodMode ? 'fill-yellow-500' : 'fill-pink-500') : ''}`} />
                <span className="text-[13px] font-bold">{localLikesCount > 0 ? localLikesCount : ''}</span>
              </button>
            </form>
            
            <button onClick={() => { playClickSound(); router.push(`/post/${post.id}`); }} className={`flex items-center gap-1.5 transition-colors ${isGodMode ? 'text-yellow-600/50 hover:text-yellow-600 dark:text-yellow-500/50 dark:hover:text-yellow-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}>
              <MessageCircle size={19} className="transform -scale-x-100" />
              <span className="text-[13px] font-bold">{commentCount > 0 ? commentCount : ''}</span>
            </button>
            
            <button onClick={handleShare} className={`flex items-center gap-1.5 transition-colors ${isGodMode ? 'text-yellow-600/50 hover:text-yellow-600 dark:text-yellow-500/50 dark:hover:text-yellow-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}>
              <Send size={19} className="transform -rotate-12 -mt-0.5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 cursor-default ${isGodMode ? 'text-yellow-600/50 dark:text-yellow-500/50' : 'text-gray-400 dark:text-gray-400'}`}>
              <Eye size={18} />
              <span className="text-[13px] font-bold">{post.views || 0}</span>
            </div>
            
            <button onClick={handleSaveToggle} className={`transition-colors ${isSaved ? (isGodMode ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-900 dark:text-white') : (isGodMode ? 'text-yellow-600/50 hover:text-yellow-600 dark:text-yellow-500/50 dark:hover:text-yellow-400' : 'text-gray-400 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white')}`}>
              <Bookmark size={19} className={isSaved ? (isGodMode ? 'fill-yellow-500 dark:fill-yellow-400' : 'fill-gray-900 dark:fill-white') : ''} />
            </button>
          </div>
        </div>
      </article>

      {/* ŞİKAYET MODALI */}
      {showReportModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowReportModal(false)}>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl w-full max-w-sm overflow-hidden transform transition-all border border-gray-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center p-6 border-b border-gray-100 dark:border-white/5">
              <ShieldAlert className="text-red-500 w-12 h-12 mb-3" />
              <h3 className="text-gray-900 dark:text-white font-bold text-lg">Şikayet Et</h3>
              <p className="text-gray-500 dark:text-gray-400 text-[13px] text-center mt-1">Bu gönderi neden kaldırılmalı?</p>
            </div>
            <div className="p-4">
              <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Şikayet sebebiniz..." className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-[14px] text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50 resize-none h-24 mb-4" />
              <div className="flex flex-col gap-2">
                <button onClick={submitReportAction} disabled={!reportReason.trim() || isSubmittingReport} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50">
                  {isSubmittingReport ? 'İletiliyor...' : 'Şikayeti Gönder'}
                </button>
                <button onClick={() => setShowReportModal(false)} className="w-full py-3.5 rounded-2xl font-bold text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white transition-colors">İptal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}