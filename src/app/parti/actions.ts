"use server";

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// Parti mesajını veritabanına kaydet
export async function sendPartyMessage(formData: FormData) {
  try {
    const type = formData.get('type') as string;
    const content = formData.get('content') as string;
    
    const cookieStore = await cookies();
    let authorId = cookieStore.get('tnku_author_id')?.value || 'party_anon_' + Math.random().toString(36).substring(7);

    if (!content || content.length < 2) return { error: "Çok kısa!" };

    await (prisma as any).post.create({
      data: {
        type: 'PARTY', // Sisteme özel bir etiket
        location: type, // 'itiraf', 'rezil', 'overheard'
        content: content.trim(),
        authorUuid: authorId,
        status: 'APPROVED', // Anında ekrana düşmesi için
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Parti mesajı hatası:", error);
    return { error: "Mesaj gönderilemedi!" };
  }
}

// DJ Ekranı için son 1 mesajı çek
export async function getLatestPartyMessage() {
  try {
    const msg = await (prisma as any).post.findFirst({
      where: { type: 'PARTY' },
      orderBy: { createdAt: 'desc' },
    });
    return msg;
  } catch (error) {
    return null;
  }
}