'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// ------------------------------------------------------------------
// 🔥 ESKİ FORM DATA FONKSİYONLARI (BAŞKA YERDE KULLANILIYOR OLABİLİR)
// ------------------------------------------------------------------

export async function updateCustomNickname(formData: FormData) {
  try {
    const nickname = (formData.get('nickname') as string)?.trim();
    let userUuid = (formData.get('userUuid') as string)?.trim();

    const cookieStore = await cookies();

    if (!userUuid) {
      userUuid = cookieStore.get('user_uuid')?.value || cookieStore.get('tnku_author_id')?.value || '';
    }

    if (!userUuid) {
      userUuid = 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    cookieStore.set('user_uuid', userUuid, { 
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      path: '/'
    });

    if (!nickname) return { error: 'Lütfen geçerli bir nick gir.' };
    if (nickname.length < 2 || nickname.length > 20) return { error: 'Nick 2 ile 20 karakter arasında olmalıdır.' };

    const cleanNick = nickname.replace(/[^a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ ]/g, '');
    if (!cleanNick) return { error: 'Nick geçersiz karakterler içeriyor.' };

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

export async function updateProfileAvatar(formData: FormData) {
  try {
    const avatarUrl = formData.get("avatarUrl") as string;
    let userUuid = (formData.get('userUuid') as string)?.trim();

    const cookieStore = await cookies();

    if (!userUuid) {
      userUuid = cookieStore.get('user_uuid')?.value || cookieStore.get('tnku_author_id')?.value || '';
    }

    if (!userUuid || !avatarUrl) return { error: "Eksik bilgi gönderildi." };

    await (prisma as any).userAvatar.upsert({
      where: { userUuid },
      update: { avatarUrl },
      create: { userUuid, avatarUrl },
    });

    revalidatePath('/');
    revalidatePath(`/profil/${userUuid}`);
    revalidatePath(`/profil/ben`);
    revalidatePath('/liderlik');
    revalidatePath('/sohbet');

    return { success: true };
  } catch (error) {
    console.error("updateProfileAvatar hatası:", error);
    return { error: "Profil resmi güncellenirken bir hata oluştu." };
  }
}

// ------------------------------------------------------------------
// 🔥 YENİ MODERN BİLEŞENLERİN (EditableAvatar & ProfileNickEdit) KULLANDIĞI FONKSİYONLAR 🔥
// ------------------------------------------------------------------

export async function updateNickname(userUuid: string, nickname: string) {
  if (!userUuid || !nickname.trim()) return { error: "Geçersiz veri" };

  try {
    // Sadece harf, rakam ve alt çizgi/boşluk kabul et
    const cleanNick = nickname.trim().replace(/[^a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ ]/g, '');
    if (!cleanNick) return { error: 'Geçersiz nick' };

    await (prisma as any).customNickname.upsert({
      where: { userUuid },
      update: { nickname: cleanNick },
      create: { userUuid, nickname: cleanNick }
    });

    revalidatePath('/');
    revalidatePath(`/profil/${userUuid}`);
    revalidatePath(`/profil/ben`);
    revalidatePath('/sohbet');
    revalidatePath('/liderlik');
    
    return { success: true };
  } catch (error) {
    console.error("Nick güncelleme hatası:", error);
    throw new Error("Nick güncellenemedi");
  }
}

export async function updateUserAvatar(userUuid: string, avatarUrl: string) {
  if (!userUuid || !avatarUrl) return { error: "Geçersiz veri" };

  try {
    await (prisma as any).userAvatar.upsert({
      where: { userUuid },
      update: { avatarUrl },
      create: { userUuid, avatarUrl }
    });

    revalidatePath('/');
    revalidatePath(`/profil/${userUuid}`);
    revalidatePath(`/profil/ben`);
    revalidatePath('/liderlik');
    revalidatePath('/sohbet');

    return { success: true };
  } catch (error) {
    console.error("Avatar güncelleme hatası:", error);
    throw new Error("Avatar güncellenemedi");
  }
}