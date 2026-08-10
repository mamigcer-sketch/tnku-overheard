import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Trophy, Flame, Crown, ChevronRight } from 'lucide-react';

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

  try {
    const [fetchedStats, nicknamesDb, badgesDb] = await Promise.all([
      (prisma as any).userStats.findMany({ orderBy: { points: 'desc' }, take: 50 }).catch(() => []),
      (prisma as any).customNickname.findMany().catch(() => []),
      (prisma as any).userBadge.findMany().catch(() => [])
    ]);
    stats = fetchedStats;
    customNicknamesMap = (nicknamesDb || []).reduce((acc: any, curr: any) => { acc[curr.userUuid] = curr.nickname; return acc; }, {});
    userBadgesMap = (badgesDb || []).reduce((acc: any, curr: any) => { acc[curr.userUuid] = curr.badgeName; return acc; }, {});
  } catch (err) { console.error(err); }

  return (
    <main className="min-h-screen bg-[#000000] text-white pb-20">
      
      <header className="sticky top-0 z-50 bg-[#000000]/80 backdrop-blur-2xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link href="/" className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="font-black text-lg">Sefirlik Tablosu</h1>
      </header>

      <div className="max-w-xl mx-auto px-4 pt-6">
        
        {/* PODYUM (Top 3) */}
        <div className="grid grid-cols-3 gap-2 mb-8 items-end px-2">
          {stats.slice(0, 3).map((user, index) => {
            const rank = index + 1;
            const pos = rank === 1 ? 2 : rank === 2 ? 1 : 3; // Podyum dizilimi: 2, 1, 3
            const rankedUser = stats[pos - 1];
            if (!rankedUser) return null;
            
            const authorData = getAnonymousData(rankedUser.userUuid, customNicknamesMap[rankedUser.userUuid]);
            const isFirst = pos === 1;

            return (
              <Link 
                key={rankedUser.userUuid} 
                href={`/profil/${encodeURIComponent(rankedUser.userUuid)}`}
                className={`flex flex-col items-center gap-2 group transition-transform hover:scale-105 cursor-pointer ${isFirst ? 'scale-110 mb-2 hover:scale-[1.15]' : ''}`}
              >
                <div className={`relative w-16 h-16 rounded-full border-2 flex items-center justify-center transition-colors bg-[#121212] group-hover:bg-[#1A1A1A] ${isFirst ? 'border-amber-400' : 'border-gray-700 group-hover:border-gray-500'}`}>
                  {isFirst && <Crown size={24} className="text-amber-400 absolute -top-3" />}
                  <span className="font-black text-xl opacity-60">{authorData.name.charAt(0)}</span>
                </div>
                <div className="text-center">
                  <p className={`text-[11px] font-bold truncate w-20 transition-colors ${isFirst ? 'text-amber-400' : 'text-gray-300 group-hover:text-white'}`}>@{authorData.name}</p>
                  <p className="text-[10px] font-black text-amber-500">{rankedUser.points} XP</p>
                </div>
                <div className={`w-full py-1 text-center font-black rounded-t-lg transition-colors ${isFirst ? 'bg-amber-400 text-black group-hover:bg-amber-300' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700 group-hover:text-gray-300'}`}>
                  {pos}
                </div>
              </Link>
            );
          })}
        </div>

        {/* LİSTE (4+) */}
        <div className="space-y-2">
          {stats.slice(3).map((user, index) => {
            const rank = index + 4;
            const authorData = getAnonymousData(user.userUuid, customNicknamesMap[user.userUuid]);
            return (
              <Link key={user.userUuid} href={`/profil/${user.userUuid}`} className="flex items-center gap-4 p-3.5 bg-[#121212]/50 hover:bg-[#1A1A1A] rounded-2xl border border-white/5 transition-all">
                <span className="text-[15px] font-black text-gray-500 w-6 text-center">{rank}</span>
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center font-bold text-sm opacity-70">
                    {authorData.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-white">@{authorData.name}</p>
                    <p className="text-[11px] text-gray-500 font-medium">Seviye {user.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full text-[12px] font-black">
                  <Flame size={12} /> {user.points}
                </div>
                <ChevronRight size={16} className="text-gray-600" />
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}