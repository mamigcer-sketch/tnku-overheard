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

  // Bahsi kasadan düş
  await prisma.userStats.update({
    where: { userUuid },
    data: { points: stats.points - betAmount }
  });

  let crashPoint = 1.00;
  if (Math.random() > 0.08) {
    crashPoint = parseFloat((100 / (100 - Math.random() * 98)).toFixed(2));
  }
  crashPoint = Math.min(100.00, Math.max(1.00, crashPoint));

  // 🔥 BÜTÜN SİTENİN ÖNBELLEĞİNİ SIFIRLA (Liderlik tablosu anında güncellensin)
  revalidatePath('/', 'layout');
  return { success: true, crashPoint };
}

export async function claimCrashWin(betAmount: number, multiplier: number) {
  const cookieStore = await cookies();
  const userUuid = cookieStore.get('tnku_author_id')?.value || cookieStore.get('user_uuid')?.value;
  if (!userUuid) return { error: "Kimlik hatası." };

  const winAmount = Math.floor(betAmount * multiplier);

  const stats = await prisma.userStats.findUnique({ where: { userUuid } });
  const newTotal = (stats?.points || 0) + winAmount;

  await prisma.userStats.update({
    where: { userUuid },
    data: { points: newTotal }
  });

  // 🔥 BÜTÜN SİTENİN ÖNBELLEĞİNİ SIFIRLA
  revalidatePath('/', 'layout');
  return { success: true, newPoints: newTotal, winAmount };
}