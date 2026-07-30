import prisma from '@/lib/prisma';
import PostCard from '@/components/PostCard';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Heart, MessageCircle, FileText, Award, UserCircle2 } from 'lucide-react';
import BackButton from '@/components/BackButton';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: any }) {
  // Parametreden direkt değişmeyen User ID'yi (authorUuid) alıyoruz
  const { id } = await params;
  const targetUuid = decodeURIComponent(id);

  const cookieStore = await cookies();
  const currentUserUuid = cookieStore.get('user_uuid')?.value || '';

  // 1. Kullanıcının Tüm Seceresini Çekiyoruz
  const [postCount, commentCount, userPosts, userBadgeDb, allNicknamesDb, allBadgesDb] = await Promise.all([
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
    (prisma as any).userBadge.findUnique({ where: { userUuid: targetUuid } }).catch(() => null),
    (prisma as any).customNickname.findMany().catch(() => []),
    (prisma as any).userBadge.findMany().catch(() => [])
  ]);

  // PostCard bileşeni için haritalar
  const customNicknamesMap = (allNicknamesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.nickname;
    return acc;
  }, {});
  const userBadgesMap = (allBadgesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.badgeName;
    return acc;
  }, {});

  // 🔥 GÜNCEL NİCK KONTROLÜ: Sitede nicki varsa o, yoksa orjinal "Anonim Öğrenci"
  const displayNickname = customNicknamesMap[targetUuid] || "Anonim Öğrenci";
  
  // Toplam aldığı beğeni sayısını hesaplıyoruz
  const totalLikes = userPosts.reduce((acc, post) => acc + post.likes, 0);
  const userBadge = userBadgeDb?.badgeName;
  
  const likedPosts = cookieStore.get('liked_posts')?.value?.split(',') || [];

  // Beğeni aksiyonu
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
      
      {/* Arka Plan Işıltısı */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-[#4DA3FF]/15 to-transparent blur-[80px] pointer-events-none z-0"></div>

      <header className="sticky top-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 sm:py-4 flex items-center shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3 w-full">
          <BackButton />
          <h1 className="text-sm sm:text-base font-bold text-gray-200">Kullanıcı Profili</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 relative z-10">
        
        {/* 🔥 PROFİL KARTI */}
        <div className="bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] mb-8 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#4DA3FF]/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-[#4DA3FF]/20"></div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#1A1A1A] to-[#252525] border-2 border-[#4DA3FF]/30 flex items-center justify-center shadow-lg shrink-0">
              <UserCircle2 size={50} className="text-[#4DA3FF]/70" />
            </div>

            {/* İsim ve Rozet */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                {displayNickname}
              </h2>
              
              {userBadge ? (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <Award size={14} /> {userBadge}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-1 font-medium">TNKU Öğrencisi</p>
              )}
            </div>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-3 gap-3 mt-8 relative z-10">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
              <FileText size={20} className="text-gray-400 mb-1.5" />
              <span className="text-xl sm:text-2xl font-black text-white">{postCount}</span>
              <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Fısıltı</span>
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

        {/* 🔥 KİŞİSEL AKIŞ (FEED) */}
        <div className="space-y-5">
          <h3 className="text-lg font-black text-white/90 mb-4 px-1 border-b border-white/10 pb-3 flex items-center gap-2">
            Son Fısıltıları
          </h3>
          
          {userPosts.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-3xl">
              <p className="text-gray-500 font-medium text-sm">Bu kullanıcı henüz hiç fısıltı göndermemiş.</p>
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
        </div>
      </div>
    </main>
  );
}