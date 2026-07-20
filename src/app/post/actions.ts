"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';

// 1. Post Oluşturma (ModernForm.tsx bunu kullanıyor)
export async function createPost(formData: FormData) {
  const cookieStore = await cookies();
  
  let authorUuid = cookieStore.get('tnku_author_id')?.value;

  if (!authorUuid) {
    authorUuid = crypto.randomUUID(); 
    cookieStore.set({
      name: 'tnku_author_id',
      value: authorUuid,
      maxAge: 60 * 60 * 24 * 365, // 1 yıl kalıcı
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  // Ban Kontrolü: Kullanıcı engellenmiş mi?
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

// 2. Yorum Ekleme ve Yanıtlama (CommentForm.tsx bunu kullanıyor)
export async function addComment(formData: FormData) {
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

  // Ban Kontrolü
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

// 4. ID'ye göre Postları Çekme (Paylaşımlarım sayfası için)
export async function getPostsByIds(ids: string[]) {
  return await prisma.post.findMany({
    where: { 
      id: { in: ids } 
    },
    orderBy: { createdAt: 'desc' }
  });
}

// 5. Yorum Beğenme / Beğeniyi Geri Alma (Toggle) Sistemi (Güvenleştirilmiş)
export async function toggleCommentLike(commentId: string, postId: string) {
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

  try {
    // Kullanıcı daha önce bu yorumu beğenmiş mi kontrol ediyoruz
    const existingLike = await (prisma as any).commentLike.findUnique({
      where: {
        commentId_userUuid: {
          commentId,
          userUuid: authorId,
        },
      },
    });

    if (existingLike) {
      // Beğenmişse -> Kaydı sil ve sayıyı 1 azalt
      await (prisma as any).commentLike.delete({
        where: { id: existingLike.id },
      });
      
      const currentComment = await prisma.comment.findUnique({ where: { id: commentId } });
      const newLikes = Math.max(0, (currentComment?.likes || 1) - 1);

      await prisma.comment.update({
        where: { id: commentId },
        data: { likes: newLikes },
      });
    } else {
      // Beğenmemişse -> Yeni beğeni kaydı oluştur ve sayıyı 1 artır
      await (prisma as any).commentLike.create({
        data: {
          commentId,
          userUuid: authorId,
        },
      });

      const currentComment = await prisma.comment.findUnique({ where: { id: commentId } });
      const newLikes = (currentComment?.likes || 0) + 1;

      await prisma.comment.update({
        where: { id: commentId },
        data: { likes: newLikes },
      });
    }

    revalidatePath(`/post/${postId}`);
  } catch (err) {
    console.error("Beğeni işlenirken hata oluştu:", err);
  }
}