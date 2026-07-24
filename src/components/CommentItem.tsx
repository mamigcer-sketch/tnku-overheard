"use client";

import { useState, useEffect } from "react";
import { Heart, Reply, Flag, ShieldAlert } from "lucide-react";
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
  const mentionRegex = /(@[a-zA-ZçğıöşüÇĞİÖŞÜ]+\s[a-zA-ZçğıöşüÇĞİÖŞÜ]+)/g;
  const parts = text.split(mentionRegex);
  return parts.map((part, i) => {
    if (part.match(/^@[a-zA-ZçğıöşüÇĞİÖŞÜ]+\s[a-zA-ZçğıöşüÇĞİÖŞÜ]+$/)) {
      return (
        <span key={i} className="text-[#4DA3FF] font-bold drop-shadow-[0_0_8px_rgba(77,163,255,0.6)]">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export default function CommentItem({ 
  comment, commentAuthor, isPostAuthor, isInitiallyLiked = false, onReply, isReply = false, hasCustomNick = false, userBadge 
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
      setTimeout(() => setIsLikingAnimation(false), 1000);
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

  return (
    <>
      {/* 🔥 PREMIUM GLASSMORPHISM YORUM KARTI (Ana PostCard ile aynı tasarım dili) */}
      <div className={`bg-[#121212]/75 backdrop-blur-xl border border-white/5 p-4 sm:p-5 rounded-[22px] shadow-md transition-all duration-300 hover:border-white/10 hover:bg-[#151515] ${
        isReply ? 'ml-6 sm:ml-10 border-l-2 border-l-[#4DA3FF]/40 bg-[#121212]/50' : ''
      }`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {userBadge && (
              <span className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-md shadow-sm flex items-center text-[9px] font-black uppercase tracking-wider">
                {userBadge}
              </span>
            )}
            
            <div className={`w-5 h-5 flex items-center justify-center rounded-md ${hasCustomNick ? 'bg-gradient-to-br from-amber-500/20 to-pink-500/20 border border-pink-500/30 text-pink-400' : `${commentAuthor.gradient} text-[10px]`} shadow-inner`}>
              {hasCustomNick ? (
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              ) : (
                commentAuthor.emoji
              )}
            </div>

            <span className={`font-semibold text-[12px] tracking-wide flex items-center gap-1 ${hasCustomNick ? 'text-yellow-100' : 'text-gray-200'}`}>
              @{commentAuthor.name}
            </span>

            {isPostAuthor && (
              <span className="bg-[#4DA3FF]/10 text-[#4DA3FF] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#4DA3FF]/20 shadow-sm">
                Yazar
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-500 font-medium shrink-0 ml-2">{getRelativeTime(comment.createdAt)}</span>
        </div>
        
        <p className="text-gray-200 text-[14px] leading-relaxed break-words mb-3 mt-1 font-normal">
          {formatCommentText(comment.content)}
        </p>
        
        {/* 🔥 ALT ETKİLEŞİM BARİ (Ana postlardaki silik çizgi ve buton stiline uyarlandı) */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/5 text-gray-400">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-all duration-300 rounded-xl px-2 py-1 -ml-2 ${localLiked ? 'text-pink-500' : 'hover:text-pink-400 hover:bg-pink-500/10'}`}
          >
            <div className="relative flex items-center justify-center">
              {isLikingAnimation && <span className="absolute w-6 h-6 bg-pink-500 rounded-full animate-ping opacity-60"></span>}
              <Heart size={16} className={`relative z-10 transition-all duration-500 ease-out ${isLikingAnimation ? 'fill-pink-500 scale-150 drop-shadow-[0_0_15px_rgba(236,72,153,1)]' : localLiked ? 'fill-pink-500 scale-110 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'active:scale-50'}`} />
            </div>
            <span className="text-[12px] font-bold">{localLikesCount}</span>
          </button>

          {onReply && (
            <button 
              onClick={() => { playClickSound(); onReply(comment.id, commentAuthor.name); }}
              className="flex items-center gap-1.5 transition-all duration-300 hover:text-[#4DA3FF] hover:bg-[#4DA3FF]/10 rounded-xl px-2 py-1 -ml-2 active:scale-90"
            >
              <Reply size={16} />
              <span className="text-[12px] font-bold">Yanıtla</span>
            </button>
          )}

          <button 
            onClick={handleReportClick}
            className={`ml-auto flex items-center gap-1.5 transition-all duration-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-2.5 py-1.5 -mr-2 ${reported ? 'text-red-500 bg-red-500/10' : 'text-gray-500'}`}
          >
            <Flag size={14} />
            <span className="text-[11px] font-bold hidden sm:inline">{reported ? 'İletildi' : 'Şikayet Et'}</span>
          </button>
        </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setShowReportModal(false); }}>
          <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/10 p-3 rounded-2xl border border-red-500/20"><ShieldAlert className="text-red-500 w-6 h-6" /></div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Yorumu Şikayet Et</h3>
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">Gizli & Güvenli</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">Bu yorumu neden şikayet ediyorsunuz? Lütfen kısaca belirtin. (Spam, Hakaret, vb.)</p>
            <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Şikayet sebebiniz..." className="w-full bg-[#0B0B0B] border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none h-28 mb-5" />
            <div className="flex gap-3">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 rounded-2xl font-bold text-sm bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">İptal</button>
              <button onClick={submitReportAction} disabled={!reportReason.trim() || isSubmittingReport} className="flex-1 py-3 rounded-2xl font-bold text-sm bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isSubmittingReport ? 'İletiliyor...' : 'Gönder'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}