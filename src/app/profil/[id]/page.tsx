import prisma from '@/lib/prisma';
import PostCard from '@/components/PostCard';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Heart, MessageCircle, ArrowRight, ArrowLeft, Flame, MoreHorizontal, User } from 'lucide-react';
import Link from 'next/link';
import ProfileNickEdit from '@/components/ProfileNickEdit'; 
import EditableAvatar from '@/components/EditableAvatar';

export const dynamic = 'force-dynamic';

const getRelativeTime = (dateString: string | Date) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Az önce";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Dün";
  if (diffInDays < 7) return `${diffInDays} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare", "Deli", "Çılgın", "Bıkkın", "Dalgın", "Ters", "Şüpheli", "Kuşkulu", "Durgun", "Hızlı", "Yavaş", "Donuk", "Parlak", "Sinsi", "Kurnaz", "Tatlı", "Sert", "Yabani", "Yalnız", "Suskun", "Coşkulu"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek", "Tavuk", "Maymun", "Keçi", "Sincap", "Kurbağa", "Kaplan", "Koala", "Tilki", "Kurt", "Aslan", "Şahin", "Karga", "Köstebek", "Koyun", "İnek", "At", "Eşek", "Fok", "Penguen", "Kirpi", "Sazan", "Yengeç", "Ahtapot", "Kertenkele", "Koala"];

const getAnonymousData = (id: string, customNickname?: string) => {
  if (!id) return { name: "Gizemli Yolcu" };
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  
  if (customNickname) {
    return { name: customNickname };
  }

  return {
    name: `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}`
  };
};

export default async function ProfilePage({ params, searchParams }: { params: any, searchParams: any }) {
  const { id } = await params;
  const sParams = await searchParams;
  const cookieStore = await cookies();
  const currentUserUuid = cookieStore.get('user_uuid')?.value || '';

  const targetUuid = id === 'ben' ? (currentUserUuid || 'ben') : decodeURIComponent(id);
  const isOwnProfile = Boolean(id === 'ben' || (currentUserUuid && targetUuid === currentUserUuid));
  
  const activeTab = sParams?.tab === 'yorumlar' ? 'yorumlar' : 'gonderiler';

  // 🔥 Veritabanından userAvatarDb de çekiliyor
  const [postCount, commentCount, userPosts, userComments, userBadgeDb, allNicknamesDb, allBadgesDb, userStats, userAvatarDb] = await Promise.all([
    prisma.post.count({ where: { authorUuid: targetUuid, status: 'APPROVED' } }),
    prisma.comment.count({ where: { authorId: targetUuid } }),
    prisma.post.findMany({
      where: { authorUuid: targetUuid, status: 'APPROVED' },
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
    prisma.comment.findMany({
      where: { authorId: targetUuid },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        post: { select: { id: true, content: true, type: true } }
      }
    }),
    (prisma as any).userBadge.findUnique({ where: { userUuid: targetUuid } }).catch(() => null),
    (prisma as any).customNickname.findMany().catch(() => []),
    (prisma as any).userBadge.findMany().catch(() => []),
    (prisma as any).userStats.findUnique({ where: { userUuid: targetUuid } }).catch(() => null),
    (prisma as any).userAvatar.findUnique({ where: { userUuid: targetUuid } }).catch(() => null)
  ]);

  const customNicknamesMap = (allNicknamesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.nickname;
    return acc;
  }, {});
  const userBadgesMap = (allBadgesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.badgeName;
    return acc;
  }, {});

  const authorData = getAnonymousData(targetUuid, customNicknamesMap[targetUuid]);
  const displayNickname = authorData.name;
  const currentAvatar = userAvatarDb?.avatarUrl;
  
  const totalLikes = userPosts.reduce((acc: any, post: any) => acc + post.likes, 0);
  const userBadge = userBadgeDb?.badgeName;
  
  const likedPostsCookie = cookieStore.get('liked_posts')?.value || '';
  const likedPosts = likedPostsCookie.split(',');

  const points = userStats?.points || 0;
  const level = userStats?.level || 1;
  const nextTarget = (Math.floor(points / 500) + 1) * 500;
  const fillPercentage = Math.max(5, (points / nextTarget) * 100);

  async function incrementLike(formData: FormData) {
    'use server';
    const postId = formData.get('id') as string;
    const currentCookieStore = await cookies();
    const currentLikedCookie = currentCookieStore.get('liked_posts')?.value || '';
    const likedList = currentLikedCookie.split(',');

    if (!likedList.includes(postId)) {
      await prisma.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } }
      });
      currentCookieStore.set('liked_posts', [...likedList, postId].join(','), { 
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true 
      });
      revalidatePath(`/profil/${id}`);
    }
  }

  return (
    <main className="min-h-screen bg-[#000000] text-white relative z-0 overflow-hidden pb-20 selection:bg-[#4DA3FF]/30">
      
      {/* 1. HEADER */}
      <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-white hover:opacity-70 transition-opacity p-1 -ml-1">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-[16px] font-bold tracking-tight text-white">
          {displayNickname}
        </h1>
        <button className="text-white hover:opacity-70 transition-opacity p-1">
          <MoreHorizontal size={24} />
        </button>
      </header>

      <div className="max-w-2xl mx-auto pt-2">
        
        {/* 2. PROFİL ÜST BİLGİ ALANI (INSTAGRAM TARZI) */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-6 sm:gap-8">
            
            {/* 🔥 YENİ DİNAMİK PROFİL AVATARI 🔥 */}
            <EditableAvatar 
              userUuid={targetUuid}
              currentAvatar={currentAvatar}
              displayNickname={displayNickname}
              isOwnProfile={isOwnProfile}
            />

            {/* İstatistikler */}
            <div className="flex-1 flex justify-between sm:justify-around text-center">
              <div className="flex flex-col">
                <span className="text-[18px] sm:text-[20px] font-bold text-white">{postCount}</span>
                <span className="text-[12px] sm:text-[13px] text-gray-400">gönderi</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[18px] sm:text-[20px] font-bold text-white">{totalLikes}</span>
                <span className="text-[12px] sm:text-[13px] text-gray-400">beğeni</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[18px] sm:text-[20px] font-bold text-white">{commentCount}</span>
                <span className="text-[12px] sm:text-[13px] text-gray-400">yorum</span>
              </div>
            </div>
          </div>

          {/* Bio ve Detaylar */}
          <div className="mt-4">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-white flex items-center gap-2">
              {displayNickname}
              {userBadge && (
                <span className="bg-amber-500/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded uppercase font-black">
                  {userBadge}
                </span>
              )}
            </h2>
            <p className="text-[13px] text-gray-400 mt-0.5">TNKUOVERHEARD TAKİPÇİSİ</p>
            
            {/* İnce ve Zarif XP Barı */}
            <div className="mt-3 flex items-center gap-3 w-full sm:w-[85%]">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000 ease-out"
                  style={{ width: `${fillPercentage}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-bold text-amber-500 shrink-0 flex items-center gap-1">
                <Flame size={12} className="animate-pulse" /> Seviye {level}
              </span>
            </div>
            
            {/* 🔥 PROFİLİ DÜZENLE (NICK) BUTONU 🔥 */}
            {isOwnProfile && (
              <div className="mt-5 w-full">
                <ProfileNickEdit 
                  targetUuid={targetUuid} 
                  currentNick={displayNickname} 
                  isServerOwner={isOwnProfile} 
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. SEKMELER (X/TWITTER TARZI ÇİZGİLİ) */}
        <div className="flex border-b border-white/10 mt-2 sticky top-[53px] bg-[#000000] z-40">
          <Link 
            href={`/profil/${id}?tab=gonderiler`} 
            scroll={false} 
            className={`flex-1 text-center py-3 text-[14px] font-bold relative transition-colors ${
              activeTab === 'gonderiler' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Gönderiler
            {activeTab === 'gonderiler' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-t-full" />
            )}
          </Link>
          <Link 
            href={`/profil/${id}?tab=yorumlar`} 
            scroll={false} 
            className={`flex-1 text-center py-3 text-[14px] font-bold relative transition-colors ${
              activeTab === 'yorumlar' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Yorumlar
            {activeTab === 'yorumlar' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-t-full" />
            )}
          </Link>
        </div>

        {/* 4. İÇERİK ALANI */}
        <div className="pt-1">
          
          {activeTab === 'gonderiler' && (
            <>
              {userPosts.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-gray-800 flex items-center justify-center mb-3">
                    <User size={32} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-medium text-[14px]">Henüz gönderi yok</p>
                </div>
              ) : (
                <div className="space-y-0 px-2 sm:px-0 mt-3">
                  {userPosts.map((post: any) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      isLiked={likedPosts.includes(post.id)} 
                      incrementLike={incrementLike}
                      userUuid={currentUserUuid}
                      customNickname={customNicknamesMap[post.authorUuid]} 
                      userBadge={userBadgesMap[post.authorUuid]}
                      customNicknamesMap={customNicknamesMap}
                      userBadgesMap={userBadgesMap}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'yorumlar' && (
            <>
              {userComments.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-gray-800 flex items-center justify-center mb-3">
                    <MessageCircle size={32} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-medium text-[14px]">Henüz yorum yok</p>
                </div>
              ) : (
                <div className="space-y-0 mt-3">
                  {userComments.map((comment: any) => (
                    <div key={comment.id} className="bg-[#000000] border-b border-white/10 p-4 transition-all">
                      
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] text-gray-500 font-medium tracking-wide">
                          {getRelativeTime(comment.createdAt)}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400 text-[12px] font-bold">
                          <Heart size={14} className={comment.likes > 0 ? "fill-pink-500 text-pink-500" : ""} /> {comment.likes || 0}
                        </div>
                      </div>
                      
                      <p className="text-white text-[14px] sm:text-[15px] leading-relaxed mb-3">
                        "{comment.content}"
                      </p>
                      
                      {comment.post && (
                        <div className="bg-white/[0.03] p-3 rounded-xl mb-3 border border-white/5">
                          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Asıl Gönderi:</p>
                          <p className="text-gray-400 text-[13px] line-clamp-1 italic">
                            {comment.post.content ? comment.post.content : '📷 (Medya İçeriği)'}
                          </p>
                        </div>
                      )}
                      
                      <Link 
                        href={`/post/${comment.postId}`} 
                        className="inline-flex items-center gap-1.5 text-gray-400 text-[12px] font-bold hover:text-white transition-colors"
                      >
                        Gönderiyi Gör <ArrowRight size={14} />
                      </Link>

                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </main>
  );
}