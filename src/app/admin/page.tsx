import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Rss, Headphones, VenetianMask, 
  Inbox, Check, X, Trash2, Lock, KeyRound, LogOut 
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
          <form action={login} className="space-y-4 mt-8">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" name="password" placeholder="Şifre" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#4DA3FF] transition-colors" />
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
  
  let queryFilter: any = { status: 'PENDING' };
  if (currentTab === 'Akış') queryFilter = { status: 'APPROVED' };
  if (currentTab === 'Overheard') queryFilter = { status: 'APPROVED', type: 'OVERHEARD' };
  if (currentTab === 'İtiraflar') queryFilter = { status: 'APPROVED', type: 'CONFESSION' };

  const displayPosts = await prisma.post.findMany({
    where: queryFilter,
    orderBy: { createdAt: 'desc' },
  });

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
      {/* MASAÜSTÜ SOL MENÜ */}
      <aside className="w-64 bg-[#121212] border-r border-white/5 flex flex-col p-6 hidden md:flex">
        <h1 className="text-xl font-bold mb-10">TNKU<span className="text-[#4DA3FF]">ADMIN</span></h1>
        <nav className="space-y-2 flex-1">
          {menuItems.map((item, i) => (
            <Link href={`/admin?tab=${item.label}`} key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentTab === item.label ? 'bg-[#4DA3FF]/10 text-[#4DA3FF] font-medium' : 'text-gray-400 hover:text-white'}`}>
              <item.icon size={20} /> {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 text-red-400 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} /> Çıkış Yap
          </button>
        </form>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        
        {/* MOBİL ÜST MENÜ */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between mb-4 pt-2">
            <h1 className="text-xl font-bold">TNKU<span className="text-[#4DA3FF]">ADMIN</span></h1>
            <form action={logout}>
              <button type="submit" className="text-red-400 p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                <LogOut size={18} />
              </button>
            </form>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {menuItems.map((item, i) => (
              <Link href={`/admin?tab=${item.label}`} key={i} className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${currentTab === item.label ? 'bg-[#4DA3FF] text-black' : 'bg-[#121212] border border-white/5 text-gray-400'}`}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 hidden md:block">{currentTab} Paneli</h2>
        
        {/* İSTATİSTİKLER (Mobilde yan yana 2 kutu, masaüstünde 4 kutu) */}
        {(currentTab === 'Dashboard' || currentTab === 'Bekleyenler') && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#121212] p-5 rounded-2xl border border-white/5">
                  <p className="text-gray-400 text-xs md:text-sm mb-1 font-medium">Toplam</p>
                  <p className="text-2xl md:text-3xl font-bold text-[#4DA3FF]">{totalPosts}</p>
              </div>
              <div className="bg-[#121212] p-5 rounded-2xl border border-white/5">
                  <p className="text-gray-400 text-xs md:text-sm mb-1 font-medium">Bekleyen</p>
                  <p className="text-2xl md:text-3xl font-bold text-yellow-400">{pendingPostsCount}</p>
              </div>
          </div>
        )}

        {/* GÖNDERİLER */}
        <div className="max-w-3xl space-y-4">
          {displayPosts.length === 0 ? (
            <div className="bg-[#121212] border border-white/5 p-10 rounded-[24px] text-center text-gray-500">
              Gösterilecek veri yok kanka.
            </div>
          ) : (
            displayPosts.map((post) => (
              <article key={post.id} className="bg-[#121212] p-5 md:p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
                <p className="text-white text-[15px] md:text-[17px] leading-relaxed">{post.content}</p>
                
                {/* BUTONLAR */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                  {post.status === 'PENDING' ? (
                    <>
                      <form action={approvePost} className="w-full">
                        <input type="hidden" name="id" value={post.id} />
                        <button type="submit" className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-400 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors border border-green-500/20">
                          <Check size={16} /> Onayla
                        </button>
                      </form>
                      <form action={rejectPost} className="w-full">
                        <input type="hidden" name="id" value={post.id} />
                        <button type="submit" className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors border border-orange-500/20">
                          <X size={16} /> Reddet
                        </button>
                      </form>
                      <form action={deletePost} className="w-full">
                        <input type="hidden" name="id" value={post.id} />
                        <button type="submit" className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors border border-red-500/20">
                          <Trash2 size={16} /> Sil
                        </button>
                      </form>
                    </>
                  ) : (
                    <form action={deletePost} className="w-full col-span-3">
                      <input type="hidden" name="id" value={post.id} />
                      <button type="submit" className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-red-500/20">
                        <Trash2 size={18} /> Bu Gönderiyi Sil
                      </button>
                    </form>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}