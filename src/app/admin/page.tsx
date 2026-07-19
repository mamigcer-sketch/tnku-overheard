import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Rss, Headphones, VenetianMask, 
  Inbox, BarChart2, Settings, Check, X, Trash2, 
  MapPin, Users, Heart, Eye, Clock, Edit3, Lock, KeyRound, LogOut
} from 'lucide-react';

// --- AYARLAR ---
export const maxDuration = 30;

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function AdminDashboard({ searchParams }: any) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('admin_auth')?.value === 'true';

  // --- 1. GİRİŞ EKRANI ---
  if (!isAuthenticated) {
    async function login(formData: FormData) {
      'use server';
      if (formData.get('password') === 'betul123') {
        const cookiesList = await cookies();
        cookiesList.set('admin_auth', 'true', { secure: true, httpOnly: true });
        revalidatePath('/admin');
      }
    }

    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-4">
        <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[24px] w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-[#4DA3FF]/10 p-4 rounded-full border border-[#4DA3FF]/20">
              <Lock className="text-[#4DA3FF] w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">Gizli Kontrol Merkezi</h1>
          <form action={login} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" name="password" placeholder="Şifre" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none" />
            </div>
            <button type="submit" className="w-full bg-[#4DA3FF] hover:bg-[#3b8ce0] text-black font-bold py-4 rounded-xl transition-all">
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. ANA ADMİN PANELİ ---
  const params = await searchParams;
  const currentTab = params?.tab || 'Dashboard';
  const editId = params?.edit;

  const totalPosts = await prisma.post.count({ where: { status: 'APPROVED' } });
  const pendingPostsCount = await prisma.post.count({ where: { status: 'PENDING' } });
  const stats = await prisma.post.aggregate({ _sum: { likes: true, views: true }, where: { status: 'APPROVED' } });
  
  let queryFilter: any = { status: 'PENDING' };
  if (currentTab === 'Akış') queryFilter = { status: 'APPROVED' };
  if (currentTab === 'Overheard') queryFilter = { status: 'APPROVED', type: 'OVERHEARD' };
  if (currentTab === 'İtiraflar') queryFilter = { status: 'APPROVED', type: 'CONFESSION' };

  const displayPosts = await prisma.post.findMany({
    where: queryFilter,
    orderBy: { createdAt: 'desc' },
  });

  const postToEdit = editId ? displayPosts.find(p => p.id === editId) : null;

  async function approvePost(formData: FormData) {
    'use server';
    await prisma.post.update({ where: { id: formData.get('id') as string }, data: { status: 'APPROVED' } });
    revalidatePath('/admin');
  }

  async function rejectPost(formData: FormData) {
    'use server';
    await prisma.post.update({ where: { id: formData.get('id') as string }, data: { status: 'REJECTED' } });
    revalidatePath('/admin');
  }

  async function deletePost(formData: FormData) {
    'use server';
    await prisma.post.delete({ where: { id: formData.get('id') as string } });
    revalidatePath('/admin');
  }

  async function updatePost(formData: FormData) {
    'use server';
    const content = formData.get('content') as string;
    if(content) await prisma.post.update({ where: { id: formData.get('id') as string }, data: { content } });
    redirect(`/admin?tab=${formData.get('currentTab')}`);
  }

  async function logout() {
    'use server';
    const cookiesList = await cookies();
    cookiesList.delete('admin_auth');
    revalidatePath('/admin');
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Rss, label: 'Akış' },
    { icon: Headphones, label: 'Overheard' },
    { icon: VenetianMask, label: 'İtiraflar' },
    { icon: Inbox, label: 'Bekleyenler' },
  ];

  return (
    <div className="flex h-screen bg-[#0B0B0B] text-white overflow-hidden">
      <aside className="w-64 bg-[#121212] border-r border-white/5 flex flex-col p-6 hidden md:flex">
        <h1 className="text-xl font-bold mb-10">TNKU<span className="text-[#4DA3FF]">ADMIN</span></h1>
        <nav className="space-y-2 flex-1">
          {menuItems.map((item, i) => (
            <Link href={`/admin?tab=${item.label}`} key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${currentTab === item.label ? 'bg-[#4DA3FF]/10 text-[#4DA3FF]' : 'text-gray-400 hover:text-white'}`}>
              <item.icon size={20} /> {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 text-red-400 py-3 rounded-xl border border-red-500/20">
            <LogOut size={18} /> Çıkış Yap
          </button>
        </form>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        <h2 className="text-2xl font-bold mb-8">{currentTab} Paneli</h2>
        
        {/* İstatistikler */}
        <div className="grid grid-cols-4 gap-6 mb-12">
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
                <p className="text-gray-400 text-sm">Toplam</p>
                <p className="text-3xl font-bold text-blue-400">{totalPosts}</p>
            </div>
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
                <p className="text-gray-400 text-sm">Bekleyen</p>
                <p className="text-3xl font-bold text-yellow-400">{pendingPostsCount}</p>
            </div>
        </div>

        <div className="max-w-3xl space-y-5">
          {displayPosts.map((post) => (
            <article key={post.id} className="bg-[#121212] p-6 rounded-2xl border border-white/10">
              <p className="text-white mb-4">{post.content}</p>
              <div className="flex gap-3">
                {post.status === 'PENDING' && (
                  <>
                    <form action={approvePost}><input type="hidden" name="id" value={post.id} /><button type="submit" className="text-green-400">Onayla</button></form>
                    <form action={rejectPost}><input type="hidden" name="id" value={post.id} /><button type="submit" className="text-orange-400">Reddet</button></form>
                  </>
                )}
                <form action={deletePost}><input type="hidden" name="id" value={post.id} /><button type="submit" className="text-red-400">Sil</button></form>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}