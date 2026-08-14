import prisma from '@/lib/prisma';
import BackButton from '@/components/BackButton';
import CommentSection from '@/components/CommentSection';
import PostCard from '@/components/PostCard'; 
import { Home } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: any) {
  const resolvedParams = await params;
  const postId = resolvedParams?.id;

  if (!postId) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-medium">Yükleniyor...</div>;

  const post = await prisma.post.findUnique({
    where: { id: String(postId) },
    include: { 
      _count: { select: { comments: true } },
      comments: { orderBy: { createdAt: 'desc' } } 
    }
  });

  if (!post) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-500 font-medium">Post bulunamadı...</div>;

  let customNicknamesDb: any[] = [];
  let userBadgesDb: any[] = [];
  let userAvatarsDb: any[] = []; // 🔥 AVATARLAR İÇİN EKLENDİ

  try {
    const [nicks, badges, avatars] = await Promise.all([
      (prisma as any).customNickname.findMany(),
      (prisma as any).userBadge.findMany(),
      (prisma as any).userAvatar.findMany() // 🔥 AVATARLAR ÇEKİLDİ
    ]);
    customNicknamesDb = nicks;
    userBadgesDb = badges;
    userAvatarsDb = avatars;
  } catch (e) {}

  const customNicknamesMap = customNicknamesDb.reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.nickname;
    return acc;
  }, {});

  const userBadgesMap = userBadgesDb.reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.badgeName;
    return acc;
  }, {});

  // 🔥 AVATARLARI HARİTALANDIRDIK
  const userAvatarsMap = userAvatarsDb.reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.avatarUrl;
    return acc;
  }, {});

  const cookieStore = await cookies();
  const authorId = cookieStore.get('tnku_author_id')?.value;
  const userUuid = cookieStore.get('user_uuid')?.value || authorId;
  let userLikedCommentIds: string[] = [];

  const likedPostsCookie = cookieStore.get('liked_posts')?.value || '';
  const likedPosts = likedPostsCookie.split(',');
  const isLikedByCurrentUser = likedPosts.includes(postId);

  if (authorId && post.comments.length > 0) {
    try {
      const userLikes: any[] = await prisma.$queryRaw`
        SELECT "commentId" FROM "CommentLike" 
        WHERE "userUuid" = ${authorId}
      `;
      userLikedCommentIds = userLikes.map((l: any) => l.commentId);
    } catch (err) {
      console.error("CommentLike Raw SQL okuma hatası:", err);
    }
  }

  async function incrementLike(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const currentCookieStore = await cookies();
    const likedCookie = currentCookieStore.get('liked_posts')?.value || '';
    const likedList = likedCookie.split(',');

    if (!likedList.includes(id)) {
      await prisma.post.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });
      currentCookieStore.set('liked_posts', [...likedList, id].join(','), { 
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true 
      });
      revalidatePath(`/post/${id}`);
    }
  }

  return (
    <main className="min-h-screen text-white relative z-0 overflow-hidden pb-24 selection:bg-[#4DA3FF]/30">
      
      {/* YENİ PREMIUM ARKA PLAN */}
      <div className="fixed inset-0 -z-10 bg-[#050505]">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050505] to-[#050505] pointer-events-none"></div>
      </div>

      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-3xl border-b border-white/[0.05] px-4 py-3 flex items-center shadow-sm mb-4 sm:mb-6">
        <div className="flex-1 flex justify-start">
          <BackButton />
        </div>
        
        <h1 className="text-[16px] font-black tracking-widest flex-1 text-center text-white uppercase">
          Gönderi
        </h1>
        
        <div className="flex-1 flex justify-end">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors bg-white/[0.03] p-2 rounded-full border border-white/5">
            <Home size={18} />
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-4">
        
        <div className="mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <PostCard 
            post={post} 
            isLiked={isLikedByCurrentUser} 
            incrementLike={incrementLike}
            userUuid={userUuid}
            customNickname={customNicknamesMap[post.authorUuid || post.id]} 
            userBadge={userBadgesMap[post.authorUuid || post.id]}
            customNicknamesMap={customNicknamesMap}
            userBadgesMap={userBadgesMap}
            userAvatar={userAvatarsMap[post.authorUuid || post.id]} // 🔥 AVATAR BURADAN GİDİYOR
          />
        </div>

        <div className="pt-2 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
          <CommentSection 
            postId={post.id} 
            comments={post.comments} 
            postAuthorUuid={post.authorUuid || post.id} 
            userLikedCommentIds={userLikedCommentIds} 
            customNicknamesMap={customNicknamesMap}
            userBadgesMap={userBadgesMap}
            userAvatarsMap={userAvatarsMap} // 🔥 YORUMLAR İÇİN AVATARLAR DA GİDİYOR
          />
        </div>

      </div>
    </main>
  );
}