"use server";

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache'; // 🔥 Önbelleği anında patlatmak için şart!

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

    if (!content || content.length < 2) return { error: "Çok kısa!" };

    await (prisma as any).post.create({
      data: {
        type: type ? type.toUpperCase() : 'TEXT', 
        content: content.trim(),
        location: `PARTY_${type ? type.toUpperCase() : 'GENERAL'}`, 
        people: 'PARTI_MODU', 
        gender: 'UNKNOWN',
        authorUuid: authorId,
        status: 'APPROVED',
      }
    });

    // 🔥 Next.js cache'ini yeniliyoruz ki dev ekran yeni mesajı hemen alsın!
    revalidatePath('/'); 
    // Eğer parti ekranı örneğin /party veya başka bir yolddaysa buraya da yazabilirsin:
    // revalidatePath('/party');

    return { success: true };
  } catch (error: any) {
    console.error("🔥 VERİTABANI ÇÖKTÜ 🔥:", error);
    return { error: error.message || "Bilinmeyen bir veritabanı hatası!" };
  }
}