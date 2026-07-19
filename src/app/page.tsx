import prisma from '@/lib/prisma';
import ModernForm from './ModernForm';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import MobileMenu from '@/components/MobileMenu';
import SearchBar from '@/components/SearchBar';

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

  let whereQuery: any = { status: 'APPROVED' };
  let orderQuery: any = { createdAt: 'desc' };

  // --- FİLTRELER ---
  if (currentFilter === 'Overheard') {
    whereQuery.type = { in: ['OVERHEARD', 'OVERHED'] };
  }
  if (currentFilter === 'İtiraf') whereQuery.type = 'CONFESSION';
  if (currentFilter === 'En Popüler') orderQuery = { likes: 'desc' };

  // --- ARAMA MANTIĞI ---
  if (searchQuery) {
    whereQuery.content = { contains: searchQuery, mode: 'insensitive' };
  }

  const posts = await prisma.post.findMany({
    where: whereQuery,
    orderBy: orderQuery,
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
        <ModernForm />
        
        <SearchBar />

        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {filters.map((filter) => (
            <Link 
              key={filter} 
              href={`/?f=${filter}${searchQuery ? `&q=${searchQuery}` : ''}`} 
              scroll={false}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap ${currentFilter === filter ? 'bg-[#4DA3FF] text-black' : 'bg-white/5 text-gray-300'}`}
            >
              {filter}
            </Link>
          ))}
        </div>

        <div className="space-y-5">
          {posts.length === 0 ? (
            <div className="text-center text-gray-500 py-10 border border-white/5 rounded-2xl bg-[#121212]">
              Aradığın kriterlerde gönderi bulunamadı kanka.
            </div>
          ) : (
            posts.map((post: any) => (
              <PostCard 
                key={post.id} 
                post={post} 
                isLiked={likedPosts.includes(post.id)} 
                incrementLike={incrementLike}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}