'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getUserPoints() {
  const cookieStore = await cookies();
  const userUuid = cookieStore.get('tnku_author_id')?.value || cookieStore.get('user_uuid')?.value;
  if (!userUuid) return 0;
  
  const stats = await prisma.userStats.findUnique({ where: { userUuid } });
  return stats?.points || 0;
}

export async function startCrashGame(betAmount: number) {
  const cookieStore = await cookies();
  const userUuid = cookieStore.get('tnku_author_id')?.value || cookieStore.get('user_uuid')?.value;
  
  if (!userUuid) return { error: "Kimlik doğrulanamadı." };
  if (betAmount <= 0) return { error: "Geçersiz bahis." };

  const stats = await prisma.userStats.findUnique({ where: { userUuid } });
  if (!stats || stats.points < betAmount) return { error: "Yetersiz XP." };

  // 🔥 1. Adım: Kullanıcının bahsini kasadan düş (Kaybederse zaten gitmiş olacak)
  await prisma.userStats.update({
    where: { userUuid },
    data: { points: stats.points - betAmount }
  });

  // 🔥 2. Adım: Çöküş Noktasını Belirle (Crash Algoritması)
  // %8 İhtimalle direkt 1.00x'da patlar (Acımasız Kasa Avantajı)
  let crashPoint = 1.00;
  if (Math.random() > 0.08) {
    // Ağırlıklı olarak düşük sayılara, nadiren çok yüksek sayılara (örn: 20x, 50x) giden matematiksel formül
    crashPoint = parseFloat((100 / (100 - Math.random() * 98)).toFixed(2));
  }

  // Maksimum 100x'te zorunlu patlatıyoruz (Siteyi iflas ettirmesinler)
  crashPoint = Math.min(100.00, Math.max(1.00, crashPoint));

  revalidatePath('/liderlik');
  return { success: true, crashPoint };
}

export async function claimCrashWin(betAmount: number, multiplier: number) {
  const cookieStore = await cookies();
  const userUuid = cookieStore.get('tnku_author_id')?.value || cookieStore.get('user_uuid')?.value;
  if (!userUuid) return { error: "Kimlik hatası." };

  const winAmount = Math.floor(betAmount * multiplier);

  const stats = await prisma.userStats.findUnique({ where: { userUuid } });
  const newTotal = (stats?.points || 0) + winAmount;

  // 🔥 Kazanılan XP'yi hesaba ekle
  await prisma.userStats.update({
    where: { userUuid },
    data: { points: newTotal }
  });

  revalidatePath('/liderlik');
  return { success: true, newPoints: newTotal, winAmount };
}