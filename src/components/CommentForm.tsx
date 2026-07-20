"use client";

import { useState } from "react";
import { addComment } from "@/app/post/actions";
import { Send, Loader2 } from "lucide-react";

export default function CommentForm({ postId }: { postId: string }) {
  const [comment, setComment] = useState("");
  const [isPending, setIsPending] = useState(false);
  const maxLength = 200; // Yorum karakter sınırı

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return; // Boş yorum atılmasını engelle
    
    setIsPending(true);
    await addComment(postId, comment);
    setComment(""); // Kutuyu temizle
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-3">
      <div className="relative group">
        <textarea
          className="w-full resize-none rounded-[20px] border border-white/[0.05] bg-white/[0.02] p-4 pb-9 text-[14px] text-gray-200 outline-none focus:bg-white/[0.04] focus:border-white/[0.1] transition-all duration-300 placeholder:text-gray-600 shadow-inner leading-relaxed"
          rows={3}
          maxLength={maxLength}
          placeholder="Anonim bir şeyler fısılda..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        {/* Karakter Sayacı - Daha Zarif */}
        <div className={`absolute bottom-3 right-4 text-[10px] font-bold tracking-wider transition-colors duration-300 ${comment.length >= maxLength ? 'text-red-400' : 'text-gray-600'}`}>
          {comment.length} <span className="opacity-50">/ {maxLength}</span>
        </div>
      </div>
      
      {/* Gönder Butonu - Pill (Hap) Tasarımı */}
      <button
        type="submit"
        disabled={isPending || comment.trim().length === 0}
        className="self-end rounded-full bg-[#4DA3FF] px-6 py-2.5 text-[13px] font-bold text-black transition-all hover:bg-blue-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_15px_rgba(77,163,255,0.15)] hover:shadow-[0_0_25px_rgba(77,163,255,0.3)] active:scale-95"
      >
        {isPending ? (
          <><Loader2 size={15} className="animate-spin" /> Fırlatılıyor...</>
        ) : (
          <>Fırlat <Send size={15} /></>
        )}
      </button>
    </form>
  );
}