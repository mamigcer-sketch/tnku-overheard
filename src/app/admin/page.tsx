import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { 
  LayoutDashboard, Rss, Headphones, VenetianMask, 
  Inbox, Check, X, Trash2, Lock, KeyRound, LogOut,
  MapPin, Clock, Users, User, BarChart3
} from 'lucide-react';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

export default async function AdminDashboard({ searchParams }: any) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('admin_auth')?.value === 'true';

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
          <form action={login} className="space-y-4 mt-8">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" name="password" placeholder="Şifre" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#4DA3FF] transition-colors" />
            </div>
            <button type="submit" className="w-full bg-[#4DA3FF] hover:bg-[#3b8ce0] text-black font-bold py-4 rounded-xl transition-all">Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const currentTab = params?.tab || 'Dashboard';

  // İstatistikleri çekiyoruz
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PENDING' } }),
    prisma.post.count({ where: { status: 'APPROVED' } }),
    prisma.post.count({ where: { status: 'REJECTED' } }),
  ]);

  let queryFilter: any = { status: 'PENDING' };
  if (currentTab === 'Akış') queryFilter = { status: 'APPROVED' };
  if (currentTab === 'Overheard') queryFilter = { status: 'APPROVED', type: { in: ['OVERHEARD', 'OVERHED'] } };
  if (currentTab === 'İtiraflar') queryFilter = { status: 'APPROVED', type: 'CONFESSION' };
  if (currentTab === 'Dashboard') queryFilter = { status: 'PENDING' };

  const displayPosts = await prisma.post.findMany({ where: queryFilter, orderBy: { createdAt: 'desc' } });

  async function approvePost(formData: FormData) { 'use server'; await prisma.post.update({ where: { id: formData.get('id') as string }, data: { status: 'APPROVED' } }); revalidatePath('/admin'); }
  async function rejectPost(formData: FormData) { 'use server'; await prisma.post.update({ where: { id: formData.get('id') as string }, data: { status: 'REJECTED' } }); revalidatePath('/admin'); }
  async function deletePost(formData: FormData) { 'use server'; await prisma.post.delete({ where: { id: formData.get('id') as string } }); revalidatePath('/admin'); }
  async function logout() { 'use server'; (await cookies()).delete('admin_auth'); revalidatePath('/admin'); }

  const menuItems = [{ icon: LayoutDashboard, label: 'Dashboard' }, { icon: Rss, label: 'Akış' }, { icon: Headphones, label: 'Overheard' }, { icon: VenetianMask, label: 'İtiraflar' }, { icon: Inbox, label: 'Bekleyenler' }];

  return (
    <div className="flex h-screen bg-[#0B0B0B] text-white">
      <aside className="w-64 bg-[#121212] border-r border-white/5 p-6 hidden md:flex flex-col">
        <h1 className="text-xl font-bold mb-10">TNKU<span className="text-[#4DA3FF]">ADMIN</span></h1>
        <nav className="space-y-2 flex-1">
          {menuItems.map((item, i) => (
            <Link href={`/admin?tab=${item.label}`} key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentTab === item.label ? 'bg-[#4DA3FF]/10 text-[#4DA3FF]' : 'text-gray-400 hover:text-white'}`}>
              <item.icon size={20} /> {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout}><button className="w-full flex items-center justify-center gap-2 text-red-400 py-3 rounded-xl border border-red-500/20 bg-red-500/5"><LogOut size={18} /> Çıkış</button></form>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3"><BarChart3 /> {currentTab} İstatistikleri</h2>

        {/* İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
                { label: 'Toplam', val: total, color: 'text-white' },
                { label: 'Bekleyen', val: pending, color: 'text-yellow-400' },
                { label: 'Onaylı', val: approved, color: 'text-green-400' },
                { label: 'Red', val: rejected, color: 'text-red-400' },
            ].map((stat, i) => (
                <div key={i} className="bg-[#121212] p-5 rounded-2xl border border-white/5">
                    <p className="text-gray-500 text-xs font-bold uppercase">{stat.label}</p>
                    <p className={`text-3xl font-black ${stat.color}`}>{stat.val}</p>
                </div>
            ))}
        </div>

        <div className="max-w-3xl space-y-4">
          {displayPosts.map((post) => (
            <article key={post.id} className="bg-[#121212] p-6 rounded-2xl border border-white/10">
              <p className="text-white text-[16px] mb-4">{post.content}</p>
              <div className="flex gap-2">
                {post.status === 'PENDING' ? (
                  <>
                    <form action={approvePost}><input type="hidden" name="id" value={post.id} /><button className="bg-green-500/10 text-green-400 px-6 py-2 rounded-xl text-sm border border-green-500/20">Onayla</button></form>
                    <form action={rejectPost}><input type="hidden" name="id" value={post.id} /><button className="bg-orange-500/10 text-orange-400 px-6 py-2 rounded-xl text-sm border border-orange-500/20">Reddet</button></form>
                  </>
                ) : null}
                <form action={deletePost}><input type="hidden" name="id" value={post.id} /><button className="bg-red-500/10 text-red-400 px-6 py-2 rounded-xl text-sm border border-red-500/20">Sil</button></form>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}