'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Bekleyen mesajları getir (Eskiden yeniye doğru, önce atan önce onaylanır)
export async function getPendingMessages() {
  return await prisma.post.findMany({
    where: {
      location: { in: ['PARTY_ITIRAF', 'PARTY_REZIL', 'PARTY_OVERHEARD'] },
      status: 'PENDING'
    },
    orderBy: { createdAt: 'asc' }
  });
}

// Mesajı onayla ve DJ ekranına fırlat
export async function approveMessage(id: string) {
  await prisma.post.update({
    where: { id },
    data: { 
      status: 'APPROVED', 
      createdAt: new Date() // 🔥 Onaylandığı anı yeni gibi göster ki dev ekranda ilk bu çıksın
    } 
  });
  revalidatePath('/dj');
}

// Saçma sapan mesajları çöpe at
export async function rejectMessage(id: string) {
  await prisma.post.delete({
    where: { id }
  });
}