"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { addPoints } from '@/lib/gamification'; // 🔥 Gamification motorunu buraya çağırdık!

// 🔥 Ortak Çerez Yöneticisi
async function getOrCreateAuthorId() {
  const cookieStore = await cookies();
  let authorId = cookieStore.get('tnku_author_id')?.value;

  if (!authorId) {
    authorId = crypto.randomUUID(); 
    cookieStore.set({
      name: 'tnku_author_id',
      value: authorId,
      maxAge: 60 * 60 * 24 * 365, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', 
    });
  }

  return authorId;
}

// 1. Post Oluşturma (🔥 Base64 Sesli Fısıltı ve 24 Saat Yok Olma Desteği)
export async function createPost(formData: FormData) {
  const authorUuid = await getOrCreateAuthorId();

  const isBanned = await (prisma as any).bannedUser.findUnique({
    where: { userUuid: authorUuid }
  });

  if (isBanned) {
    throw new Error("Bu platformdan engellendiğiniz için paylaşım yapamazsınız.");
  }

  const type = formData.get("type") as string;
  const content = formData.get("content") as string;
  const location = formData.get("location") as string;
  const people = formData.get("people") as string;
  const gender = formData.get("gender") as string;
  const isEphemeral = formData.get("isEphemeral") === "true";
  
  // 🔥 İstemciden gelen Base64 ses verisini doğrudan yakala
  const audioUrl = formData.get("audioUrl") as string | null;

  // Eğer 24 saat sonra kaybolması seçildiyse, bitiş zamanını şimdiden 24 saat sonrasına ayarla
  const expiresAt = isEphemeral ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

  const post = await prisma.post.create({
    data: {
      type,
      content: content || "", 
      location,
      people,
      gender,
      authorUuid, 
      status: 'PENDING', 
      audioUrl: audioUrl || null, // 🔥 Ses verisi doğrudan veritabanına yazılıyor
      expiresAt,
    },
  });

  // 🔥 İŞTE BURASI: Yeni gönderi paylaşıldığı an kullanıcıya şak diye +10 XP veriyoruz!
  await addPoints(authorUuid, 10);

  revalidatePath("/");
  return post; 
}

// 2. Yorum Ekleme ve Yanıtlama (BİLDİRİM SİSTEMİ)
export async function addComment(formData: FormData) {
  const authorId = await getOrCreateAuthorId();

  const isBanned = await (prisma as any).bannedUser.findUnique({
    where: { userUuid: authorId }
  });

  if (isBanned) {
    throw new Error("Bu platformdan engellendiğiniz için yorum yapamazsınız.");
  }

  const postId = formData.get("postId") as string;
  const content = formData.get("content") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!postId || !content || !content.trim()) return;

  await prisma.comment.create({
    data: {
      postId,
      content: content.trim(),
      authorId, 
      parentId: parentId || null, 
    },
  });

  // 🔥 İŞTE BURASI: Yorum yapıldığı an kullanıcıya şak diye +5 XP veriyoruz!
  await addPoints(authorId, 5);

  // 🔥 BİLDİRİM GÖNDERME MANTIĞI
  try {
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (parentComment && parentComment.authorId && parentComment.authorId !== authorId) {
        await (prisma as any).notification.create({
          data: {
            userUuid: parentComment.authorId,
            message: "💬 Birisi yorumuna yanıt verdi!",
            postId: postId
          }
        });
      }
    } else {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (post && post.authorUuid && post.authorUuid !== authorId) {
        await (prisma as any).notification.create({
          data: {
            userUuid: post.authorUuid,
            message: "🔔 Fısıltına/İtirafına yeni bir yorum geldi!",
            postId: postId
          }
        });
      }
    }
  } catch (err) {
    console.error("Bildirim oluşturulamadı:", err);
  }
  
  revalidatePath(`/post/${postId}`); 
  revalidatePath("/");
}

// 3. Görüntülenme Artırma
export async function incrementView(id: string) {
  await prisma.post.update({
    where: { id },
    data: { views: { increment: 1 } }
  });
}

