import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Trophy, Flame, Crown, ChevronRight, Sparkles } from 'lucide-react';

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

export default async function LeaderboardPage() {
  let stats: any[] = [];
  let customNicknamesMap: any = {};
  let userBadgesMap: any = {};
  let userAvatarsMap: any = {};

  try {
    // 🔥 AVATARLAR DA VERİTABANINDAN ÇEKİLİYOR
    const [fetchedStats, nicknamesDb, badgesDb, avatarsDb] = await Promise.all([
      (prisma as any).userStats.findMany({ orderBy: { points: 'desc' }, take: 50 }).catch(() => []),
      (prisma as any).customNickname.findMany().catch(() => []),
      (prisma as any).userBadge.findMany().catch(() => []),
      (prisma as any).userAvatar.findMany().catch(() => [])
    ]);
    stats = fetchedStats;
    customNicknamesMap = (nicknamesDb || []).reduce((acc: any, curr: any) => { acc[curr.userUuid] = curr.nickname; return acc; }, {});
    userBadgesMap = (badgesDb || []).reduce((acc: any, curr: any) => { acc[curr.userUuid] = curr.badgeName; return acc; }, {});
    userAvatarsMap = (avatarsDb || []).reduce((acc: any, curr: any) => { acc[curr.userUuid] = curr.avatarUrl; return acc; }, {});
  } catch (err) { console.error(err); }

  return (
    <main className="min-h-screen text-white relative z-0 pb-20 selection:bg-amber-500/30">
      
      {/* PREMIUM ARKA PLAN (Liderliğe Özel Kehribar Parlaması) */}
      <div className="fixed inset-0 -z-10 bg-[#050505]">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-[#050505] to-[#050505] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-3xl border-b border-white/[0.05] px-4 py-3 flex items-center gap-4 shadow-sm">
        <Link href="/" className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors bg-white/5">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-black text-[15px] tracking-widest uppercase flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" /> Sefirlik Tablosu
        </h1>
      </header>

      <div className="max-w-xl mx-auto px-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* PODYUM (Top 3) */}
        <div className="grid grid-cols-3 gap-3 mb-10 items-end px-1 mt-6">
          {stats.slice(0, 3).map((user, index) => {
            const rank = index + 1;
            const pos = rank === 1 ? 2 : rank === 2 ? 1 : 3; // Podyum dizilimi: 2, 1, 3
            const rankedUser = stats[pos - 1];
            if (!rankedUser) return null;
            
            const authorData = getAnonymousData(rankedUser.userUuid, customNicknamesMap[rankedUser.userUuid]);
            const currentAvatar = userAvatarsMap[rankedUser.userUuid];
            const badge = userBadgesMap[rankedUser.userUuid];
            const isFirst = pos === 1;

            // Dereceye göre renk ve stil ayarları
            const rankStyles = pos === 1 
              ? { border: 'border-amber-400', shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]', text: 'text-amber-400', bg: 'bg-gradient-to-t from-amber-500/20 to-transparent', rankBg: 'bg-amber-400 text-black', rankShadow: 'shadow-[0_-5px_15px_rgba(251,191,36,0.4)]' }
              : pos === 2 
              ? { border: 'border-slate-300', shadow: 'shadow-[0_0_20px_rgba(203,213,225,0.1)]', text: 'text-slate-300', bg: 'bg-gradient-to-t from-slate-500/10 to-transparent', rankBg: 'bg-slate-300 text-black', rankShadow: '' }
              : { border: 'border-orange-400', shadow: 'shadow-[0_0_20px_rgba(251,146,60,0.1)]', text: 'text-orange-400', bg: 'bg-gradient-to-t from-orange-500/10 to-transparent', rankBg: 'bg-orange-400 text-black', rankShadow: '' };

            return (
              <Link 
                key={rankedUser.userUuid} 
                href={`/profil/${encodeURIComponent(rankedUser.userUuid)}`}
                className={`flex flex-col items-center gap-2 group transition-transform duration-300 hover:scale-105 cursor-pointer relative ${isFirst ? 'scale-110 mb-4 hover:scale-[1.15] z-10' : 'z-0'}`}
              >
                {/* 1. olan kişiye özel arkadan parlama */}
                {isFirst && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-amber-500/20 blur-2xl rounded-full -z-10"></div>}

                {/* AVATAR */}
                <div className={`relative w-[68px] h-[68px] rounded-full border-[3px] flex items-center justify-center bg-[#121212] overflow-hidden ${rankStyles.border} ${rankStyles.shadow} transition-all`}>
                  {isFirst && <Crown size={28} className="text-amber-400 absolute -top-4 drop-shadow-lg z-20" />}
                  
                  {currentAvatar?.startsWith("data:image") ? (
                    <img src={currentAvatar} alt="Profil" className="w-full h-full object-cover" />
                  ) : currentAvatar ? (
                    <span className="text-[28px]">{currentAvatar}</span>
                  ) : (
                    <span className="font-black text-xl opacity-80 text-white">{authorData.name.charAt(0)}</span>
                  )}
                </div>

                {/* İSİM VE BİLGİLER */}
                <div className="text-center w-full mt-1">
                  <p className={`text-[11px] font-bold truncate px-1 transition-colors ${rankStyles.text}`}>@{authorData.name}</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Flame size={10} className={rankStyles.text} />
                    <p className={`text-[10px] font-black ${rankStyles.text}`}>{rankedUser.points} XP</p>
                  </div>
                </div>

                {/* KÜRSÜ BASAMAĞI */}
                <div className={`w-full pt-1.5 pb-1 text-center font-black rounded-t-xl transition-colors ${rankStyles.rankBg} ${rankStyles.rankShadow} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {pos}
                </div>
                <div className={`w-full h-12 rounded-b-xl ${rankStyles.bg} border-x border-b border-white/[0.05] backdrop-blur-sm -mt-2 -z-10`}></div>
              </Link>
            );
          })}
        </div>

        {/* LİSTE (4+) */}
        <div className="space-y-2.5 relative z-10">
          {stats.slice(3).map((user, index) => {
            const rank = index + 4;
            const authorData = getAnonymousData(user.userUuid, customNicknamesMap[user.userUuid]);
            const currentAvatar = userAvatarsMap[user.userUuid];
            const badge = userBadgesMap[user.userUuid];

            return (
              <Link 
                key={user.userUuid} 
                href={`/profil/${encodeURIComponent(user.userUuid)}`} 
                className="group flex items-center gap-3 sm:gap-4 p-3.5 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.05] rounded-[20px] border border-white/[0.05] hover:border-white/10 transition-all shadow-sm hover:shadow-lg"
              >
                <div className="w-8 flex justify-center shrink-0">
                  <span className="text-[15px] font-black text-gray-500 group-hover:text-white transition-colors">{rank}</span>
                </div>
                
                {/* AVATAR */}
                <div className="flex-1 flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-[#1A1A1A] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {currentAvatar?.startsWith("data:image") ? (
                      <img src={currentAvatar} alt="Profil" className="w-full h-full object-cover" />
                    ) : currentAvatar ? (
                      <span className="text-[20px]">{currentAvatar}</span>
                    ) : (
                      <span className="font-black text-sm opacity-80 text-white">{authorData.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="overflow-hidden pr-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-bold text-gray-200 group-hover:text-white transition-colors truncate">@{authorData.name}</p>
                      {badge && <span className="hidden sm:inline-block bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">{badge}</span>}
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium tracking-wide">Seviye {user.level}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 border border-amber-500/10 px-3 py-1.5 rounded-full text-[12px] font-black shrink-0 shadow-inner group-hover:bg-amber-500/20 transition-colors">
                  <Flame size={12} className="animate-pulse" /> {user.points}
                </div>
                
                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors shrink-0 hidden sm:block" />
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}