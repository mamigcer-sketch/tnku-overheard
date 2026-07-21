"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';

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

// 1. Post Oluşturma (🔥 24 Saat Sonra Yok Olma Desteği)
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

  // Eğer 24 saat sonra kaybolması seçildiyse, bitiş zamanını şimdiden 24 saat sonrasına ayarla
  const expiresAt = isEphemeral ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

  const post = await prisma.post.create({
    data: {
      type,
      content,
      location,
      people,
      gender,
      authorUuid, 
      status: 'PENDING', 
      expiresAt,
    },
  });

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
  'use server';
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  
  let userUuid = cookieStore.get('tnku_author_id')?.value;
  if (!userUuid) {
    userUuid = cookieStore.get('user_uuid')?.value;
  }
  if (!userUuid) return;

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Daha önce bu emojiyi atmış mı kontrol et
    const existing = await prisma.commentReaction.findFirst({
      where: { commentId, userUuid, emoji }
    });

    if (existing) {
      // Varsa sil (geri al)
      await prisma.commentReaction.delete({ where: { id: existing.id } });
    } else {
      // Yoksa oluştur
      await prisma.commentReaction.create({ 
        data: { commentId, userUuid, emoji } 
      });
    }
  } catch (err) {
    console.error("Reaksiyon kayıt hatası:", err);
  }

  const { revalidatePath } = await import('next/cache');
  revalidatePath(`/post/${postId}`);
}