import prisma from '@/lib/prisma';
import BackButton from '@/components/BackButton';
import CommentSection from '@/components/CommentSection';
import AnonymousPlayer from '@/components/AnonymousPlayer'; // 🔥 Hacker Ses Oynatıcısı Eklendi
import { Home, MapPin, Clock, Users, User, Heart, Eye, Flame } from 'lucide-react';
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
const emojis = ["🦊", "🐼", "🦉", "🦝", "🐨", "🦁", "🐸", "🐙", "🦋", "🦖", "🦄", "🐧", "🐱", "🐶", "🐰", "🐯"];
const gradients = [
  "from-blue-400 to-indigo-600", "from-pink-400 to-rose-600", "from-purple-400 to-fuchsia-600",
  "from-emerald-400 to-teal-600", "from-amber-400 to-orange-600", "from-cyan-400 to-blue-600"
];

const getAnonymousData = (id: string, customNickname?: string) => {
  if (!id) return { name: "Gizemli Yolcu", emoji: "👤", gradient: gradients[0] };
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  
  if (customNickname) {
    return {
      name: customNickname,
      emoji: emojis[positiveHash % emojis.length],
      gradient: gradients[Math.floor(positiveHash / emojis.length) % gradients.length]
    };
  }

  return {
    name: `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}`,
    emoji: emojis[positiveHash % emojis.length],
    gradient: gradients[Math.floor(positiveHash / emojis.length) % gradients.length]
  };
};

