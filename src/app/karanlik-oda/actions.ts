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

export async function rollRoulette(betAmount: number) {
  const cookieStore = await cookies();
  const userUuid = cookieStore.get('tnku_author_id')?.value || cookieStore.get('user_uuid')?.value;
  
  if (!userUuid) return { error: "Kimlik doğrulanamadı." };
  if (betAmount <= 0) return { error: "Geçersiz bahis." };

  const stats = await prisma.userStats.findUnique({ where: { userUuid } });
  if (!stats || stats.points < betAmount) return { error: "Yetersiz XP." };

  // 🔥 KUMAR ALGORİTMASI: Kasa %55 Kazanır, Oyuncu %45 Kazanır
  const isWin = Math.random() < 0.45;
  const newPoints = isWin ? stats.points + betAmount : stats.points - betAmount;

  await prisma.userStats.update({
    where: { userUuid },
    data: { points: newPoints }
  });

  revalidatePath('/liderlik');
  return { success: true, isWin, newPoints, betAmount };
}