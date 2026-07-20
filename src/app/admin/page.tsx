import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { 
  LayoutDashboard, Rss, Headphones, VenetianMask, 
  Inbox, Check, X, Trash2, Lock, KeyRound, LogOut,
  BarChart3, Heart, Eye, Calendar, Tag, Activity, MessageSquare
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

  // VERİ ÇEKME MANTIĞI: Sekme Yorumlarsa Yorumları, Değilse Gönderileri Çek
  let displayPosts: any[] = [];
  let displayComments: any[] = [];

  if (currentTab === 'Yorumlar') {
    displayComments = await prisma.comment.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: { post: { select: { content: true, type: true } } }
    });
  } else {
    let queryFilter: any = { status: 'PENDING' };
    if (currentTab === 'Akış') queryFilter = { status: 'APPROVED' };
    if (currentTab === 'Overheard') queryFilter = { status: 'APPROVED', type: { in: ['OVERHEARD', 'OVERHED'] } };
    if (currentTab === 'İtiraflar') queryFilter = { status: 'APPROVED', type: 'CONFESSION' };
    if (currentTab === 'Dashboard') queryFilter = { status: 'PENDING' };
    displayPosts = await prisma.post.findMany({ where: queryFilter, orderBy: { createdAt: 'desc' } });
  }

  // SERVER ACTIONS (Gönderi ve Yorum İşlemleri)
  async function approvePost(formData: FormData) { 'use server'; await prisma.post.update({ where: { id: formData.get('id') as string }, data: { status: 'APPROVED' } }); revalidatePath('/admin'); }
  async function rejectPost(formData: FormData) { 'use server'; await prisma.post.update({ where: { id: formData.get('id') as string }, data: { status: 'REJECTED' } }); revalidatePath('/admin'); }
  async function deletePost(formData: FormData) { 'use server'; await prisma.post.delete({ where: { id: formData.get('id') as string } }); revalidatePath('/admin'); }
  async function deleteComment(formData: FormData) { 'use server'; await prisma.comment.delete({ where: { id: formData.get('id') as string } }); revalidatePath('/admin'); }
  async function logout() { 'use server'; (await cookies()).delete('admin_auth'); revalidatePath('/admin'); }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' }, 
    { icon: Rss, label: 'Akış' }, 
    { icon: Headphones, label: 'Overheard' }, 
    { icon: VenetianMask, label: 'İtiraflar' }, 
    { icon: Inbox, label: 'Bekleyenler', badge: pending },
    { icon: MessageSquare, label: 'Yorumlar' }
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-white/10 p-3 flex justify-around z-50 overflow-x-auto gap-2 scrollbar-hide">
        {menuItems.map((item, i) => (
          <Link href={`/admin?tab=${item.label}`} key={i} className={`flex flex-col items-center gap-1 min-w-[64px] ${currentTab === item.label ? 'text-[#4DA3FF]' : 'text-gray-500'}`}>
            <item.icon size={20} />
            <span className="text-[10px] font-medium truncate w-full text-center">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide pb-28">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              {currentTab === 'Yorumlar' ? <MessageSquare className="text-[#4DA3FF]" /> : <BarChart3 className="text-[#4DA3FF]" />} 
              {currentTab} Paneli
            </h2>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <Activity size={16} className="text-green-400" /> Sistem Aktif
            </div>
        </header>

        {/* İSTATİSTİKLER */}
        {currentTab !== 'Yorumlar' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                    { label: 'TOPLAM GÖNDERİ', val: total, color: 'text-white', bg: 'bg-[#121212]' },
                    { label: 'ONAY BEKLEYEN', val: pending, color: 'text-yellow-400', bg: 'bg-yellow-500/5 border-yellow-500/20' },
                    { label: 'YAYINDA OLAN', val: approved, color: 'text-green-400', bg: 'bg-green-500/5 border-green-500/20' },
                    { label: 'REDDEDİLEN', val: rejected, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/20' },
                ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} p-6 rounded-2xl border ${stat.bg.includes('border') ? stat.bg.split(' ')[1] : 'border-white/5'} transition-all hover:-translate-y-1`}>
                        <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2">{stat.label}</p>
                        <p className={`text-4xl font-black ${stat.color}`}>{stat.val}</p>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-[#121212] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20"><Heart className="text-pink-500" size={24}/></div>
                    <div>
                        <p className="text-gray-500 text-[11px] font-bold tracking-widest uppercase">Toplam Beğeni</p>
                        <p className="text-2xl font-bold text-white">{totalLikes}</p>
                    </div>
                </div>
                <div className="bg-[#121212] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20"><Eye className="text-blue-500" size={24}/></div>
                    <div>
                        <p className="text-gray-500 text-[11px] font-bold tracking-widest uppercase">Toplam Görüntülenme</p>
                        <p className="text-2xl font-bold text-white">{totalViews}</p>
                    </div>
                </div>
            </div>
          </>
        )}

        {/* LİSTELEME ALANI */}
        <div className="max-w-4xl space-y-5">
          {currentTab === 'Yorumlar' ? (
            displayComments.length === 0 ? (
               <div className="text-center py-20 bg-[#121212] rounded-3xl border border-white/5 flex flex-col items-center justify-center">
                    <div className="bg-white/5 p-4 rounded-full mb-4"><MessageSquare className="text-gray-500" size={32}/></div>
                    <p className="text-gray-400 font-medium">Sistemde henüz hiç yorum yok.</p>
               </div>
            ) : (
              displayComments.map((comment) => (
                <article key={comment.id} className="bg-[#121212] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col gap-4 shadow-lg">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">Yanıtlanan Gönderi</span>
                    <p className="text-sm text-gray-400 italic line-clamp-2">"{comment.post?.content || 'Gönderi silinmiş'}"</p>
                  </div>

                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-white">Anonim</span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(comment.createdAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      <p className="text-white text-base leading-relaxed break-words">{comment.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-2 pt-4 border-t border-white/5">
                    <form action={deleteComment} className="w-full sm:w-auto">
                      <input type="hidden" name="id" value={comment.id} />
                      <button className="w-full bg-red-500/10 text-red-400 px-6 py-2.5 rounded-xl text-xs font-bold border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center gap-2 transition-all">
                        <Trash2 size={14}/> Yorumu Sil
                      </button>
                    </form>
                  </div>
                </article>
              ))
            )
          ) : (
            displayPosts.length === 0 ? (
               <div className="text-center py-20 bg-[#121212] rounded-3xl border border-white/5 flex flex-col items-center justify-center">
                    <div className="bg-white/5 p-4 rounded-full mb-4"><Inbox className="text-gray-500" size={32}/></div>
                    <p className="text-gray-400 font-medium">Bu sekmede gösterilecek gönderi bulunmuyor.</p>
               </div>
            ) : (
              displayPosts.map((post) => (
                <article key={post.id} className="bg-[#121212] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col gap-4 shadow-lg">
                  <div className="flex flex-wrap justify-between items-center pb-4 border-b border-white/5 gap-2">
                      <div className="flex gap-2">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider ${post.type === 'CONFESSION' ? 'bg-purple-500/10 text-purple-400' : 'bg-[#4DA3FF]/10 text-[#4DA3FF]'}`}>
                              <Tag size={12}/> {post.type === 'CONFESSION' ? 'İtiraf' : 'Overheard'}
                          </span>
                          <span className="text-[11px] font-medium px-2.5 py-1 bg-white/5 rounded-md text-gray-400 flex items-center gap-1">
                              <Calendar size={12}/> {new Date(post.createdAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}
                          </span>
                      </div>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${post.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : post.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {post.status === 'PENDING' ? 'ONAY BEKLİYOR' : post.status === 'APPROVED' ? 'YAYINDA' : 'REDDEDİLDİ'}
                      </span>
                  </div>
  
                  <p className="text-white text-[16px] leading-relaxed py-2">{post.content}</p>
                  
                  <div className="flex flex-wrap justify-between items-center pt-2 gap-3">
                    <div className="flex gap-4 text-gray-500 text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Heart size={16} className={post.likes > 0 ? "text-pink-500" : ""}/> {post.likes}</span>
                        <span className="flex items-center gap-1.5"><Eye size={16} className={post.views > 0 ? "text-blue-500" : ""}/> {post.views}</span>
                    </div>
                    
                    <div className="flex gap-2 w-full flex-wrap">
                      {post.status === 'PENDING' ? (
                        <>
                          <form action={approvePost} className="flex-1 min-w-[120px]"><input type="hidden" name="id" value={post.id} /><button className="w-full bg-green-500/10 text-green-400 py-2.5 rounded-xl text-xs font-bold border border-green-500/20 hover:bg-green-500/20 flex items-center justify-center gap-2 transition-all"><Check size={14}/> Onayla</button></form>
                          <form action={rejectPost} className="flex-1 min-w-[120px]"><input type="hidden" name="id" value={post.id} /><button className="w-full bg-orange-500/10 text-orange-400 py-2.5 rounded-xl text-xs font-bold border border-orange-500/20 hover:bg-orange-500/20 flex items-center justify-center gap-2 transition-all"><X size={14}/> Reddet</button></form>
                        </>
                      ) : null}
                      <form action={deletePost} className="flex-1 min-w-[120px]"><input type="hidden" name="id" value={post.id} /><button className="w-full bg-red-500/10 text-red-400 py-2.5 rounded-xl text-xs font-bold border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center gap-2 transition-all"><Trash2 size={14}/> Sil</button></form>
                    </div>
                  </div>
                </article>
              ))
            )
          )}
        </div>
      </main>
    </div>
  );
}