"use client";

import { useState, useEffect, useRef } from "react";
import CommentForm from "./CommentForm";
import { Heart, Eye, MapPin, Clock, Users, User } from "lucide-react"; // İkonlar eklendi
import Link from "next/link";
import { incrementView } from "@/app/post/actions";

export default function PostCard({ post, isLiked, incrementLike }: any) {
  const [showComment, setShowComment] = useState(false);
  const cardRef = useRef(null);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasViewed) {
          incrementView(post.id);
          setHasViewed(true); // Sadece bir kere artsın diye işaretledik
        }
      },
      { threshold: 0.5 } // Postun yarısı ekrana girince say
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [post.id, hasViewed]);

  return (
    <div ref={cardRef} className="group bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-5 rounded-[20px] hover:bg-white/[0.05] transition-all">
      <Link href={`/post/${post.id}`} className="block">
        
        {/* ROZETLERİN (TAGS) OLDUĞU KISIM */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium text-gray-400">
          
          <span className={`px-3 py-1 rounded-full border ${post.type === 'CONFESSION' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-[#4DA3FF]/10 border-[#4DA3FF]/20 text-[#4DA3FF]'}`}>
            {post.type === 'CONFESSION' ? 'İTİRAF' : 'OVERHEARD'}
          </span>
          
          {post.location && (
            <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <MapPin size={12} /> {post.location}
            </span>
          )}

          {post.time && (
            <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <Clock size={12} /> {post.time}
            </span>
          )}

          {post.people && (
            <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <Users size={12} /> {post.people}
            </span>
          )}

          {post.gender && (
            <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <User size={12} /> {post.gender}
            </span>
          )}

        </div>
        
        <p className="text-white text-[17px] leading-relaxed mb-6 font-light">{post.content}</p>
      </Link>

      <div className="flex items-center justify-between border-t border-white/10 pt-4 text-gray-400 px-2 -mt-4">
        <div className="flex gap-5">
          <form action={incrementLike}>
            <input type="hidden" name="id" value={post.id} />
            <button type="submit" disabled={isLiked} className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-400'}`}>
              <Heart size={18} className={isLiked ? 'fill-red-500' : ''} /> 
              <span className="text-sm">{post.likes}</span>
            </button>
          </form>
          <div className="flex items-center gap-2">
            <Eye size={18} /> <span className="text-sm">{post.views}</span>
          </div>
          <button 
            onClick={() => setShowComment(!showComment)}
            className="text-sm hover:text-[#4DA3FF] transition-colors"
          >
            {showComment ? "Vazgeç" : "Yorum Yap"}
          </button>
        </div>
        <span className="text-xs">{post.createdAt.toLocaleDateString('tr-TR')}</span>
      </div>

      {showComment && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <CommentForm postId={post.id} />
        </div>
      )}
    </div>
  );
}