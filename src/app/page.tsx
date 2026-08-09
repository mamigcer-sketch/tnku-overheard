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
import { MessageSquareHeart, Bell, MessageCircle, Trophy, LayoutGrid, Coffee, Headphones, Flame, ChevronRight } from 'lucide-react';
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

  const filterData = [
    { name: 'Tümü', icon: LayoutGrid },
    { name: 'İtiraf', icon: MessageSquareHeart },
    { name: 'Boş Yap', icon: Coffee },
    { name: 'Overheard', icon: Headphones },
    { name: '🔥 Trend', icon: Flame },
  ];

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white relative z-0 overflow-hidden pb-20">
      
      {/* HEADER - DAHA ZARİF */}
      <header className="sticky top-0 z-50 bg-[#121212]/90 backdrop-blur-2xl border-b border-white/5 px-4 py-3 md:px-8 flex items-center justify-between shadow-sm gap-2">
        <Link href="https://instagram.com/tnkuoverheard" target="_blank" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <img src="/logo.jpg" alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-cover rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
          <h1 className="text-[15px] sm:text-lg font-black tracking-tighter">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span></h1>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <RefreshButton />
          
          <Link 
            href="/my-likes" 
            className="hidden sm:flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.08] px-3 py-1.5 rounded-full transition-colors text-[12px] font-medium border border-white/[0.05] text-pink-400"
          >
            <MessageSquareHeart size={14} />
            <span>Beğendiklerim</span>
          </Link>

          <Link 
            href="/liderlik" 
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 sm:px-3 py-1.5 rounded-full transition-all duration-300 text-[12px] font-bold border border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
          >
            <Trophy size={14} className="shrink-0" />
            <span className="hidden sm:inline">Sefirler</span>
          </Link>

          <NotificationBell notifications={notifications} />
          <MobileMenu userUuid={userUuid} />
        </div>
      </header>

      {/* İÇERİK ALANI - BOŞLUKLAR TIRAŞLANDI (py-3) */}
      <div className="max-w-2xl mx-auto px-3 py-3 sm:py-4">
        
        {/* İNCECİK ZARİF DUYURU BAR'I */}
        {activeAnnouncement && (
          <div className="mb-3 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#4DA3FF]/15 to-transparent border border-[#4DA3FF]/20 shadow-sm relative overflow-hidden">
            <Bell size={14} className="text-[#4DA3FF] animate-pulse shrink-0" />
            <p className="text-gray-200 text-[12px] sm:text-[13px] font-medium truncate flex-1">
              <span className="font-bold text-[#4DA3FF] mr-1.5">DUYURU:</span>
              {activeAnnouncement.content}
            </p>
          </div>
        )}

        {/* İNCECİK GLOBAL LOBİ BAR'I */}
        <Link href="/sohbet" className="flex items-center justify-between bg-[#121212]/80 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-xl p-2.5 mb-3 transition-all group">
          <div className="flex items-center gap-3">
            <div className="relative flex h-2.5 w-2.5 shrink-0 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <div className="flex flex-col">
               <span className="text-white text-[13px] font-bold flex items-center gap-1.5">
                 GLOBAL LOBİ 
                 <span className="bg-[#4DA3FF]/20 text-[#4DA3FF] text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Canlı</span>
               </span>
               <span className="text-gray-400 text-[11px] truncate mt-0.5">Kampüs şimdi ne konuşuyor? Tıkla ve katıl!</span>
            </div>
          </div>
          <div className="bg-white/5 p-1.5 rounded-lg text-gray-400 group-hover:text-white group-hover:bg-[#4DA3FF]/20 group-hover:text-[#4DA3FF] transition-colors mr-1">
            <ChevronRight size={16} />
          </div>
        </Link>

        {activeCountdown && (
          <div className="mb-3 relative z-10">
            <CountdownWidget countdown={activeCountdown} />
          </div>
        )}
        
        {/* ARAMA ÇUBUĞU */}
        <div className="mb-3 relative z-10">
          <SearchBar />
        </div>

        {/* YÜZEN FİLTRE MENÜSÜ */}
        <div className="flex justify-center sticky top-[65px] sm:top-[75px] z-40 mb-4 pointer-events-none">
          <div className="flex items-center bg-[#121212]/95 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-auto">
            {filterData.map((filter) => {
              const isActive = currentFilter === filter.name;
              const Icon = filter.icon;
              const displayText = filter.name === '🔥 Trend' ? 'Trend' : filter.name;

              return (
                <Link
                  key={filter.name}
                  href={`/?f=${filter.name}${searchQuery ? `&q=${searchQuery}` : ''}`}
                  scroll={false}
                  className={`flex items-center justify-center gap-1.5 transition-all duration-300 ease-out ${
                    isActive
                      ? 'bg-[#2A2A2A] text-white px-3.5 py-2 rounded-full shadow-inner'
                      : 'text-gray-500 hover:text-gray-300 px-2.5 py-2 hover:bg-white/5 rounded-full'
                  }`}
                >
                  <Icon size={16} className={`${isActive ? 'text-white' : ''} ${filter.name === '🔥 Trend' && isActive ? 'text-amber-400' : ''}`} />
                  {isActive && (
                    <span className={`text-[12px] font-bold tracking-wide whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-300 ${filter.name === '🔥 Trend' ? 'text-amber-400' : ''}`}>
                      {displayText}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* GÖNDERİLER */}
        <div className="space-y-4 relative z-10">
          {posts.length === 0 ? (
            <div className="text-center py-16 bg-[#121212]/80 backdrop-blur-xl rounded-2xl border border-white/5 flex flex-col items-center justify-center">
              <p className="text-gray-400 font-medium text-[13px]">
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
                  customNicknamesMap={customNicknamesMap}
                  userBadgesMap={userBadgesMap}
                />
              ))}
              
              {posts.length < totalPostsCount && (
                <div className="flex justify-center pt-4">
                  <Link 
                    href={`/?f=${currentFilter}${searchQuery ? `&q=${searchQuery}` : ''}&page=${page + 1}`}
                    scroll={false}
                    className="px-6 py-2.5 bg-[#121212]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-full text-[12px] font-bold text-gray-300 transition-all hover:bg-white/10 hover:text-white"
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