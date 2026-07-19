"use client";

import { useState, useEffect } from 'react';
import { getPostsByIds } from '@/app/post/actions';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

export default function MyPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function loadMyPosts() {
    const storedIds = localStorage.getItem('my_posts');
    console.log("LocalStorage'dan gelen veriler:", storedIds); // <--- Bunu ekle

    if (storedIds) {
      const ids = JSON.parse(storedIds);
      console.log("Parsed ID'ler:", ids); // <--- Bunu da ekle
      
      const data = await getPostsByIds(ids);
      console.log("Veritabanından dönen postlar:", data); // <--- Bunu da ekle
      setPosts(data);
    }
    setLoading(false);
  }
  loadMyPosts();
}, []);

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Link href="/" className="text-gray-400 hover:text-white">←</Link>
          Paylaşımlarım
        </h1>

        {loading ? (
          <p className="text-gray-500">Yükleniyor...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-2xl">
            <p className="text-gray-400">Henüz bir paylaşımın yok.</p>
            <Link href="/" className="text-[#4DA3FF] underline mt-2 block">Bir şeyler yazmaya başla!</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}