import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Home, Trophy, Medal, Flame, Crown, Star, TrendingUp } from 'lucide-react';

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

  // Barın doluluk oranını hesaplamak için en yüksek puanı alıyoruz
  const maxPoints = topUsers.length > 0 ? topUsers[0].points : 1;

  return (
    <main className="min-h-screen bg-[#09090B] text-white relative z-0 overflow-hidden pb-20 selection:bg-amber-500/30">
      
      {/* Arka Plan Efektleri - Daha koyu ve elit bir altın yansıması */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-500/10 via-orange-900/5 to-transparent blur-[100px] pointer-events-none z-0"></div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#09090B]/80 backdrop-blur-2xl border-b border-white/5 px-4 py-3 sm:py-4 flex items-center shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] px-3.5 py-2 rounded-full transition-colors text-[12px] sm:text-[13px] font-medium border border-white/[0.05]">
            <Home size={14} /> <span>Ana Sayfa</span>
          </Link>
          <h1 className="text-sm sm:text-base font-bold text-gray-200 tracking-wide">Sefirlik Tablosu</h1>
          <div className="w-20 sm:w-24"></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 relative z-10">
        
        {/* BAŞLIK VE İKON ALANI */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] bg-gradient-to-b from-[#2A1F0D] to-[#120D05] border border-amber-500/40 text-amber-400 mb-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] relative group">
            <div className="absolute inset-0 bg-amber-500/20 rounded-[24px] blur-md group-hover:blur-xl transition-all duration-500"></div>
            <Trophy size={36} className="relative z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] sm:w-[42px] sm:h-[42px]" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4">
            KAMPÜSÜN <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500 drop-shadow-sm">SEFİRLERİ</span>
          </h2>
          <p className="text-gray-400 text-[14px] sm:text-[16px] font-medium max-w-md mx-auto leading-relaxed">
            Kampüsün nabzını tutanlar, masanın kralları ve dedikodunun pîrleri.
          </p>
        </div>

        {/* LİDERLİK LİSTESİ */}
        <div className="space-y-4">
          {topUsers.length === 0 ? (
            <div className="text-center py-16 bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-[32px]">
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

              // XP Bar doluluk oranı (Minimum %5 görünsün diye sınır koyduk)
              const fillPercentage = Math.max(5, (user.points / maxPoints) * 100);

              // 🥇 🥈 🥉 İlk 3'e Özel Stil Tanımlamaları
              let cardClass = "bg-[#121212]/60 border-white/[0.06] hover:border-white/[0.15] hover:bg-[#161616]/80";
              let rankColor = "text-gray-500 bg-white/[0.03] border-white/5";
              let nameColor = "text-gray-200 group-hover:text-white";
              let pointColor = "text-gray-300";
              let RankIcon = Star;
              let barColor = "bg-[#4DA3FF]";

              if (isFirst) {
                cardClass = "bg-gradient-to-r from-[#1A1408] to-[#120E06] border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.12)] scale-[1.02] mb-5";
                rankColor = "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
                nameColor = "text-amber-400";
                pointColor = "text-amber-400";
                RankIcon = Crown;
                barColor = "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]";
              } else if (isSecond) {
                cardClass = "bg-gradient-to-r from-[#161618] to-[#0F0F12] border-gray-400/40 shadow-[0_0_20px_rgba(156,163,175,0.08)] mb-4";
                rankColor = "text-gray-300 bg-gray-400/10 border-gray-400/20 shadow-[0_0_15px_rgba(156,163,175,0.2)]";
                nameColor = "text-gray-200";
                pointColor = "text-gray-300";
                RankIcon = Medal;
                barColor = "bg-gray-300 shadow-[0_0_10px_rgba(156,163,175,0.8)]";
              } else if (isThird) {
                cardClass = "bg-gradient-to-r from-[#1F1208] to-[#120A05] border-orange-700/40 shadow-[0_0_20px_rgba(194,65,12,0.08)] mb-4";
                rankColor = "text-orange-500 bg-orange-600/10 border-orange-700/20 shadow-[0_0_15px_rgba(194,65,12,0.2)]";
                nameColor = "text-orange-400";
                pointColor = "text-orange-400";
                RankIcon = Medal;
                barColor = "bg-orange-500 shadow-[0_0_10px_rgba(194,65,12,0.8)]";
              }

              return (
                <Link 
                  href={`/profil/${user.userUuid}`} 
                  key={user.userUuid}
                  className={`flex items-center gap-4 p-4 sm:p-5 rounded-[24px] border backdrop-blur-xl transition-all duration-300 group ${cardClass}`}
                >
                  
                  {/* Sol Kısım: Sıra Numarası veya Kupa */}
                  <div className={`w-12 h-12 shrink-0 rounded-[16px] flex items-center justify-center font-black text-xl border transition-transform group-hover:scale-110 ${rankColor}`}>
                    {isFirst || isSecond || isThird ? <RankIcon size={22} /> : `#${index + 1}`}
                  </div>

                  {/* Orta Kısım: Kullanıcı Detayları ve Progress Bar */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <h3 className={`font-black text-[16px] sm:text-lg truncate ${nameColor}`}>
                        {displayName}
                      </h3>
                      {latestBadge && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-black tracking-widest uppercase whitespace-nowrap border ${isFirst ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white/[0.05] border-white/10 text-gray-400'}`}>
                          {latestBadge}
                        </span>
                      )}
                    </div>
                    
                    {/* Alt Bilgi: Seviye ve Neon Güç Barı */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                        SEVİYE {user.level}
                      </span>
                      <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`} 
                          style={{ width: `${fillPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Kısım: XP Puanı ve Trend İkonu */}
                  <div className="shrink-0 text-right flex flex-col items-end justify-center gap-1">
                    <div className={`flex items-center gap-1.5 font-black text-2xl sm:text-3xl ${pointColor}`}>
                      {user.points} 
                      <Flame size={20} className={isFirst ? 'text-amber-500 animate-pulse' : 'text-gray-500 opacity-70'} />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">
                      <span className="text-gray-500">XP</span>
                      {/* Gelişimi simgeleyen yeşil trend oku */}
                      <span className="flex items-center gap-0.5 text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <TrendingUp size={10} />
                      </span>
                    </div>
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