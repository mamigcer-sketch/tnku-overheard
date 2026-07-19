"use client";

import { useState } from "react";
import { addComment } from "@/app/post/actions";

export default function CommentForm({ postId }: { postId: string }) {
  const [comment, setComment] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    await addComment(postId, comment);
    setComment(""); // Kutuyu temizle
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
      <textarea
        className="w-full resize-none rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-[#4DA3FF]"
        rows={2}
        placeholder="Anonim bir şeyler fısılda..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        type="submit"
        disabled={isPending}
        className="self-end rounded-md bg-[#4DA3FF] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-blue-400"
      >
        {isPending ? "Fırlatılıyor..." : "Fırlat"}
      </button>
    </form>
  );
}