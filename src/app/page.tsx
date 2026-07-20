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
  const cookieStore = await cookies();

  // 🔥 KALICI ANONİM KİMLİK ÇEREZİ (USER UUID) MANTIĞI
  let userUuid = cookieStore.get('user_uuid')?.value;
  if (!userUuid) {
    userUuid = 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    cookieStore.set('user_uuid', userUuid, {
      maxAge: 60 * 60 * 24 * 365, // 1 yıl kalıcı
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  async function incrementLike(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const currentCookieStore = await cookies();
    const likedPostsCookie = currentCookieStore.get('liked_posts')?.value || '';
    const likedPosts = likedPostsCookie.split(',');

    if (!likedPosts.includes(id)) {
      await prisma.post.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });
      currentCookieStore.set('liked_posts', [...likedPosts, id].join(','), { 
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true 
      });
      revalidatePath('/');
    }
  }

  const likedPosts = cookieStore.get('liked_posts')?.value?.split(',') || [];
  
  const params = await searchParams;
  const currentFilter = params?.f || 'Tümü';
  const searchQuery = params?.q || '';
  
  const page = parseInt(params?.page || '1');
  const pageSize = 10;
  const totalTake = page * pageSize; 

  let whereQuery: any = { status: 'APPROVED' };
  let orderQuery: any = { createdAt: 'desc' };

  if (currentFilter === 'Overheard') {
    whereQuery.type = { in: ['OVERHEARD', 'OVERHED'] };
  }
  if (currentFilter === 'İtiraf') whereQuery.type = 'CONFESSION';
  
  if (currentFilter === '🔥 Trend') {
    orderQuery = { likes: 'desc' };
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    whereQuery.createdAt = { gte: oneWeekAgo };
  }

  if (searchQuery) {
    whereQuery.content = { contains: searchQuery, mode: 'insensitive' };
  }

  const posts = await prisma.post.findMany({
    where: whereQuery,
    orderBy: orderQuery,
    take: totalTake,
    include: { comments: { select: { id: true } } }
  });

  const totalPostsCount = await prisma.post.count({ where: whereQuery });

  const filters = ['Tümü', 'Overheard', 'İtiraf', 'En Yeni', '🔥 Trend'];

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      {/* Şeffaf ve Daha Zarif Header */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/60 backdrop-blur-2xl border-b border-white/[0.03] px-4 py-4 md:px-8 flex items-center relative transition-all">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Link href="https://instagram.com/tnkuoverheard" target="_blank" className="flex items-center gap-3 pointer-events-auto hover:opacity-80 transition-opacity">
            <img src="/logo.jpg" alt="Logo" className="w-9 h-9 object-cover rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
            <h1 className="text-xl font-black tracking-tighter">TNKU<span className="text-[#4DA3FF]">OVERHEARD</span></h1>
          </Link>
        </div>
        <div className="ml-auto z-10"><MobileMenu /></div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        
        {/* Premium Paylaşım Akordeonu */}
        <div className="mb-8">
          <details className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="list-none cursor-pointer flex items-center justify-between bg-[#121212]/60 backdrop-blur-xl border border-white/[0.05] hover:border-white/[0.1] hover:bg-[#121212]/80 p-4 sm:p-5 rounded-[24px] transition-all duration-300 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-[#4DA3FF]/10 p-3 rounded-2xl border border-[#4DA3FF]/10 group-hover:scale-105 transition-transform">
                  <Plus className="text-[#4DA3FF]" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-100 text-[15px]">Anonim paylaşım yapmak ister misin?</h3>
                  <p className="text-[12px] text-gray-500 font-medium mt-0.5">Kampüste olan biteni anonim fısılda.</p>
                </div>
              </div>
              <div className="bg-white/5 w-8 h-8 flex items-center justify-center rounded-full group-open:rotate-180 transition-transform duration-500">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </summary>
            <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <ModernForm />
            </div>
          </details>
        </div>
        
        <div className="mb-6">
          <SearchBar />
        </div>

        {/* Yeni Nesil Filtre Hapları (Pills) */}
        <div className="flex gap-2.5 overflow-x-auto pb-6 mb-2 scrollbar-hide snap-x">
          {filters.map((filter) => (
            <Link 
              key={filter} 
              href={`/?f=${filter}${searchQuery ? `&q=${searchQuery}` : ''}`} 
              scroll={false}
              className={`px-5 py-2.5 rounded-full text-[13px] font-bold whitespace-nowrap snap-start transition-all duration-300 ${
                currentFilter === filter 
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
                  : 'bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:text-gray-200 hover:bg-white/[0.08]'
              }`}
            >
              {filter}
            </Link>
          ))}
        </div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-[#121212]/50 rounded-[24px] border border-white/[0.05] flex flex-col items-center justify-center">
              <p className="text-gray-400 font-medium text-[14px]">
                {currentFilter === '🔥 Trend' 
                  ? 'Bu hafta henüz popülerleşen bir fısıltı yok.' 
                  : 'Aradığın kriterlerde gönderi bulunamadı.'}
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
                  userUuid={userUuid}
                />
              ))}
              
              {posts.length < totalPostsCount && (
                <div className="flex justify-center pt-6">
                  <Link 
                    href={`/?f=${currentFilter}${searchQuery ? `&q=${searchQuery}` : ''}&page=${page + 1}`}
                    scroll={false}
                    className="px-8 py-3.5 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.2] rounded-full text-[13px] font-bold text-gray-300 transition-all hover:bg-white/[0.08] hover:text-white shadow-lg"
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