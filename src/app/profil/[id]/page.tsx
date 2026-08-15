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

  // 🔥 1. KESİN ÇÖZÜM: EĞER ÇEREZ YOKSA VE "BEN" SAYFASINDAYSA ASLA İŞLEME DEVAM ETME! 🔥
  // Kullanıcıyı hayali "ben" profiline sokmak yerine gerçek kimliğini bulup oraya fırlatıyoruz.
  if (id === 'ben' && !currentUserUuid) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#050505] flex flex-col items-center justify-center">
        <script dangerouslySetInnerHTML={{ __html: `
          let realId = localStorage.getItem('tnku_anon_id') || localStorage.getItem('tnku_chat_anon_id');
          if (!realId) {
            realId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('tnku_anon_id', realId);
          }
          document.cookie = 'user_uuid=' + realId + '; path=/; max-age=31536000; SameSite=Lax';
          document.cookie = 'tnku_author_id=' + realId + '; path=/; max-age=31536000; SameSite=Lax';
          window.location.replace('/profil/' + realId);
        `}} />
        <div className="w-10 h-10 border-4 border-[#4DA3FF] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Kimlik Eşitleniyor...</p>
      </main>
    );
  }

  // 🔥 2. HEDEF KİMLİK BELİRLEME 🔥
  // Artık id === 'ben' ise currentUserUuid KESİNLİKLE doludur (çünkü boşsa yukarıda yakaladık).
  const targetUuid = id === 'ben' ? currentUserUuid : decodeURIComponent(id);
  const isOwnProfile = Boolean(currentUserUuid && targetUuid === currentUserUuid);
  
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
  
  // 🔥 TANRI PARÇACIĞI KONTROLÜ 🔥
  const isGodMode = ["KURUCU", "GOD", "SİSTEM"].includes(userBadge?.toUpperCase() || "");

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

  const profileCardClass = isGodMode
    ? 'bg-gradient-to-br from-yellow-50/80 to-white dark:from-yellow-500/10 dark:to-black/80 border-yellow-400/50 shadow-[0_0_50px_rgba(234,179,8,0.25)] ring-1 ring-yellow-400/30'
    : 'bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/[0.05] shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]';

  const statsBoxClass = isGodMode
    ? 'bg-yellow-500/10 dark:bg-yellow-500/5 border-yellow-400/30 dark:border-yellow-500/20 shadow-inner'
    : 'bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-white/5 shadow-inner';

  return (
    <main className="min-h-screen text-gray-900 dark:text-white relative z-0 pb-20 selection:bg-[#4DA3FF]/30 transition-colors duration-300">
      
      {/* 🔥 KENDİ PROFİLİNDE ÇEREZİ SİLİNENLERE TUŞLARI GERİ VEREN SİHİRBAZ 🔥 */}
      {!currentUserUuid && (
        <script dangerouslySetInnerHTML={{ __html: `
          var localId = localStorage.getItem('tnku_anon_id') || localStorage.getItem('tnku_chat_anon_id');
          if (localId && localId === '${targetUuid}') {
            document.cookie = 'user_uuid=' + localId + '; path=/; max-age=31536000; SameSite=Lax';
            document.cookie = 'tnku_author_id=' + localId + '; path=/; max-age=31536000; SameSite=Lax';
            window.location.reload();
          }
        `}} />
      )}

      <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-[#050505] transition-colors duration-300">
        {isGodMode ? (
          <div className="absolute top-0 left-0 right-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-100/60 via-slate-50 to-slate-50 dark:from-yellow-900/30 dark:via-[#050505] dark:to-[#050505] pointer-events-none transition-colors duration-700 animate-pulse"></div>
        ) : (
          <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50 dark:from-blue-900/20 dark:via-[#050505] dark:to-[#050505] pointer-events-none transition-colors duration-300"></div>
        )}
      </div>

      <header className={`sticky top-0 z-50 backdrop-blur-3xl border-b shadow-sm px-4 py-3 flex items-center justify-between transition-colors duration-300 ${isGodMode ? 'bg-white/80 dark:bg-black/60 border-yellow-200 dark:border-yellow-500/20' : 'bg-white/80 dark:bg-[#050505]/80 border-gray-200 dark:border-white/[0.05]'}`}>
        <Link href="/" className="text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white transition-colors p-1 -ml-1 dark:bg-white/5 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <h1 className={`text-[15px] font-black tracking-widest uppercase flex items-center gap-1.5 transition-colors ${isGodMode ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
          <Sparkles size={14} className={isGodMode ? 'text-yellow-500 animate-pulse' : 'text-[#4DA3FF]'} /> {isOwnProfile ? (isGodMode ? 'ADMİN' : 'Profilim') : 'Profil'}
        </h1>
        <button className="text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white transition-colors p-1 dark:bg-white/5 rounded-full">
          <MoreHorizontal size={20} />
        </button>
      </header>

      <div className="max-w-2xl mx-auto pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="px-4 pb-2">
          <div className={`flex flex-col sm:flex-row items-center gap-5 sm:gap-6 border rounded-[32px] p-5 backdrop-blur-xl transition-all duration-500 ${profileCardClass}`}>
            
            {isGodMode ? (
              <div className="relative shrink-0 p-[3px] rounded-full">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-300 animate-[spin_3s_linear_infinite] shadow-[0_0_20px_rgba(234,179,8,0.6)] pointer-events-none" />
                <div className="relative z-10 rounded-full bg-gray-100 dark:bg-[#121212]">
                  <EditableAvatar 
                    userUuid={targetUuid}
                    currentAvatar={currentAvatar}
                    displayNickname={displayNickname}
                    isOwnProfile={isOwnProfile}
                  />
                </div>
              </div>
            ) : (
              <div className="shrink-0">
                <EditableAvatar 
                  userUuid={targetUuid}
                  currentAvatar={currentAvatar}
                  displayNickname={displayNickname}
                  isOwnProfile={isOwnProfile}
                />
              </div>
            )}

            <div className={`w-full flex-1 flex justify-around items-center border rounded-2xl py-3 px-2 transition-colors duration-300 ${statsBoxClass}`}>
              <div className="flex flex-col items-center">
                <span className={`text-[20px] font-black ${isGodMode ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>{postCount}</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gönderi</span>
              </div>
              <div className={`w-px h-8 ${isGodMode ? 'bg-yellow-300 dark:bg-yellow-500/20' : 'bg-gray-200 dark:bg-white/10'}`}></div>
              <div className="flex flex-col items-center">
                <span className={`text-[20px] font-black ${isGodMode ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>{totalLikes}</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Beğeni</span>
              </div>
              <div className={`w-px h-8 ${isGodMode ? 'bg-yellow-300 dark:bg-yellow-500/20' : 'bg-gray-200 dark:bg-white/10'}`}></div>
              <div className="flex flex-col items-center">
                <span className={`text-[20px] font-black ${isGodMode ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>{commentCount}</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Yorum</span>
              </div>
            </div>
          </div>

          <div className="mt-5 px-2">
            <h2 className="text-[16px] font-black flex items-center gap-2">
              <span className={`${isGodMode ? 'bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-500 dark:from-yellow-300 dark:via-amber-400 dark:to-yellow-300 animate-pulse drop-shadow-md text-[18px]' : 'text-gray-900 dark:text-white'}`}>
                {displayNickname}
              </span>
              {userBadge && (
                <span className={`${isGodMode ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse' : 'bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20'} text-[10px] px-2 py-0.5 rounded-md uppercase font-black tracking-widest shadow-sm flex items-center gap-1`}>
                  {isGodMode && <Sparkles size={10} />} {userBadge}
                </span>
              )}
            </h2>
            <p className={`text-[12px] font-medium mt-1 uppercase tracking-widest ${isGodMode ? 'text-yellow-600 dark:text-yellow-500/80 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
              {isGodMode ? 'SİSTEMİN HAKİMİ' : 'TNKUOVERHEARD TAKİPÇİSİ'}
            </p>
            
            <div className={`mt-4 flex items-center gap-3 w-full border p-2.5 rounded-xl transition-colors duration-300 ${isGodMode ? 'bg-yellow-50/50 border-yellow-200/50 dark:bg-yellow-500/10 dark:border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none'}`}>
              <span className={`text-[12px] font-black shrink-0 flex items-center gap-1.5 w-[70px] ${isGodMode ? 'text-yellow-600 dark:text-yellow-400' : 'text-amber-600 dark:text-amber-500'}`}>
                <Flame size={14} className="animate-pulse" /> Lvl {level}
              </span>
              <div className={`flex-1 h-2 rounded-full overflow-hidden shadow-inner border ${isGodMode ? 'bg-yellow-100 dark:bg-black/50 border-yellow-200 dark:border-yellow-500/20' : 'bg-gray-200 dark:bg-black/50 border-gray-300 dark:border-white/5'}`}>
                <div 
                  className={`h-full transition-all duration-1000 ease-out relative ${isGodMode ? 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500' : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 dark:from-amber-600 dark:via-yellow-500 dark:to-amber-400'}`}
                  style={{ width: `${fillPercentage}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-stripe_1s_linear_infinite]"></div>
                </div>
              </div>
              <span className={`text-[10px] font-bold ${isGodMode ? 'text-yellow-600 dark:text-yellow-500' : 'text-gray-500'}`}>{points} XP</span>
            </div>
            
            {/* 🔥 EĞER KİŞİ KENDİ PROFİLİNDEYSE DÜZENLEME TUŞLARI BURADA KESİN ÇIKAR 🔥 */}
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

        <div className={`sticky top-[53px] z-40 backdrop-blur-3xl pt-2 pb-3 px-4 mt-2 transition-colors duration-300 ${isGodMode ? 'bg-slate-50/90 dark:bg-[#050505]/80' : 'bg-slate-50/90 dark:bg-[#050505]/80'}`}>
          <div className={`flex p-1 rounded-xl border shadow-inner transition-colors duration-300 ${isGodMode ? 'bg-yellow-100/50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20' : 'bg-gray-200 dark:bg-white/[0.04] border-gray-300 dark:border-white/5'}`}>
            <Link 
              href={`/profil/${id}?tab=gonderiler`} 
              scroll={false} 
              className={`flex-1 text-center py-2 text-[13px] font-bold rounded-lg transition-all duration-300 ${
                activeTab === 'gonderiler' 
                  ? (isGodMode ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-md' : 'bg-[#4DA3FF] text-black shadow-md') 
                  : (isGodMode ? 'text-yellow-700/70 hover:text-yellow-800 dark:text-yellow-500/70 dark:hover:text-yellow-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white')
              }`}
            >
              Gönderiler
            </Link>
            <Link 
              href={`/profil/${id}?tab=yorumlar`} 
              scroll={false} 
              className={`flex-1 text-center py-2 text-[13px] font-bold rounded-lg transition-all duration-300 ${
                activeTab === 'yorumlar' 
                  ? (isGodMode ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-md' : 'bg-[#4DA3FF] text-black shadow-md') 
                  : (isGodMode ? 'text-yellow-700/70 hover:text-yellow-800 dark:text-yellow-500/70 dark:hover:text-yellow-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white')
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
                <div className={`text-center py-16 flex flex-col items-center justify-center border rounded-3xl mt-2 transition-colors duration-300 ${isGodMode ? 'bg-yellow-50/50 dark:bg-yellow-500/5 border-yellow-200/50 dark:border-yellow-500/10' : 'bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none'}`}>
                  <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-3 ${isGodMode ? 'bg-yellow-100 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10'}`}>
                    <User size={28} className={isGodMode ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'} />
                  </div>
                  <p className={`font-medium text-[13px] ${isGodMode ? 'text-yellow-600/70 dark:text-yellow-500/70' : 'text-gray-500 dark:text-gray-400'}`}>Henüz gönderi yok</p>
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
                <div className={`text-center py-16 flex flex-col items-center justify-center border rounded-3xl mt-2 transition-colors duration-300 ${isGodMode ? 'bg-yellow-50/50 dark:bg-yellow-500/5 border-yellow-200/50 dark:border-yellow-500/10' : 'bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none'}`}>
                  <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-3 ${isGodMode ? 'bg-yellow-100 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10'}`}>
                    <MessageCircle size={28} className={isGodMode ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'} />
                  </div>
                  <p className={`font-medium text-[13px] ${isGodMode ? 'text-yellow-600/70 dark:text-yellow-500/70' : 'text-gray-500 dark:text-gray-400'}`}>Henüz yorum yok</p>
                </div>
              ) : (
                <div className="space-y-3 mt-2">
                  {userComments.map((comment: any) => (
                    <div key={comment.id} className={`p-4 rounded-[24px] hover:shadow-md transition-all duration-300 ${isGodMode ? 'bg-gradient-to-br from-yellow-50/80 to-white dark:from-yellow-500/[0.05] dark:to-white/[0.02] border border-yellow-400/50 shadow-[0_0_20px_rgba(234,179,8,0.1)] ring-1 ring-yellow-400/30' : 'bg-white dark:bg-white/[0.02] backdrop-blur-xl border border-gray-200 dark:border-white/[0.04] dark:hover:bg-white/[0.03] shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]'}`}>
                      
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <MessageCircle size={14} className={isGodMode ? 'text-yellow-500' : 'text-[#4DA3FF]'} />
                          <span className={`text-[11px] font-bold tracking-wide ${isGodMode ? 'text-yellow-600/70 dark:text-yellow-500/70' : 'text-gray-500 dark:text-gray-400'}`}>
                            {getRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-[12px] font-bold px-2 py-1 rounded-full border ${isGodMode ? 'bg-yellow-100/50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 text-yellow-600 dark:text-yellow-400' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400'}`}>
                          <Heart size={12} className={comment.likes > 0 ? (isGodMode ? "fill-yellow-500 text-yellow-500" : "fill-pink-500 text-pink-500") : ""} /> {comment.likes || 0}
                        </div>
                      </div>
                      
                      <p className={`text-[14px] leading-relaxed mb-3 font-medium ${isGodMode ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                        "{comment.content}"
                      </p>
                      
                      {comment.post && (
                        <div className={`p-3 rounded-xl mb-3 border relative overflow-hidden transition-colors duration-300 ${isGodMode ? 'bg-yellow-50/50 dark:bg-black/30 border-yellow-200/50 dark:border-yellow-500/20' : 'bg-gray-50 dark:bg-black/30 border-gray-200 dark:border-white/5'}`}>
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${isGodMode ? 'bg-yellow-400/80' : 'bg-[#4DA3FF]/50'}`}></div>
                          <p className={`text-[10px] uppercase font-black tracking-widest mb-1 pl-1 ${isGodMode ? 'text-yellow-600/70 dark:text-yellow-500/70' : 'text-gray-500'}`}>Yanıtlanan Gönderi:</p>
                          <p className={`text-[12px] line-clamp-1 italic pl-1 ${isGodMode ? 'text-gray-800 dark:text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                            {comment.post.content ? comment.post.content : '📷 (Medya İçeriği)'}
                          </p>
                        </div>
                      )}
                      
                      <Link 
                        href={`/post/${comment.postId}`} 
                        className={`inline-flex items-center gap-1.5 text-[12px] font-bold transition-colors ${isGodMode ? 'text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300' : 'text-[#4DA3FF] hover:text-blue-500 dark:hover:text-blue-400'}`}
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