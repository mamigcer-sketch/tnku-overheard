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
      maxAge: 60 * 60 * 24 * 365, // 1 yıl kalıcı
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

// 2. Yorum Ekleme ve Yanıtlama
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

// 5. Kesin Çözüm: Beğeni ve Beğeniyi Geri Alma (Explicit ID ve Hata Yakalama)
export async function toggleCommentLike(commentId: string, postId: string) {
  const authorId = await getOrCreateAuthorId();

  // Daha önce beğenmiş mi kontrol et
  const existingLike = await (prisma as any).commentLike.findFirst({
    where: {
      commentId,
      userUuid: authorId,
    },
  });

  const currentComment = await prisma.comment.findUnique({ where: { id: commentId } });
  const currentLikes = currentComment?.likes || 0;

  if (existingLike) {
    // Beğenmişse -> Sil
    await (prisma as any).commentLike.deleteMany({
      where: {
        commentId,
        userUuid: authorId,
      },
    });
    await prisma.comment.update({
      where: { id: commentId },
      data: { likes: Math.max(0, currentLikes - 1) },
    });
  } else {
    // Beğenmemişse -> ID'yi manuel vererek kesin olarak oluştur
    await (prisma as any).commentLike.create({
      data: {
        id: crypto.randomUUID(), 
        commentId,
        userUuid: authorId,
      },
    });
    await prisma.comment.update({
      where: { id: commentId },
      data: { likes: currentLikes + 1 },
    });
  }

  revalidatePath(`/post/${postId}`);
}