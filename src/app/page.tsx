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
import { Bookmark, Bell, MessageCircle, Trophy } from 'lucide-react';
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

  const [posts, totalPostsCount, activeAnnouncement, activeCountdown, customNicknamesDb, userBadgesDb, userAvatarsDb] = await Promise.all([
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
    (prisma as any).userBadge.findMany().catch(() => []),
    (prisma as any).userAvatar.findMany().catch(() => [])
  ]);

  const customNicknamesMap = (customNicknamesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.nickname;
    return acc;
  }, {});

  const userBadgesMap = (userBadgesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.badgeName;
    return acc;
  }, {});

  const userAvatarsMap = (userAvatarsDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.avatarUrl;
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
    } catch (err) {}
  }

  const filters = ['Tümü', 'İtiraf', 'Boş Yap', 'Overheard', '🔥 Trend'];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#050505] text-gray-900 dark:text-white relative z-0 pb-20 selection:bg-[#4DA3FF]/30 transition-colors duration-300">
      
      {/* 🔥 ARKA PLAN GÜNDÜZ/GECE MODUNA UYARLANDI */}
      <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-[#050505] transition-colors duration-300">
        <div className="absolute top-0 left-0 right-0 h-[700px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50 dark:from-purple-900/30 dark:via-[#050505] dark:to-[#050505] pointer-events-none transition-colors duration-300"></div>
      </div>

      {/* 🔥 HEADER GÜNDÜZ/GECE MODUNA UYARLANDI */}
      <div className="sticky top-0 z-50 bg-white/70 dark:bg-black/20 backdrop-blur-3xl border-b border-gray-200 dark:border-white/[0.05] shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-colors duration-300">
        
        <header className="px-4 py-3 flex items-center justify-between gap-2">
          <Link href="https://instagram.com/tnkuoverheard" target="_blank" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-cover rounded-xl shadow-lg" />
            <h1 className="text-[16px] font-black tracking-tighter text-gray-900 dark:text-white">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span></h1>
          </Link>
          
          <div className="flex items-center gap-2.5 shrink-0">
            <RefreshButton />
            
            <Link href="/kaydedilenler" className="hidden sm:flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] px-3 py-1.5 rounded-full transition-colors text-[12px] font-bold border border-gray-200 dark:border-white/[0.05] text-gray-700 dark:text-gray-300">
              <Bookmark size={14} className="text-gray-500 dark:text-gray-400" /> <span>Kaydedilenler</span>
            </Link>

            <Link href="/liderlik" className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 px-2.5 py-1.5 rounded-full transition-all text-[12px] font-bold border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-500 shadow-sm dark:shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Trophy size={14} /> <span className="hidden sm:inline">Sefirler</span>
            </Link>

            <NotificationBell notifications={notifications} />
            <MobileMenu userUuid={userUuid} />
          </div>
        </header>

        <div className="flex overflow-x-auto no-scrollbar px-2">
          {filters.map((filter) => {
            const isActive = currentFilter === filter;
            return (
              <Link
                key={filter}
                href={`/?f=${filter}${searchQuery ? `&q=${searchQuery}` : ''}`}
                scroll={false}
                className={`relative px-4 py-3 text-[14px] font-bold whitespace-nowrap transition-colors ${
                  isActive ? (filter === '🔥 Trend' ? 'text-amber-600 dark:text-amber-500' : 'text-gray-900 dark:text-white') : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {filter === '🔥 Trend' ? 'Trend' : filter}
                {isActive && (
                  <div className={`absolute bottom-0 left-0 w-full h-[2px] rounded-t-full ${filter === '🔥 Trend' ? 'bg-amber-500 shadow-[0_-2px_10px_rgba(245,158,11,0.5)]' : 'bg-[#4DA3FF] shadow-[0_-2px_10px_rgba(77,163,255,0.5)]'}`} />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">
        
        {/* 🔥 NKÜ CHAT VE DUYURU KUTULARI */}
        <div className={`grid gap-3 mb-5 ${activeAnnouncement ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <Link href="/sohbet" className="bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.05] border border-gray-200 dark:border-white/[0.05] rounded-[24px] p-4 flex flex-col justify-between min-h-[100px] transition-all duration-300 group relative overflow-hidden backdrop-blur-md shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#4DA3FF]/15 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="bg-[#4DA3FF]/15 p-2 rounded-xl text-[#4DA3FF] group-hover:scale-110 transition-transform shadow-inner">
                <MessageCircle size={18} />
              </div>
              <div className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <h3 className="text-gray-900 dark:text-white font-black text-[14px] tracking-tight">NKÜ CHAT</h3>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 font-medium">Kampüs ne konuşuyor?</p>
            </div>
          </Link>

          {activeAnnouncement && (
            <div className="bg-blue-50 dark:bg-[#4DA3FF]/[0.02] border border-blue-200 dark:border-[#4DA3FF]/20 rounded-[24px] p-4 flex flex-col justify-between min-h-[100px] relative overflow-hidden backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4DA3FF]/5 to-transparent pointer-events-none"></div>
              <div className="flex items-start justify-between relative z-10">
                <div className="bg-[#4DA3FF]/20 p-2 rounded-xl text-[#4DA3FF] shadow-inner">
                  <Bell size={18} className="animate-pulse" />
                </div>
              </div>
              <div className="mt-3 relative z-10">
                <h3 className="text-[#4DA3FF] font-black text-[14px] tracking-tight">Duyuru</h3>
                {/* 🔥 BURADAKİ TRUNCATE SİLİNDİ, YERİNE whitespace-pre-wrap EKLENDİ */}
                <p className="text-gray-600 dark:text-gray-300 text-[11px] mt-0.5 font-medium whitespace-pre-wrap break-words leading-relaxed">{activeAnnouncement.content}</p>
              </div>
            </div>
          )}
        </div>

        {activeCountdown && (
          <div className="mb-5 relative z-10">
            <CountdownWidget countdown={activeCountdown} />
          </div>
        )}
        
        <div className="mb-6 relative z-10">
          <SearchBar />
        </div>

        <div className="space-y-0 relative z-10">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-white/[0.02] rounded-[24px] border border-gray-200 dark:border-white/[0.05] flex flex-col items-center justify-center backdrop-blur-md shadow-sm dark:shadow-none">
              <p className="text-gray-500 dark:text-gray-400 font-bold text-[14px]">
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
                  userAvatar={userAvatarsMap[post.authorUuid]}
                />
              ))}
              
              {posts.length < totalPostsCount && (
                <div className="flex justify-center pt-4 pb-10">
                  <Link 
                    href={`/?f=${currentFilter}${searchQuery ? `&q=${searchQuery}` : ''}&page=${page + 1}`}
                    scroll={false}
                    className="px-6 py-3 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] hover:border-gray-300 dark:hover:border-white/20 rounded-full text-[13px] font-bold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white shadow-sm dark:shadow-lg backdrop-blur-md"
                  >
                    Daha Fazla Göster
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ClientShareWidgetV2>
        <ModernForm />
      </ClientShareWidgetV2>
    </main>
  );
}