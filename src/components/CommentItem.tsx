"use client";

import { useState, useEffect } from "react";
import { Heart, Reply, Flag, ShieldAlert, BadgeCheck } from "lucide-react";
import { toggleCommentLike, submitReport } from "@/app/post/actions";
import { toggleCommentReaction } from "@/app/post/actions"; // 🔥 YENİ EKLENDİ
import { playPopSound, playClickSound } from "@/utils/sounds"; // 🔥 SESLER EKLENDİ

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

const AVAILABLE_EMOJIS = ["🔥", "💀", "😂", "🤡"];

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

  // 🔥 Reaksiyonlar için anlık (optimistic) state
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});

  useEffect(() => { setLocalLiked(isInitiallyLiked); }, [isInitiallyLiked]);
  useEffect(() => { setLocalLikesCount(comment.likes || 0); }, [comment.likes]);

  // Sayfa yüklendiğinde veritabanından gelen emojileri say ve state'e at
  useEffect(() => {
    if (comment.reactions) {
      const counts: Record<string, number> = {};
      comment.reactions.forEach((r: any) => {
        counts[r.emoji] = (counts[r.emoji] || 0) + 1;
      });
      setReactionCounts(counts);
    }
  }, [comment.reactions]);

  const handleLike = async () => {
    playPopSound(); // 🔥 Ses Motoru Kullanıldı!
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

  const handleEmojiClick = async (emoji: string) => {
    playPopSound(); // 🔥 Emojiye basınca da tatlı bir POP sesi!
    // Anlık olarak UI'da sayıyı arttır (hızlı hissettirsin diye)
    setReactionCounts(prev => ({...prev, [emoji]: (prev[emoji] || 0) + 1}));
    try {
      await toggleCommentReaction(comment.id, emoji, comment.postId);
    } catch (e) {
      // Hata olursa geri al
      setReactionCounts(prev => ({...prev, [emoji]: Math.max(0, (prev[emoji] || 1) - 1)}));
    }
  };

  const handleReportClick = () => {
    if (reported) return;
    playClickSound(); // 🔥 Tık Sesi!
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
      <div className={`bg-white/[0.02] backdrop-blur-md border border-white/[0.05] p-4 sm:p-5 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all hover:border-white/[0.1] hover:bg-white/[0.04] ${
        isReply ? 'ml-6 sm:ml-10 border-l-2 border-l-[#4DA3FF]/40 bg-white/[0.01]' : ''
      }`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {userBadge && (
              <span className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(245,158,11,0.15)] flex items-center text-[9px] font-black uppercase tracking-wider">
                {userBadge}
              </span>
            )}
            <div className={`w-6 h-6 flex items-center justify-center rounded-md bg-gradient-to-br ${commentAuthor.gradient} text-[12px] shadow-inner`}>
              {commentAuthor.emoji}
            </div>
            <span className={`font-bold text-[12px] tracking-wide flex items-center gap-1 ${hasCustomNick ? 'text-yellow-50 drop-shadow-sm' : 'text-gray-200'}`}>
              @{commentAuthor.name}
              {hasCustomNick && <BadgeCheck size={14} className="text-yellow-400" />}
            </span>
            {isPostAuthor && (
              <span className="bg-[#4DA3FF]/10 text-[#4DA3FF] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#4DA3FF]/20 shadow-sm">
                Yazar
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-500 font-medium shrink-0 ml-2">{getRelativeTime(comment.createdAt)}</span>
        </div>
        
        <p className="text-gray-300 text-[14px] leading-relaxed break-words mb-3 mt-1">
          {formatCommentText(comment.content)}
        </p>
        
        {/* 🔥 YENİ: Reaksiyon (Emoji) Kutucukları */}
        <div className="flex flex-wrap gap-2 mb-3">
          {AVAILABLE_EMOJIS.map(emoji => {
            const count = reactionCounts[emoji] || 0;
            return (
              <button 
                key={emoji} 
                onClick={() => handleEmojiClick(emoji)}
                className="flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] px-2.5 py-1 rounded-xl transition-all active:scale-90"
              >
                <span className="text-[14px]">{emoji}</span>
                {count > 0 && <span className="text-[11px] font-bold text-gray-400">{count}</span>}
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center gap-4 pt-3 border-t border-white/[0.02] text-gray-400">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-all duration-300 rounded-lg px-2 py-1 -ml-2 ${localLiked ? 'text-pink-500' : 'hover:text-pink-400 hover:bg-pink-500/10'}`}
          >
            <div className="relative flex items-center justify-center">
              {isLikingAnimation && <span className="absolute w-6 h-6 bg-pink-500 rounded-full animate-ping opacity-60"></span>}
              <Heart size={14} className={`relative z-10 transition-all duration-500 ease-out ${isLikingAnimation ? 'fill-pink-500 scale-150 drop-shadow-[0_0_15px_rgba(236,72,153,1)]' : localLiked ? 'fill-pink-500 scale-110 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'active:scale-50'}`} />
            </div>
            <span className="text-[11px] font-bold">{localLikesCount}</span>
          </button>

          {onReply && (
            <button 
              onClick={() => { playClickSound(); onReply(comment.id, commentAuthor.name); }}
              className="flex items-center gap-1.5 transition-all duration-300 hover:text-[#4DA3FF] hover:bg-[#4DA3FF]/10 rounded-lg px-2 py-1 -ml-2 active:scale-90"
            >
              <Reply size={14} />
              <span className="text-[11px] font-bold">Yanıtla</span>
            </button>
          )}

          <button 
            onClick={handleReportClick}
            className={`ml-auto flex items-center gap-1.5 transition-all duration-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg px-2 py-1 -mr-2 ${reported ? 'text-red-500' : ''}`}
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