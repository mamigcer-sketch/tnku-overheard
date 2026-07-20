"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';

// 1. Post Oluşturma (ModernForm.tsx bunu kullanıyor)
export async function createPost(formData: FormData) {
  const cookieStore = await cookies();
  
  // 🔥 Kullanıcının sabit kimliğini (çerezini) alıyoruz, yoksa oluşturuyoruz
  let authorUuid = cookieStore.get('tnku_author_id')?.value;

  if (!authorUuid) {
    authorUuid = crypto.randomUUID(); 
    cookieStore.set('tnku_author_id', authorUuid, {
      maxAge: 60 * 60 * 24 * 365, // 1 yıl kalıcı
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
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
      authorUuid, // 🔥 Artık postu kimin attığı veritabanına sabit olarak kaydediliyor!
      status: 'PENDING', // Admin onayına düşer
    },
  });

  revalidatePath("/");
  return post; 
}

// 2. Yorum Ekleme (CommentForm.tsx bunu kullanıyor)
export async function addComment(postId: string, comment: string) {
  const cookieStore = await cookies();
  
  let authorId = cookieStore.get('tnku_author_id')?.value;

  if (!authorId) {
    authorId = crypto.randomUUID(); 
    cookieStore.set('tnku_author_id', authorId, {
      maxAge: 60 * 60 * 24 * 365, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  await prisma.comment.create({
    data: {
      postId,
      content: comment,
      authorId, 
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