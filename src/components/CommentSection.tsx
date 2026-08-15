"use client";

import { useState } from "react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { MessageCircle } from "lucide-react";

const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare", "Deli", "Çılgın", "Bıkkın", "Dalgın", "Ters", "Şüpheli", "Kuşkulu", "Durgun", "Hızlı", "Yavaş", "Donuk", "Parlak", "Sinsi", "Kurnaz", "Tatlı", "Sert", "Yabani", "Yalnız", "Suskun", "Coşkulu"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek", "Tavuk", "Maymun", "Keçi", "Sincap", "Kurbağa", "Kaplan", "Koala", "Tilki", "Kurt", "Aslan", "Şahin", "Karga", "Köstebek", "Koyun", "İnek", "At", "Eşek", "Fok", "Penguen", "Kirpi", "Sazan", "Yengeç", "Ahtapot", "Kertenkele", "Koala"];

const getAnonymousData = (id: string, customNickname?: string) => {
  if (!id) return { name: "Gizemli Yolcu" };
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  
  if (customNickname) {
    return { name: customNickname };
  }

  return {
    name: `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}`
  };
};

export default function CommentSection({ 
  postId, 
  comments, 
  postAuthorUuid, 
  userLikedCommentIds,
  customNicknamesMap = {},
  userBadgesMap = {},
  userAvatarsMap = {} 
}: { 
  postId: string; 
  comments: any[]; 
  postAuthorUuid: string; 
  userLikedCommentIds: string[];
  customNicknamesMap?: Record<string, string>;
  userBadgesMap?: Record<string, string>; 
  userAvatarsMap?: Record<string, string>; 
}) {
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  const parentComments = comments.filter((c: any) => !c.parentId);

  const handleReplyClick = (targetCommentId: string, authorName: string) => {
    const targetComment = comments.find((c: any) => c.id === targetCommentId);
    const rootParentId = targetComment?.parentId ? targetComment.parentId : targetCommentId;

    setReplyingTo({ id: rootParentId, name: authorName });
    
    setTimeout(() => {
      const textarea = document.querySelector('#comment-form-section textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        const textLength = textarea.value.length;
        textarea.setSelectionRange(textLength, textLength);
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Yorumlar Başlığı (Gündüz/Gece Uyumlu) */}
      <div className="flex items-center gap-2 px-1 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <MessageCircle size={18} className="text-blue-500 dark:text-[#4DA3FF]" />
        <h2 className="text-[16px] font-bold tracking-wide">
          Yorumlar <span className="text-gray-500 font-medium text-sm">({comments.length})</span>
        </h2>
      </div>

      <div className="space-y-4">
        {parentComments.length === 0 ? (
          // 🔥 BOŞ DURUM KUTUSU (Tamamen Gündüz/Gece Uyumlu)
          <div className="text-center py-12 bg-gray-50 dark:bg-[#121212]/70 backdrop-blur-xl rounded-[22px] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-inner transition-colors duration-300">
            <p className="text-gray-500 dark:text-gray-400 font-medium text-[13px]">Bu fısıltıya ilk cevabı sen ver.</p>
          </div>
        ) : (
          parentComments.map((comment: any) => {
            const authorUuid = comment.authorId || comment.id;
            const commentAuthor = getAnonymousData(authorUuid, customNicknamesMap[authorUuid]);
            const isPostAuthor = comment.authorId && comment.authorId === postAuthorUuid;
            const isLiked = userLikedCommentIds.includes(comment.id);
            const hasCustomNick = !!customNicknamesMap[authorUuid];
            const badge = userBadgesMap[authorUuid]; 
            const avatar = userAvatarsMap[authorUuid]; 
            
            const replies = comments
              .filter((c: any) => c.parentId === comment.id)
              .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            return (
              <div key={comment.id} className="space-y-3">
                <CommentItem 
                  comment={comment}
                  commentAuthor={commentAuthor}
                  isPostAuthor={isPostAuthor}
                  isInitiallyLiked={isLiked}
                  onReply={handleReplyClick}
                  hasCustomNick={hasCustomNick} 
                  userBadge={badge}
                  authorUuid={authorUuid} 
                  userAvatar={avatar} 
                />

                {replies.length > 0 && (
                  // YANIT ÇİZGİSİ (Gündüz/Gece Uyumlu)
                  <div className="space-y-3 pl-6 sm:pl-10 border-l-2 border-blue-200 dark:border-[#4DA3FF]/20 ml-3 sm:ml-5 transition-colors duration-300">
                    {replies.map((reply: any) => {
                      const replyAuthorUuid = reply.authorId || reply.id;
                      const replyAuthor = getAnonymousData(replyAuthorUuid, customNicknamesMap[replyAuthorUuid]);
                      const isReplyAuthorPostAuthor = reply.authorId && reply.authorId === postAuthorUuid;
                      const isReplyLiked = userLikedCommentIds.includes(reply.id);
                      const isReplyHasCustomNick = !!customNicknamesMap[replyAuthorUuid];
                      const replyBadge = userBadgesMap[replyAuthorUuid]; 
                      const replyAvatar = userAvatarsMap[replyAuthorUuid]; 

                      return (
                        <CommentItem 
                          key={reply.id}
                          comment={reply}
                          commentAuthor={replyAuthor}
                          isPostAuthor={isReplyAuthorPostAuthor}
                          isInitiallyLiked={isReplyLiked}
                          isReply={true}
                          onReply={handleReplyClick}
                          hasCustomNick={isReplyHasCustomNick} 
                          userBadge={replyBadge}
                          authorUuid={replyAuthorUuid} 
                          userAvatar={replyAvatar} 
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* 🔥 PREMIUM YORUM YAZMA ALANI DIŞ KUTUSU (Tamamen Gündüz/Gece Uyumlu) */}
      <div id="comment-form-section" className="pt-6 mt-8 bg-gray-50 dark:bg-[#121212]/80 backdrop-blur-xl rounded-[24px] p-4 sm:p-5 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-lg transition-colors duration-300">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
            {replyingTo ? `@${replyingTo.name} kişisine yanıt veriliyor` : "Sen Ne Düşünüyorsun?"}
          </h3>
          {replyingTo && (
            <button 
              onClick={() => setReplyingTo(null)} 
              className="text-xs text-red-500 hover:text-red-600 dark:text-pink-400 dark:hover:text-pink-300 font-semibold transition-colors cursor-pointer"
            >
              Yanıtı İptal Et ✕
            </button>
          )}
        </div>

        <CommentForm 
          postId={postId} 
          parentId={replyingTo?.id} 
          replyingToName={replyingTo?.name}
          onReplyDone={() => setReplyingTo(null)} 
        />
      </div>
    </div>
  );
}