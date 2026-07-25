"use server";

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateCustomNickname(formData: FormData) {
  try {
    const nickname = formData.get('nickname') as string;
    const cookieStore = await cookies();
    const userUuid = cookieStore.get('tnku_author_id')?.value;

    if (!userUuid) {
      return { error: "Kimliğin doğrulanamadı. Lütfen sayfayı yenile." };
    }

    if (!nickname || nickname.trim().length < 2 || nickname.length > 15) {
      return { error: "Kullanıcı adı 2 ile 15 karakter arasında olmalıdır." };
    }

    // 🔥 Özel karakterleri ve boşlukları temizleyelim (sadece harf, rakam, alt tire)
    const cleanNickname = nickname.replace(/[^a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]/g, '');

    if (cleanNickname !== nickname) {
       return { error: "Kullanıcı adında sadece harf, rakam ve alt tire (_) kullanabilirsin." }
    }

    // Veritabanında varsa güncelle, yoksa yeni oluştur (upsert)
    await (prisma as any).customNickname.upsert({
      where: { userUuid: userUuid },
      update: { nickname: cleanNickname },
      create: { 
        userUuid: userUuid, 
        nickname: cleanNickname 
      }
    });

    // Ana sayfayı ve postları güncelle ki yeni isim anında yansısın
    revalidatePath('/');
    revalidatePath('/post/[id]', 'page');

    return { success: true };
  } catch (error) {
    console.error("Nick kaydetme hatası:", error);
    return { error: "Sunucu kaynaklı bir sorun oluştu." };
  }
}