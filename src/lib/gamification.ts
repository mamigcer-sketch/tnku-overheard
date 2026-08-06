import prisma from '@/lib/prisma';

// 🔥 RÜTBE VE ROZET SİSTEMİ (Puan Sınırları)
const BADGE_THRESHOLDS = [
  { points: 50, name: "Çırak İtirafçı 🐣" },
  { points: 150, name: "Laf Ebesi 💬" },
  { points: 300, name: "Ortamın Arananı 🔥" },
  { points: 500, name: "Kampüs Sefiri 👑" },
  { points: 1000, name: "Efsanevi Ruh 👻" }
];

export async function addPoints(userUuid: string, pointsToAdd: number) {
  if (!userUuid) return;

  try {
    // 1. Kullanıcının puanını güncelle (Yoksa 0'dan başlatıp ekle)
    const stats = await (prisma as any).userStats.upsert({
      where: { userUuid },
      update: { points: { increment: pointsToAdd } },
      create: { userUuid, points: pointsToAdd, level: 1 }
    });

    const currentPoints = stats.points;

    // 2. Hak ettiği yeni rozetler var mı diye kontrol et
    for (const threshold of BADGE_THRESHOLDS) {
      if (currentPoints >= threshold.points) {
        // Rozeti daha önce almış mı diye kontrol eder, almadıysa ekler
        try {
          await (prisma as any).unlockedBadge.upsert({
            where: {
              userUuid_badgeName: {
                userUuid: userUuid,
                badgeName: threshold.name
              }
            },
            update: {}, // Varsa dokunma
            create: {
              userUuid: userUuid,
              badgeName: threshold.name
            }
          });
        } catch (e) {
          // Benzersizlik (unique constraint) hatası verirse yoksay, zaten almış demektir.
        }
      }
    }

    return stats;
  } catch (error) {
    console.error("Puan eklenirken hata oluştu:", error);
  }
}