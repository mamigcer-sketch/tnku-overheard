"use server";

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getOrCreateAuthorId() {
  const cookieStore = await cookies();
  let authorId = cookieStore.get('tnku_author_id')?.value;
  if (!authorId) {
    authorId = crypto.randomUUID();
    cookieStore.set({ name: 'tnku_author_id', value: authorId, maxAge: 60 * 60 * 24 * 365, path: '/' });
  }
  return authorId;
}

export async function sendPartyMessage(formData: FormData) {
  try {
    const type = formData.get('type') as string; 
    const content = formData.get('content') as string;
    const authorId = await getOrCreateAuthorId();

    if (!content || content.trim().length < 2) {
      return { error: "Mesaj çok kısa!" };
    }

    const cleanType = type ? type.toUpperCase() : 'ITIRAF';

    await (prisma as any).post.create({
      data: {
        type: cleanType,
        content: content.trim(),
        location: `PARTY_${cleanType}`, 
        people: 'PARTI_MODU', 
        gender: 'UNKNOWN',
        authorUuid: authorId,
        status: 'APPROVED', // Doğrudan onaylı düşüyor
      }
    });

    revalidatePath('/party'); // Parti sayfasının önbelleğini patlatıyoruz
    return { success: true };
  } catch (error: any) {
    console.error("🔥 PARTİ MESAJ HATASI:", error);
    return { error: error.message || "Veritabanı hatası oluştu!" };
  }
}