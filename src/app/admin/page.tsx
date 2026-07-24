import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import Link from 'next/link';
import AdminStoryExporter from '@/components/AdminStoryExporter'; 
import AnonymousPlayer from '@/components/AnonymousPlayer'; // 🔥 Admin için ses oynatıcısı eklendi
import { 
  LayoutDashboard, Rss, Headphones, VenetianMask, Coffee,
  Inbox, Check, X, Trash2, Lock, KeyRound, LogOut,
  BarChart3, Heart, Eye, Calendar, Tag, Activity, MessageSquare, Bell, CheckCircle, XCircle, Plus, Ban, ShieldAlert, Pencil, Flag, AlertTriangle, Clock, Radio, Timer, Fingerprint, Sparkles, ExternalLink, Crown, Award, UserMinus
} from 'lucide-react';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare", "Deli", "Çılgın", "Bıkkın", "Dalgın", "Ters", "Şüpheli", "Kuşkulu", "Durgun", "Hızlı", "Yavaş", "Donuk", "Parlak", "Sinsi", "Kurnaz", "Tatlı", "Sert", "Yabani", "Yalnız", "Suskun", "Coşkulu"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek", "Tavuk", "Maymun", "Keçi", "Sincap", "Kurbağa", "Kaplan", "Koala", "Tilki", "Kurt", "Aslan", "Şahin", "Karga", "Köstebek", "Koyun", "İnek", "At", "Eşek", "Fok", "Penguen", "Kirpi", "Sazan", "Yengeç", "Ahtapot", "Kertenkele", "Koala"];

