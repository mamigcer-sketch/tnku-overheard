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

// Yorum Avatarları İçin Soft Renk Temaları (Daha Premium)
const avatarThemes = [
  { bg: 'bg-blue-500/5', border: 'border-blue-500/10', text: 'text-blue-400' },
  { bg: 'bg-purple-500/5', border: 'border-purple-500/10', text: 'text-purple-400' },
  { bg: 'bg-pink-500/5', border: 'border-pink-500/10', text: 'text-pink-400' },
  { bg: 'bg-teal-500/5', border: 'border-teal-500/10', text: 'text-teal-400' },
];

export default async function PostPage({ params }: any) {
  const resolvedParams = await params;
  const postId = resolvedParams?.id;

  if (!postId) return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white font-medium">Yükleniyor...</div>;

  const post = await prisma.post.findUnique({
    where: { id: String(postId) },
    include: { comments: { orderBy: { createdAt: 'desc' } } }
  });

  if (!post) return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-gray-500 font-medium">Post bulunamadı...</div>;

  const isConfession = post.type === 'CONFESSION';
  const glowStyle = isConfession 
    ? 'shadow-[0_0_40px_rgba(168,85,247,0.07)] border-purple-500/20' 
    : 'shadow-[0_0_40px_rgba(77,163,255,0.07)] border-[#4DA3FF]/20';

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      {/* Şeffaf Header */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/70 backdrop-blur-xl border-b border-white/5 px-4 py-4 md:px-8 mb-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-lg font-extrabold tracking-tighter">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span></h1>
          </Link>
          <div className="flex items-center gap-3">
            <BackButton />
            <Link href="/" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors text-[13px] font-medium border border-white/5">
              <Home size={14} /> <span className="hidden sm:inline">Ana Sayfa</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* ANA GÖNDERİ KARTI */}
        <article className={`bg-[#121212]/80 backdrop-blur-xl border p-6 rounded-[24px] mb-8 relative overflow-hidden transition-all duration-500 ${glowStyle}`}>
          
          {/* Üst Bilgi Çubuğu */}
          <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold tracking-wide">
              <span className={`px-2.5 py-1 rounded-md uppercase ${isConfession ? 'bg-purple-500/10 text-purple-400' : 'bg-[#4DA3FF]/10 text-[#4DA3FF]'}`}>
                {isConfession ? 'İTİRAF' : 'OVERHEARD'}
              </span>
              {post.location && <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md text-gray-400"><MapPin size={10} /> {post.location}</span>}
              {post.time && <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md text-gray-400"><Clock size={10} /> {post.time}</span>}
              {post.people && <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md text-gray-400"><Users size={10} /> {post.people}</span>}
              {post.gender && <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md text-gray-400"><User size={10} /> {post.gender}</span>}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">
              {getRelativeTime(post.createdAt)}
            </span>
          </div>

          {/* İçerik - Zarafet katıldı, boyut ufaltıldı, okuma kolaylığı eklendi */}
          <p className="text-[15px] sm:text-[16px] leading-relaxed font-medium text-gray-100 mb-6 break-words tracking-wide">
            {post.content}
          </p>

          {/* İstatistikler */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5 bg-pink-500/5 px-3 py-1.5 rounded-lg border border-pink-500/10">
              <Heart size={14} className="text-pink-400" /> 
              <span className="text-xs font-bold text-pink-100">{post.likes}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10">
              <Eye size={14} className="text-blue-400" /> 
              <span className="text-xs font-bold text-blue-100">{post.views}</span>
            </div>
          </div>
        </article>

        {/* YORUMLAR BÖLÜMÜ */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <MessageCircle size={16} className="text-[#4DA3FF]" />
            <h2 className="text-[14px] font-bold text-gray-200">
              Anonim Yorumlar <span className="text-gray-500 font-medium">({post.comments.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {post.comments.length === 0 ? (
              <div className="text-center py-10 bg-[#121212]/50 rounded-2xl border border-white/5 text-gray-500 text-[13px]">
                Bu fısıltıya ilk cevabı sen ver.
              </div>
            ) : (
              post.comments.map((comment: any, index: number) => {
                const theme = avatarThemes[index % avatarThemes.length];
                return (
                  // Yorum kartlarına "slide-in" efekti ve küçültülmüş pading uygulandı
                  <div key={comment.id} className="bg-[#121212]/80 border border-white/[0.03] hover:border-white/[0.08] p-3.5 rounded-2xl flex gap-3 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className={`w-8 h-8 shrink-0 rounded-full ${theme.bg} flex items-center justify-center border ${theme.border}`}>
                      <Ghost size={14} className={theme.text} />
                    </div>
                    <div className="flex-1 mt-0.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-[11px] text-gray-300 tracking-wide">ANONİM</span>
                        <span className="text-[9px] text-gray-500 font-medium">{getRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-300 text-[13px] leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          
          {/* Yorum Yapma Formu */}
          <div className="pt-6 border-t border-white/5 mt-8">
            <h3 className="text-xs font-bold text-gray-400 mb-3 px-1 uppercase tracking-wider">Sen Ne Düşünüyorsun?</h3>
            <CommentForm postId={post.id} />
          </div>
        </div>
      </div>
    </main>
  );
}