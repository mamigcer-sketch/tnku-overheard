"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { addComment } from "@/app/post/actions";

export default function CommentForm({ 
  postId, 
  parentId, 
  replyingToName,
  onReplyDone 
}: { 
  postId: string; 
  parentId?: string; 
  replyingToName?: string;
  onReplyDone?: () => void 
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Yanıtla butonuna basıldığında metin kutusunun başına otomatik olarak @etiket ekler
  useEffect(() => {
    if (replyingToName) {
      setContent(prev => {
        if (prev.trim().startsWith(`@${replyingToName}`)) return prev;
        return `@${replyingToName} ${prev}`;
      });
    }
  }, [replyingToName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("content", content);
      
      if (parentId) {
        formData.append("parentId", parentId);
      }

      await addComment(formData);
      setContent("");
      if (onReplyDone) onReplyDone();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Anonim olarak yanıtla..." : "Bu paylaşıma anonim bir yorum bırak..."}
          rows={3}
          // 🔥 GÜNDÜZ/GECE UYUMLU STİLLER EKLENDİ
          className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 dark:focus:border-[#4DA3FF]/50 rounded-[20px] px-4 py-3.5 pr-14 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors duration-300 resize-none shadow-inner dark:shadow-none"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          // 🔥 BUTON VE GÖLGESİ DİNAMİK YAPILDI
          className="absolute right-3 bottom-4 bg-[#4DA3FF] hover:bg-[#3b8fd8] text-white dark:text-black p-2.5 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-md dark:shadow-[0_0_15px_rgba(77,163,255,0.4)] flex items-center justify-center cursor-pointer"
        >
          <Send size={15} className="translate-x-[1px] translate-y-[-1px]" />
        </button>
      </div>
    </form>
  );
}