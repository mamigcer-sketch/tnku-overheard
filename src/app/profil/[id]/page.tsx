import prisma from '@/lib/prisma';
import PostCard from '@/components/PostCard';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Heart, MessageCircle, ArrowRight, ArrowLeft, Flame, MoreHorizontal, User, Sparkles } from 'lucide-react';
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
  
  const authorId = cookieStore.get('tnku_author_id')?.value;
  const generalUuid = cookieStore.get('user_uuid')?.value;
  const currentUserUuid = authorId || generalUuid || '';

  const targetUuid = id === 'ben' ? (currentUserUuid || 'ben') : decodeURIComponent(id);
  const isOwnProfile = Boolean(id === 'ben' || (currentUserUuid && targetUuid === currentUserUuid));
  
  const activeTab = sParams?.tab === 'yorumlar' ? 'yorumlar' : 'gonderiler';

  const [postCount, commentCount, userPosts, userComments, userBadgeDb, allNicknamesDb, allBadgesDb, userStats, allAvatarsDb] = await Promise.all([
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
    (prisma as any).userAvatar.findMany().catch(() => [])
  ]);

  const customNicknamesMap = (allNicknamesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.nickname;
    return acc;
  }, {});
  const userBadgesMap = (allBadgesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.badgeName;
    return acc;
  }, {});
  const userAvatarsMap = (allAvatarsDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.avatarUrl;
    return acc;
  }, {});

  const authorData = getAnonymousData(targetUuid, customNicknamesMap[targetUuid]);
  const displayNickname = authorData.name;
  const currentAvatar = userAvatarsMap[targetUuid];
  
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
    <main className="min-h-screen text-white relative z-0 pb-20 selection:bg-[#4DA3FF]/30">
      
      {/* YENİ PREMIUM ARKA PLAN (Ana sayfa ile uyumlu) */}
      <div className="fixed inset-0 -z-10 bg-[#050505]">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050505] to-[#050505] pointer-events-none"></div>
      </div>

      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-3xl border-b border-white/[0.05] shadow-sm px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors p-1 -ml-1 bg-white/5 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-[15px] font-black tracking-widest uppercase text-white flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#4DA3FF]" /> {isOwnProfile ? 'Profilim' : 'Profil'}
        </h1>
        <button className="text-gray-400 hover:text-white transition-colors p-1 bg-white/5 rounded-full">
          <MoreHorizontal size={20} />
        </button>
      </header>

      <div className="max-w-2xl mx-auto pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* PREMIUM PROFİL KARTI */}
        <div className="px-4 pb-2">
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            
            {/* AVATAR */}
            <EditableAvatar 
              userUuid={targetUuid}
              currentAvatar={currentAvatar}
              displayNickname={displayNickname}
              isOwnProfile={isOwnProfile}
            />

            {/* İSTATİSTİK KUTUSU (YENİ CAM EFEKTLİ) */}
            <div className="w-full flex-1 flex justify-around items-center bg-black/40 border border-white/5 rounded-2xl py-3 px-2 shadow-inner">
              <div className="flex flex-col items-center">
                <span className="text-[20px] font-black text-white">{postCount}</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gönderi</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-[20px] font-black text-white">{totalLikes}</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Beğeni</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-[20px] font-black text-white">{commentCount}</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Yorum</span>
              </div>
            </div>
          </div>

          {/* BIO VE DETAYLAR */}
          <div className="mt-5 px-2">
            <h2 className="text-[16px] font-black text-white flex items-center gap-2">
              {displayNickname}
              {userBadge && (
                <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-md uppercase font-black tracking-widest shadow-sm">
                  {userBadge}
                </span>
              )}
            </h2>
            <p className="text-[12px] font-medium text-gray-400 mt-1 uppercase tracking-widest">TNKUOVERHEARD TAKİPÇİSİ</p>
            
            {/* OYUN TARZI SEVİYE BARI */}
            <div className="mt-4 flex items-center gap-3 w-full bg-white/[0.03] border border-white/5 p-2.5 rounded-xl">
              <span className="text-[12px] font-black text-amber-500 shrink-0 flex items-center gap-1.5 w-[70px]">
                <Flame size={14} className="animate-pulse" /> Lvl {level}
              </span>
              <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden shadow-inner border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 transition-all duration-1000 ease-out relative"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-stripe_1s_linear_infinite]"></div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-500">{points} XP</span>
            </div>
            
            {isOwnProfile && (
              <div className="mt-4 w-full">
                <ProfileNickEdit 
                  targetUuid={targetUuid} 
                  currentNick={displayNickname} 
                  isServerOwner={isOwnProfile} 
                />
              </div>
            )}
          </div>
        </div>

        {/* YENİ iOS TARZI KAPSÜL SEKMELER */}
        <div className="sticky top-[53px] z-40 bg-[#050505]/80 backdrop-blur-3xl pt-2 pb-3 px-4 mt-2">
          <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/5 shadow-inner">
            <Link 
              href={`/profil/${id}?tab=gonderiler`} 
              scroll={false} 
              className={`flex-1 text-center py-2 text-[13px] font-bold rounded-lg transition-all duration-300 ${
                activeTab === 'gonderiler' ? 'bg-[#4DA3FF] text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Gönderiler
            </Link>
            <Link 
              href={`/profil/${id}?tab=yorumlar`} 
              scroll={false} 
              className={`flex-1 text-center py-2 text-[13px] font-bold rounded-lg transition-all duration-300 ${
                activeTab === 'yorumlar' ? 'bg-[#4DA3FF] text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Yorumlar
            </Link>
          </div>
        </div>

        <div className="pt-2 px-4">
          
          {activeTab === 'gonderiler' && (
            <div className="animate-in fade-in duration-300">
              {userPosts.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl mt-2">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                    <User size={28} className="text-gray-500" />
                  </div>
                  <p className="text-gray-400 font-medium text-[13px]">Henüz gönderi yok</p>
                </div>
              ) : (
                <div className="space-y-0 mt-2">
                  {userPosts.map((post: any) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      isLiked={likedPosts.includes(post.id)} 
                      incrementLike={incrementLike}
                      userUuid={currentUserUuid}
                      customNickname={customNicknamesMap[post.authorUuid]} 
                      userBadge={userBadgesMap[post.authorUuid]}
                      userAvatar={userAvatarsMap[post.authorUuid]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'yorumlar' && (
            <div className="animate-in fade-in duration-300">
              {userComments.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl mt-2">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                    <MessageCircle size={28} className="text-gray-500" />
                  </div>
                  <p className="text-gray-400 font-medium text-[13px]">Henüz yorum yok</p>
                </div>
              ) : (
                <div className="space-y-3 mt-2">
                  {userComments.map((comment: any) => (
                    <div key={comment.id} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.04] p-4 rounded-[24px] shadow-sm hover:bg-white/[0.03] transition-colors">
                      
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <MessageCircle size={14} className="text-[#4DA3FF]" />
                          <span className="text-[11px] text-gray-400 font-bold tracking-wide">
                            {getRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-[12px] font-bold bg-white/5 px-2 py-1 rounded-full border border-white/5">
                          <Heart size={12} className={comment.likes > 0 ? "fill-pink-500 text-pink-500" : ""} /> {comment.likes || 0}
                        </div>
                      </div>
                      
                      <p className="text-gray-100 text-[14px] leading-relaxed mb-3 font-medium">
                        "{comment.content}"
                      </p>
                      
                      {comment.post && (
                        <div className="bg-black/30 p-3 rounded-xl mb-3 border border-white/5 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4DA3FF]/50"></div>
                          <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1 pl-1">Yanıtlanan Gönderi:</p>
                          <p className="text-gray-300 text-[12px] line-clamp-1 italic pl-1">
                            {comment.post.content ? comment.post.content : '📷 (Medya İçeriği)'}
                          </p>
                        </div>
                      )}
                      
                      <Link 
                        href={`/post/${comment.postId}`} 
                        className="inline-flex items-center gap-1.5 text-[#4DA3FF] text-[12px] font-bold hover:text-blue-400 transition-colors"
                      >
                        Gönderiye Git <ArrowRight size={14} />
                      </Link>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}