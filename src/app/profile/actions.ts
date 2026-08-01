'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateCustomNickname(formData: FormData) {
  try {
    const nickname = (formData.get('nickname') as string)?.trim();
    let userUuid = (formData.get('userUuid') as string)?.trim();

    const cookieStore = await cookies();

    // 1. Form verisinde yoksa sunucu çerezlerinden çekmeyi dene
    if (!userUuid) {
      userUuid = cookieStore.get('user_uuid')?.value || cookieStore.get('tnku_author_id')?.value || '';
    }

    // 🔥 KESİN ÇÖZÜM: Eğer hiçbir yerde UUID yoksa, anında yeni bir tane oluşturup çereze çakıyoruz!
    if (!userUuid) {
      userUuid = 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    // Kullanıcının tarayıcısına çerezi mühürlüyoruz
    cookieStore.set('user_uuid', userUuid, { 
      maxAge: 60 * 60 * 24 * 365, // 1 yıl
      httpOnly: true,
      path: '/'
    });

    if (!nickname) {
      return { error: 'Lütfen geçerli bir nick gir.' };
    }

    if (nickname.length < 2 || nickname.length > 15) {
      return { error: 'Nick 2 ile 15 karakter arasında olmalıdır.' };
    }

    const cleanNick = nickname.replace(/[^a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ]/g, '');
    if (!cleanNick) {
      return { error: 'Nick sadece harf, rakam ve alt çizgi içerebilir.' };
    }

    // 🔥 UPSERT: Veritabanında varsa güncelle, yoksa yeni kayıt aç (Çakışmayı önler)
    await (prisma as any).customNickname.upsert({
      where: { userUuid },
      update: { nickname: cleanNick },
      create: { userUuid, nickname: cleanNick }
    });

    revalidatePath('/');
    revalidatePath(`/profil/${userUuid}`);
    revalidatePath(`/profil/ben`);
    revalidatePath('/admin');
    revalidatePath('/sohbet');

    return { success: true, nickname: cleanNick };
  } catch (error: any) {
    console.error("updateCustomNickname hatası:", error);
    return { error: 'Veritabanı güncellenirken bir hata oluştu.' };
  }
}