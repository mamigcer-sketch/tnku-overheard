import prisma from '@/lib/prisma';
import CommentForm from '@/components/CommentForm';
import BackButton from '@/components/BackButton'; // <-- YENİ BUTONUMUZ BURADA
import { MessageCircle } from 'lucide-react';

export default async function PostPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  // Postu ve ona bağlı yorumları aynı anda çekiyoruz
  const post = await prisma.post.findUnique({
    where: { id },
    include: { 
      comments: { 
        orderBy: { createdAt: 'desc' } // En yeni yorum en üstte
      } 
    }
  });

  if (!post) return <div className="p-10 text-center text-white">Post bulunamadı kanka...</div>;

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* AKILLI GERİ DÖN BUTONU */}
        <BackButton />

        {/* Post Detayı */}
        <article className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-[20px] mb-8">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 border ${post.type === 'CONFESSION' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-[#4DA3FF]/10 border-[#4DA3FF]/20 text-[#4DA3FF]'}`}>
            {post.type === 'CONFESSION' ? 'İTİRAF' : 'OVERHEARD'}
          </span>
          <p className="text-xl md:text-2xl leading-relaxed font-light">{post.content}</p>
          <div className="mt-6 text-sm text-gray-500">
            {post.createdAt.toLocaleDateString('tr-TR')}
          </div>
        </article>

        {/* Yorumlar Bölümü */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <MessageCircle size={20} /> Anonim Yorumlar ({post.comments.length})
          </h2>

          {/* Yorum Listesi */}
          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Henüz kimse bir şey fısıldamamış. İlk sen ol!</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
                  <p className="text-gray-200 text-sm">{comment.content}</p>
                  <span className="text-[10px] text-gray-600 mt-2 block">
                    {comment.createdAt.toLocaleDateString('tr-TR')}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Yorum Yapma Kutusu */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-sm text-gray-400 mb-2">Anonim olarak yorumla:</h3>
            <CommentForm postId={post.id} />
          </div>
        </div>
      </div>
    </main>
  );
}