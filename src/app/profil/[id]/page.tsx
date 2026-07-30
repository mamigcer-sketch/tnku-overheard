import prisma from '@/lib/prisma';
import PostCard from '@/components/PostCard';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Heart, MessageCircle, FileText, Award, UserCircle2, ArrowRight, Home } from 'lucide-react';
import BackButton from '@/components/BackButton';
import Link from 'next/link';

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

// 🔥 Sohbet (Lobi) sayfasıyla birebir aynı havuz dizileri (İsimlerin uyuşması için)
const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek"];

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
  const targetUuid = decodeURIComponent(id);
  
  const activeTab = sParams?.tab === 'yorumlar' ? 'yorumlar' : 'gonderiler';

  const cookieStore = await cookies();
  const currentUserUuid = cookieStore.get('user_uuid')?.value || '';

  const [postCount, commentCount, userPosts, userComments, userBadgeDb, allNicknamesDb, allBadgesDb] = await Promise.all([
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
    (prisma as any).userBadge.findMany().catch(() => [])
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
  
  const totalLikes = userPosts.reduce((acc, post) => acc + post.likes, 0);
  const userBadge = userBadgeDb?.badgeName;
  
  const likedPosts = cookieStore.get('liked_posts')?.value?.split(',') || [];

  async function incrementLike(formData: FormData) {
    'use server';
    const postId = formData.get('id') as string;
    const currentCookieStore = await cookies();
    const likedPostsCookie = currentCookieStore.get('liked_posts')?.value || '';
    const likedList = likedPostsCookie.split(',');

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
    <main className="min-h-screen bg-[#0B0B0B] text-white relative z-0 overflow-hidden pb-20 selection:bg-[#4DA3FF]/30">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-[#4DA3FF]/15 to-transparent blur-[80px] pointer-events-none z-0"></div>

      <header className="sticky top-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 sm:py-4 flex items-center shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-sm sm:text-base font-bold text-gray-200">Kullanıcı Profili</h1>
          </div>
          
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 bg-white/[0.03] hover:bg-white/[0.08] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-colors text-[12px] sm:text-[13px] font-medium border border-white/[0.05]">
            <Home size={14} /> <span className="hidden sm:inline">Ana Sayfa</span>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 relative z-10">
        
        <div className="bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] mb-8 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#4DA3FF]/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-[#4DA3FF]/20"></div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 relative z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#1A1A1A] to-[#252525] border-2 border-[#4DA3FF]/30 flex items-center justify-center shadow-lg shrink-0">
              <UserCircle2 size={50} className="text-[#4DA3FF]/70" />
            </div>

            <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                {displayNickname}
              </h2>
              
              {userBadge ? (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <Award size={14} /> {userBadge}
                </div>
              ) : (
                <p className="text-[13px] sm:text-sm text-gray-400 mt-1.5 font-bold tracking-wider">TNKUOVERHEARD TAKİÇİSİ</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8 relative z-10">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
              <FileText size={20} className="text-gray-400 mb-1.5" />
              <span className="text-xl sm:text-2xl font-black text-white">{postCount}</span>
              <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Gönderi</span>
            </div>
            
            <div className="bg-[#4DA3FF]/5 border border-[#4DA3FF]/10 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center hover:bg-[#4DA3FF]/10 transition-colors">
              <Heart size={20} className="text-[#4DA3FF] mb-1.5" />
              <span className="text-xl sm:text-2xl font-black text-[#4DA3FF]">{totalLikes}</span>
              <span className="text-[10px] sm:text-xs text-[#4DA3FF]/70 font-bold uppercase tracking-wider">Beğeni</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
              <MessageCircle size={20} className="text-gray-400 mb-1.5" />
              <span className="text-xl sm:text-2xl font-black text-white">{commentCount}</span>
              <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Yorum</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-white/[0.02] p-1.5 rounded-[20px] border border-white/5 shadow-inner">
          <Link 
            href={`/profil/${id}?tab=gonderiler`} 
            scroll={false} 
            className={`flex-1 py-2.5 sm:py-3 text-center rounded-[14px] font-bold text-[13px] sm:text-sm transition-all duration-300 ${
              activeTab === 'gonderiler' 
                ? 'bg-[#1A1A1A] text-white shadow-md border border-white/10' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Gönderiler
          </Link>
          <Link 
            href={`/profil/${id}?tab=yorumlar`} 
            scroll={false} 
            className={`flex-1 py-2.5 sm:py-3 text-center rounded-[14px] font-bold text-[13px] sm:text-sm transition-all duration-300 ${
              activeTab === 'yorumlar' 
                ? 'bg-[#4DA3FF]/15 text-[#4DA3FF] shadow-[0_0_15px_rgba(77,163,255,0.1)] border border-[#4DA3FF]/20' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Yorumlar
          </Link>
        </div>

        <div className="space-y-5">
          
          {activeTab === 'gonderiler' && (
            <>
              {userPosts.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-3xl">
                  <p className="text-gray-500 font-medium text-sm">Bu kullanıcı henüz hiç gönderi paylaşmamış.</p>
                </div>
              ) : (
                userPosts.map((post: any) => (
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
                ))
              )}
            </>
          )}

          {activeTab === 'yorumlar' && (
            <>
              {userComments.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-3xl">
                  <p className="text-gray-500 font-medium text-sm">Bu kullanıcı henüz hiçbir gönderiye yorum yapmamış.</p>
                </div>
              ) : (
                userComments.map((comment: any) => (
                  <div key={comment.id} className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 hover:border-white/10 p-5 rounded-[24px] shadow-sm transition-all duration-300 group hover:-translate-y-1">
                    
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[11px] text-gray-500 font-bold tracking-wide uppercase bg-white/[0.03] px-2 py-1 rounded-md border border-white/5">
                        {getRelativeTime(comment.createdAt)}
                      </span>
                      <div className="flex items-center gap-1 text-pink-400 bg-pink-500/10 px-2 py-1 rounded-md text-[11px] font-bold border border-pink-500/20">
                        <Heart size={12} className="fill-pink-500/40" /> {comment.likes || 0}
                      </div>
                    </div>
                    
                    <p className="text-gray-200 text-[14px] sm:text-[15px] leading-relaxed mb-4 font-medium">
                      "{comment.content}"
                    </p>
                    
                    {comment.post && (
                      <div className="bg-white/[0.02] border border-white/[0.05] p-3 sm:p-4 rounded-xl mb-4 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4DA3FF]/50 rounded-l-xl"></div>
                        <p className="text-gray-500 text-[11px] uppercase font-bold tracking-widest mb-1.5 ml-2">Asıl Gönderi:</p>
                        <p className="text-gray-400 text-[13px] line-clamp-2 italic ml-2">
                          {comment.post.content ? comment.post.content : '📷 (Medya İçeriği)'}
                        </p>
                      </div>
                    )}
                    
                    <Link 
                      href={`/post/${comment.postId}`} 
                      className="inline-flex items-center gap-1.5 text-[#4DA3FF] text-[12px] font-black uppercase tracking-wider hover:text-blue-400 transition-colors group-hover:translate-x-1 duration-300 bg-[#4DA3FF]/10 px-3 py-1.5 rounded-lg border border-[#4DA3FF]/20"
                    >
                      Gönderİye Gİt <ArrowRight size={14} />
                    </Link>

                  </div>
                ))
              )}
            </>
          )}

        </div>
      </div>
    </main>
  );
}