const getAuthorName = (id: string, customNickname?: string) => {
  if (customNickname) return customNickname;
  if (!id) return "Gizemli Yolcu";
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  
  return `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}`;
};

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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4DA3FF]/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10" />

        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-6 sm:p-10 rounded-[24px] sm:rounded-[32px] w-full max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#4DA3FF]/20 rounded-full blur-3xl" />
          
          <div className="flex justify-center mb-6 sm:mb-8 relative z-10">
            <div className="bg-gradient-to-tr from-[#4DA3FF]/10 to-purple-500/10 p-4 sm:p-5 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(77,163,255,0.15)]">
              <Lock className="text-[#4DA3FF] w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-2 tracking-tight">KONTROL MERKEZİ</h1>
          <p className="text-gray-400 text-center text-xs sm:text-sm mb-8 sm:mb-10 font-medium">Sisteme erişmek için yetkilendirme gerekiyor.</p>
          
          <form action={login} className="space-y-4 sm:space-y-5 relative z-10">
            <div className="relative group">
              <KeyRound className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#4DA3FF] w-4 h-4 sm:w-5 sm:h-5 transition-colors" />
              <input type="password" name="password" placeholder="Yönetici Şifresi" className="w-full bg-black/40 border border-white/10 rounded-2xl sm:rounded-[20px] py-3.5 sm:py-4 pl-12 sm:pl-14 pr-4 sm:pr-5 text-sm sm:text-base text-white outline-none focus:border-[#4DA3FF]/50 focus:bg-black/60 transition-all shadow-inner" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-[#4DA3FF] to-blue-500 hover:to-blue-400 text-black font-black py-3.5 sm:py-4 rounded-2xl sm:rounded-[20px] transition-all shadow-[0_0_20px_rgba(77,163,255,0.4)] hover:shadow-[0_0_30px_rgba(77,163,255,0.6)] hover:-translate-y-1 uppercase tracking-wider text-xs sm:text-sm">Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const currentTab = params?.tab || 'Dashboard';

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [total, pending, approved, rejected, aggregateStats, reportsCount, recentPostsCount, recentCommentsCount, recentAuthors] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PENDING' } }),
    prisma.post.count({ where: { status: 'APPROVED' } }),
    prisma.post.count({ where: { status: 'REJECTED' } }),
    prisma.post.aggregate({ _sum: { likes: true, views: true } }),
    (prisma as any).report.count(),
    prisma.post.count({ where: { createdAt: { gte: oneHourAgo } } }),
    prisma.comment.count({ where: { createdAt: { gte: oneHourAgo } } }),
    prisma.post.findMany({
      where: { createdAt: { gte: oneHourAgo } },
      select: { authorUuid: true },
      distinct: ['authorUuid']
    })
  ]);

  const totalLikes = aggregateStats._sum.likes || 0;
  const totalViews = aggregateStats._sum.views || 0;
  const activeAuthorsCount = recentAuthors.length;

  let displayPosts: any[] = [];
  let displayComments: any[] = [];
  let announcements: any[] = [];
  let countdowns: any[] = [];
  let bannedUsers: any[] = [];
  let reports: any[] = [];

  let customNicknamesDb: any[] = [];
  try { customNicknamesDb = await (prisma as any).customNickname.findMany(); } catch (e) {}
  const customNicknamesMap = customNicknamesDb.reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.nickname;
    return acc;
  }, {});

  let userBadgesDb: any[] = [];
  try { userBadgesDb = await (prisma as any).userBadge.findMany(); } catch (e) {}
  const userBadgesMap = userBadgesDb.reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.badgeName;
    return acc;
  }, {});

  const vipUserUuids = Array.from(new Set([...customNicknamesDb.map(n => n.userUuid), ...userBadgesDb.map(b => b.userUuid)]));
  const vipUsers = vipUserUuids.map(uuid => ({
    uuid,
    nickname: customNicknamesMap[uuid] || '',
    badge: userBadgesMap[uuid] || ''
  }));

  if (currentTab === 'Yorumlar') {
    displayComments = await prisma.comment.findMany({ orderBy: { createdAt: 'desc' }, include: { post: { select: { content: true, type: true } } } });
  } else if (currentTab === 'Duyurular') {
    announcements = await (prisma as any).announcement.findMany({ orderBy: { createdAt: 'desc' } });
  } else if (currentTab === 'Sayaç') {
    countdowns = await (prisma as any).countdown.findMany({ orderBy: { createdAt: 'desc' } });
  } else if (currentTab === 'Banlar') {
    bannedUsers = await (prisma as any).bannedUser.findMany({ orderBy: { createdAt: 'desc' } });
  } else if (currentTab === 'Şikayetler') {
    reports = await (prisma as any).report.findMany({ orderBy: { createdAt: 'desc' }, include: { post: true, comment: true } });
  } else if (currentTab !== 'VIP Üyeler') { 
    let queryFilter: any = { status: 'PENDING' };
    if (currentTab === 'Akış') queryFilter = { status: 'APPROVED' };
    if (currentTab === 'Overheard') queryFilter = { status: 'APPROVED', type: { in: ['OVERHEARD', 'OVERHED'] } };
    if (currentTab === 'İtiraflar') queryFilter = { status: 'APPROVED', type: 'CONFESSION' };
    if (currentTab === 'Boş Yap') queryFilter = { status: 'APPROVED', type: 'BOSYAP' };
    if (currentTab === 'Dashboard') queryFilter = { status: 'PENDING' };
    displayPosts = await prisma.post.findMany({ where: queryFilter, orderBy: { createdAt: 'desc' } });
  }
  
  async function approvePost(formData: FormData) { 
    'use server'; 
    await prisma.post.update({ 
      where: { id: formData.get('id') as string }, 
      data: { 
        status: 'APPROVED', 
        createdAt: new Date() 
      } 
    }); 
    revalidatePath('/admin'); 
    revalidatePath('/'); 
  }

  async function rejectPost(formData: FormData) { 
    'use server'; 
    await prisma.post.update({ 
      where: { id: formData.get('id') as string }, 
      data: { status: 'REJECTED' } 
    }); 
    revalidatePath('/admin'); 
    revalidatePath('/'); 
  }

  async function deletePost(formData: FormData) { 
    'use server'; 
    await prisma.post.delete({ 
      where: { id: formData.get('id') as string } 
    }); 
    revalidatePath('/admin'); 
    revalidatePath('/'); 
  }
  
  async function updatePostContent(formData: FormData) { 
    'use server'; 
    const id = formData.get('postId') as string;
    const content = formData.get('content') as string;
    const type = formData.get('type') as string;
    if (!id) return;

    const updateData: any = {};
    if (content) updateData.content = content.trim();
    if (type) updateData.type = type;

    await prisma.post.update({ where: { id }, data: updateData }); 
    revalidatePath('/admin'); 
    revalidatePath('/'); 
  }

  async function deleteComment(formData: FormData) { 
    'use server'; 
    await prisma.comment.delete({ where: { id: formData.get('id') as string } }); 
    revalidatePath('/admin'); 
  }

  async function banUser(formData: FormData) { 
    'use server'; 
    const userUuid = formData.get('userUuid') as string; 
    if (!userUuid) return; 
    try { await (prisma as any).bannedUser.create({ data: { userUuid } }); } catch (e) {} 
    revalidatePath('/admin'); 
  }

  async function unbanUser(formData: FormData) { 
    'use server'; 
    const id = formData.get('id') as string; 
    await (prisma as any).bannedUser.delete({ where: { id } }); 
    revalidatePath('/admin'); 
  }
  
  async function createAnnouncement(formData: FormData) { 
    'use server'; 
    const content = formData.get('content') as string; 
    if (!content) return; 
    await (prisma as any).announcement.create({ data: { content, isActive: true } }); 
    revalidatePath('/admin'); 
    revalidatePath('/'); 
  }

  async function toggleAnnouncement(formData: FormData) { 
    'use server'; 
    const id = formData.get('id') as string; 
    const currentState = formData.get('isActive') === 'true'; 
    await (prisma as any).announcement.update({ where: { id }, data: { isActive: !currentState } }); 
    revalidatePath('/admin'); 
    revalidatePath('/'); 
  }

  async function deleteAnnouncement(formData: FormData) { 
    'use server'; 
    await (prisma as any).announcement.delete({ where: { id: formData.get('id') as string } }); 
    revalidatePath('/admin'); 
    revalidatePath('/'); 
  }

  async function createCountdown(formData: FormData) { 
    'use server'; 
    const title = formData.get('title') as string;
    const dateStr = formData.get('targetDate') as string;
    if (!title || !dateStr) return;
    const targetDate = new Date(dateStr);
    
    await (prisma as any).countdown.updateMany({ data: { isActive: false } });
    await (prisma as any).countdown.create({ data: { title, targetDate, isActive: true } }); 
    revalidatePath('/admin'); 
    revalidatePath('/'); 
  }

  async function deleteCountdown(formData: FormData) { 
    'use server'; 
    await (prisma as any).countdown.delete({ where: { id: formData.get('id') as string } }); 
    revalidatePath('/admin'); 
    revalidatePath('/'); 
  }

  async function dismissReport(formData: FormData) { 
    'use server'; 
    await (prisma as any).report.delete({ where: { id: formData.get('id') as string } }); 
    revalidatePath('/admin'); 
  }

  async function logout() { 
    'use server'; 
    (await cookies()).delete('admin_auth'); 
    revalidatePath('/admin'); 
  }

  async function updateUserMeta(formData: FormData) {
    'use server';
    const userUuid = formData.get('userUuid') as string;
    const nickname = formData.get('nickname') as string;
    const badge = formData.get('badge') as string;

    if (!userUuid) return;

    if (!nickname.trim()) {
      await (prisma as any).customNickname.deleteMany({ where: { userUuid } });
    } else {
      const existingNick = await (prisma as any).customNickname.findUnique({ where: { userUuid } });
      if (existingNick) {
        await (prisma as any).customNickname.update({ where: { userUuid }, data: { nickname: nickname.trim() } });
      } else {
        await (prisma as any).customNickname.create({ data: { userUuid, nickname: nickname.trim() } });
      }
    }

    if (!badge.trim()) {
      await (prisma as any).userBadge.deleteMany({ where: { userUuid } });
    } else {
      const existingBadge = await (prisma as any).userBadge.findUnique({ where: { userUuid } });
      if (existingBadge) {
        await (prisma as any).userBadge.update({ where: { userUuid }, data: { badgeName: badge.trim() } });
      } else {
        await (prisma as any).userBadge.create({ data: { userUuid, badgeName: badge.trim() } });
      }
    }
    
    revalidatePath('/admin');
    revalidatePath('/');
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' }, 
    { icon: Rss, label: 'Akış' }, 
    { icon: Crown, label: 'VIP Üyeler' }, 
    { icon: Headphones, label: 'Overheard' }, 
    { icon: VenetianMask, label: 'İtiraflar' }, 
    { icon: Coffee, label: 'Boş Yap' }, 
    { icon: Inbox, label: 'Bekleyenler', badge: pending },
    { icon: MessageSquare, label: 'Yorumlar' },
    { icon: Flag, label: 'Şikayetler', badge: reportsCount },
    { icon: Bell, label: 'Duyurular' },
    { icon: Timer, label: 'Sayaç' },
    { icon: Ban, label: 'Banlar' }
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white relative z-0 overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-[#4DA3FF]/10 blur-[100px] sm:blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[10%] right-[-10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-purple-600/10 blur-[100px] sm:blur-[150px] pointer-events-none -z-10" />

      <aside className="w-72 bg-[#0B0B0B]/80 backdrop-blur-3xl border-r border-white/5 p-6 hidden lg:flex flex-col relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <h1 className="text-2xl font-black mb-10 tracking-tighter">TNKU<span className="text-[#4DA3FF]">ADMIN</span></h1>
        <nav className="space-y-1.5 flex-1 overflow-y-auto scrollbar-hide pr-2">
          {menuItems.map((item, i) => (
            <Link href={`/admin?tab=${item.label}`} key={i} className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${currentTab === item.label ? 'bg-white/[0.06] text-white border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.02)]' : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/[0.03]'}`}>
              <div className="flex items-center gap-3.5">
                <item.icon size={18} className={`transition-colors ${currentTab === item.label ? (item.label === 'VIP Üyeler' ? 'text-yellow-400' : 'text-[#4DA3FF]') : 'text-gray-500 group-hover:text-gray-300'}`} /> 
                <span className={`font-semibold tracking-wide text-sm ${currentTab === item.label ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 ? (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.label === 'Şikayetler' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-[#4DA3FF]/20 text-[#4DA3FF] border border-[#4DA3FF]/20'}`}>{item.badge}</span>
              ) : null}
            </Link>
          ))}
        </nav>
        <form action={logout} className="mt-6">
          <button className="w-full flex items-center justify-center gap-2 text-red-400 font-bold py-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all">
            <LogOut size={18} /> Sistemi Kapat
          </button>
        </form>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0B0B0B]/90 backdrop-blur-3xl border-t border-white/10 px-2 py-2 flex justify-start z-50 overflow-x-auto gap-1 sm:gap-2 scrollbar-hide shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        {menuItems.map((item, i) => (
          <Link href={`/admin?tab=${item.label}`} key={i} className={`flex flex-col items-center justify-center gap-1 min-w-[64px] sm:min-w-[72px] px-1 py-2 rounded-2xl transition-all relative ${currentTab === item.label ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <item.icon size={18} className={currentTab === item.label && item.label === 'VIP Üyeler' ? 'text-yellow-400' : currentTab === item.label ? 'text-[#4DA3FF]' : ''} />
            {item.badge !== undefined && item.badge > 0 && (
              <span className={`absolute top-0 right-2 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black ${item.label === 'Şikayetler' ? 'bg-red-500 text-white' : 'bg-[#4DA3FF] text-black'}`}>{item.badge}</span>
            )}
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wide truncate w-full text-center">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-12 scrollbar-hide pb-24 lg:pb-12 relative z-10">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-white/5 gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold flex items-center gap-3 sm:gap-4 tracking-tight">
              <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border ${currentTab === 'Yorumlar' ? 'bg-blue-500/10 border-blue-500/20' : currentTab === 'VIP Üyeler' ? 'bg-yellow-500/10 border-yellow-500/20' : currentTab === 'Duyurular' ? 'bg-[#4DA3FF]/10 border-[#4DA3FF]/20' : currentTab === 'Sayaç' ? 'bg-red-500/10 border-red-500/20' : currentTab === 'Banlar' ? 'bg-red-500/10 border-red-500/20' : currentTab === 'Şikayetler' ? 'bg-red-500/10 border-red-500/20' : 'bg-[#4DA3FF]/10 border-[#4DA3FF]/20'}`}>
                {currentTab === 'Yorumlar' ? <MessageSquare className="text-blue-400 w-5 h-5 sm:w-6 sm:h-6" /> : currentTab === 'VIP Üyeler' ? <Crown className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" /> : currentTab === 'Duyurular' ? <Bell className="text-[#4DA3FF] w-5 h-5 sm:w-6 sm:h-6" /> : currentTab === 'Sayaç' ? <Timer className="text-red-400 w-5 h-5 sm:w-6 sm:h-6" /> : currentTab === 'Banlar' ? <Ban className="text-red-400 w-5 h-5 sm:w-6 sm:h-6" /> : currentTab === 'Şikayetler' ? <Flag className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" /> : <BarChart3 className="text-[#4DA3FF] w-5 h-5 sm:w-6 sm:h-6" />} 
              </div>
              {currentTab} Paneli
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-green-400 bg-green-500/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)] self-start md:self-auto">
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-green-500"></span>
                </span>
                Sistem Aktif
            </div>
        </header>

        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          
          {currentTab !== 'Yorumlar' && currentTab !== 'VIP Üyeler' && currentTab !== 'Duyurular' && currentTab !== 'Sayaç' && currentTab !== 'Banlar' && currentTab !== 'Şikayetler' && (
            <>
              <div className="bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[32px] border border-white/5 shadow-2xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 sm:gap-8 mb-6 sm:mb-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-green-500/5 rounded-full blur-3xl -z-10 group-hover:bg-green-500/10 transition-colors duration-700" />
                 
                <div className="flex items-center gap-4 sm:gap-5 w-full xl:w-auto">
                  <div className="relative flex items-center justify-center p-3 sm:p-4 bg-green-500/10 rounded-xl sm:rounded-2xl border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.15)] shrink-0">
                    <Radio className="text-green-400 relative z-10 w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                      <h3 className="text-white font-extrabold text-base sm:text-lg md:text-xl">Canlı Kampüs Nabzı</h3>
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-green-500/20 text-green-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-green-500/30">Son 1 Saat</span>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium leading-snug">Değirmenaltı'nda anlık hareketlilik ve okuyucu aktivitesi.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full xl:w-auto">
                  <div className="bg-black/30 backdrop-blur-md px-3 py-2 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl border border-white/5 text-center shadow-inner">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Yeni Post</p>
                    <p className="text-xl sm:text-2xl font-black text-green-400">{recentPostsCount}</p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-md px-3 py-2 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl border border-white/5 text-center shadow-inner">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Yeni Yorum</p>
                    <p className="text-xl sm:text-2xl font-black text-[#4DA3FF]">{recentCommentsCount}</p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-md px-3 py-2 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl border border-white/5 text-center shadow-inner">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Aktif Yazar</p>
                    <p className="text-xl sm:text-2xl font-black text-purple-400">{activeAuthorsCount}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
                  {[
                      { label: 'TOPLAM GÖNDERİ', val: total, color: 'text-white', bg: 'bg-white/[0.02]', border: 'border-white/5' },
                      { label: 'ONAY BEKLİYOR', val: pending, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
                      { label: 'YAYINDA OLAN', val: approved, color: 'text-green-400', bg: 'bg-green-500/5', border: 'border-green-500/20' },
                      { label: 'REDDEDİLEN', val: rejected, color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20' },
                  ].map((stat, i) => (
                      <div key={i} className={`${stat.bg} ${stat.border} p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[24px] border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                        <p className="text-gray-500 text-[9px] sm:text-[11px] font-black tracking-widest uppercase mb-1.5 sm:mb-3">{stat.label}</p>
                        <p className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter ${stat.color}`}>{stat.val}</p>
                      </div>
                  ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-8 sm:mb-12">
                  <div className="bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[24px] border border-white/5 flex flex-row items-center gap-4 sm:gap-6 shadow-lg">
                      <div className="p-3 sm:p-4 bg-pink-500/10 rounded-xl sm:rounded-2xl border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.15)]"><Heart className="text-pink-400 w-6 h-6 sm:w-8 sm:h-8"/></div>
                      <div>
                          <p className="text-gray-500 text-[10px] sm:text-[11px] font-black tracking-widest uppercase mb-0.5 sm:mb-1">Toplam Beğeni</p>
                          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">{totalLikes}</p>
                      </div>
                  </div>
                  <div className="bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[24px] border border-white/5 flex flex-row items-center gap-4 sm:gap-6 shadow-lg">
                      <div className="p-3 sm:p-4 bg-[#4DA3FF]/10 rounded-xl sm:rounded-2xl border border-[#4DA3FF]/20 shadow-[0_0_20px_rgba(77,163,255,0.15)]"><Eye className="text-[#4DA3FF] w-6 h-6 sm:w-8 sm:h-8"/></div>
                      <div>
                          <p className="text-gray-500 text-[10px] sm:text-[11px] font-black tracking-widest uppercase mb-0.5 sm:mb-1">Toplam Görüntülenme</p>
                          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">{totalViews}</p>
                      </div>
                  </div>
              </div>
            </>
          )}

          <div className="space-y-4 sm:space-y-6">
             
            {currentTab === 'VIP Üyeler' ? (
              <div className="space-y-6 sm:space-y-8">
                 
                <form action={updateUserMeta} className="bg-white/[0.02] backdrop-blur-xl p-5 sm:p-8 rounded-[20px] sm:rounded-[32px] border border-yellow-500/20 space-y-4 sm:space-y-5 shadow-[0_10px_40px_rgba(234,179,8,0.05)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-yellow-500/10 blur-3xl rounded-full -z-10 group-hover:bg-yellow-500/20 transition-colors duration-700" />
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 sm:gap-3 tracking-wide"><div className="p-2 sm:p-2.5 bg-yellow-500/10 rounded-lg sm:rounded-xl border border-yellow-500/30"><Award className="text-yellow-400 w-4 h-4 sm:w-5 sm:h-5"/></div> Yeni VIP Ekle / Rozet Ver</h3>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium mb-2">Kullanıcının UUID'sini buraya yapıştırıp ona doğrudan özel nick ve rozet atayabilirsin.</p>
                   
                  <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
                    <div className="lg:col-span-3">
                      <label className="text-[10px] sm:text-[11px] text-gray-400 block mb-1.5 font-black uppercase tracking-widest">Kullanıcı UUID (Kimlik)</label>
                      <input type="text" name="userUuid" required placeholder="Örn: clxj12345..." className="w-full bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-white outline-none focus:border-yellow-400 focus:bg-black/60 transition-all shadow-inner font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-[11px] text-gray-400 block mb-1.5 font-black uppercase tracking-widest">Özel Nickname</label>
                      <input type="text" name="nickname" placeholder="Örn: Sitenin Sahibi" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-white outline-none focus:border-yellow-400 focus:bg-black/60 transition-all shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-[11px] text-gray-400 block mb-1.5 font-black uppercase tracking-widest">Rozet</label>
                      <input type="text" name="badge" placeholder="Örn: 👑 Yönetici" className="w-full bg-black/40 border border-yellow-500/10 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-yellow-400 placeholder-yellow-700/50 outline-none focus:border-yellow-400 focus:bg-black/60 transition-all shadow-inner" />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full justify-center bg-gradient-to-r from-yellow-500 to-amber-500 hover:to-amber-400 text-black font-black uppercase tracking-widest px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-[10px] sm:text-xs transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.4)]"><Crown size={16}/> Ayrıcalık Tanımla</button>
                    </div>
                  </div>
                </form>

                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">Mevcut VIP Üyeler <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-md text-xs border border-yellow-500/30">{vipUsers.length}</span></h3>
                  </div>

                  {vipUsers.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-white/[0.01] rounded-[20px] sm:rounded-[32px] border border-dashed border-white/10 text-gray-500 text-sm sm:text-base font-medium">Sistemde henüz hiç VIP üye yok. Çok fakiriz!</div>
                  ) : (
                    <div className="grid gap-4 sm:gap-6">
                      {vipUsers.map((user, idx) => (
                      <div key={idx} className="bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] border border-white/5 flex flex-col md:flex-row gap-4 sm:gap-6 md:items-center justify-between shadow-lg">
                          
                        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 p-[2px] shrink-0">
                            <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center">
                              <Crown className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2 flex-wrap">
                              {user.nickname ? <span className="font-extrabold text-white text-sm sm:text-base">{user.nickname}</span> : <span className="font-extrabold text-gray-500 italic text-sm sm:text-base">Nick Yok</span>}
                              {user.badge && <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full">{user.badge}</span>}
                            </div>
                            <code className="text-[10px] sm:text-xs text-gray-500 font-mono mt-1 block truncate">UUID: {user.uuid}</code>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                          <form action={updateUserMeta} className="flex gap-2 w-full sm:w-auto">
                            <input type="hidden" name="userUuid" value={user.uuid} />
                            <input type="hidden" name="nickname" value="" />
                            <input type="hidden" name="badge" value="" />
                            <button type="submit" className="w-full sm:w-auto justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-4 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"><UserMinus size={14}/> Yetkileri Al</button>
                          </form>
                        </div>

                      </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            ) : currentTab === 'Yorumlar' ? (
              displayComments.map((comment) => (
                <article key={comment.id} className="bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[24px] border border-white/5 flex flex-col gap-4 sm:gap-5 shadow-xl hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1">
                      <div className="bg-white/[0.03] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 mb-3 sm:mb-4">
                        <p className="text-gray-400 text-[11px] sm:text-xs italic mb-1.5 sm:mb-2">"{comment.post.content.substring(0, 80)}..." gönderisine yorum yaptı:</p>
                        <p className="text-white text-base sm:text-lg leading-relaxed font-medium">{comment.content}</p>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-500 bg-black/40 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg">{new Date(comment.createdAt).toLocaleString('tr-TR')}</span>
                    </div>
                  </div>

                  <div className="bg-black/30 border border-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
                      <div className="p-2 sm:p-2.5 bg-white/5 rounded-lg sm:rounded-xl border border-white/5 shrink-0"><Fingerprint className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" /></div>
                      <div className="overflow-hidden w-full">
                        <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-0.5">Yazar Kimliği (UUID)</span>
                        <code className="text-[10px] sm:text-xs text-white/90 font-mono bg-black/50 px-2 py-1 rounded-md block truncate">{comment.authorId || 'Bilinmiyor'}</code>
                      </div>
                    </div>
                      
                    {comment.authorId && (
                      <form action={updateUserMeta} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
                        <input type="hidden" name="userUuid" value={comment.authorId} />
                        <input type="text" name="nickname" defaultValue={customNicknamesMap[comment.authorId] || ''} placeholder="Nick (Örn: Kral)" className="bg-black/50 border border-white/10 text-xs sm:text-sm text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl focus:border-[#4DA3FF] outline-none w-full sm:w-32 lg:w-36 transition-colors shadow-inner" />
                        <input type="text" name="badge" defaultValue={userBadgesMap[comment.authorId] || ''} placeholder="Rozet (Örn: 👑 VIP)" className="bg-yellow-500/5 border border-yellow-500/20 text-xs sm:text-sm text-yellow-400 placeholder-yellow-700/50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl focus:border-yellow-500 focus:bg-yellow-500/10 outline-none w-full sm:w-36 lg:w-40 transition-colors shadow-inner" />
                        <button type="submit" className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-pink-300 border border-pink-500/30 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:from-purple-600/30 hover:to-pink-600/30 transition-all shrink-0 w-full sm:w-auto text-center">Kaydet</button>
                      </form>
                    )}
                  </div>
                    
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-3">
                      {comment.authorId && (
                        <form action={banUser} className="w-full sm:w-auto"><input type="hidden" name="userUuid" value={comment.authorId} /><button className="w-full sm:w-auto justify-center bg-red-500/10 text-red-400 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-red-500/20 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center gap-1.5 sm:gap-2 transition-all"><Ban size={14}/> Yazarı Banla</button></form>
                      )}
                      <form action={deleteComment} className="w-full sm:w-auto"><input type="hidden" name="id" value={comment.id} /><button className="w-full sm:w-auto justify-center bg-white/5 text-gray-300 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-white/10 hover:bg-white/10 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-all"><Trash2 size={14}/> Yorumu Sil</button></form>
                  </div>
                </article>
              ))
            ) : currentTab === 'Duyurular' ? (
              <div className="space-y-6 sm:space-y-8">
                <form action={createAnnouncement} className="bg-white/[0.02] backdrop-blur-xl p-5 sm:p-8 rounded-[20px] sm:rounded-[32px] border border-white/5 space-y-4 sm:space-y-5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-[#4DA3FF]/10 blur-3xl rounded-full -z-10" />
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 sm:gap-3 tracking-wide"><div className="p-2 sm:p-2.5 bg-[#4DA3FF]/10 rounded-lg sm:rounded-xl border border-[#4DA3FF]/20"><Bell className="text-[#4DA3FF] w-4 h-4 sm:w-5 sm:h-5"/></div> Yeni Duyuru Fırlat</h3>
                  <textarea name="content" required placeholder="Kampüse duyurulacak efsane metin..." className="w-full bg-black/40 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-white outline-none focus:border-[#4DA3FF] focus:bg-black/60 resize-none h-24 sm:h-32 shadow-inner transition-all"></textarea>
                  <button type="submit" className="w-full sm:w-auto justify-center bg-[#4DA3FF] text-black font-black uppercase tracking-widest px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-[10px] sm:text-xs hover:bg-[#3b8ce0] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(77,163,255,0.4)]"><Plus size={16}/> Yayına Al</button>
                </form>

                <div className="space-y-3 sm:space-y-4">
                  {announcements.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-white/[0.01] rounded-[20px] sm:rounded-[32px] border border-dashed border-white/10 text-gray-500 text-sm sm:text-base font-medium">Buralar sessiz. Aktif duyuru bulunmuyor.</div>
                  ) : (
                    announcements.map((item: any) => (
                      <div key={item.id} className="bg-white/[0.02] backdrop-blur-md p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5 shadow-lg">
                        <div>
                          <p className="text-white text-sm sm:text-base font-medium mb-1.5 sm:mb-2">{item.content}</p>
                          <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 bg-black/30 px-2 sm:px-3 py-1 rounded-md">{new Date(item.createdAt).toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                          <form action={toggleAnnouncement} className="flex-1 sm:flex-none">
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="isActive" value={item.isActive.toString()} />
                            <button className={`w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border transition-all ${item.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                              {item.isActive ? 'Aktif 🟢' : 'Pasif ⚪'}
                            </button>
                          </form>
                          <form action={deleteAnnouncement}>
                            <input type="hidden" name="id" value={item.id} />
                            <button className="w-full flex justify-center bg-red-500/10 text-red-400 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5"/></button>
                          </form>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : currentTab === 'Sayaç' ? (
              <div className="space-y-6 sm:space-y-8">
                <form action={createCountdown} className="bg-white/[0.02] backdrop-blur-xl p-5 sm:p-8 rounded-[20px] sm:rounded-[32px] border border-white/5 space-y-4 sm:space-y-5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-red-500/10 blur-3xl rounded-full -z-10" />
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 sm:gap-3 tracking-wide"><div className="p-2 sm:p-2.5 bg-red-500/10 rounded-lg sm:rounded-xl border border-red-500/20"><Timer className="text-red-400 w-4 h-4 sm:w-5 sm:h-5"/></div> Yeni Geri Sayım Kur</h3>
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="text-[10px] sm:text-[11px] text-gray-400 block mb-1.5 sm:mb-2 font-black uppercase tracking-widest">Başlık / Etkinlik Adı</label>
                      <input type="text" name="title" required placeholder="Örn: Vize Haftası Başlıyor 📚" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-white outline-none focus:border-red-400 focus:bg-black/60 transition-all shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-[11px] text-gray-400 block mb-1.5 sm:mb-2 font-black uppercase tracking-widest">Hedef Tarih ve Saat</label>
                      <input type="datetime-local" name="targetDate" required className="w-full bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-white outline-none focus:border-red-400 focus:bg-black/60 transition-all shadow-inner [color-scheme:dark]" />
                    </div>
                  </div>
                  <button type="submit" className="w-full sm:w-auto justify-center bg-gradient-to-r from-red-500 to-orange-500 hover:to-orange-400 text-black font-black uppercase tracking-widest px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-[10px] sm:text-xs transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]"><Plus size={16}/> Sayacı Fırlat</button>
                </form>

                <div className="space-y-3 sm:space-y-4">
                  {countdowns.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-white/[0.01] rounded-[20px] sm:rounded-[32px] border border-dashed border-white/10 text-gray-500 text-sm sm:text-base font-medium">Kayıtlı geri sayım bulunmuyor. Rahatız!</div>
                  ) : (
                    countdowns.map((item: any) => (
                      <div key={item.id} className="bg-white/[0.02] backdrop-blur-md p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5 shadow-lg">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                            <h4 className="text-white text-base sm:text-lg font-black">{item.title}</h4>
                            {item.isActive && <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.2)] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span> Yayında</span>}
                          </div>
                          <p className="text-[11px] sm:text-xs font-semibold text-gray-500 bg-black/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg inline-block border border-white/5">Hedef: {new Date(item.targetDate).toLocaleString('tr-TR')}</p>
                        </div>
                        <form action={deleteCountdown} className="w-full sm:w-auto">
                          <input type="hidden" name="id" value={item.id} />
                          <button className="w-full sm:w-auto bg-red-500/10 text-red-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 font-bold text-[10px] sm:text-xs uppercase"><Trash2 size={14}/> Kaldır</button>
                        </form>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : currentTab === 'Banlar' ? (
              <div className="space-y-6">
                <div className="bg-white/[0.02] backdrop-blur-xl p-5 sm:p-8 rounded-[20px] sm:rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-red-600/10 blur-3xl rounded-full -z-10" />
                  <h3 className="text-lg sm:text-xl font-black text-white mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 tracking-wide"><div className="p-2 sm:p-2.5 bg-red-500/10 rounded-lg sm:rounded-xl border border-red-500/20"><Ban className="text-red-400 w-4 h-4 sm:w-5 sm:h-5"/></div> Engellenen Yazarlar <span className="text-xs sm:text-sm text-red-400 bg-red-500/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-red-500/20">{bannedUsers.length}</span></h3>
                   
                  {bannedUsers.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm font-medium py-8 sm:py-10 bg-black/30 rounded-xl sm:rounded-2xl border border-dashed border-white/10">Sistemde hiç banlı kullanıcı bulunmuyor. Herkes uslu!</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {bannedUsers.map((item: any) => (
                        <div key={item.id} className="bg-black/40 border border-red-500/10 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col gap-3 sm:gap-4 shadow-inner">
                          <div className="overflow-hidden">
                            <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Yazar UUID (Parmak İzi)</span>
                            <code className="text-xs sm:text-sm text-red-300 font-mono bg-red-500/5 px-2 sm:px-2.5 py-1 rounded-lg border border-red-500/10 block truncate">{item.userUuid}</code>
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 block mt-1.5 sm:mt-2">Ban Tarihi: {new Date(item.createdAt).toLocaleString('tr-TR')}</span>
                          </div>
                          <form action={unbanUser}>
                            <input type="hidden" name="id" value={item.id} />
                            <button className="w-full bg-green-500/10 text-green-400 border border-green-500/20 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-green-500/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] transition-all">Banı Kaldır / Affet</button>
                          </form>
                        </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : currentTab === 'Şikayetler' ? (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl font-black text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 tracking-wide"><div className="p-2 sm:p-3 bg-red-500/10 rounded-xl sm:rounded-2xl border border-red-500/20"><Flag className="text-red-500 w-5 h-5 sm:w-6 sm:h-6"/></div> Bildirilen İçerikler <span className="text-xs sm:text-sm text-red-400 bg-red-500/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-red-500/20">{reports.length}</span></h3>
                 
                {reports.length === 0 ? (
                  <div className="text-center py-16 sm:py-20 bg-white/[0.01] rounded-[20px] sm:rounded-[32px] border border-dashed border-white/10 text-gray-500 font-medium text-sm sm:text-lg">Şikayet edilen içerik bulunmuyor. Kampüs tertemiz! 🎉</div>
                ) : (
                  reports.map((report: any) => (
                    <div key={report.id} className="bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[32px] border border-red-500/20 space-y-4 sm:space-y-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-red-600/10 blur-3xl rounded-full -z-10" />
                       
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/5 pb-3 sm:pb-4">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.15)] flex items-center gap-1.5">
                            <AlertTriangle size={12} className="sm:w-[14px] sm:h-[14px]"/> {report.reason}
                          </span>
                          <span className="text-[10px] sm:text-xs font-bold text-gray-500 bg-black/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg">{new Date(report.createdAt).toLocaleString('tr-TR')}</span>
                        </div>
                        <form action={dismissReport} className="w-full sm:w-auto">
                          <input type="hidden" name="id" value={report.id} />
                          <button className="w-full sm:w-auto bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-white/10 transition-colors">Asılsız / Şikayeti Gizle</button>
                        </form>
                      </div>

                      {report.post && (
                        <div className="bg-black/40 border border-white/5 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-inner relative">
                          <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2 sm:mb-3 border-b border-white/5 pb-1.5 sm:pb-2">🎯 Şikayet Edilen Gönderi</span>
                          <p className="text-white text-sm sm:text-base leading-relaxed font-medium">{report.post.content}</p>
                          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/5">
                            <form action={deletePost} className="w-full"><input type="hidden" name="id" value={report.post.id} /><button className="w-full justify-center bg-red-500/10 text-red-400 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-red-500/20 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center gap-1.5 sm:gap-2 transition-all"><Trash2 size={14}/> Postu Kalıcı Sil</button></form>
                          </div>
                        </div>
                      )}

                      {report.comment && (
                        <div className="bg-black/40 border border-white/5 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-inner relative">
                          <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2 sm:mb-3 border-b border-white/5 pb-1.5 sm:pb-2">💬 Şikayet Edilen Yorum</span>
                          <p className="text-white text-sm sm:text-base leading-relaxed font-medium">{report.comment.content}</p>
                          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/5">
                            <form action={deleteComment} className="w-full"><input type="hidden" name="id" value={report.comment.id} /><button className="w-full justify-center bg-red-500/10 text-red-400 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-red-500/20 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center gap-1.5 sm:gap-2 transition-all"><Trash2 size={14}/> Yorumu Kalıcı Sil</button></form>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              displayPosts.length === 0 ? (
                <div className="text-center py-16 sm:py-24 bg-white/[0.01] rounded-[20px] sm:rounded-[32px] border border-dashed border-white/10 flex flex-col items-center justify-center px-4">
                  <div className="bg-white/5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl mb-4 sm:mb-5 border border-white/5 shadow-inner"><Inbox className="text-gray-500 w-8 h-8 sm:w-10 sm:h-10"/></div>
                  <p className="text-gray-400 font-bold text-sm sm:text-lg tracking-wide text-center">Bu sekmede gösterilecek gönderi bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6">
                  {displayPosts.map((post) => {
                    const isEphemeral = !!post.expiresAt;
                    const isConfession = post.type === 'CONFESSION';
                    const isBosYap = post.type === 'BOSYAP';

                    const cardGlow = isEphemeral ? 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)] bg-amber-500/[0.02]' 
                      : post.status === 'PENDING' ? 'border-orange-500/40 hover:border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.1)] bg-orange-500/[0.03] animate-[pulse_4s_ease-in-out_infinite]'
                      : isConfession ? 'border-purple-500/20 hover:border-purple-500/40 bg-white/[0.02]'
                      : isBosYap ? 'border-emerald-500/20 hover:border-emerald-500/40 bg-white/[0.02]'
                      : 'border-white/10 hover:border-white/20 bg-white/[0.02]';

                    const finalAuthorName = getAuthorName(post.authorUuid || post.id, customNicknamesMap[post.authorUuid]);

                    return (
                      <article key={post.id} className={`${cardGlow} p-4 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[32px] border backdrop-blur-xl transition-all duration-300 flex flex-col gap-4 sm:gap-5 hover:shadow-2xl relative overflow-hidden group/post`}>
                        {isEphemeral && <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-amber-500/10 blur-3xl rounded-full -z-10" />}
                         
                        <div className="flex flex-wrap justify-between items-center pb-3 sm:pb-5 border-b border-white/5 gap-2 sm:gap-3">
                          <div className="flex flex-wrap gap-2 items-center">
                            {isEphemeral ? (
                              <span className="text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg flex items-center gap-1 sm:gap-1.5 uppercase tracking-widest bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.2)]"><Clock size={10} className="sm:w-3 sm:h-3"/> 24s {isConfession ? 'İtiraf' : 'Fısıltı'} ⏳</span>
                            ) : (
                              <span className={`text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg flex items-center gap-1 sm:gap-1.5 uppercase tracking-widest border ${
                                isConfession ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                : isBosYap ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-[#4DA3FF]/10 text-[#4DA3FF] border-[#4DA3FF]/20'
                              }`}>
                                <Tag size={10} className="sm:w-3 sm:h-3"/> {isConfession ? 'İtiraf' : isBosYap ? 'Boş Yap' : 'Overheard'}
                              </span>
                            )}
                            <span className="text-[9px] sm:text-[11px] font-bold px-2 sm:px-3 py-1 sm:py-1.5 bg-black/40 rounded-md sm:rounded-lg text-gray-400 border border-white/5 flex items-center gap-1 sm:gap-1.5"><Calendar size={10} className="sm:w-3 sm:h-3"/> {new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <span className={`text-[9px] sm:text-[10px] font-black px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-widest border ${post.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.3)] animate-pulse' : post.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {post.status === 'PENDING' ? '🔥 BEKLİYOR' : post.status === 'APPROVED' ? 'YAYINDA' : 'RED'}
                          </span>
                        </div>
   
                        <details className="group/edit relative z-10">
                          <summary className="list-none cursor-pointer">
                            <div className="flex justify-between items-start gap-4">
                              <p className="text-white text-base sm:text-lg leading-relaxed py-1 sm:py-2 font-medium break-words flex-1">{post.content}</p>
                              <span className="shrink-0 text-xs text-[#4DA3FF] hover:underline flex items-center gap-1 bg-[#4DA3FF]/10 px-3 py-1.5 rounded-xl border border-[#4DA3FF]/20 font-bold"><Pencil size={12}/> Düzenle</span>
                            </div>
                          </summary>
                          <form action={updatePostContent} className="mt-4 pt-4 border-t border-white/10 space-y-4 bg-black/40 p-4 sm:p-5 rounded-2xl border border-white/5">
                            <input type="hidden" name="postId" value={post.id} />
                            <div>
                              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Gönderi Metni</label>
                              <textarea name="content" defaultValue={post.content} className="w-full bg-black/60 border border-white/15 rounded-xl p-3.5 text-sm text-white outline-none focus:border-[#4DA3FF] resize-none h-28 shadow-inner"></textarea>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-300 font-extrabold uppercase tracking-wider">Kategori Seç:</label>
                                <select name="type" defaultValue={post.type} className="bg-black border border-[#4DA3FF]/50 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-[#4DA3FF] font-bold cursor-pointer">
                                  <option value="OVERHEARD">🎧 Overheard</option>
                                  <option value="CONFESSION">🎭 İtiraf</option>
                                  <option value="BOSYAP">☕ Boş Yap</option>
                                </select>
                              </div>
                              <button type="submit" className="bg-[#4DA3FF] hover:bg-[#3b8fd8] text-black font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(77,163,255,0.3)]">Değişiklikleri Kaydet</button>
                            </div>
                          </form>
                        </details>

                        {/* 🔥 ADMIN PANELİNDE SESİ DİNLEME ALANI */}
                        {post.audioUrl && (
                          <div className="my-2">
                            <AnonymousPlayer audioUrl={post.audioUrl} />
                          </div>
                        )}

                        <div className="bg-black/30 border border-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col xl:flex-row gap-3 sm:gap-4 items-start xl:items-center justify-between shadow-inner w-full relative z-10">
                          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
                            <div className="p-2 sm:p-2.5 bg-white/5 rounded-lg sm:rounded-xl border border-white/5 shrink-0"><Fingerprint className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" /></div>
                            <div className="overflow-hidden w-full">
                              <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-0.5">Yazar Kimliği (UUID)</span>
                              <code className="text-[10px] sm:text-xs text-white/90 font-mono bg-black/50 px-2 py-1 rounded-md border border-white/5 block truncate">{post.authorUuid || 'Bilinmiyor'}</code>
                            </div>
                          </div>
                           
                          {post.authorUuid && (
                            <form action={updateUserMeta} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full xl:w-auto">
                              <input type="hidden" name="userUuid" value={post.authorUuid} />
                              <input type="text" name="nickname" defaultValue={customNicknamesMap[post.authorUuid] || ''} placeholder="Nick (Örn: Kral)" className="bg-black/50 border border-white/10 text-xs sm:text-sm text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl focus:border-[#4DA3FF] outline-none w-full sm:w-32 lg:w-36 transition-colors shadow-inner" />
                              <input type="text" name="badge" defaultValue={userBadgesMap[post.authorUuid] || ''} placeholder="Rozet (Örn: 👑 VIP)" className="bg-yellow-500/5 border border-yellow-500/20 text-xs sm:text-sm text-yellow-400 placeholder-yellow-700/50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl focus:border-yellow-500 focus:bg-yellow-500/10 outline-none w-full sm:w-36 lg:w-40 transition-colors shadow-inner" />
                              <button type="submit" className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-pink-300 border border-pink-500/30 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:from-purple-600/30 hover:to-pink-600/30 transition-all shrink-0 w-full sm:w-auto text-center">Kaydet</button>
                            </form>
                          )}
                        </div>
                         
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full justify-between items-stretch sm:items-center pt-3 sm:pt-4 border-t border-white/5 mt-1 relative z-10">
                            <AdminStoryExporter 
                              postContent={post.content} 
                              postType={post.type} 
                              authorName={finalAuthorName} 
                            />

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap sm:justify-end w-full sm:w-auto">
                                {post.status === 'PENDING' ? (
                                  <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 w-full sm:w-auto">
                                    <form action={approvePost} className="w-full sm:w-auto">
                                      <input type="hidden" name="id" value={post.id} />
                                      <button className="w-full justify-center bg-green-500/20 text-green-400 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-green-500/40 flex gap-1.5 sm:gap-2 hover:bg-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all"><Check size={16} className="sm:w-4 sm:h-4"/> Onayla Yolla</button>
                                    </form>
                                    <form action={rejectPost} className="w-full sm:w-auto">
                                      <input type="hidden" name="id" value={post.id} />
                                      <button className="w-full justify-center bg-orange-500/10 text-orange-400 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-orange-500/20 flex gap-1.5 sm:gap-2 hover:bg-orange-500/20 transition-all"><X size={14} className="sm:w-4 sm:h-4"/> Çöpe At</button>
                                    </form>
                                  </div>
                                ) : null}
                                <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                  <form action={banUser} className="w-full sm:w-auto">
                                    <input type="hidden" name="userUuid" value={post.authorUuid || 'bilinmiyor'} />
                                    <button className="w-full justify-center bg-red-500/10 text-red-400 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-red-500/20 flex gap-1.5 sm:gap-2 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all"><Ban size={14} className="sm:w-4 sm:h-4"/> Banla</button>
                                  </form>
                                  <form action={deletePost} className="w-full sm:w-auto">
                                    <input type="hidden" name="id" value={post.id} />
                                    <button className="w-full justify-center bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-white/10 flex gap-1.5 sm:gap-2 transition-all"><Trash2 size={14} className="sm:w-4 sm:h-4"/> Sil</button>
                                  </form>
                                </div>
                            </div>
                        </div>
                      </article>
                      );
                    })}
                  </div>
                )
              )}
          </div>
        </div>
      </main>
    </div>
  );
}