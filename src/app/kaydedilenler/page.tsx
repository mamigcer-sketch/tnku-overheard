import prisma from '@/lib/prisma';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function SavedPostsPage() {
  const cookieStore = await cookies();
  const userUuid = cookieStore.get('user_uuid')?.value || '';
  const savedPostsCookie = cookieStore.get('saved_posts')?.value || '';
  const likedPostsCookie = cookieStore.get('liked_posts')?.value || '';

  const savedPostIds = savedPostsCookie.split(',').filter(Boolean);
  const likedPosts = likedPostsCookie.split(',').filter(Boolean);

  let posts: any[] = [];
  let customNicknamesMap: any = {};
  let userBadgesMap: any = {};

  if (savedPostIds.length > 0) {
    const [fetchedPosts, customNicknamesDb, userBadgesDb] = await Promise.all([
      prisma.post.findMany({
        where: {
          id: { in: savedPostIds },
          status: 'APPROVED',
        },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { comments: true } },
          comments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { id: true, content: true, authorId: true }
          }
        }
      }),
      (prisma as any).customNickname.findMany().catch(() => []),
      (prisma as any).userBadge.findMany().catch(() => [])
    ]);

    posts = fetchedPosts;

    customNicknamesMap = (customNicknamesDb || []).reduce((acc: any, curr: any) => {
      acc[curr.userUuid] = curr.nickname;
      return acc;
    }, {});

    userBadgesMap = (userBadgesDb || []).reduce((acc: any, curr: any) => {
      acc[curr.userUuid] = curr.badgeName;
      return acc;
    }, {});
  }

  // Beğeni aksiyonu
  async function incrementLike(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const currentCookieStore = await cookies();
    const currentLikedCookie = currentCookieStore.get('liked_posts')?.value || '';
    const currentLikedList = currentLikedCookie.split(',');

    if (!currentLikedList.includes(id)) {
      await prisma.post.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });
      currentCookieStore.set('liked_posts', [...currentLikedList, id].join(','), { 
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true 
      });
      revalidatePath('/kaydedilenler');
    }
  }

  return (
    <main className="min-h-screen bg-[#000000] text-white relative z-0 pb-20">
      <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white hover:opacity-70 transition-opacity p-2 -ml-2">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-[18px] font-bold tracking-tight flex items-center gap-2">
            <Bookmark size={20} className="text-gray-300" />
            Kaydedilenler
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-[#121212]/50 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
            <Bookmark size={48} className="text-gray-600 mb-4" />
            <h2 className="text-lg font-bold text-gray-300 mb-2">Henüz hiçbir şeyi kaydetmedin</h2>
            <p className="text-gray-500 font-medium text-[13px]">
              Gözüne kestirdiğin fısıltıları ve itirafları kaydettiğinde burada görünecek.
            </p>
            <Link href="/" className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 transition-colors rounded-full text-sm font-bold text-white border border-white/10">
              Ana Sayfaya Dön
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <PostCard 
                key={post.id} 
                post={post} 
                isLiked={likedPosts.includes(post.id)} 
                incrementLike={incrementLike}
                userUuid={userUuid}
                customNickname={customNicknamesMap[post.authorUuid]} 
                userBadge={userBadgesMap[post.authorUuid]}
                customNicknamesMap={customNicknamesMap}
                userBadgesMap={userBadgesMap}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}