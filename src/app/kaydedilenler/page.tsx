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
  let userAvatarsMap: any = {}; // 🔥 AVATARLAR İÇİN EKLENDİ

  if (savedPostIds.length > 0) {
    // 🔥 AVATARLAR DA VERİTABANINDAN ÇEKİLİYOR
    const [fetchedPosts, customNicknamesDb, userBadgesDb, userAvatarsDb] = await Promise.all([
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
      (prisma as any).userBadge.findMany().catch(() => []),
      (prisma as any).userAvatar.findMany().catch(() => []) // 🔥 EKLENDİ
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

    // 🔥 AVATARLARI HARİTALANDIRDIK
    userAvatarsMap = (userAvatarsDb || []).reduce((acc: any, curr: any) => {
      acc[curr.userUuid] = curr.avatarUrl;
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
    // 🔥 DİNAMİK METİN VE GEÇİŞ EKLENDİ
    <main className="min-h-screen bg-slate-50 dark:bg-[#050505] text-gray-900 dark:text-white relative z-0 pb-20 transition-colors duration-300">
      
      {/* 🔥 ARKA PLAN (Gündüz/Gece Uyumlu) */}
      <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-[#050505] transition-colors duration-300">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50 dark:from-blue-900/20 dark:via-[#050505] dark:to-[#050505] pointer-events-none transition-colors duration-300"></div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-3xl border-b border-gray-200 dark:border-white/[0.05] px-4 py-3 flex items-center justify-between shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:bg-white/5 p-2 -ml-2 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-[15px] font-black tracking-widest uppercase flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
            <Bookmark size={16} className="text-[#4DA3FF]" />
            Kaydedilenler
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {posts.length === 0 ? (
          // BOŞ DURUM KUTUSU (Gündüz/Gece Uyumlu)
          <div className="text-center py-20 bg-white dark:bg-[#121212]/50 rounded-[24px] border border-gray-200 dark:border-white/5 flex flex-col items-center justify-center shadow-sm dark:shadow-none transition-colors duration-300">
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-full mb-4">
              <Bookmark size={36} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-lg font-black text-gray-800 dark:text-white mb-2 tracking-tight">Henüz hiçbir şeyi kaydetmedin</h2>
            <p className="text-gray-500 font-medium text-[13px] px-4">
              Gözüne kestirdiğin fısıltıları ve itirafları kaydettiğinde burada görünecek.
            </p>
            <Link href="/" className="mt-6 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 transition-colors rounded-full text-sm font-bold text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 shadow-inner dark:shadow-none">
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
                userAvatar={userAvatarsMap[post.authorUuid]} // 🔥 AVATAR BURADAN EKLENDİ
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}