'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 🗳️ Oy Kullan veya Oyunu Değiştir
export async function castVote(userUuid: string, genre: 'POP' | 'RAP' | 'ROCK') {
  try {
    if (!userUuid) return { error: "Kullanıcı ID bulunamadı." };

    await prisma.vote.upsert({
      where: { userUuid },
      update: { genre },
      create: { userUuid, genre },
    });

    revalidatePath('/parti');
    revalidatePath('/dj');
    return { success: true };
  } catch (error: any) {
    console.error("Oy kullanma hatası:", error);
    return { error: "Oy kullanılamadı." };
  }
}

// 🛠️ ADMİN İÇİN: Manuel Oy Ekleme (Manipülasyon)
export async function adminAddVote(genre: 'POP' | 'RAP' | 'ROCK') {
  try {
    // Rastgele sahte bir userUuid ile admin oyu ekliyoruz
    const fakeUuid = 'admin_boost_' + Math.random().toString(36).substring(2, 9) + Date.now();
    
    await prisma.vote.create({
      data: {
        userUuid: fakeUuid,
        genre: genre,
      }
    });

    revalidatePath('/parti');
    revalidatePath('/dj');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error("Admin oy ekleme hatası:", error);
    return { error: "Oy eklenemedi." };
  }
}

// 📊 Canlı Oy İstatistiklerini Getir
export async function getVoteStats(userUuid?: string) {
  try {
    const votes = await prisma.vote.findMany();
    const totalVotes = votes.length;

    const popCount = votes.filter(v => v.genre === 'POP').length;
    const rapCount = votes.filter(v => v.genre === 'RAP').length;
    const rockCount = votes.filter(v => v.genre === 'ROCK').length;

    const popPercent = totalVotes > 0 ? Math.round((popCount / totalVotes) * 100) : 0;
    const rapPercent = totalVotes > 0 ? Math.round((rapCount / totalVotes) * 100) : 0;
    const rockPercent = totalVotes > 0 ? Math.round((rockCount / totalVotes) * 100) : 0;

    let userVote: string | null = null;
    if (userUuid) {
      const vote = votes.find(v => v.userUuid === userUuid);
      if (vote) userVote = vote.genre;
    }

    let leading = 'POP';
    if (rapCount > popCount && rapCount >= rockCount) leading = 'RAP';
    else if (rockCount > popCount && rockCount > rapCount) leading = 'ROCK';

    return {
      totalVotes,
      userVote,
      leading,
      stats: {
        POP: { count: popCount, percent: popPercent },
        RAP: { count: rapCount, percent: rapPercent },
        ROCK: { count: rockCount, percent: rockPercent },
      }
    };
  } catch (error: any) {
    console.error("İstatistik hatası:", error);
    return null;
  }
}

// 🧹 Oyları Sıfırla
export async function resetVotes() {
  await prisma.vote.deleteMany();
  revalidatePath('/parti');
  revalidatePath('/dj');
}