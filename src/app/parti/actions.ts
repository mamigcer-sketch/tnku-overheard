"use server";

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { unstable_noStore as noStore } from 'next/cache';

export async function sendPartyMessage(formData: FormData) {
  try {
    const type = formData.get('type') as string; // 'itiraf', 'rezil', 'overheard'
    const content = formData.get('content') as string;
    
    const cookieStore = await cookies();
    let authorId = cookieStore.get('tnku_author_id')?.value;
    
    // Eğer kişi siteye ilk kez giriyorsa çökmesin diye rastgele ID veriyoruz
    if (!authorId) {
        authorId = 'party_' + Date.now();
    }

    if (!content || content.length < 2) return { error: "Çok kısa!" };

    // 🔥 İŞTE ÇÖZÜM: Prisma çökmesin diye type'ı 'TEXT' yapıp zorunlu alanları boş gönderiyoruz
    await (prisma as any).post.create({
      data: {
        type: 'TEXT', // Hata vermemesi için geçerli bir tip
        location: `PARTY_${type.toUpperCase()}`, // Örn: 'PARTY_ITIRAF' (DJ ekranı buradan tanıyacak)
        content: content.trim(),
        authorUuid: authorId,
        status: 'APPROVED', 
        people: '', // Zorunluysa boş geç
        gender: ''  // Zorunluysa boş geç
      }
    });

    // DJ Ekranının önbelleğini kır
    revalidatePath('/parti/dj');

    return { success: true };
  } catch (error: any) {
    console.error("🔥 PARTİ MESAJI KAYIT HATASI 🔥:", error);
    return { error: "Sunucu hatası!" };
  }
}

export async function getLatestPartyMessage(timestamp?: number) {
  noStore(); // Önbelleği (Cache) tamamen yok eder
  try {
    // 🔥 Sadece lokasyonunda 'PARTY_' yazan postları çeker
    const msg = await (prisma as any).post.findFirst({
      where: { 
        location: { startsWith: 'PARTY_' } 
      },
      orderBy: { createdAt: 'desc' },
    });
    return msg;
  } catch (error) {
    console.error("🔥 DJ EKRANI VERİ ÇEKME HATASI 🔥:", error);
    return null;
  }
}