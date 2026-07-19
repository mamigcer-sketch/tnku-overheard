import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { 
  LayoutDashboard, Rss, Headphones, VenetianMask, 
  Inbox, Check, X, Trash2, Lock, KeyRound, LogOut,
  BarChart3, Heart, Eye, Calendar, Tag, Activity
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
          <p className="text-gray-500 text-center text-sm mb-8">Sisteme erişmek için yetkilendirme gerekiyor.</p>
          <form action={login} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" name="password" placeholder="Yönetici Şifresi" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#4DA3FF] transition-colors" />
            </div>
            <button type="submit" className="w-full bg-[#4DA3FF] hover:bg-[#3b8ce0] text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(77,163,255,0.3)]">Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const currentTab = params?.tab || 'Dashboard';

  const [total, pending, approved, rejected, aggregateStats] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PENDING' } }),
    prisma.post.count({ where: { status: 'APPROVED' } }),
    prisma.post.count({ where: { status: 'REJECTED' } }),
    prisma.post.aggregate({ _sum: { likes: true, views: true } })
  ]);

  const totalLikes = aggregateStats._sum.likes || 0;
  const totalViews = aggregateStats._sum.views || 0;

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

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' }, 
    { icon: Rss, label: 'Akış' }, 
    { icon: Headphones, label: 'Overheard' }, 
    { icon: VenetianMask, label: 'İtiraflar' }, 
    { icon: Inbox, label: 'Bekleyenler', badge: pending }
  ];

  return (
    <div className="flex h-screen bg-[#0B0B0B] text-white">
      {/* SOL MENÜ (Masaüstü) */}
      <aside className="w-64 bg-[#121212] border-r border-white/5 p-6 hidden md:flex flex-col">
        <h1 className="text-xl font-bold mb-10 tracking-tight">TNKU<span className="text-[#4DA3FF]">ADMIN</span></h1>
        <nav className="space-y-2 flex-1">
          {menuItems.map((item, i) => (
            <Link href={`/admin?tab=${item.label}`} key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${currentTab === item.label ? 'bg-[#4DA3FF]/10 text-[#4DA3FF] shadow-inner' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <div className="flex items-center gap-3">
                <item.icon size={20} /> <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="bg-[#4DA3FF] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
              ) : null}
            </Link>
          ))}
        </nav>
        <form action={logout}><button className="w-full flex items-center justify-center gap-2 text-red-400 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors"><LogOut size={18} /> Güvenli Çıkış</button></form>
      </aside>

      {/* MOBİL ALT NAVİGASYON */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-white/10 p-3 flex justify-around z-50">
        {menuItems.map((item, i) => (
          <Link href={`/admin?tab=${item.label}`} key={i} className={`flex flex-col items-center gap-1 ${currentTab === item.label ? 'text-[#4DA3FF]' : 'text-gray-500'}`}>
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide pb-28">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <h2 className="text-2xl font-bold flex items-center gap-3"><BarChart3 className="text-[#4DA3FF]" /> {currentTab} Paneli</h2>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <Activity size={16} className="text-green-400" /> Sistem Aktif
            </div>
        </header>

        {/* İSTATİSTİKLER VE GÖNDERİ LİSTESİ... (Aşağıdaki kısımlar aynı kalıyor) */}
        {/* ... */}
      </main>
    </div>
  );
}