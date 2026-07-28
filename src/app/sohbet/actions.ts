"use server";

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function sendMessage(content: string) {
  if (!content || content.trim() === '') return;

  const cookieStore = await cookies();
  // Kullanıcının sitedeki mevcut anonim ID'sini alıyoruz
  let authorId = cookieStore.get('tnku_author_id')?.value;

  // Eğer çerezi yoksa (siteye ilk kez giriyorsa) geçici bir ID veriyoruz
  if (!authorId) {
    authorId = uuidv4();
  }

  // Mesajı Prisma üzerinden veritabanına çakıyoruz
  await prisma.chatMessage.create({
    data: {
      content: content.trim(),
      authorUuid: authorId,
    },
  });
}