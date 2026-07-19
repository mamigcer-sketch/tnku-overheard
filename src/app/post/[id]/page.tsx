import prisma from '@/lib/prisma';
import CommentForm from '@/components/CommentForm';
import BackButton from '@/components/BackButton';
import { MessageCircle, Home, MapPin, Clock, Users, User, Heart, Eye, Ghost } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Zaman Damgası Fonksiyonu
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

// Yorum Avatarları İçin Renk Temaları
const avatarThemes = [
  { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400' },
  { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
];

export default async function PostPage({ params }: any) {
  const resolvedParams = await params;
  const postId = resolvedParams?.id;

  if (!postId) return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white">Yükleniyor...</div>;

  const post = await prisma.post.findUnique({
    where: { id: String(postId) },
    include: { comments: { orderBy: { createdAt: 'desc' } } }
  });

  if (!post) return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-gray-500">Post bulunamadı kanka...</div>;

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 md:px-8 mb-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-extrabold tracking-tighter">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span></h1>
          </Link>
          <div className="flex items-center gap-3">
            <BackButton />
            <Link href="/" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors text-sm font-medium border border-white/5">
              <Home size={16} /> <span className="hidden sm:inline">Ana Sayfa</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        <article className="bg-[#121212]/90 backdrop-blur-md border border-white/[0.08] p-5 md:p-8 rounded-[24px] mb-8 shadow-lg">
          
          {/* Mobilde düzenlenmiş etiketler */}
          <div className="flex flex-wrap justify-between items-start gap-2 mb-5">
            <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-gray-400">
              <span className={`px-2 py-0.5 rounded-full border ${post.type === 'CONFESSION' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-[#4DA3FF]/10 border-[#4DA3FF]/20 text-[#4DA3FF]'}`}>
                {post.type === 'CONFESSION' ? 'İTİRAF' : 'OVERHEARD'}
              </span>
              {post.location && <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5"><MapPin size={12} /> {post.location}</span>}
              {post.time && <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5"><Clock size={12} /> {post.time}</span>}
              {post.people && <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5"><Users size={12} /> {post.people}</span>}
              {post.gender && <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5"><User size={12} /> {post.gender}</span>}
            </div>
            <span className="text-[11px] text-gray-500 font-medium bg-white/5 px-2 py-0.5 rounded-full shrink-0">
              {getRelativeTime(post.createdAt)}
            </span>
          </div>

          <p className="text-lg md:text-2xl leading-relaxed font-normal text-white mb-8 break-words">{post.content}</p>

          <div className="flex items-center gap-5 border-t border-white/5 pt-4 text-gray-400">
            <div className="flex items-center gap-1.5"><Heart size={18} className="text-pink-500" /> <span className="font-medium text-white">{post.likes}</span></div>
            <div className="flex items-center gap-1.5"><Eye size={18} className="text-blue-500" /> <span className="font-medium text-white">{post.views}</span></div>
          </div>
        </article>

        <div className="space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <MessageCircle size={20} className="text-[#4DA3FF]" /> Anonim Yorumlar ({post.comments.length})
          </h2>
          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <div className="text-center py-10 bg-[#121212] rounded-2xl border border-white/5 text-gray-500 text-sm">Henüz kimse bir şey fısıldamamış. İlk sen ol!</div>
            ) : (
              post.comments.map((comment: any, index: number) => {
                const theme = avatarThemes[index % avatarThemes.length];
                return (
                  <div key={comment.id} className="bg-[#121212] border border-white/5 p-4 rounded-2xl flex gap-3">
                    <div className={`w-9 h-9 shrink-0 rounded-full ${theme.bg} flex items-center justify-center border ${theme.border}`}>
                      <Ghost size={16} className={theme.text} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-gray-300">Anonim</span>
                        <span className="text-[10px] text-gray-500">{getRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Bırak fısıltını:</h3>
            <CommentForm postId={post.id} />
          </div>
        </div>
      </div>
    </main>
  );
}