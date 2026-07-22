import prisma from '@/lib/prisma';
import ModernForm from './ModernForm';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import MobileMenu from '@/components/MobileMenu';
import SearchBar from '@/components/SearchBar';
import NotificationBell from '@/components/NotificationBell';
import RefreshButton from '@/components/RefreshButton';
import CountdownWidget from '@/components/CountdownWidget';
import { MessageSquareHeart } from 'lucide-react';
import ClientShareWidgetV2 from '@/components/ClientShareWidgetV2';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: any) {
  const cookieStore = await cookies();

  let userUuid = cookieStore.get('user_uuid')?.value;
  if (!userUuid) {
    userUuid = 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async function incrementLike(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const currentCookieStore = await cookies();
    const likedPostsCookie = currentCookieStore.get('liked_posts')?.value || '';
    const likedPosts = likedPostsCookie.split(',');

    if (!likedPosts.includes(id)) {
      await prisma.post.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });
      currentCookieStore.set('liked_posts', [...likedPosts, id].join(','), { 
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true 
      });
      revalidatePath('/');
    }
  }

  const likedPosts = cookieStore.get('liked_posts')?.value?.split(',') || [];
  
  const params = await searchParams;
  const currentFilter = params?.f || 'Tümü';
  const searchQuery = params?.q || '';
  
  const page = parseInt(params?.page || '1');
  const pageSize = 10;
  const totalTake = page * pageSize; 

  let whereQuery: any = { 
    status: 'APPROVED',
    OR: [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } }
    ]
  };

  let orderQuery: any = { createdAt: 'desc' };

  if (currentFilter === 'Overheard') whereQuery.type = { in: ['OVERHEARD', 'OVERHED'] };
  if (currentFilter === 'İtiraf') whereQuery.type = 'CONFESSION';
  if (currentFilter === 'Boş Yap') whereQuery.type = 'BOSYAP';
  
  if (currentFilter === '🔥 Trend') {
    orderQuery = { likes: 'desc' };
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24); 
    whereQuery.createdAt = { gte: oneDayAgo };
  }

  if (searchQuery) whereQuery.content = { contains: searchQuery, mode: 'insensitive' };

  const [posts, totalPostsCount, activeAnnouncement, activeCountdown, customNicknamesDb, userBadgesDb] = await Promise.all([
    prisma.post.findMany({
      where: whereQuery,
      orderBy: orderQuery,
      take: totalTake,
      include: { 
        _count: { select: { comments: true } }, 
        comments: { 
          orderBy: [
            { likes: 'desc' },
            { createdAt: 'desc' }
          ], 
          take: 1, 
          select: { id: true, content: true, authorId: true } 
        } 
      }
    }),
    prisma.post.count({ where: whereQuery }),
    (prisma as any).announcement.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    }),
    (prisma as any).countdown.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    }),
    (prisma as any).customNickname.findMany().catch(() => []),
    (prisma as any).userBadge.findMany().catch(() => [])
  ]);

  const customNicknamesMap = (customNicknamesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.nickname;
    return acc;
  }, {});

  const userBadgesMap = (userBadgesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.badgeName;
    return acc;
  }, {});

  const authorId = cookieStore.get('tnku_author_id')?.value;
  let notifications: any[] = [];
  
  if (authorId) {
    try {
      notifications = await (prisma as any).notification.findMany({
        where: { userUuid: authorId },
        orderBy: { createdAt: 'desc' },
        take: 15
      });
    } catch (err) {
      console.error("Bildirimler çekilemedi:", err);
    }
  }

  const filters = ['Tümü', 'İtiraf', 'Boş Yap', 'Overheard', '🔥 Trend'];

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white relative z-0 overflow-hidden pb-20">
      
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#4DA3FF]/15 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-pink-500/5 blur-[100px] pointer-events-none -z-10" />

      <header className="sticky top-0 z-50 bg-[#0B0B0B]/40 backdrop-blur-3xl border-b border-white/[0.03] px-4 py-4 md:px-8 flex items-center justify-between transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] gap-2">
        
        <Link href="https://instagram.com/tnkuoverheard" target="_blank" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity shrink-0">
          <img src="/logo.jpg" alt="Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
          <h1 className="text-base sm:text-xl font-black tracking-tighter">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span></h1>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <RefreshButton />
          
          <NotificationBell notifications={notifications} />
          
          <Link 
            href="/my-likes" 
            className="hidden sm:flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.08] px-3.5 py-2 rounded-full transition-colors text-[13px] font-medium border border-white/[0.05] text-pink-400"
          >
            <MessageSquareHeart size={15} />
            <span>Beğendiklerim</span>
          </Link>
          <MobileMenu />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        
        {activeAnnouncement && (
          <div className="mb-6 bg-gradient-to-r from-[#4DA3FF]/10 via-purple-500/10 to-[#4DA3FF]/10 backdrop-blur-xl border border-[#4DA3FF]/20 p-4 rounded-[20px] flex items-center gap-3 animate-in fade-in duration-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
            <div className="bg-[#4DA3FF] text-black px-2.5 py-1 rounded-xl shrink-0 font-black text-[10px] uppercase tracking-wider shadow">Duyuru</div>
            <p className="text-gray-200 text-[13px] sm:text-[14px] font-medium leading-relaxed">{activeAnnouncement.content}</p>
          </div>
        )}

        <div className="relative z-10">
          <CountdownWidget countdown={activeCountdown} />
        </div>
        
        <div className="mb-6 relative z-10">
          <SearchBar />
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-4 mb-4 scrollbar-hide snap-x relative z-40 sticky top-[70px] sm:top-[80px] bg-transparent backdrop-blur-md pt-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          {filters.map((filter) => {
            const isActive = currentFilter === filter;
            
            let activeClass = 'bg-white text-black font-extrabold shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105';
            if (isActive) {
              if (filter === 'Overheard') activeClass = 'bg-[#4DA3FF] text-black font-extrabold shadow-[0_0_25px_rgba(77,163,255,0.5)] scale-105';
              else if (filter === 'İtiraf') activeClass = 'bg-purple-600 text-white font-extrabold shadow-[0_0_25px_rgba(168,85,247,0.5)] scale-105';
              else if (filter === 'Boş Yap') activeClass = 'bg-emerald-500 text-black font-extrabold shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-105';
              else if (filter === '🔥 Trend') activeClass = 'bg-amber-500 text-black font-extrabold shadow-[0_0_25px_rgba(245,158,11,0.5)] scale-105';
            }

            const inactiveClass = 'bg-white/[0.03] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15]';

            return (
              <Link 
                key={filter} 
                href={`/?f=${filter}${searchQuery ? `&q=${searchQuery}` : ''}`} 
                scroll={false}
                className={`px-5 py-2.5 rounded-xl text-[13px] font-bold whitespace-nowrap snap-start transition-all duration-300 backdrop-blur-md flex items-center justify-center ${
                  isActive ? activeClass : inactiveClass
                }`}
              >
                {filter}
              </Link>
            )
          })}
        </div>

        <div className="space-y-6 relative z-10">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] backdrop-blur-2xl rounded-[24px] border border-white/[0.05] flex flex-col items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
              <p className="text-gray-400 font-medium text-[14px]">
                {currentFilter === '🔥 Trend' 
                  ? 'Son 24 saatte henüz popülerleşen bir fısıltı yok.' 
                  : 'Aradığın kriterlerde gönderi bulunamadı.'}
              </p>
            </div>
          ) : (
            <>
              {posts.map((post: any) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  isLiked={likedPosts.includes(post.id)} 
                  incrementLike={incrementLike}
                  userUuid={userUuid}
                  customNickname={customNicknamesMap[post.authorUuid]} 
                  userBadge={userBadgesMap[post.authorUuid]}
                />
              ))}
              
              {posts.length < totalPostsCount && (
                <div className="flex justify-center pt-6">
                  <Link 
                    href={`/?f=${currentFilter}${searchQuery ? `&q=${searchQuery}` : ''}&page=${page + 1}`}
                    scroll={false}
                    className="px-8 py-3.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-white/[0.2] rounded-full text-[13px] font-bold text-gray-300 transition-all hover:bg-white/[0.08] hover:text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
                  >
                    Daha Fazla Göster
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Kesinlikle kapalı başlayan güvenli istemci paylaşım widget'ı */}
      <ClientShareWidgetV2>
        <ModernForm />
      </ClientShareWidgetV2>
    </main>
  );
}