import prisma from '@/lib/prisma';
import PostCard from '@/components/PostCard';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MyLikesPage() {
  const cookieStore = await cookies();
  const likedPostsCookie = cookieStore.get('liked_posts')?.value || '';
  const likedPostIds = likedPostsCookie.split(',').filter(Boolean);

  const posts = await prisma.post.findMany({
    where: { id: { in: likedPostIds } },
    orderBy: { createdAt: 'desc' },
    include: { comments: { select: { id: true } } }
  });

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white p-4">
      <div className="max-w-2xl mx-auto pt-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={20} /> Geri Dön
        </Link>
        
        <h1 className="text-2xl font-bold mb-6">Beğendiklerin</h1>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-[#121212] rounded-3xl border border-white/5">
            <p className="text-gray-400">Henüz bir gönderiyi beğenmemişsin kanka.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                isLiked={true} 
                incrementLike={async () => { 'use server'; }} // Zaten beğenilmiş olduğu için gerek yok
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}