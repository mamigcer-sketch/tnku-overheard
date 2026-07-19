import prisma from '@/lib/prisma';
import ModernForm from './ModernForm'; 
import PostCard from '@/components/PostCard'; 
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Menu } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu'; // Bileşeni import ettik

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

  let whereQuery: any = { status: 'APPROVED' };
  let orderQuery: any = { createdAt: 'desc' };

  if (currentFilter === 'Overheard') whereQuery.type = 'OVERHEARD';
  if (currentFilter === 'İtiraf') whereQuery.type = 'CONFESSION';
  if (currentFilter === 'En Popüler') orderQuery = { likes: 'desc' };

  const posts = await prisma.post.findMany({
    where: whereQuery,
    orderBy: orderQuery,
  });

  const filters = ['Tümü', 'Overheard', 'İtiraf', 'En Yeni', 'En Popüler'];

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      {/* Üst Menü / Header Alanı */}
     <header className="sticky top-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 md:px-8 flex items-center relative">
  {/* Logo ve Başlık (Tam Ortada) */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <Link 
      href="https://instagram.com/tnkuoverheard" 
      target="_blank" 
      className="flex items-center gap-3 pointer-events-auto hover:opacity-80 transition-opacity"
    >
      <img 
        src="/logo.jpg" 
        alt="TNKU Overheard Logo" 
        className="w-10 h-10 object-cover rounded-xl border border-white/10 shadow-[0_0_10px_rgba(77,163,255,0.1)]" 
      />
      <h1 className="text-2xl font-extrabold tracking-tighter">
        TNKU<span className="text-[#4DA3FF]">OVERHEARD</span>
      </h1>
    </Link>
  </div>

  {/* Sağ taraftaki menü butonu */}
  {/* Sağ taraftaki menü butonu */}
        <div className="ml-auto z-10">
          <MobileMenu />
        </div>
</header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <ModernForm />
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6">
          {filters.map((filter) => (
            <Link key={filter} href={`/?f=${filter}`} className={`px-5 py-2 rounded-full text-sm font-medium ${currentFilter === filter ? 'bg-[#4DA3FF] text-black' : 'bg-white/5 text-gray-300'}`}>
              {filter}
            </Link>
          ))}
        </div>

        <div className="space-y-5">
          {posts.map((post: any) => (
            <PostCard 
              key={post.id} 
              post={post} 
              isLiked={likedPosts.includes(post.id)} 
              incrementLike={incrementLike}
            />
          ))}
        </div>
      </div>
    </main>
  );
}