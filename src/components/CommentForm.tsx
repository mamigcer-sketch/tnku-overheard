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
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <div className="relative">
        <textarea
          className="w-full resize-none rounded-xl border border-white/10 bg-[#121212] p-4 pb-8 text-sm text-white outline-none focus:ring-2 focus:ring-[#4DA3FF]/40 focus:border-[#4DA3FF] transition-all placeholder:text-gray-500 shadow-inner"
          rows={3}
          maxLength={maxLength}
          placeholder="Anonim bir şeyler fısılda..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        {/* Karakter Sayacı */}
        <div className={`absolute bottom-3 right-4 text-[11px] font-medium transition-colors ${comment.length >= maxLength ? 'text-red-400' : 'text-gray-500'}`}>
          {comment.length} / {maxLength}
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isPending || comment.trim().length === 0}
        className="self-end rounded-xl bg-[#4DA3FF] px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_15px_rgba(77,163,255,0.2)] hover:shadow-[0_0_25px_rgba(77,163,255,0.4)] active:scale-95"
      >
        {isPending ? (
          <><Loader2 size={16} className="animate-spin" /> Fırlatılıyor...</>
        ) : (
          <>Fırlat <Send size={16} /></>
        )}
      </button>
    </form>
  );
}