"use server";

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { unstable_noStore as noStore } from 'next/cache';

export async function sendPartyMessage(formData: FormData) {
  try {
    const type = formData.get('type') as string;
    const content = formData.get('content') as string;
    
    const cookieStore = await cookies();
    let authorId = cookieStore.get('tnku_author_id')?.value || 'party_anon_' + Math.random().toString(36).substring(7);

    if (!content || content.length < 2) return { error: "Çok kısa!" };

    await (prisma as any).post.create({
      data: {
        type: 'PARTY', 
        location: type, 
        content: content.trim(),
        authorUuid: authorId,
        status: 'APPROVED', 
      }
    });

    // Mesaj atıldığı an DJ ekranını güncellemeye zorla
    revalidatePath('/parti/dj');

    return { success: true };
  } catch (error) {
    console.error("Parti mesajı hatası:", error);
    return { error: "Mesaj gönderilemedi!" };
  }
}

export async function getLatestPartyMessage(timestamp?: number) {
  noStore(); // 🔥 NEXT.JS'E EMİR: ASLA CACHE YAPMA, HEP TAZE VERİ GETİR! 🔥
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