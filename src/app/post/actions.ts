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

// 1. Post Oluşturma
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

  const post = await prisma.post.create({
    data: {
      type,
      content,
      location,
      people,
      gender,
      authorUuid, 
      status: 'PENDING', 
    },
  });

  revalidatePath("/");
  return post; 
}

// 2. Yorum Ekleme
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

// 4. ID'ye göre Postları Çekme
export async function getPostsByIds(ids: string[]) {
  return await prisma.post.findMany({
    where: { 
      id: { in: ids } 
    },
    orderBy: { createdAt: 'desc' }
  });
}

// 5. 🚀 RAW SQL GOD MODE: Prisma'yı aradan çıkarıp veriyi zorla işliyoruz!
export async function toggleCommentLike(commentId: string, postId: string) {
  const authorId = await getOrCreateAuthorId();

  try {
    // 1. Kullanıcı daha önce beğenmiş mi? (Doğrudan Veritabanına Soruyoruz)
    const existingLikes: any[] = await prisma.$queryRaw`
      SELECT "id" FROM "CommentLike" 
      WHERE "commentId" = ${commentId} AND "userUuid" = ${authorId} 
      LIMIT 1
    `;

    if (existingLikes.length > 0) {
      // 2. Zaten beğenmişse -> Beğeniyi Sil ve Sayıyı 1 Azalt
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
      // 3. Beğenmemişse -> Beğeniyi Ekle ve Sayıyı 1 Artır
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
    throw new Error("Beğeni veritabanına kaydedilemedi"); // Hatayı fırlat ki ön yüz haberdar olsun!
  }
}