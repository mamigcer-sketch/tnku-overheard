'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const PARTY_LOCATIONS = [
  'PARTY_ITIRAF',
  'PARTY_REZIL',
  'PARTY_LINC',
  'PARTY_LİNÇ',
  'PARTY_IFSA',
  'PARTY_OVERHEARD',
];

// Parti giriş şifresi kontrolü
export async function verifyPartyPassword(password: string) {
  const normalized = (password || '').trim().toLocaleLowerCase('tr-TR');
  return normalized === 'scap';
}

// Admin paneli giriş şifresi kontrolü
export async function verifyAdminPassword(password: string) {
  const normalized = (password || '').trim().toLocaleLowerCase('tr-TR');
  return normalized === 'dayılar';
}

// Bekleyen günahları getir
export async function getPendingMessages() {
  return await prisma.post.findMany({
    where: {
      location: { in: PARTY_LOCATIONS },
      status: 'PENDING',
    },
    orderBy: { createdAt: 'asc' },
  });
}

// Şu an DJ ekranında yayında olan aktif günahı getir
export async function getActiveMessage() {
  return await prisma.post.findFirst({
    where: {
      location: { in: PARTY_LOCATIONS },
      status: 'APPROVED',
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Günahı onayla ve DJ ekranına fırlat
export async function approveMessage(id: string) {
  await prisma.post.updateMany({
    where: {
      location: { in: PARTY_LOCATIONS },
      status: 'APPROVED',
    },
    data: { status: 'COMPLETED' },
  });

  await prisma.post.update({
    where: { id },
    data: {
      status: 'APPROVED',
      createdAt: new Date(),
    },
  });

  revalidatePath('/dj');
  revalidatePath('/admin');
}

// Uygunsuz / boş mesajları sil
export async function rejectMessage(id: string) {
  await prisma.post.delete({
    where: { id },
  });

  revalidatePath('/admin');
}

// DJ ekranındaki aktif günahı kaldır (Bekleme moduna dön)
export async function clearActiveMessage() {
  await prisma.post.updateMany({
    where: {
      location: { in: PARTY_LOCATIONS },
      status: 'APPROVED',
    },
    data: { status: 'COMPLETED' },
  });

  revalidatePath('/dj');
  revalidatePath('/admin');
}

// Yayına almadan önce yazım hatası / sansür düzenlemesi yap
export async function updateMessage(id: string, content: string, location: string) {
  await prisma.post.update({
    where: { id },
    data: { content, location },
  });

  revalidatePath('/admin');
  revalidatePath('/dj');
}

// Katılımcı ekranından gönderilen günahı kaydet
export async function sendPartyMessage(formData: FormData) {
  try {
    const type = formData.get('type') as string;
    const content = formData.get('content') as string;

    if (!content || !content.trim()) {
      return { error: 'Günah metni boş olamaz!' };
    }

    if (content.trim().length > 300) {
      return { error: 'Günahın en fazla 300 karakter olabilir!' };
    }

    const targetLocation = type || 'PARTY_ITIRAF';

    await prisma.post.create({
      data: {
        type: 'PARTY_MODE',
        content: content.trim(),
        location: targetLocation,
        status: 'PENDING',
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Günah gönderilemedi:', error);
    return { error: error.message || 'Veritabanı kayıt hatası oluştu.' };
  }
}

// Tüm parti/günah itiraflarını veritabanından kalıcı olarak sil
export async function deleteAllMessages() {
  await prisma.post.deleteMany({
    where: {
      location: { in: PARTY_LOCATIONS },
    },
  });

  revalidatePath('/dj');
  revalidatePath('/admin');
}