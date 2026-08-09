import prisma from '@/lib/prisma';
import BackButton from '@/components/BackButton';
import CommentSection from '@/components/CommentSection';
import AnonymousPlayer from '@/components/AnonymousPlayer'; 
import { Home, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const getRelativeTime = (dateString: string | Date) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Az önce";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} DAKİKA ÖNCE`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} SAAT ÖNCE`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "DÜN";
  if (diffInDays < 7) return `${diffInDays} GÜN ÖNCE`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }).toUpperCase();
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

export default async function PostPage({ params }: any) {
  const resolvedParams = await params;
  const postId = resolvedParams?.id;

  if (!postId) return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-white font-medium">Yükleniyor...</div>;

  const post = await prisma.post.findUnique({
    where: { id: String(postId) },
    include: { comments: { orderBy: { createdAt: 'desc' } } }
  });

  if (!post) return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-gray-500 font-medium">Post bulunamadı...</div>;

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
  let userLikedCommentIds: string[] = [];

  // Cookieden kullanıcının bu postu beğenip beğenmediğini kontrol edelim
  const likedPostsCookie = cookieStore.get('liked_posts')?.value || '';
  const isLikedByCurrentUser = likedPostsCookie.split(',').includes(postId);

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

  const isConfession = post.type === 'CONFESSION';
  const isBosYap = post.type === 'BOSYAP'; 
  const isEphemeral = !!post.expiresAt; 
  
  const postAuthorUuid = (post as any).authorUuid || post.id;
  const postUserBadge = userBadgesMap[postAuthorUuid]; 
  const authorData = getAnonymousData(postAuthorUuid, customNicknamesMap[postAuthorUuid]);

  const tagText = isConfession ? 'İtiraf' : isBosYap ? 'Boş Yap' : 'Overheard';
  const subText = [tagText, post.location, post.time].filter(Boolean).join(' • ');

  return (
    <main className="min-h-screen bg-[#000000] text-white relative z-0 overflow-hidden pb-24">
      
      {/* 1. ZARİF HEADER (Instagram tarzı üst bar) */}
      <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-[16px] font-bold tracking-tight">Gönderi</h1>
        </div>
        <Link href="/" className="text-white hover:opacity-70 transition-opacity p-2">
          <Home size={20} />
        </Link>
      </header>

      <div className="max-w-2xl mx-auto pt-2">
        {/* 2. INSTAGRAM POST ALANI (Kutusuz, Temiz) */}
        <article className="w-full bg-[#000000] border-b border-white/10 pb-4">
          
          {/* Üst Bilgi (Kullanıcı Avatarı ve İsim) */}
          <div className="flex items-center justify-between px-4 py-3">
            <Link href={`/profil/${encodeURIComponent(postAuthorUuid)}`} className="flex items-center gap-3 group">
              <div className={`w-10 h-10 rounded-full p-[2px] ${isEphemeral ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500' : 'bg-white/10'}`}>
                <div className="w-full h-full rounded-full bg-[#121212] border border-black flex items-center justify-center overflow-hidden">
                  <span className="text-[15px] font-black opacity-60">{authorData.name.charAt(0)}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white text-[14px] tracking-tight group-hover:text-gray-300 transition-colors">
                    {authorData.name}
                  </span>
                  {postUserBadge && (
                    <span className="bg-amber-500/20 text-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                      {postUserBadge}
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-gray-400 tracking-wide mt-0.5">
                  {subText}
                </span>
              </div>
            </Link>
            
            <button className="p-2 text-white hover:opacity-50 transition-opacity">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Ana Metin / Ses Kaydı */}
          <div className="px-4 py-2">
            {post.content && (
              <p className="text-white text-[16px] sm:text-[17px] leading-relaxed break-words font-medium">
                {post.content}
              </p>
            )}

            {(post as any).audioUrl && (
              <div className="mt-6 w-full max-w-[280px]">
                <AnonymousPlayer audioUrl={(post as any).audioUrl} />
              </div>
            )}
          </div>

          {/* Aksiyon İkonları (Beğen, Yorum, Paylaş) */}
          <div className="px-4 pt-4 pb-2 flex items-center justify-between mt-2">
            <div className="flex items-center gap-3.5">
              <button disabled className="group relative transition-transform">
                <Heart size={24} className={isLikedByCurrentUser ? 'fill-red-500 text-red-500' : 'text-white'} />
              </button>
              <button disabled className="transition-transform">
                <MessageCircle size={24} className="text-white transform -scale-x-100" />
              </button>
              <button disabled className="transition-transform">
                <Send size={24} className="text-white transform -rotate-12 -mt-1" />
              </button>
            </div>
            
            <button disabled className="transition-transform">
              <Bookmark size={24} className="text-white" />
            </button>
          </div>

          {/* Beğeni Sayısı ve Zaman */}
          <div className="px-4 pb-2">
            <div className="font-semibold text-white text-[14px] mb-1.5 cursor-default">
              {post.likes} beğenme
            </div>
            <div className="text-gray-500 text-[11px] uppercase mt-2 tracking-widest font-medium">
              {getRelativeTime(post.createdAt)}
            </div>
          </div>
        </article>

        {/* 3. YORUMLAR SEKMESİ */}
        <div className="pt-6">
          <CommentSection 
            postId={post.id} 
            comments={post.comments} 
            postAuthorUuid={postAuthorUuid} 
            userLikedCommentIds={userLikedCommentIds} 
            customNicknamesMap={customNicknamesMap}
            userBadgesMap={userBadgesMap} 
          />
        </div>

      </div>
    </main>
  );
}