"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/PostCard";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import { Home, Trash2, FileText, Loader2, Sparkles, MessageSquareHeart } from "lucide-react";
import { getPostsByIds } from "@/app/post/actions";

export default function MyPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyPosts() {
      try {
        const localIds = JSON.parse(localStorage.getItem('my_posts') || '[]');
        if (localIds.length === 0) {
          setLoading(false);
          return;
        }

        const fetchedPosts = await getPostsByIds(localIds);
        setPosts(fetchedPosts);

        const existingIds = fetchedPosts.map((p: any) => p.id);
        localStorage.setItem('my_posts', JSON.stringify(existingIds));
      } catch (err) {
        console.error("Paylaşımlar yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyPosts();
  }, []);

  const handleRemoveFromLocal = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedPosts = posts.filter(p => p.id !== postId);
    setPosts(updatedPosts);
    const updatedIds = updatedPosts.map(p => p.id);
    localStorage.setItem('my_posts', JSON.stringify(updatedIds));
  };

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white relative z-0 overflow-hidden pb-24">
      
      {/* Arka Plan Işık Efektleri */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#4DA3FF]/15 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-pink-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/40 backdrop-blur-3xl border-b border-white/[0.03] px-4 py-4 md:px-8 flex items-center justify-between transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] gap-2">
        <Link href="https://instagram.com/tnkuoverheard" target="_blank" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity shrink-0">
          <img src="/logo.jpg" alt="Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
          <h1 className="text-base sm:text-xl font-black tracking-tighter">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span></h1>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <BackButton />
          <Link 
            href="/my-likes" 
            className="hidden sm:flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.08] px-3.5 py-2 rounded-full transition-colors text-[13px] font-medium border border-white/[0.05] text-pink-400"
          >
            <MessageSquareHeart size={15} />
            <span>Beğendiklerim</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] px-4 py-2 rounded-full transition-colors text-[13px] font-medium border border-white/[0.05]">
            <Home size={14} /> <span className="hidden sm:inline">Ana Sayfa</span>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 relative z-10">
        
        {/* Üst Bilgi Kartı */}
        <div className="mb-8 bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] p-5 sm:p-6 rounded-[24px] flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight mb-1 flex items-center gap-2">
              <FileText className="text-[#4DA3FF]" size={20} /> Paylaşımlarım
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm font-medium">
              Bu cihazdan gönderdiğin ve yayında olan anonim fısıltıların.
            </p>
          </div>
          <div className="bg-[#4DA3FF]/10 text-[#4DA3FF] px-3.5 py-1.5 rounded-2xl border border-[#4DA3FF]/20 font-black text-xs sm:text-sm shadow-inner">
            {posts.length} Post
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white/[0.02] backdrop-blur-2xl rounded-[24px] border border-white/[0.05] flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#4DA3FF]" size={32} />
            <p className="text-gray-400 text-sm font-medium">Paylaşımların yükleniyor...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] backdrop-blur-2xl rounded-[24px] border border-white/[0.05] flex flex-col items-center justify-center gap-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <div className="bg-white/5 p-4 rounded-full">
              <Sparkles className="text-gray-500" size={32} />
            </div>
            <p className="text-gray-300 font-bold text-base">Henüz bu cihazdan yapılan bir paylaşım yok.</p>
            <p className="text-gray-500 text-xs max-w-xs">Kampüste duyduğun bir diyaloğu veya sırrını anonim olarak hemen fısılda!</p>
            <Link href="/" className="mt-2 px-6 py-2.5 bg-[#4DA3FF] text-black font-bold rounded-xl text-xs hover:bg-blue-400 transition-all shadow">
              Hemen Paylaşım Yap
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post: any) => (
              <div key={post.id} className="relative group">
                <PostCard 
                  post={post} 
                  isLiked={false} 
                  incrementLike={() => {}} 
                />
                <div className="absolute top-4 right-4 z-30">
                  <button 
                    onClick={(e) => handleRemoveFromLocal(post.id, e)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md backdrop-blur-md active:scale-95"
                    title="Listeden Kaldır"
                  >
                    <Trash2 size={13} /> Listeden Kaldır
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}