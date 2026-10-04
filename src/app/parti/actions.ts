'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Bekleyen mesajları getir (Eskiden yeniye doğru, önce atan önce onaylanır)
export async function getPendingMessages() {
  return await prisma.post.findMany({
    where: {
      location: { in: ['PARTY_ITIRAF', 'PARTY_REZIL', 'PARTY_LINC', 'PARTY_LİNÇ', 'PARTY_OVERHEARD'] },
      status: 'PENDING'
    },
    orderBy: { createdAt: 'asc' }
  });
}

// Mesajı onayla ve DJ ekranına fırlat
export async function approveMessage(id: string) {
  // Önce daha önceden yayında olan mesaj varsa onları "COMPLETED" yapıp ekrandan düşürüyoruz
  await prisma.post.updateMany({
    where: { 
      location: { in: ['PARTY_ITIRAF', 'PARTY_REZIL', 'PARTY_LINC', 'PARTY_LİNÇ', 'PARTY_OVERHEARD'] },
      status: 'APPROVED' 
    },
    data: { status: 'COMPLETED' }
  });

  // Şimdi yeni seçtiğimiz mesajı yayına alıyoruz
  await prisma.post.update({
    where: { id },
    data: { 
      status: 'APPROVED', 
      createdAt: new Date() // 🔥 Onaylandığı anı yeni gibi göster ki dev ekranda ilk bu çıksın
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

// 🔥 EKRANI TEMİZLE BUTONU İÇİN ÇALIŞACAK KOD
export async function clearActiveMessage() {
  await prisma.post.updateMany({
    where: { 
      location: { in: ['PARTY_ITIRAF', 'PARTY_REZIL', 'PARTY_LINC', 'PARTY_LİNÇ', 'PARTY_OVERHEARD'] },
      status: 'APPROVED' 
    },
    data: { status: 'COMPLETED' }
  });
  
  revalidatePath('/dj');
  revalidatePath('/admin');
}

// 🔥 ADMIN PANELİNDEN METİN VEYA KATEGORİ GÜNCELLEME
export async function updateMessage(id: string, content: string, location: string) {
  await prisma.post.update({
    where: { id },
    data: { content, location }
  });
  revalidatePath('/admin');
  revalidatePath('/dj');
}

export async function sendPartyMessage(formData: FormData) {
  try {
    const type = formData.get('type') as string;
    const content = formData.get('content') as string;

    if (!content || !content.trim()) {
      return { error: "Mesaj içeriği boş olamaz!" };
    }

    // Doğrudan formdan gelen türü location olarak kaydediyoruz
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