export default async function PostPage({ params }: any) {
  const resolvedParams = await params;
  const postId = resolvedParams?.id;

  if (!postId) return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white font-medium">Yükleniyor...</div>;

  const post = await prisma.post.findUnique({
    where: { id: String(postId) },
    include: { comments: { orderBy: { createdAt: 'desc' } } }
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
  let userLikedCommentIds: string[] = [];

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
  const isTrending = post.likes >= 10; 
  const isEphemeral = !!post.expiresAt; 
  
  const postAuthorUuid = (post as any).authorUuid;
  const hasCustomNick = !!customNicknamesMap[postAuthorUuid];
  const postUserBadge = userBadgesMap[postAuthorUuid]; 
  const authorData = getAnonymousData(postAuthorUuid || post.id, customNicknamesMap[postAuthorUuid]);

  const glowStyle = isEphemeral
    ? 'shadow-[0_8px_32px_0_rgba(245,158,11,0.2)] border-amber-500/40'
    : isConfession 
      ? 'shadow-[0_8px_32px_0_rgba(168,85,247,0.15)] border-purple-500/20' 
      : isBosYap
        ? 'shadow-[0_8px_32px_0_rgba(16,185,129,0.15)] border-emerald-500/20' 
        : 'shadow-[0_8px_32px_0_rgba(77,163,255,0.15)] border-[#4DA3FF]/20';

  return (
    <main className="min-h-screen bg-[#121212] text-white relative z-0 overflow-hidden pb-24">
      
      {/* 🔥 Ana sayfadaki zemin parlamaları detay sayfasına da eklendi */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#4DA3FF]/10 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none -z-10" />

      <header className="sticky top-0 z-50 bg-[#121212]/80 backdrop-blur-2xl border-b border-white/[0.03] px-4 py-4 md:px-8 mb-6 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-lg font-extrabold tracking-tighter">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span></h1>
          </Link>
          <div className="flex items-center gap-3">
            <BackButton />
            <Link href="/" className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] px-4 py-2 rounded-full transition-colors text-[13px] font-medium border border-white/[0.05]">
              <Home size={14} /> <span className="hidden sm:inline">Ana Sayfa</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-12 relative z-10">
        {/* 🔥 ANA AKIŞTAKİ TOK, ASİL VE CAM EFEKTLİ POSTCARD TASARIMI BURAYA UYARLANDI */}
        <article className={`backdrop-blur-2xl border p-5 sm:p-6 rounded-[22px] mb-8 relative overflow-hidden transition-all duration-300 bg-[#121212]/80 border-white/5 shadow-lg hover:border-white/10 ${glowStyle}`}>
          
          {isEphemeral && (
            <div className="absolute -inset-[1px] opacity-30 blur-xl -z-10 bg-gradient-to-r from-amber-500/40 to-orange-500/40" />
          )}

          {isTrending && !isEphemeral && (
            <div className={`absolute -inset-[1px] opacity-100 blur-xl -z-10 bg-gradient-to-r ${isConfession ? 'from-purple-500/20 to-pink-500/20' : isBosYap ? 'from-emerald-500/20 to-teal-500/20' : 'from-[#4DA3FF]/20 to-blue-500/20'}`} />
          )}

          <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
            <div className="flex flex-wrap gap-2 text-[10px] font-bold tracking-wider items-center">
              
              {isEphemeral ? (
                <span className="px-2.5 py-1 rounded-md uppercase flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                  <Clock size={12} /> 24 Saatlik {isConfession ? 'İtiraf' : 'Fısıltı'} ⏳
                </span>
              ) : (
                <span className={`px-2.5 py-1 rounded-md uppercase flex items-center gap-1 ${
                  isConfession ? 'bg-purple-500/10 text-purple-400' 
                  : isBosYap ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-[#4DA3FF]/10 text-[#4DA3FF]'
                }`}>
                  {isTrending && <Flame size={12} className="animate-pulse" />}
                  {isConfession ? 'İTİRAF' : isBosYap ? 'BOŞ YAP' : 'OVERHEARD'}
                </span>
              )}

              <div className="flex items-center gap-2">
                {postUserBadge && (
                  <span className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.15)] flex items-center">
                    {postUserBadge}
                  </span>
                )}
                <span className={`flex items-center gap-1.5 bg-white/[0.04] text-gray-200 pr-3 pl-1.5 py-1 rounded-lg border shadow-sm ${hasCustomNick ? 'border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 'border-white/[0.05]'}`}>
                  <div className={`w-5 h-5 flex items-center justify-center rounded-md ${hasCustomNick ? 'bg-gradient-to-br from-amber-500/20 to-pink-500/20 border border-pink-500/30 text-pink-400' : `${authorData.gradient} text-[10px]`} shadow-inner`}>
                    {hasCustomNick ? (
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    ) : (
                      authorData.emoji
                    )}
                  </div>
                  <span className="font-semibold text-[11px] tracking-wide">
                    @{authorData.name}
                  </span>
                </span>
              </div>

            </div>
            <span className="text-[10px] text-gray-500 font-medium bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.02]">
              {getRelativeTime(post.createdAt)}
            </span>

          </div>

          {post.content && (
            <p className="text-[15px] sm:text-[17px] leading-relaxed font-medium text-gray-100 mb-6 break-words tracking-wide">
              {post.content}
            </p>
          )}

          {/* 🔥 SESLİ FISILTI OYNATICISI DETAY SAYFASINA EKLENDİ */}
          {(post as any).audioUrl && (
            <div className="mb-6">
              <AnonymousPlayer audioUrl={(post as any).audioUrl} />
            </div>
          )}

          {(post.location || post.time || post.people || post.gender) && (
            <div className="flex flex-wrap gap-2 mb-6 border-t border-white/[0.04] pt-4">
              {post.location && <span className="flex items-center gap-1 bg-white/[0.03] px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 border border-white/[0.02]"><MapPin size={12} /> {post.location}</span>}
              {post.time && <span className="flex items-center gap-1 bg-white/[0.03] px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 border border-white/[0.02]"><Clock size={12} /> {post.time}</span>}
              {post.people && <span className="flex items-center gap-1 bg-white/[0.03] px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 border border-white/[0.02]"><Users size={12} /> {post.people}</span>}
              {post.gender && <span className="flex items-center gap-1 bg-white/[0.03] px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 border border-white/[0.02]"><User size={12} /> {post.gender}</span>}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5 bg-pink-500/10 px-4 py-2 rounded-xl border border-pink-500/20 shadow-sm">
              <Heart size={16} className="text-pink-400 fill-pink-500" /> 
              <span className="text-[13px] font-bold text-pink-100">{post.likes}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5 shadow-sm">
              <Eye size={16} className="text-blue-400" /> 
              <span className="text-[13px] font-bold text-blue-100">{post.views}</span>
            </div>
          </div>
        </article>

        <CommentSection 
          postId={post.id} 
          comments={post.comments} 
          postAuthorUuid={postAuthorUuid} 
          userLikedCommentIds={userLikedCommentIds} 
          customNicknamesMap={customNicknamesMap}
          userBadgesMap={userBadgesMap} 
        />
      </div>
    </main>
  );
}