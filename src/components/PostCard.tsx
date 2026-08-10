"use client";

import { useState, useEffect, useRef } from "react";
import AnonymousPlayer from "./AnonymousPlayer";
import CommentForm from "./CommentForm";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ShieldAlert, Eye, Repeat2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import { incrementView, submitReport } from "@/app/post/actions";
import { playPopSound, playClickSound } from "@/utils/sounds";

const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare", "Deli", "Çılgın", "Bıkkın", "Dalgın", "Ters", "Şüpheli", "Kuşkulu", "Durgun", "Hızlı", "Yavaş", "Donuk", "Parlak", "Sinsi", "Kurnaz", "Tatlı", "Sert", "Yabani", "Yalnız", "Suskun", "Coşkulu"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek", "Tavuk", "Maymun", "Keçi", "Sincap", "Kurbağa", "Kaplan", "Koala", "Tilki", "Kurt", "Aslan", "Şahin", "Karga", "Köstebek", "Koyun", "İnek", "At", "Eşek", "Fok", "Penguen", "Kirpi", "Sazan", "Yengeç", "Ahtapot", "Kertenkele", "Koala"];

const getAnonymousData = (id: string, customNickname?: string) => {
  if (!id) return { name: "Gizemli Yolcu", username: "gizemliyolcu" };
  if (customNickname) return { name: customNickname, username: customNickname.toLowerCase().replace(/\s+/g, '_') };
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  const name = `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}`;
  return { name, username: name.toLowerCase().replace(/\s+/g, '_') };
};

// 🔥 Twitter Tarzı Kısa Zaman (5d, 2s, 1g)
const getRelativeTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds}sn`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}d`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}s`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}g`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

