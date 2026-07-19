"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from "next/cache";

// 1. Post Oluşturma (ModernForm.tsx bunu kullanıyor)
export async function createPost(formData: FormData) {
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
      status: 'PENDING', // Burayı PENDING yapınca admin onayına düşecek!
    },
  });

  revalidatePath("/");
  return post; 
}


// 2. Yorum Ekleme (CommentForm.tsx bunu kullanıyor)
export async function addComment(postId: string, comment: string) {
  await prisma.comment.create({
    data: {
      postId,
      content: comment,
    },
  });
  
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