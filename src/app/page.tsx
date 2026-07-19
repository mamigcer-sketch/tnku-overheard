import prisma from '@/lib/prisma';
import ModernForm from './ModernForm';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import MobileMenu from '@/components/MobileMenu';
import SearchBar from '@/components/SearchBar';
import { Plus, ChevronDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: any) {
  async function incrementLike(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const cookieStore = await cookies();
    const likedPostsCookie = cookieStore.get('liked_posts')?.value || '';
    const likedPosts = likedPostsCookie.split(',');

    if (!likedPosts.includes(id)) {
      await prisma.post.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });
      cookieStore.set('liked_posts', [...likedPosts, id].join(','), { 
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true 
      });
      revalidatePath('/');
    }
  }

  const cookieStore = await cookies();
  const likedPosts = cookieStore.get('liked_posts')?.value?.split(',') || [];
  
  const params = await searchParams;
  const currentFilter = params?.f || 'Tümü';
  const searchQuery = params?.q || '';
  const page = parseInt(params?.page || '1'); // Sayfa numarasını al

  let whereQuery: any = { status: 'APPROVED' };
  let orderQuery: any = { createdAt: 'desc' };

  if (currentFilter === 'Overheard') {
    whereQuery.type = { in: ['OVERHEARD', 'OVERHED'] };
  }
  if (currentFilter === 'İtiraf') whereQuery.type = 'CONFESSION';
  
  // HAFTANIN EN POPÜLERİ MANTIĞI BURADA EKLENDİ
  if (currentFilter === 'En Popüler') {
    orderQuery = { likes: 'desc' };
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Son 7 gün
    whereQuery.createdAt = { gte: oneWeekAgo };
  }

  if (searchQuery) {
    whereQuery.content = { contains: searchQuery, mode: 'insensitive' };
  }

  // --- SAYFALAMA MANTIĞI ---
  const pageSize = 10;
  const posts = await prisma.post.findMany({
    where: whereQuery,
    orderBy: orderQuery,
    skip: (page - 1) * pageSize, // Kaç gönderi atlanacak
    take: pageSize, // Kaç tane alınacak
    include: { comments: { select: { id: true } } }
  });

  const filters = ['Tümü', 'Overheard', 'İtiraf', 'En Yeni', 'En Popüler'];

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 md:px-8 flex items-center relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Link href="https://instagram.com/tnkuoverheard" target="_blank" className="flex items-center gap-3 pointer-events-auto hover:opacity-80 transition-opacity">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-cover rounded-xl border border-white/10" />
            <h1 className="text-2xl font-extrabold tracking-tighter">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span></h1>
          </Link>
        </div>
        <div className="ml-auto z-10"><MobileMenu /></div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* YENİ PAYLAŞIM ALANI (AKORDEON YAPISI) */}
        <div className="mb-6">
          <details className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="list-none cursor-pointer flex items-center justify-between bg-[#121212] border border-white/10 hover:border-white/20 p-4 rounded-2xl transition-all shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-[#4DA3FF]/10 p-2.5 rounded-xl">
                  <Plus className="text-[#4DA3FF]" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Bir şeyler paylaşmak ister misin?</h3>
                  <p className="text-xs text-gray-500">Kampüste duyduklarını veya itiraflarını anonim yaz.</p>
                </div>
              </div>
              <div className="bg-white/5 p-2 rounded-xl group-open:rotate-180 transition-transform duration-300">
                <ChevronDown size={18} className="text-gray-400" />
              </div>
            </summary>
            <div className="pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <ModernForm />
            </div>
          </details>
        </div>
        
        <SearchBar />

        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {filters.map((filter) => (
            <Link 
              key={filter} 
              href={`/?f=${filter}${searchQuery ? `&q=${searchQuery}` : ''}`} 
              scroll={false}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap ${currentFilter === filter ? 'bg-[#4DA3FF] text-black shadow-[0_0_15px_rgba(77,163,255,0.3)]' : 'bg-[#121212] border border-white/5 text-gray-300 hover:bg-white/5 transition-colors'}`}
            >
              {filter}
            </Link>
          ))}
        </div>

        <div className="space-y-5">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-[#121212] rounded-3xl border border-white/5 flex flex-col items-center justify-center">
              <p className="text-gray-400 font-medium">
                {currentFilter === 'En Popüler' 
                  ? 'Bu hafta henüz popülerleşen bir fısıltı yok kanka.' 
                  : 'Aradığın kriterlerde gönderi bulunamadı kanka.'}
              </p>
            </div>
          ) : (
            <>
              {posts.map((post: any) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  isLiked={likedPosts.includes(post.id)} 
                  incrementLike={incrementLike}
                />
              ))}
              
              {/* Daha Fazla Göster Butonu */}
              {posts.length === pageSize && (
                <div className="flex justify-center pt-4">
                  <Link 
                    href={`/?f=${currentFilter}${searchQuery ? `&q=${searchQuery}` : ''}&page=${page + 1}`}
                    className="px-8 py-3 bg-[#121212] border border-white/10 hover:border-white/30 rounded-full text-sm font-medium text-white transition-all hover:bg-white/5"
                  >
                    Daha Fazla Göster
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}