export default function PostCard({ post, isLiked, incrementLike, customNickname, userBadge, customNicknamesMap = {}, userBadgesMap = {} }: any) {
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
  const [showComment, setShowComment] = useState(false);
  
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const isEphemeral = !!post.expiresAt;
  const isConfession = post.type === 'CONFESSION';
  const isBosYap = post.type === 'BOSYAP';

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
      return '';
    };
    const savedList = getCookie('saved_posts').split(',').filter(Boolean);
    if (savedList.includes(post.id)) {
      setIsSaved(true);
    }
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
    setTimeout(() => setIsLikingAnimation(false), 500);
    
    const formData = new FormData();
    formData.append('id', post.id);
    incrementLike(formData);
  };

  const handleLikeClick = (e: React.FormEvent) => {
    e.preventDefault();
    triggerLike();
  };

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
    
    if (newState) {
      if (!savedList.includes(post.id)) savedList.push(post.id);
    } else {
      savedList = savedList.filter(id => id !== post.id);
    }

    document.cookie = `saved_posts=${savedList.join(',')}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  const handleTap = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('.audio-player')) return;
    router.push(`/post/${post.id}`);
  };

  const submitReportAction = async () => {
    if (!reportReason.trim()) return;
    setIsSubmittingReport(true);
    try {
      await submitReport('POST', post.id, reportReason.trim());
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
  const commentCount = post._count?.comments || post.comments?.length || 0;

  return (
    <>
      <article 
        ref={cardRef} 
        onClick={handleTap}
        className={`w-full bg-transparent border-b border-white/10 px-4 py-3 sm:py-4 transition-all duration-200 cursor-pointer hover:bg-white/[0.02] flex gap-3 ${
          isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* SOL: AVATAR */}
        <Link 
          href={`/profil/${encodeURIComponent(post.authorUuid || post.id)}`}
          onClick={(e) => { e.stopPropagation(); playClickSound(); }}
          className="shrink-0"
        >
          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[1.5px] ${isEphemeral ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500' : 'bg-transparent'}`}>
            <div className="w-full h-full rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
              <span className="text-[16px] font-black opacity-70 text-white">{authorData.name.charAt(0)}</span>
            </div>
          </div>
        </Link>

        {/* SAĞ: İÇERİK BÖLÜMÜ */}
        <div className="flex-1 min-w-0">
          
          {/* HEADER (İsim, Nickname, Süre, Tag) */}
          <div className="flex items-start justify-between">
            <div className="flex flex-wrap items-center gap-x-1.5 text-[14px] leading-tight mb-0.5">
              <Link 
                href={`/profil/${encodeURIComponent(post.authorUuid || post.id)}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-white hover:underline truncate max-w-[120px] sm:max-w-[200px]"
              >
                {authorData.name}
              </Link>
              
              {userBadge && (
                <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-1.5 rounded-sm uppercase tracking-wide">
                  {userBadge}
                </span>
              )}
              
              <span className="text-gray-500 text-[14px] hidden sm:inline">@{authorData.username}</span>
              
              <span className="text-gray-600">·</span>
              <span className="text-gray-500 text-[13px] hover:underline">{getRelativeTime(post.createdAt)}</span>
              
              <span className="text-gray-600">·</span>
              <span className={`text-[12px] font-medium ${isConfession ? 'text-purple-400' : isBosYap ? 'text-emerald-400' : 'text-[#4DA3FF]'}`}>
                {tagText}
              </span>
            </div>
            
            <button onClick={(e) => { e.stopPropagation(); setShowReportModal(true); }} className="text-gray-500 hover:text-[#1d9bf0] transition-colors p-1 -mr-2 -mt-1 rounded-full hover:bg-[#1d9bf0]/10">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* İÇERİK METNİ */}
          <div className="mt-1">
            {post.content && (
              <p className={`text-white text-[15px] sm:text-[16px] leading-snug sm:leading-relaxed break-words whitespace-pre-wrap ${!isExpanded && isLongText ? 'line-clamp-6' : ''}`}>
                {post.content}
              </p>
            )}

            {!isExpanded && isLongText && (
              <button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }} className="text-[#1d9bf0] text-[14px] mt-1 hover:underline transition-colors">
                daha fazla göster
              </button>
            )}

            {post.audioUrl && (
              <div onClick={(e) => e.stopPropagation()} className="mt-3 w-full max-w-[250px] audio-player">
                <AnonymousPlayer audioUrl={post.audioUrl} />
              </div>
            )}
          </div>

          {/* AKSİYON BUTONLARI (Twitter Stili) */}
          <div className="flex justify-between items-center mt-3 max-w-[400px] w-full text-gray-500">
            
            <button 
              onClick={(e) => { e.stopPropagation(); playClickSound(); router.push(`/post/${post.id}`); }}
              className="flex items-center gap-1.5 group hover:text-[#1d9bf0] transition-colors"
            >
              <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <MessageCircle size={17} className="transform -scale-x-100" />
              </div>
              <span className="text-[13px]">{commentCount > 0 ? commentCount : ''}</span>
            </button>
            
            <form action={incrementLike} onSubmit={handleLikeClick} className="flex items-center">
              <input type="hidden" name="id" value={post.id} />
              <button 
                type="submit" 
                disabled={localLiked} 
                className={`flex items-center gap-1.5 group transition-colors ${localLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
              >
                <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                  <Heart size={17} className={`transition-transform ${isLikingAnimation ? 'scale-125' : ''} ${localLiked ? 'fill-pink-500' : ''}`} />
                </div>
                <span className="text-[13px]">{localLikesCount > 0 ? localLikesCount : ''}</span>
              </button>
            </form>
            
            <button 
              onClick={handleShare} 
              className="flex items-center gap-1.5 group hover:text-emerald-500 transition-colors"
            >
              <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                <Repeat2 size={18} />
              </div>
            </button>

            <div className="flex items-center gap-1.5 group hover:text-[#1d9bf0] transition-colors cursor-default">
              <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <Eye size={17} />
              </div>
              <span className="text-[13px]">{post.views || 0}</span>
            </div>

            <button 
              onClick={handleSaveToggle} 
              className={`flex items-center gap-1.5 group transition-colors ${isSaved ? 'text-[#1d9bf0]' : 'hover:text-[#1d9bf0]'}`}
            >
              <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <Bookmark size={17} className={isSaved ? 'fill-[#1d9bf0]' : ''} />
              </div>
            </button>
            
          </div>
        </div>
      </article>

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