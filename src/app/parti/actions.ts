"use server";

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';

export async function sendPartyMessage(formData: FormData) {
  try {
    const type = formData.get('type') as string; 
    const content = formData.get('content') as string;
    
    const cookieStore = await cookies();
    let authorId = cookieStore.get('tnku_author_id')?.value || cookieStore.get('user_uuid')?.value;
    
    if (!authorId) {
        authorId = 'party_anon_' + Date.now();
    }

    if (!content || content.length < 2) return { error: "İçerik çok kısa!" };

    // 🔥 Prisma'nın istediği TÜM boş alanları doldurarak gönderiyoruz ki hata vermesin!
    await (prisma as any).post.create({
      data: {
        type: 'TEXT', 
        content: content.trim(),
        location: `PARTY_${type.toUpperCase()}`, // PARTY_ITIRAF, PARTY_REZIL, PARTY_OVERHEARD
        people: 'PARTI_MODU', 
        gender: 'UNKNOWN',
        authorUuid: authorId,
        status: 'APPROVED',
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("🔥 VERİTABANI ÇÖKTÜ 🔥:", error);
    // Hatayı gizlemiyoruz, ön yüze fırlatıyoruz!
    return { error: error.message || "Bilinmeyen bir veritabanı hatası!" };
  }
}

export async function getLatestPartyMessage() {
  noStore(); // Önbelleği yok et!
  try {
    const msg = await (prisma as any).post.findFirst({
      where: { 
        location: { in: ['PARTY_ITIRAF', 'PARTY_REZIL', 'PARTY_OVERHEARD'] } 
      },
      orderBy: { createdAt: 'desc' },
    });
    return msg;
  } catch (error) {
    return null;
  }
}