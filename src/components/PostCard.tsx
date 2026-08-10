"use client";

import { useState, useEffect, useRef } from "react";
import AnonymousPlayer from "./AnonymousPlayer";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ShieldAlert, Eye, Hourglass } from "lucide-react";
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

export default function PostCard({ post, isLiked, incrementLike, customNickname, userBadge }: any) {
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

  // Benzersiz Stil Ayarları
  const tagText = isConfession ? 'İtiraf' : isBosYap ? 'Boş Yap' : 'Overheard';
  const themeClasses = isConfession 
    ? { border: 'hover:border-purple-500/30', badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20', text: 'text-purple-400' }
    : isBosYap 
    ? { border: 'hover:border-emerald-500/30', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' }
    : { border: 'hover:border-[#4DA3FF]/30', badge: 'text-[#4DA3FF] bg-[#4DA3FF]/10 border-[#4DA3FF]/20', text: 'text-[#4DA3FF]' };

  // 🔥 24 Saatlik Postlar İçin Özel Stil
  const cardBorderClass = isEphemeral 
    ? 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)] hover:border-amber-500/50' 
    : `border-white/[0.04] shadow-[0_4px_30px_rgba(0,0,0,0.5)] ${themeClasses.border}`;

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
        className={`group w-full bg-white/[0.02] backdrop-blur-xl rounded-[24px] mb-5 p-4 sm:p-5 border transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${cardBorderClass}`}
      >
        {/* 1. ÜST BİLGİ (HEADER) */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <Link href={`/profil/${encodeURIComponent(post.authorUuid || post.id)}`} onClick={(e) => { e.stopPropagation(); playClickSound(); }} className="flex items-center gap-3">
            {/* 🔥 Avatar: Instagram halkası yerine zarif şeffaf arka plan */}
            <div className={`w-11 h-11 rounded-full p-[1.5px] ${isEphemeral ? 'bg-amber-500/30' : 'bg-white/[0.1]'}`}>
              <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center">
                <span className="text-[16px] font-black opacity-80 text-white">{authorData.name.charAt(0)}</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-[15px] tracking-tight">{authorData.name}</span>
                {userBadge && <span className="bg-amber-500/20 text-amber-500 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{userBadge}</span>}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium mt-0.5">
                {/* 24 Saatlik Post İndikatörü */}
                {isEphemeral ? (
                  <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase font-bold border border-amber-500/20">
                    <Hourglass size={10} className="animate-pulse" /> 24s
                  </span>
                ) : (
                  <span className="text-gray-500">{getRelativeTime(post.createdAt)}</span>
                )}
                
                {subText && (
                  <>
                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span className="truncate max-w-[150px] text-gray-500">{subText}</span>
                  </>
                )}
              </div>
            </div>
          </Link>
          
          {/* SAĞ ÜST ROZET VE MENÜ */}
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${themeClasses.badge}`}>
              {tagText}
            </span>
            <button onClick={() => setShowReportModal(true)} className="p-1.5 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* 2. İÇERİK */}
        <div onClick={handleDoubleTap} className="relative z-10 cursor-pointer select-none pl-1">
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50 transition-all duration-300 ease-out ${showBigHeart ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.3]'}`}>
            <Heart size={80} className="text-white drop-shadow-2xl fill-white" />
          </div>

          {post.content && (
            <p className={`text-gray-100 text-[15.5px] leading-relaxed break-words whitespace-pre-wrap ${!isExpanded && isLongText ? 'line-clamp-6' : ''}`}>
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

        {/* 3. YÜZEN AKSİYON KAPSÜLÜ (Pill Bar) - 🔥 Artık daha aydınlık ve belirgin! */}
        <div className="mt-5 flex items-center justify-between bg-white/[0.06] border border-white/[0.1] rounded-full px-4 py-3 shadow-inner">
          <div className="flex items-center gap-5">
            <form action={incrementLike} onSubmit={handleLikeClick} className="flex items-center">
              <input type="hidden" name="id" value={post.id} />
              <button type="submit" disabled={localLiked} className={`flex items-center gap-1.5 transition-colors ${localLiked ? 'text-pink-500' : 'text-gray-300 hover:text-pink-500'}`}>
                <Heart size={19} className={`transition-transform ${isLikingAnimation ? 'scale-125' : ''} ${localLiked ? 'fill-pink-500' : ''}`} />
                <span className="text-[13px] font-bold">{localLikesCount > 0 ? localLikesCount : ''}</span>
              </button>
            </form>
            
            <button onClick={() => { playClickSound(); router.push(`/post/${post.id}`); }} className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
              <MessageCircle size={19} className="transform -scale-x-100" />
              <span className="text-[13px] font-bold">{commentCount > 0 ? commentCount : ''}</span>
            </button>
            
            <button onClick={handleShare} className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
              <Send size={19} className="transform -rotate-12 -mt-0.5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-400 cursor-default">
              <Eye size={18} />
              <span className="text-[13px] font-bold">{post.views || 0}</span>
            </div>
            
            <button onClick={handleSaveToggle} className={`transition-colors ${isSaved ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              <Bookmark size={19} className={isSaved ? 'fill-white' : ''} />
            </button>
          </div>
        </div>
      </article>

      {/* ŞİKAYET MODALI */}
      {showReportModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowReportModal(false)}>
          <div className="bg-[#1A1A1A] rounded-3xl w-full max-w-sm overflow-hidden transform transition-all border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center p-6 border-b border-white/5">
              <ShieldAlert className="text-red-500 w-12 h-12 mb-3" />
              <h3 className="text-white font-bold text-lg">Şikayet Et</h3>
              <p className="text-gray-400 text-[13px] text-center mt-1">Bu gönderi neden kaldırılmalı?</p>
            </div>
            <div className="p-4">
              <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Şikayet sebebiniz..." className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 text-[14px] text-white focus:outline-none focus:border-red-500/50 resize-none h-24 mb-4" />
              <div className="flex flex-col gap-2">
                <button onClick={submitReportAction} disabled={!reportReason.trim() || isSubmittingReport} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50">
                  {isSubmittingReport ? 'İletiliyor...' : 'Şikayeti Gönder'}
                </button>
                <button onClick={() => setShowReportModal(false)} className="w-full py-3.5 rounded-2xl font-bold text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors">İptal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}