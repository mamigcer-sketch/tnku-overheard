import prisma from '@/lib/prisma';
import BackButton from '@/components/BackButton';
import CommentSection from '@/components/CommentSection';
import { MessageCircle, Home, MapPin, Clock, Users, User, Heart, Eye, Flame } from 'lucide-react';
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

const getAnonymousData = (id: string) => {
  if (!id) return { name: "Gizemli Yolcu", emoji: "👤", gradient: gradients[0] };
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
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

  // 🔥 Kullanıcının bu posttaki hangi yorumları beğendiğini buluyoruz (As Casting ile)
  const cookieStore = await cookies();
  const authorId = cookieStore.get('tnku_author_id')?.value;
  let userLikedCommentIds: string[] = [];

  if (authorId && post.comments.length > 0) {
    const userLikes = await (prisma as any).commentLike.findMany({
      where: {
        userUuid: authorId,
        commentId: { in: post.comments.map(c => c.id) }
      }
    });
    userLikedCommentIds = userLikes.map((l: any) => l.commentId);
  }

  const isConfession = post.type === 'CONFESSION';
  const isTrending = post.likes >= 10 && (new Date().getTime() - new Date(post.createdAt).getTime() < 24 * 60 * 60 * 1000);
  const authorData = getAnonymousData((post as any).authorUuid || post.id);

  const glowStyle = isConfession 
    ? 'shadow-[0_8px_32px_0_rgba(168,85,247,0.15)] border-purple-500/20' 
    : 'shadow-[0_8px_32px_0_rgba(77,163,255,0.15)] border-[#4DA3FF]/20';

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white relative z-0 overflow-hidden pb-24">
      
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#4DA3FF]/15 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none -z-10" />

      <header className="sticky top-0 z-50 bg-[#0B0B0B]/40 backdrop-blur-3xl border-b border-white/[0.03] px-4 py-4 md:px-8 mb-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
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
        
        <article className={`bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] p-6 rounded-[24px] mb-8 relative overflow-hidden transition-all duration-500 ${glowStyle}`}>
          {isTrending && (
            <div className={`absolute -inset-[1px] opacity-100 blur-xl -z-10 bg-gradient-to-r ${isConfession ? 'from-purple-500/20 to-pink-500/20' : 'from-[#4DA3FF]/20 to-blue-500/20'}`} />
          )}

          <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
            <div className="flex flex-wrap gap-2 text-[10px] font-bold tracking-wider items-center">
              <span className={`px-2.5 py-1 rounded-md uppercase flex items-center gap-1 ${isConfession ? 'bg-purple-500/10 text-purple-400' : 'bg-[#4DA3FF]/10 text-[#4DA3FF]'}`}>
                {isTrending && <Flame size={12} className="animate-pulse" />}
                {isConfession ? 'İTİRAF' : 'OVERHEARD'}
              </span>

              <span className="flex items-center gap-1.5 bg-white/[0.04] text-gray-200 pr-3 pl-1.5 py-1 rounded-lg border border-white/[0.05] shadow-sm">
                <div className={`w-5 h-5 flex items-center justify-center rounded-md bg-gradient-to-br ${authorData.gradient} text-[10px] shadow-inner`}>
                  {authorData.emoji}
                </div>
                <span className="font-semibold text-[11px] tracking-wide">@{authorData.name}</span>
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.02]">
              {getRelativeTime(post.createdAt)}
            </span>
          </div>

          <p className="text-[15px] sm:text-[17px] leading-relaxed font-medium text-gray-100 mb-6 break-words tracking-wide">
            {post.content}
          </p>

          {(post.location || post.time || post.people || post.gender) && (
            <div className="flex flex-wrap gap-2 mb-6 border-t border-white/[0.04] pt-4">
              {post.location && <span className="flex items-center gap-1 bg-white/[0.03] px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 border border-white/[0.02]"><MapPin size={12} /> {post.location}</span>}
              {post.time && <span className="flex items-center gap-1 bg-white/[0.03] px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 border border-white/[0.02]"><Clock size={12} /> {post.time}</span>}
              {post.people && <span className="flex items-center gap-1 bg-white/[0.03] px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 border border-white/[0.02]"><Users size={12} /> {post.people}</span>}
              {post.gender && <span className="flex items-center gap-1 bg-white/[0.03] px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 border border-white/[0.02]"><User size={12} /> {post.gender}</span>}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-white/[0.04]">
            <div className="flex items-center gap-1.5 bg-pink-500/10 px-4 py-2 rounded-xl border border-pink-500/20 shadow-sm">
              <Heart size={16} className="text-pink-400" /> 
              <span className="text-[13px] font-bold text-pink-100">{post.likes}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/[0.05] shadow-sm">
              <Eye size={16} className="text-blue-400" /> 
              <span className="text-[13px] font-bold text-blue-100">{post.views}</span>
            </div>
          </div>
        </article>

        {/* YORUMLAR BÖLÜMÜ */}
        <CommentSection 
          postId={post.id} 
          comments={post.comments} 
          postAuthorUuid={(post as any).authorUuid} 
          userLikedCommentIds={userLikedCommentIds} 
        />

      </div>
    </main>
  );
}