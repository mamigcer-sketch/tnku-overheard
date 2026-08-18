import prisma from '@/lib/prisma';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowLeft, Trophy, Flame, Crown, ChevronRight, Sparkles, CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare", "Deli", "Çılgın", "Bıkkın", "Dalgın", "Ters", "Şüpheli", "Kuşkulu", "Durgun", "Hızlı", "Yavaş", "Donuk", "Parlak", "Sinsi", "Kurnaz", "Tatlı", "Sert", "Yabani", "Yalnız", "Suskun", "Coşkulu"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek", "Tavuk", "Maymun", "Keçi", "Sincap", "Kurbağa", "Kaplan", "Koala", "Tilki", "Kurt", "Aslan", "Şahin", "Karga", "Köstebek", "Koyun", "İnek", "At", "Eşek", "Fok", "Penguen", "Kirpi", "Sazan", "Yengeç", "Ahtapot", "Kertenkele", "Koala"];

const getAnonymousData = (id: string, customNickname?: string) => {
  if (!id) return { name: "Gizemli Yolcu" };
  if (customNickname) return { name: customNickname };
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  return {
    name: `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}`
  };
};

// SearchParams'ı alıyoruz ki hangi sekmede olduğumuzu bilelim
export default async function LeaderboardPage({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  const currentTab = params?.tab || 'all'; // 'all' veya 'weekly'
  const isWeekly = currentTab === 'weekly';

  const cookieStore = await cookies();
  const currentUserUuid = cookieStore.get('tnku_author_id')?.value || cookieStore.get('user_uuid')?.value;

  let allStats: any[] = [];
  let customNicknamesMap: any = {};
  let userBadgesMap: any = {};
  let userAvatarsMap: any = {};

  try {
    const [fetchedStats, nicknamesDb, badgesDb, avatarsDb] = await Promise.all([
      (prisma as any).userStats.findMany({ 
        orderBy: [{ points: 'desc' }, { updatedAt: 'asc' }] 
      }).catch(() => []),
      (prisma as any).customNickname.findMany().catch(() => []),
      (prisma as any).userBadge.findMany().catch(() => []),
      (prisma as any).userAvatar.findMany().catch(() => [])
    ]);
    
    allStats = fetchedStats.filter((s: any) => s.points > 0);
    
    customNicknamesMap = (nicknamesDb || []).reduce((acc: any, curr: any) => { acc[curr.userUuid] = curr.nickname; return acc; }, {});
    userBadgesMap = (badgesDb || []).reduce((acc: any, curr: any) => { acc[curr.userUuid] = curr.badgeName; return acc; }, {});
    userAvatarsMap = (avatarsDb || []).reduce((acc: any, curr: any) => { acc[curr.userUuid] = curr.avatarUrl; return acc; }, {});
  } catch (err) { console.error(err); }

  // 🔥 HAFTALIK (SON 7 GÜN) XP HESAPLAMA ALGORİTMASI 🔥
  let finalDisplayStats = allStats;

  if (isWeekly) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [recentPosts, recentComments] = await Promise.all([
        (prisma as any).post.findMany({
          where: { createdAt: { gte: sevenDaysAgo }, status: 'APPROVED' },
          select: { authorUuid: true, likes: true }
        }).catch(() => []),
        (prisma as any).comment.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { authorId: true }
        }).catch(() => [])
      ]);

      const weeklyScores: Record<string, number> = {};

      // Puanlama Mantığı: Post=10 XP, Yorum=5 XP, Her Beğeni=2 XP
      recentPosts.forEach((p: any) => {
        if (!p.authorUuid) return;
        if (!weeklyScores[p.authorUuid]) weeklyScores[p.authorUuid] = 0;
        weeklyScores[p.authorUuid] += 10; 
        weeklyScores[p.authorUuid] += (p.likes || 0) * 2; 
      });

      recentComments.forEach((c: any) => {
        if (!c.authorId) return;
        if (!weeklyScores[c.authorId]) weeklyScores[c.authorId] = 0;
        weeklyScores[c.authorId] += 5; 
      });

      // Global statlarla birleştirip haftalık listeyi oluştur
      finalDisplayStats = Object.keys(weeklyScores).map(uuid => {
        const globalStat = allStats.find(s => s.userUuid === uuid);
        return {
          userUuid: uuid,
          points: weeklyScores[uuid],
          level: globalStat ? globalStat.level : 1, // Seviyeyi globalden çekiyoruz
        };
      }).sort((a, b) => b.points - a.points);

    } catch (e) { console.error(e); }
  }

  // 🔥 Top 10 ve Kullanıcı Sıralaması Algoritması 🔥
  const top10 = finalDisplayStats.slice(0, 10);
  let currentUserRank = -1;
  let currentUserStat = null;

  if (currentUserUuid) {
    currentUserRank = finalDisplayStats.findIndex((s: any) => s.userUuid === currentUserUuid) + 1;
    if (currentUserRank > 0) {
      currentUserStat = finalDisplayStats[currentUserRank - 1];
    }
  }

  const isCurrentUserInTop10 = currentUserRank > 0 && currentUserRank <= 10;

  // Sıralama kartlarını çizen ortak yardımcı fonksiyon
  const renderListItem = (user: any, rank: number, isHighlighted: boolean = false) => {
    const authorData = getAnonymousData(user.userUuid, customNicknamesMap[user.userUuid]);
    const currentAvatar = userAvatarsMap[user.userUuid];
    const badge = userBadgesMap[user.userUuid];

    const cardClasses = isHighlighted
      ? "group flex items-center gap-3 sm:gap-4 p-3.5 rounded-[20px] border-2 border-[#4DA3FF] bg-[#4DA3FF]/10 shadow-[0_0_15px_rgba(77,163,255,0.15)] transition-all"
      : "group flex items-center gap-3 sm:gap-4 p-3.5 bg-white dark:bg-white/[0.02] backdrop-blur-xl hover:bg-gray-50 dark:hover:bg-white/[0.05] rounded-[20px] border border-gray-200 dark:border-white/[0.05] hover:border-gray-300 dark:hover:border-white/10 transition-all shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-lg";

    const rankClasses = isHighlighted
      ? "text-[15px] font-black text-[#4DA3FF]"
      : "text-[15px] font-black text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors";

    const nameClasses = isHighlighted
      ? "text-[14px] font-bold text-[#4DA3FF] truncate"
      : "text-[14px] font-bold text-gray-900 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors truncate";

    return (
      <Link 
        key={user.userUuid} 
        href={`/profil/${encodeURIComponent(user.userUuid)}`} 
        className={cardClasses}
      >
        <div className="w-8 flex justify-center shrink-0">
          <span className={rankClasses}>{rank}</span>
        </div>
        
        {/* AVATAR */}
        <div className="flex-1 flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {currentAvatar?.startsWith("data:image") ? (
              <img src={currentAvatar} alt="Profil" className="w-full h-full object-cover" />
            ) : currentAvatar ? (
              <span className="text-[20px]">{currentAvatar}</span>
            ) : (
              <span className="font-black text-sm opacity-80 text-gray-500 dark:text-white">{authorData.name.charAt(0)}</span>
            )}
          </div>
          <div className="overflow-hidden pr-2">
            <div className="flex items-center gap-2">
              <p className={nameClasses}>@{authorData.name}</p>
              {badge && <span className="hidden sm:inline-block bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 transition-colors">{badge}</span>}
            </div>
            <p className="text-[11px] text-gray-500 font-medium tracking-wide">Seviye {user.level}</p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-black shrink-0 shadow-sm dark:shadow-inner transition-colors ${isHighlighted ? 'text-[#4DA3FF] bg-[#4DA3FF]/20 border border-[#4DA3FF]/30' : 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/10 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20'}`}>
          <Flame size={12} className={`animate-pulse ${isHighlighted ? 'text-[#4DA3FF]' : 'text-amber-500'}`} /> {user.points}
        </div>
        
        <ChevronRight size={16} className={`shrink-0 hidden sm:block transition-colors ${isHighlighted ? 'text-[#4DA3FF]' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-white'}`} />
      </Link>
    );
  };

  return (
    <main className="min-h-screen text-gray-900 dark:text-white relative z-0 pb-20 selection:bg-amber-500/30 transition-colors duration-300">
      
      {/* 🔥 ARKA PLAN (Gündüz/Gece Uyumlu) */}
      <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-[#050505] transition-colors duration-300">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/50 via-slate-50 to-slate-50 dark:from-amber-900/20 dark:via-[#050505] dark:to-[#050505] pointer-events-none transition-colors duration-300"></div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-3xl border-b border-gray-200 dark:border-white/[0.05] px-4 py-3 flex items-center gap-4 shadow-sm transition-colors duration-300">
        <Link href="/" className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors bg-gray-100 dark:bg-white/5">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-black text-[15px] tracking-widest uppercase flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
          <Trophy size={16} className="text-amber-500" /> Sefirlik Tablosu
        </h1>
      </header>

      {/* 🔥 TAB DEĞİŞTİRİCİ (Tüm Zamanlar / Son 7 Gün) 🔥 */}
      <div className="max-w-xl mx-auto px-4 mt-5 animate-in fade-in duration-500 z-10 relative">
        <div className="flex p-1 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-xl shadow-inner transition-colors">
          <Link 
            href="/liderlik?tab=all" 
            scroll={false} 
            className={`flex-1 flex items-center justify-center gap-2 text-center py-2.5 text-[13px] font-bold rounded-lg transition-all duration-300 ${!isWeekly ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
          >
            <Trophy size={14} /> Tüm Zamanlar
          </Link>
          <Link 
            href="/liderlik?tab=weekly" 
            scroll={false} 
            className={`flex-1 flex items-center justify-center gap-2 text-center py-2.5 text-[13px] font-bold rounded-lg transition-all duration-300 ${isWeekly ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
          >
            <CalendarDays size={14} /> Son 7 Gün
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* PODYUM (Top 3) */}
        {top10.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-10 items-end px-1 mt-4">
            {top10.slice(0, 3).map((user, index) => {
              const rank = index + 1;
              const pos = rank === 1 ? 2 : rank === 2 ? 1 : 3; // Podyum dizilimi: 2, 1, 3
              const rankedUser = top10[pos - 1];
              if (!rankedUser) return null;
              
              const authorData = getAnonymousData(rankedUser.userUuid, customNicknamesMap[rankedUser.userUuid]);
              const currentAvatar = userAvatarsMap[rankedUser.userUuid];
              const badge = userBadgesMap[rankedUser.userUuid];
              const isFirst = pos === 1;

              // 🔥 DERECEYE GÖRE GÜNDÜZ/GECE UYUMLU STİLLER
              const rankStyles = pos === 1 
                ? { 
                    border: 'border-amber-400 dark:border-amber-400', 
                    shadow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)] dark:shadow-[0_0_30px_rgba(251,191,36,0.3)]', 
                    text: 'text-amber-600 dark:text-amber-400', 
                    bg: 'bg-gradient-to-t from-amber-100 to-transparent dark:from-amber-500/20 dark:to-transparent', 
                    rankBg: 'bg-amber-400 text-black', 
                    rankShadow: 'shadow-[0_-5px_15px_rgba(251,191,36,0.3)] dark:shadow-[0_-5px_15px_rgba(251,191,36,0.4)]' 
                  }
                : pos === 2 
                ? { 
                    border: 'border-slate-300 dark:border-slate-400', 
                    shadow: 'shadow-[0_0_20px_rgba(203,213,225,0.4)] dark:shadow-[0_0_20px_rgba(203,213,225,0.1)]', 
                    text: 'text-slate-600 dark:text-slate-300', 
                    bg: 'bg-gradient-to-t from-slate-200 to-transparent dark:from-slate-500/10 dark:to-transparent', 
                    rankBg: 'bg-slate-200 dark:bg-slate-300 text-slate-800 dark:text-black', 
                    rankShadow: '' 
                  }
                : { 
                    border: 'border-orange-300 dark:border-orange-400', 
                    shadow: 'shadow-[0_0_20px_rgba(251,146,60,0.2)] dark:shadow-[0_0_20px_rgba(251,146,60,0.1)]', 
                    text: 'text-orange-600 dark:text-orange-400', 
                    bg: 'bg-gradient-to-t from-orange-100 to-transparent dark:from-orange-500/10 dark:to-transparent', 
                    rankBg: 'bg-orange-300 dark:bg-orange-400 text-black', 
                    rankShadow: '' 
                  };

              return (
                <Link 
                  key={rankedUser.userUuid} 
                  href={`/profil/${encodeURIComponent(rankedUser.userUuid)}`}
                  className={`flex flex-col items-center gap-2 group transition-transform duration-300 hover:scale-105 cursor-pointer relative ${isFirst ? 'scale-110 mb-4 hover:scale-[1.15] z-10' : 'z-0'}`}
                >
                  {isFirst && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-amber-400/30 dark:bg-amber-500/20 blur-2xl rounded-full -z-10"></div>}

                  <div className={`relative w-[68px] h-[68px] rounded-full border-[3px] flex items-center justify-center bg-gray-50 dark:bg-[#121212] overflow-hidden ${rankStyles.border} ${rankStyles.shadow} transition-all`}>
                    {isFirst && <Crown size={28} className="text-amber-500 dark:text-amber-400 absolute -top-4 drop-shadow-lg z-20" />}
                    
                    {currentAvatar?.startsWith("data:image") ? (
                      <img src={currentAvatar} alt="Profil" className="w-full h-full object-cover" />
                    ) : currentAvatar ? (
                      <span className="text-[28px]">{currentAvatar}</span>
                    ) : (
                      <span className="font-black text-xl opacity-80 text-gray-400 dark:text-white">{authorData.name.charAt(0)}</span>
                    )}
                  </div>

                  <div className="text-center w-full mt-1">
                    <p className={`text-[11px] font-bold truncate px-1 transition-colors ${rankStyles.text}`}>@{authorData.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <Flame size={10} className={rankStyles.text} />
                      <p className={`text-[10px] font-black ${rankStyles.text}`}>{rankedUser.points} XP</p>
                    </div>
                  </div>

                  <div className={`w-full pt-1.5 pb-1 text-center font-black rounded-t-xl transition-colors ${rankStyles.rankBg} ${rankStyles.rankShadow} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/5 dark:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {pos}
                  </div>
                  <div className={`w-full h-12 rounded-b-xl ${rankStyles.bg} border-x border-b border-gray-300 dark:border-white/[0.05] backdrop-blur-sm -mt-2 -z-10 transition-colors`}></div>
                </Link>
              );
            })}
          </div>
        )}

        {/* LİSTE (Ranks 4-10) */}
        <div className="space-y-2.5 relative z-10">
          {top10.slice(3).map((user, index) => {
            const rank = index + 4;
            const isHighlighted = user.userUuid === currentUserUuid;
            return renderListItem(user, rank, isHighlighted);
          })}
        </div>

        {/* 🔥 KULLANICI TOP 10'DA DEĞİLSE EN ALTTA GÖSTER 🔥 */}
        {!isCurrentUserInTop10 && currentUserStat && (
          <div className="pt-2 pb-6">
            <div className="flex justify-center mb-4 mt-2">
              <div className="flex flex-col gap-1.5 opacity-30">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white"></div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-50 dark:bg-[#050505] px-3 text-[10px] font-black text-[#4DA3FF] uppercase tracking-widest z-10 rounded-full border border-[#4DA3FF]/20 shadow-sm">
                Senin Sıran
              </div>
              {renderListItem(currentUserStat, currentUserRank, true)}
            </div>
          </div>
        )}

        {finalDisplayStats.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-bold border border-dashed border-gray-300 dark:border-white/10 rounded-3xl bg-white dark:bg-white/[0.02]">
            {isWeekly ? 'Son 7 günde henüz kimse XP kazanamadı. İlk sen ol!' : 'Henüz XP kazanan kimse yok. Liderlik tahtı boş!'}
          </div>
        )}

      </div>
    </main>
  );
}