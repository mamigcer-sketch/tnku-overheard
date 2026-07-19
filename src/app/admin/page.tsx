import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Rss, Headphones, VenetianMask, 
  Inbox, BarChart2, Settings, Check, X, Trash2, 
  MapPin, Users, Heart, Eye, Clock, Edit3, Lock, KeyRound, LogOut
} from 'lucide-react';

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
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-4 selection:bg-[#4DA3FF]/30">
        <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[24px] shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-6">
            <div className="bg-[#4DA3FF]/10 p-4 rounded-full border border-[#4DA3FF]/20">
              <Lock className="text-[#4DA3FF] w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">Gizli Kontrol Merkezi</h1>
          <p className="text-gray-400 text-center mb-8 text-sm">Devam etmek için yönetici şifresini girin.</p>
          <form action={login} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" name="password" placeholder="Şifre" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-[#4DA3FF] outline-none transition-all" />
            </div>
            <button type="submit" className="w-full bg-[#4DA3FF] hover:bg-[#3b8ce0] text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(77,163,255,0.4)]">
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. ANA ADMİN PANELİ ---
  
  const params = await searchParams;
  const currentTab = params?.tab || 'Dashboard'; // Hangi sekmedeyiz?
  const editId = params?.edit;

  // İSTATİSTİKLER
  const totalPosts = await prisma.post.count({ where: { status: 'APPROVED' } });
  const pendingPostsCount = await prisma.post.count({ where: { status: 'PENDING' } });
  const stats = await prisma.post.aggregate({ _sum: { likes: true, views: true }, where: { status: 'APPROVED' } });
  
  // SEKME MANTIĞINA GÖRE VERİ ÇEKME
  let queryFilter: any = { status: 'PENDING' }; // Varsayılan olarak bekleyenler
  
  if (currentTab === 'Akış') queryFilter = { status: 'APPROVED' };
  if (currentTab === 'Overheard') queryFilter = { status: 'APPROVED', type: 'OVERHEARD' };
  if (currentTab === 'İtiraflar') queryFilter = { status: 'APPROVED', type: 'CONFESSION' };

  const displayPosts = await prisma.post.findMany({
    where: queryFilter,
    orderBy: { createdAt: 'desc' },
  });

  const postToEdit = editId ? displayPosts.find(p => p.id === editId) : null;

  // --- SERVER ACTIONS ---
  async function approvePost(formData: FormData) {
    'use server';
    await prisma.post.update({ where: { id: formData.get('id') as string }, data: { status: 'APPROVED' } });
    revalidatePath('/admin'); revalidatePath('/'); 
  }

  async function rejectPost(formData: FormData) {
    'use server';
    await prisma.post.update({ where: { id: formData.get('id') as string }, data: { status: 'REJECTED' } });
    revalidatePath('/admin');
  }

  async function deletePost(formData: FormData) {
    'use server';
    await prisma.post.delete({ where: { id: formData.get('id') as string } });
    revalidatePath('/admin'); revalidatePath('/'); 
  }

  async function updatePost(formData: FormData) {
    'use server';
    const content = formData.get('content') as string;
    if(content) await prisma.post.update({ where: { id: formData.get('id') as string }, data: { content } });
    // URL'deki currentTab bilgisini koruyarak sadece edit kısmını silip geri dön
    const tabParam = formData.get('currentTab') as string;
    redirect(`/admin?tab=${tabParam}`);
  }

  async function logout() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('admin_auth');
    revalidatePath('/admin');
  }

  // MENÜ LİSTESİ
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Rss, label: 'Akış' },
    { icon: Headphones, label: 'Overheard' },
    { icon: VenetianMask, label: 'İtiraflar' },
    { icon: Inbox, label: 'Bekleyenler' },
    { icon: BarChart2, label: 'İstatistikler' },
    { icon: Settings, label: 'Ayarlar' },
  ];

  return (
    <div className="flex h-screen bg-[#0B0B0B] text-white overflow-hidden selection:bg-[#4DA3FF]/30">
      
      {/* SOL SİDEBAR (ARTIK TIKLANABİLİR LİNKLER) */}
      <aside className="w-64 bg-[#121212]/80 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 hidden md:flex">
        <div className="mb-10">
          <h1 className="text-2xl font-extrabold tracking-tighter text-white">
            TNKU<span className="text-[#4DA3FF]">ADMIN</span>
          </h1>
        </div>
        <nav className="space-y-2 flex-1">
          {menuItems.map((item, index) => {
            // Eğer URL'deki sekme ile butonun adı aynıysa veya (currentTab Dashboard iken Bekleyenler seçiliyse) aktif yap
            const isActive = currentTab === item.label || (currentTab === 'Dashboard' && item.label === 'Dashboard');
            
            return (
              <Link 
                href={`/admin?tab=${item.label}`} 
                key={index} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#4DA3FF]/10 text-[#4DA3FF] font-semibold border border-[#4DA3FF]/20 shadow-[0_0_15px_rgba(77,163,255,0.1)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={logout} className="mt-auto pt-6 border-t border-white/5">
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-xl font-medium transition-colors">
            <LogOut size={18} /> Çıkış Yap
          </button>
        </form>
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide relative">
        <h2 className="text-2xl font-bold mb-8">{currentTab} Paneli</h2>

        {/* İstatistikler Sadece Dashboard ve Bekleyenler Sekmesinde Görünsün */}
        {(currentTab === 'Dashboard' || currentTab === 'Bekleyenler') && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            {[
              { label: 'Toplam Gönderi', value: totalPosts, color: 'text-blue-400' },
              { label: 'Bekleyen Onay', value: pendingPostsCount, color: 'text-yellow-400' },
              { label: 'Toplam Beğeni', value: stats._sum.likes || 0, color: 'text-red-400' },
              { label: 'Görüntülenme', value: stats._sum.views || 0, color: 'text-green-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.02] backdrop-blur-lg border border-white/5 p-6 rounded-[24px] hover:bg-white/[0.04] transition-all">
                <p className="text-gray-400 text-sm font-medium mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* YAPIM AŞAMASINDA OLAN SEKELER */}
        {(currentTab === 'İstatistikler' || currentTab === 'Ayarlar') ? (
          <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[24px] text-center text-gray-500">
            Bu bölüm çok yakında eklenecek... 🚧
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Inbox className="text-[#4DA3FF]" /> 
              {queryFilter.status === 'PENDING' ? 'Bekleyen Fısıltılar' : 'Onaylanmış Fısıltılar'}
            </h3>

            <div className="max-w-3xl space-y-5">
              {displayPosts.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[24px] text-center text-gray-500">
                  Burada gösterilecek bir şey yok kanka.
                </div>
              ) : (
                displayPosts.map((post) => (
                  <article key={post.id} className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 rounded-[20px] transition-all">
                    
                    <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium text-gray-400">
                      <span className={`px-3 py-1 rounded-full border ${post.type === 'CONFESSION' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-[#4DA3FF]/10 border-[#4DA3FF]/20 text-[#4DA3FF]'}`}>
                        {post.type === 'CONFESSION' ? 'İTİRAF' : 'OVERHEARD'}
                      </span>
                      {post.location && <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5"><MapPin size={12} /> {post.location}</span>}
                      {post.people && <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5"><Users size={12} /> {post.people}</span>}
                    </div>

                    <p className="text-white text-[17px] leading-relaxed mb-6">
                      {post.content}
                    </p>

                    {/* BUTONLAR: Eğer Bekliyorsa hepsini göster, Onaylanmışsa sadece SİL göster */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/5">
                      {post.status === 'PENDING' && (
                        <>
                          <form action={approvePost} className="w-full">
                            <input type="hidden" name="id" value={post.id} />
                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 py-2.5 rounded-xl font-medium transition-colors">
                              <Check size={18} /> Onayla
                            </button>
                          </form>
                          
                          <Link href={`/admin?tab=${currentTab}&edit=${post.id}`} className="w-full flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 py-2.5 rounded-xl font-medium transition-colors">
                            <Edit3 size={18} /> Düzenle
                          </Link>

                          <form action={rejectPost} className="w-full">
                            <input type="hidden" name="id" value={post.id} />
                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 py-2.5 rounded-xl font-medium transition-colors">
                              <X size={18} /> Reddet
                            </button>
                          </form>
                        </>
                      )}

                      <form action={deletePost} className="w-full">
                        <input type="hidden" name="id" value={post.id} />
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl font-medium transition-colors">
                          <Trash2 size={18} /> Sil
                        </button>
                      </form>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* DÜZENLEME MODALI */}
      {postToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-white/10 p-6 rounded-[24px] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-4">Gönderiyi Düzenle</h3>
            
            <form action={updatePost} className="space-y-4">
              <input type="hidden" name="id" value={postToEdit.id} />
              <input type="hidden" name="currentTab" value={currentTab} />
              
              <textarea 
                name="content" 
                defaultValue={postToEdit.content} 
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white text-md focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF] outline-none transition-all resize-none h-40"
              />
              
              <div className="flex gap-3 pt-2">
                <Link href={`/admin?tab=${currentTab}`} className="flex-1 py-3 text-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-medium transition-all">
                  İptal
                </Link>
                <button type="submit" className="flex-1 bg-[#4DA3FF] hover:bg-[#3b8ce0] text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(77,163,255,0.3)]">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}