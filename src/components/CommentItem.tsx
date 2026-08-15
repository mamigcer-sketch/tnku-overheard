"use client";

import { useState, useEffect } from "react";
import { Heart, Reply, Flag, ShieldAlert } from "lucide-react";
import Link from "next/link"; 
import { toggleCommentLike, submitReport } from "@/app/post/actions";
import { playPopSound, playClickSound } from "@/utils/sounds";

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

const formatCommentText = (text: string) => {
  if (!text) return null;
  const mentionRegex = /(@(?:[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s[A-ZÇĞİÖŞÜ][a-zçğıöşü]+|[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]+))/g;
  const parts = text.split(mentionRegex);
  
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} className="text-blue-600 dark:text-[#4DA3FF] font-bold drop-shadow-none dark:drop-shadow-[0_0_8px_rgba(77,163,255,0.4)]">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export default function CommentItem({ 
  comment, 
  commentAuthor, 
  isPostAuthor, 
  isInitiallyLiked = false, 
  onReply, 
  isReply = false, 
  hasCustomNick = false, 
  userBadge,
  authorUuid,
  userAvatar
}: any) {
  const [localLiked, setLocalLiked] = useState(isInitiallyLiked);
  const [localLikesCount, setLocalLikesCount] = useState(comment.likes || 0);
  const [isLikingAnimation, setIsLikingAnimation] = useState(false);
  const [reported, setReported] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => { setLocalLiked(isInitiallyLiked); }, [isInitiallyLiked]);
  useEffect(() => { setLocalLikesCount(comment.likes || 0); }, [comment.likes]);

  const handleLike = async () => {
    playPopSound();
    const nextLikedState = !localLiked;
    setLocalLiked(nextLikedState);
    setLocalLikesCount((prev: number) => nextLikedState ? prev + 1 : Math.max(0, prev - 1));

    if (nextLikedState) {
      setIsLikingAnimation(true);
      setTimeout(() => setIsLikingAnimation(false), 500);
    }

    try {
      await toggleCommentLike(comment.id, comment.postId);
    } catch (err) {
      setLocalLiked(!nextLikedState);
      setLocalLikesCount((prev: number) => !nextLikedState ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  const handleReportClick = () => {
    if (reported) return;
    playClickSound();
    setShowReportModal(true);
  };

  const submitReportAction = async () => {
    if (!reportReason.trim()) return;
    setIsSubmittingReport(true);
    try {
      await submitReport('COMMENT', comment.id, reportReason.trim());
      setReported(true);
      setShowReportModal(false);
      setReportReason("");
    } catch (err) {} finally {
      setIsSubmittingReport(false);
    }
  };

  const finalProfileId = authorUuid || comment.authorId || comment.id;

  return (
    <>
      <div className={`group flex gap-3 p-4 transition-all duration-300 ease-out mb-3 
        ${isReply 
          ? 'ml-8 sm:ml-12 mt-1 bg-gray-50 dark:bg-white/[0.01] rounded-r-[24px] rounded-bl-[24px] border-l-2 border-l-blue-400/50 dark:border-l-[#4DA3FF]/40' 
          : 'bg-white dark:bg-white/[0.02] backdrop-blur-xl rounded-[24px] border border-gray-200 dark:border-white/[0.04] hover:border-gray-300 dark:hover:border-white/10 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* SOL: AVATAR */}
        <Link 
          href={`/profil/${encodeURIComponent(finalProfileId)}`}
          onClick={() => playClickSound()}
          className="shrink-0 mt-0.5"
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full p-[1.5px] bg-gray-200 dark:bg-white/[0.1] transition-colors duration-300`}>
            <div className="w-full h-full rounded-full bg-gray-100 dark:bg-[#121212] flex items-center justify-center overflow-hidden transition-colors duration-300">
              {userAvatar?.startsWith("data:image") ? (
                <img src={userAvatar} alt="Profil" className="w-full h-full object-cover" />
              ) : userAvatar ? (
                <span className="text-[18px]">{userAvatar}</span>
              ) : (
                <span className="text-[15px] font-black opacity-80 text-gray-500 dark:text-white">{commentAuthor.name.charAt(0)}</span>
              )}
            </div>
          </div>
        </Link>

        {/* SAĞ: İÇERİK BÖLÜMÜ */}
        <div className="flex-1 min-w-0">
          
          {/* HEADER (İsim, Rozet, Süre) */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link 
                href={`/profil/${encodeURIComponent(finalProfileId)}`} 
                onClick={() => playClickSound()} 
                className="font-bold text-gray-900 dark:text-white text-[13px] sm:text-[14px] tracking-tight hover:underline truncate max-w-[150px] transition-colors duration-300"
              >
                {commentAuthor.name}
              </Link>

              {isPostAuthor && (
                <span className="bg-blue-100 dark:bg-[#4DA3FF]/10 text-blue-600 dark:text-[#4DA3FF] text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-blue-200 dark:border-[#4DA3FF]/20 transition-colors duration-300">
                  Yazar
                </span>
              )}

              {userBadge && (
                <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/20 transition-colors duration-300">
                  {userBadge}
                </span>
              )}

              <span className="text-[11px] text-gray-500 font-medium hidden sm:inline-block ml-1">
                • {getRelativeTime(comment.createdAt)}
              </span>
            </div>
            
            {/* Mobil için sağ üstte süre */}
            <span className="text-[10px] text-gray-500 font-medium sm:hidden shrink-0">
              {getRelativeTime(comment.createdAt)}
            </span>
          </div>

          {/* İÇERİK METNİ */}
          <p className="text-gray-800 dark:text-gray-100 text-[14px] leading-relaxed break-words mt-1 mb-2.5 transition-colors duration-300">
            {formatCommentText(comment.content)}
          </p>

          {/* AKSİYON BUTONLARI */}
          <div className="flex items-center gap-4 text-gray-500 mt-1">
            <button 
              onClick={handleLike} 
              className={`flex items-center gap-1.5 transition-colors ${localLiked ? 'text-pink-500' : 'hover:text-pink-500 dark:hover:text-pink-400'}`}
            >
              <Heart size={15} className={`transition-transform ${isLikingAnimation ? 'scale-125' : ''} ${localLiked ? 'fill-pink-500' : ''}`} />
              <span className="text-[12px] font-bold">{localLikesCount > 0 ? localLikesCount : ''}</span>
            </button>

            {onReply && (
              <button 
                onClick={() => { playClickSound(); onReply(comment.id, commentAuthor.name); }} 
                className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-[#4DA3FF] transition-colors"
              >
                <Reply size={15} />
                <span className="text-[12px] font-bold">Yanıtla</span>
              </button>
            )}

            <button 
              onClick={handleReportClick} 
              className={`ml-auto flex items-center gap-1.5 transition-colors ${reported ? 'text-red-500' : 'hover:text-red-500 dark:hover:text-red-400'}`}
            >
              <Flag size={14} className={reported ? 'fill-red-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ŞİKAYET MODALI */}
      {showReportModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300" onClick={(e) => { e.stopPropagation(); setShowReportModal(false); }}>
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-xl dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-2xl border border-red-100 dark:border-red-500/20">
                <ShieldAlert className="text-red-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-tight">Yorumu Şikayet Et</h3>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider">Gizli & Güvenli</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">Bu yorumu neden şikayet ediyorsunuz? Lütfen kısaca belirtin.</p>
            <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Şikayet sebebiniz..." className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50 resize-none h-28 mb-5 transition-colors duration-300" />
            <div className="flex gap-3">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors">İptal</button>
              <button onClick={submitReportAction} disabled={!reportReason.trim() || isSubmittingReport} className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSubmittingReport ? 'İletiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}