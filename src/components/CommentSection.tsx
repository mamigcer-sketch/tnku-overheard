"use client";

import { useState } from "react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { MessageCircle } from "lucide-react";

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

const getAnonymousData = (id: string) => {
  if (!id) return { name: "Gizemli Yolcu", emoji: "👤", gradient: gradients[0] };
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  return {
    name: `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}`,
    emoji: emojis[positiveHash % emojis.length],
    gradient: gradients[Math.floor(positiveHash / emojis.length) % gradients.length]
  };
};

export default function CommentSection({ postId, comments, postAuthorUuid }: { postId: string; comments: any[]; postAuthorUuid: string }) {
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  // Ana yorumlar (istersen onları da en eskiye/en yeniye göre ayarlayabilirsin, ana yorumlar genelde ters sırada kalabilir veya düz)
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
      <div className="flex items-center gap-2 px-1 text-gray-300">
        <MessageCircle size={18} className="text-[#4DA3FF]" />
        <h2 className="text-[16px] font-bold">
          Yorumlar <span className="text-gray-500 font-medium text-sm">({comments.length})</span>
        </h2>
      </div>

      <div className="space-y-4">
        {parentComments.length === 0 ? (
          <div className="text-center py-10 bg-white/[0.02] backdrop-blur-md rounded-[20px] border border-white/[0.05] shadow-inner">
            <p className="text-gray-500 font-medium text-[13px]">Bu fısıltıya ilk cevabı sen ver.</p>
          </div>
        ) : (
          parentComments.map((comment: any) => {
            const commentAuthor = getAnonymousData(comment.authorId || comment.id);
            const isPostAuthor = comment.authorId && comment.authorId === postAuthorUuid;
            
            // 🔥 KRİTİK DÜZELTME: Yanıtları tarihe göre ARTAN (eskiden yeniye) sıralıyoruz. Böylece yeni gelen hep EN ALTA ekleniyor!
            const replies = comments
              .filter((c: any) => c.parentId === comment.id)
              .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            return (
              <div key={comment.id} className="space-y-3">
                <CommentItem 
                  comment={comment}
                  commentAuthor={commentAuthor}
                  isPostAuthor={isPostAuthor}
                  onReply={handleReplyClick}
                />

                {replies.length > 0 && (
                  <div className="space-y-3 pl-6 sm:pl-10 border-l-2 border-[#4DA3FF]/20 ml-3 sm:ml-5">
                    {replies.map((reply: any) => {
                      const replyAuthor = getAnonymousData(reply.authorId || reply.id);
                      const isReplyAuthorPostAuthor = reply.authorId && reply.authorId === postAuthorUuid;

                      return (
                        <CommentItem 
                          key={reply.id}
                          comment={reply}
                          commentAuthor={replyAuthor}
                          isPostAuthor={isReplyAuthorPostAuthor}
                          isReply={true}
                          onReply={handleReplyClick}
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
      
      {/* YORUM / YANITLAMA FORMU */}
      <div id="comment-form-section" className="pt-6 border-t border-white/[0.05] mt-8 bg-white/[0.01] backdrop-blur-md rounded-[24px] p-3">
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {replyingTo ? `@${replyingTo.name} kişisine yanıt veriliyor` : "Sen Ne Düşünüyorsun?"}
          </h3>
          {replyingTo && (
            <button 
              onClick={() => setReplyingTo(null)} 
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold transition-colors"
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