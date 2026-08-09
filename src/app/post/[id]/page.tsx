import prisma from '@/lib/prisma';
import BackButton from '@/components/BackButton';
import CommentSection from '@/components/CommentSection';
import PostCard from '@/components/PostCard'; // 🔥 Ana sayfadaki efsane kartı direkt import ediyoruz!
import { Home } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: any) {
  const resolvedParams = await params;
  const postId = resolvedParams?.id;

  if (!postId) return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white font-medium">Yükleniyor...</div>;

  const post = await prisma.post.findUnique({
    where: { id: String(postId) },
    include: { 
      _count: { select: { comments: true } },
      comments: { orderBy: { createdAt: 'desc' } } 
    }
  });

  if (!post) return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-gray-500 font-medium">Post bulunamadı...</div>;

  let customNicknamesDb: any[] = [];
  let userBadgesDb: any[] = [];
  try {
    const [nicks, badges] = await Promise.all([
      (prisma as any).customNickname.findMany(),
      (prisma as any).userBadge.findMany()
    ]);
    customNicknamesDb = nicks;
    userBadgesDb = badges;
  } catch (e) {}

  const customNicknamesMap = customNicknamesDb.reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.nickname;
    return acc;
  }, {});

  const userBadgesMap = userBadgesDb.reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.badgeName;
    return acc;
  }, {});

  const cookieStore = await cookies();
  const authorId = cookieStore.get('tnku_author_id')?.value;
  const userUuid = cookieStore.get('user_uuid')?.value || authorId;
  let userLikedCommentIds: string[] = [];

  // Cookieden kullanıcının bu postu beğenip beğenmediğini kontrol edelim
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

  // Beğeni işlemini Server Action olarak burada da tanımlıyoruz
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
    <main className="min-h-screen bg-[#0B0B0B] text-white relative z-0 overflow-hidden pb-24">
      
      {/* 1. KUSURSUZ HİZALANMIŞ HEADER */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center shadow-sm mb-4 sm:mb-6">
        <div className="flex-1 flex justify-start">
          <BackButton />
        </div>
        
        <h1 className="text-[16px] font-bold tracking-tight flex-1 text-center text-gray-200">
          Gönderi
        </h1>
        
        <div className="flex-1 flex justify-end">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors bg-white/[0.03] p-2 rounded-full border border-white/5">
            <Home size={18} />
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-2 sm:px-4">
        
        {/* 2. POSTCARD BİLEŞENİ (Ana sayfadakiyle %100 aynı görünüm ve özellikler) */}
        <div className="mb-2">
          <PostCard 
            post={post} 
            isLiked={isLikedByCurrentUser} 
            incrementLike={incrementLike}
            userUuid={userUuid}
            customNickname={customNicknamesMap[post.authorUuid || post.id]} 
            userBadge={userBadgesMap[post.authorUuid || post.id]}
            customNicknamesMap={customNicknamesMap}
            userBadgesMap={userBadgesMap}
          />
        </div>

        {/* 3. YORUMLAR SEKMESİ */}
        <div className="pt-2">
          <CommentSection 
            postId={post.id} 
            comments={post.comments} 
            postAuthorUuid={post.authorUuid || post.id} 
            userLikedCommentIds={userLikedCommentIds} 
            customNicknamesMap={customNicknamesMap}
            userBadgesMap={userBadgesMap} 
          />
        </div>

      </div>
    </main>
  );
}