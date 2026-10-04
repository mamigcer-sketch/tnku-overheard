'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Bekleyen mesajları getir (Parti modu olanları direkt getiriyoruz, filtre takılmasın)
export async function getPendingMessages() {
  return await prisma.post.findMany({
    where: {
      type: 'PARTY_MODE',
      status: 'PENDING'
    },
    orderBy: { createdAt: 'asc' }
  });
}

// Mesajı onayla ve DJ ekranına fırlat
export async function approveMessage(id: string) {
  // Önce daha önceden yayında olan parti mesajlarını COMPLETED yapıyoruz
  await prisma.post.updateMany({
    where: { 
      type: 'PARTY_MODE',
      status: 'APPROVED' 
    },
    data: { status: 'COMPLETED' }
  });

  // Seçilen mesajı yayına alıyoruz
  await prisma.post.update({
    where: { id },
    data: { 
      status: 'APPROVED', 
      createdAt: new Date() 
    } 
  });
  
  revalidatePath('/dj');
  revalidatePath('/admin');
}

// Saçma sapan mesajları çöpe at
export async function rejectMessage(id: string) {
  await prisma.post.delete({
    where: { id }
  });
}

// Ekranda aktif olan mesajı temizle (İntroya dön)
export async function clearActiveMessage() {
  await prisma.post.updateMany({
    where: { 
      type: 'PARTY_MODE',
      status: 'APPROVED' 
    },
    data: { status: 'COMPLETED' }
  });
  
  revalidatePath('/dj');
  revalidatePath('/admin');
}

// Admin panelinden metin veya kategori güncelleme
export async function updateMessage(id: string, content: string, location: string) {
  await prisma.post.update({
    where: { id },
    data: { content: content.trim(), location }
  });
  revalidatePath('/admin');
  revalidatePath('/dj');
}

// Kullanıcının masadan gönderdiği mesajı kaydetme
export async function sendPartyMessage(formData: FormData) {
  try {
    const type = formData.get('type') as string;
    const content = formData.get('content') as string;

    if (!content || !content.trim()) {
      return { error: "Mesaj içeriği boş olamaz!" };
    }

    const targetLocation = type || 'PARTY_ITIRAF';

    await prisma.post.create({
      data: {
        type: 'PARTY_MODE', 
        content: content.trim(),
        location: targetLocation,
        status: 'PENDING' 
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Mesaj gönderilemedi:", error);
    return { error: error.message || "Veritabanı kayıt hatası oluştu." };
  }
}