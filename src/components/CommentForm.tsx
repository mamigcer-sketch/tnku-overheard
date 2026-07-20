"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { addComment } from "@/app/post/actions";

export default function CommentForm({ 
  postId, 
  parentId, 
  onReplyDone 
}: { 
  postId: string; 
  parentId?: string; 
  onReplyDone?: () => void 
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

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
          placeholder={parentId ? "Bu yoruma yanıt yaz..." : "Fısıltıya bir cevap yaz..."}
          rows={3}
          className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-[#4DA3FF]/50 rounded-[20px] px-4 py-3.5 pr-14 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-all resize-none shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="absolute right-3 bottom-4 bg-[#4DA3FF] hover:bg-[#3b8fd8] text-black p-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(77,163,255,0.4)]"
        >
          <Send size={15} />
        </button>
      </div>
    </form>
  );
}