// 4. ID'ye göre Postları Çekme (Yorum sayımı için include eklendi)
export async function getPostsByIds(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  return await prisma.post.findMany({
    where: { 
      id: { in: ids } 
    },
    include: { comments: { select: { id: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

// 5. RAW SQL: Beğeni İşlemi
export async function toggleCommentLike(commentId: string, postId: string) {
  const authorId = await getOrCreateAuthorId();

  try {
    const existingLikes: any[] = await prisma.$queryRaw`
      SELECT "id" FROM "CommentLike" 
      WHERE "commentId" = ${commentId} AND "userUuid" = ${authorId} 
      LIMIT 1
    `;

    if (existingLikes.length > 0) {
      await prisma.$executeRaw`
        DELETE FROM "CommentLike" 
        WHERE "commentId" = ${commentId} AND "userUuid" = ${authorId}
      `;
      await prisma.$executeRaw`
        UPDATE "Comment" 
        SET "likes" = GREATEST(0, "likes" - 1) 
        WHERE "id" = ${commentId}
      `;
    } else {
      const newId = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO "CommentLike" ("id", "commentId", "userUuid", "createdAt") 
        VALUES (${newId}, ${commentId}, ${authorId}, NOW())
      `;
      await prisma.$executeRaw`
        UPDATE "Comment" 
        SET "likes" = "likes" + 1 
        WHERE "id" = ${commentId}
      `;
    }

    revalidatePath(`/post/${postId}`);
  } catch (err) {
    console.error("SQL ile Beğeni İşlenirken Kritik Hata:", err);
    throw new Error("Beğeni veritabanına kaydedilemedi"); 
  }
}

// 6. Şikayet Etme (Report) Sistemi
export async function submitReport(type: 'POST' | 'COMMENT', itemId: string, reason: string) {
  if (type === 'POST') {
    await (prisma as any).report.create({ data: { postId: itemId, reason } });
  } else {
    await (prisma as any).report.create({ data: { commentId: itemId, reason } });
  }
}

// 7. Bildirimleri Okundu Olarak İşaretleme
export async function markNotificationsAsRead() {
  try {
    const authorId = await getOrCreateAuthorId();
    await (prisma as any).notification.updateMany({
      where: { userUuid: authorId, isRead: false },
      data: { isRead: true }
    });
  } catch (err) {
    console.error("Bildirimler okundu işaretlenemedi:", err);
  }
}

export async function toggleCommentReaction(commentId: string, emoji: string, postId: string) {
  const authorId = await getOrCreateAuthorId();
  if (!authorId) return;

  try {
    const existing = await prisma.commentReaction.findFirst({
      where: { commentId, userUuid: authorId, emoji }
    });

    if (existing) {
      await prisma.commentReaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.commentReaction.create({ 
        data: { commentId, userUuid: authorId, emoji } 
      });
    }
  } catch (err) {
    console.error("Reaksiyon kayıt hatası:", err);
  }

  revalidatePath(`/post/${postId}`);
}

// =====================================================================================
// 🔥 YENİ EKLENEN PROFİL BİLEŞENİ FONKSİYONLARI (Z-Index / Modal Hatalarını Çözen Sistem)
// =====================================================================================

// 8. Özel Nickname (Kullanıcı Adı) Güncelleme
export async function updateCustomNickname(formData: FormData) {
  try {
    const nickname = (formData.get('nickname') as string)?.trim();
    const targetUuid = (formData.get('userUuid') as string)?.trim();

    // Güvenlik Önlemi: Eğer targetUuid yoksa işlemi iptal et (kendi kendine oluşturmasın diye)
    if (!targetUuid) {
       return { error: 'Profil ID bulunamadı.' };
    }

    if (!nickname) {
      return { error: 'Lütfen geçerli bir nick gir.' };
    }

    // Harf, rakam, alt çizgi ve Türkçe karakterler serbest (boşlukları temizle)
    const cleanNick = nickname.replace(/[^a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ ]/g, '').trim();
    
    if (cleanNick.length < 2 || cleanNick.length > 20) {
      return { error: 'Nick 2 ile 20 karakter arasında olmalıdır.' };
    }

    // 🔥 UPSERT: Varsa Güncelle, Yoksa Yeni Oluştur (Kritik Çözüm)
    await (prisma as any).customNickname.upsert({
      where: { userUuid: targetUuid },
      update: { nickname: cleanNick },
      create: { userUuid: targetUuid, nickname: cleanNick }
    });

    // Sayfaların yeniden oluşturulmasını sağla (Önbellek Temizliği)
    revalidatePath('/');
    revalidatePath(`/profil/${targetUuid}`);
    revalidatePath(`/profil/ben`);
    revalidatePath('/sohbet');
    revalidatePath('/liderlik');

    return { success: true, nickname: cleanNick };
  } catch (error: any) {
    console.error("Nick Güncelleme Hatası:", error);
    return { error: 'Nick güncellenirken sunucu hatası oluştu.' };
  }
}

// 9. Profil Avatarı / Emojisi Güncelleme
export async function updateProfileAvatar(formData: FormData) {
  try {
    const avatarUrl = formData.get("avatarUrl") as string;
    const targetUuid = (formData.get('userUuid') as string)?.trim();

    if (!targetUuid || !avatarUrl) {
      return { error: "Eksik bilgi gönderildi." };
    }

    // 🔥 UPSERT: Varsa Avatarı Güncelle, Yoksa Yeni Oluştur
    await (prisma as any).userAvatar.upsert({
      where: { userUuid: targetUuid },
      update: { avatarUrl },
      create: { userUuid: targetUuid, avatarUrl },
    });

    // Sayfaların yeniden oluşturulmasını sağla (Önbellek Temizliği)
    revalidatePath('/');
    revalidatePath(`/profil/${targetUuid}`);
    revalidatePath(`/profil/ben`);
    revalidatePath('/liderlik');
    revalidatePath('/sohbet');

    return { success: true };
  } catch (error) {
    console.error("Avatar Güncelleme Hatası:", error);
    return { error: "Profil resmi güncellenirken bir hata oluştu." };
  }
}