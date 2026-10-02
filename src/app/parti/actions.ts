'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function sendPartyMessage(formData: FormData) {
  try {
    const type = formData.get('type') as string;
    const content = formData.get('content') as string;

    if (!content || !content.trim()) {
      return { error: "Mesaj içeriği boş olamaz!" };
    }

    const locationMapping: Record<string, string> = {
      'ITIRAF': 'PARTY_ITIRAF',
      'REZIL': 'PARTY_REZIL',
      'OVERHEARD': 'PARTY_OVERHEARD'
    };

    const targetLocation = locationMapping[type] || 'PARTY_ITIRAF';

    await prisma.post.create({
      data: {
        type: 'PARTY_MODE', // Şemandaki zorunlu alanı dolduruyoruz
        content: content.trim(),
        location: targetLocation,
        status: 'APPROVED'
      },
    });

    revalidatePath('/dj');
    return { success: true };
  } catch (error: any) {
    console.error("Mesaj gönderilemedi:", error);
    return { error: error.message || "Veritabanı kayıt hatası oluştu." };
  }
}