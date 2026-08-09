import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Trophy, Flame, Crown, Medal, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare", "Deli", "Çılgın", "Bıkkın", "Dalgın", "Ters", "Şüpheli", "Kuşkulu", "Durgun", "Hızlı", "Yavaş", "Donuk", "Parlak", "Sinsi", "Kurnaz", "Tatlı", "Sert", "Yabani", "Yalnız", "Suskun", "Coşkulu"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek", "Tavuk", "Maymun", "Keçi", "Sincap", "Kurbağa", "Kaplan", "Koala", "Tilki", "Kurt", "Aslan", "Şahin", "Karga", "Köstebek", "Koyun", "İnek", "At", "Eşek", "Fok", "Penguen", "Kirpi", "Sazan", "Yengeç", "Ahtapot", "Kertenkele", "Koala"];

const getAnonymousData = (id: string, customNickname?: string) => {
  if (!id) return { name: "Gizemli Yolcu" };
  if (customNickname) {
    return { name: customNickname };
  }
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
      (prisma as any).userStats.findMany({
        orderBy: { points: 'desc' },
        take: 50
      }).catch(() => []),
      (prisma as any).customNickname.findMany().catch(() => []),
      (prisma as any).userBadge.findMany().catch(() => [])
    ]);

    stats = fetchedStats;

    customNicknamesMap = (nicknamesDb || []).reduce((acc: any, curr: any) => {
      acc[curr.userUuid] = curr.nickname;
      return acc;
    }, {});

    userBadgesMap = (badgesDb || []).reduce((acc: any, curr: any) => {
      acc[curr.userUuid] = curr.badgeName;
      return acc;
    }, {});
  } catch (err) {
    console.error("Liderlik tablosu çekilemedi:", err);
  }

  return (
    <main className="min-h-screen bg-[#000000] text-white relative z-0 pb-20 selection:bg-amber-500/30">
      
      {/* 1. ÜST HEADER */}
      <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white hover:opacity-70 transition-opacity p-1 -ml-1">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-[17px] font-bold tracking-tight flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            Sefirlik Tablosu
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        
        {/* KAMPÜSÜN SEFİRLERİ BAŞLIK ALANI */}
        <div className="text-center mb-8 px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Trophy size={24} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
            KAMPÜSÜN <span className="text-amber-400">SEFİRLERİ</span>
          </h2>
          <p className="text-gray-400 text-[13px]">
            Kampüsün nabzını tutanlar, masanın kralları ve dedikodunun pîrleri.
          </p>
        </div>

        {/* LİDERLİK LİSTESİ */}
        {stats.length === 0 ? (
          <div className="text-center py-16 bg-[#121212]/50 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
            <p className="text-gray-400 font-medium text-[13px]">Henüz sıralamaya giren sefir bulunmuyor.</p>
          </div>
        ) : (
          <div className="bg-[#121212]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl divide-y divide-white/5">
            {stats.map((user: any, index: number) => {
              const rank = index + 1;
              const hasCustomNick = Boolean(customNicknamesMap[user.userUuid]);
              // 🔥 Sadece özel nicki olanların özel nickini göster, olmayanlara orjinal UUID/ID verisini temiz yansıt
              const displayName = hasCustomNick 
                ? customNicknamesMap[user.userUuid] 
                : `Kullanıcı_${user.userUuid.substring(0, 6)}`;
              
              const badge = userBadgesMap[user.userUuid];

              return (
                <Link
                  key={user.userUuid || index}
                  href={`/profil/${encodeURIComponent(user.userUuid)}`}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    
                    {/* Sıralama İkonu veya Numarası */}
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {rank === 1 ? (
                        <Crown size={22} className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                      ) : rank === 2 ? (
                        <Medal size={20} className="text-gray-300" />
                      ) : rank === 3 ? (
                        <Award size={20} className="text-amber-600" />
                      ) : (
                        <span className="text-[14px] font-bold text-gray-500">#{rank}</span>
                      )}
                    </div>

                    {/* Kullanıcı Bilgisi */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-[15px] group-hover:text-amber-400 transition-colors">
                          @{displayName}
                        </span>
                        {badge && (
                          <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                            {badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium mt-0.5">
                        Seviye {user.level || 1}
                      </span>
                    </div>

                  </div>

                  {/* XP Puanı */}
                  <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full text-[13px] font-black shadow-inner">
                    <Flame size={14} className="animate-pulse" />
                    <span>{user.points || 0} XP</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}