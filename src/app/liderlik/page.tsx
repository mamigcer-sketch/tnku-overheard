import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Home, Trophy, Medal, Flame, Crown, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  // En çok puana sahip ilk 50 kişiyi çekiyoruz
  const topUsers = await (prisma as any).userStats.findMany({
    orderBy: { points: 'desc' },
    take: 50,
  });

  // Bu kişilerin özel nicklerini ve rozetlerini çekiyoruz
  const userUuids = topUsers.map((u: any) => u.userUuid);
  
  const [nicknamesDb, badgesDb] = await Promise.all([
    (prisma as any).customNickname.findMany({ where: { userUuid: { in: userUuids } } }),
    (prisma as any).unlockedBadge.findMany({ where: { userUuid: { in: userUuids } } })
  ]);

  const nicknamesMap = nicknamesDb.reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.nickname;
    return acc;
  }, {});

  const badgesMap = badgesDb.reduce((acc: any, curr: any) => {
    if (!acc[curr.userUuid]) acc[curr.userUuid] = [];
    acc[curr.userUuid].push(curr.badgeName);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white relative z-0 overflow-hidden pb-20 selection:bg-amber-500/30">
      
      {/* Arka Plan Efektleri */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-transparent blur-[80px] pointer-events-none z-0"></div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 sm:py-4 flex items-center shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-colors text-[12px] sm:text-[13px] font-medium border border-white/[0.05]">
            <Home size={14} /> <span>Ana Sayfa</span>
          </Link>
          <h1 className="text-sm sm:text-base font-bold text-gray-200">Sefirlik Tablosu</h1>
          <div className="w-16 sm:w-20"></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        
        {/* Başlık Alanı */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-600/20 border border-amber-500/30 text-amber-400 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Trophy size={32} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            KAMPÜSÜN <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">SEFİRLERİ</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base font-medium">
            En çok etkileşim alanlar, lobinin kralları ve dedikodunun pîrleri.
          </p>
        </div>

        {/* Liderlik Listesi */}
        <div className="space-y-3">
          {topUsers.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-3xl">
              <p className="text-gray-500 font-medium text-sm">Henüz kimse puan kazanmamış. Meydan boş, ilk sen kap!</p>
            </div>
          ) : (
            topUsers.map((user: any, index: number) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;
              
              const displayName = nicknamesMap[user.userUuid] || "Gizemli İtirafçı";
              const userBadges = badgesMap[user.userUuid] || [];
              const latestBadge = userBadges.length > 0 ? userBadges[userBadges.length - 1] : null;

              // İlk 3'e özel tasarımlar
              let cardClass = "bg-[#121212]/80 border-white/5 hover:border-white/10";
              let rankColor = "text-gray-500";
              let RankIcon = Star;

              if (isFirst) {
                cardClass = "bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)] scale-[1.02] mb-4";
                rankColor = "text-amber-400";
                RankIcon = Crown;
              } else if (isSecond) {
                cardClass = "bg-gradient-to-r from-gray-300/10 to-gray-400/5 border-gray-400/30 shadow-[0_0_15px_rgba(156,163,175,0.1)] mb-3";
                rankColor = "text-gray-300";
                RankIcon = Medal;
              } else if (isThird) {
                cardClass = "bg-gradient-to-r from-amber-700/10 to-orange-800/5 border-amber-700/30 shadow-[0_0_15px_rgba(180,83,9,0.1)] mb-3";
                rankColor = "text-amber-600";
                RankIcon = Medal;
              }

              return (
                <Link 
                  href={`/profil/${user.userUuid}`} 
                  key={user.userUuid}
                  className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 group ${cardClass}`}
                >
                  
                  {/* Sıra Numarası */}
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-lg bg-white/[0.03] border border-white/5 ${rankColor}`}>
                    {isFirst || isSecond || isThird ? <RankIcon size={20} /> : `#${index + 1}`}
                  </div>

                  {/* Kullanıcı Bilgileri */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-black text-[15px] sm:text-base truncate ${isFirst ? 'text-amber-400' : 'text-gray-200 group-hover:text-white'}`}>
                        {displayName}
                      </h3>
                      {latestBadge && (
                        <span className="text-[10px] bg-white/[0.05] border border-white/10 px-2 py-0.5 rounded-md text-gray-300 font-bold tracking-wider uppercase whitespace-nowrap">
                          {latestBadge}
                        </span>
                      )}
                    </div>
                    {/* Seviye barı detayı */}
                    <div className="flex items-center gap-3 mt-1.5 opacity-70">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        Seviye {user.level}
                      </span>
                    </div>
                  </div>

                  {/* Puan */}
                  <div className="shrink-0 text-right">
                    <div className={`flex items-center gap-1.5 font-black text-xl sm:text-2xl ${isFirst ? 'text-amber-400' : 'text-[#4DA3FF]'}`}>
                      {user.points} <Flame size={18} className={isFirst ? 'text-amber-400' : 'text-[#4DA3FF]'} />
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">XP</span>
                  </div>

                </Link>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}