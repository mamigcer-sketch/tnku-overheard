"use server";

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// Sitedeki orijinal nickleri ve rozetleri çekiyoruz
export async function getChatData() {
  const cookieStore = await cookies();
  const userUuid = cookieStore.get('user_uuid')?.value || '';

  const [customNicknamesDb, userBadgesDb] = await Promise.all([
    (prisma as any).customNickname.findMany().catch(() => []),
    (prisma as any).userBadge.findMany().catch(() => [])
  ]);

  const customNicknamesMap = (customNicknamesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.nickname;
    return acc;
  }, {});

  const userBadgesMap = (userBadgesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.badgeName;
    return acc;
  }, {});

  return { userUuid, customNicknamesMap, userBadgesMap };
}

// 🔥 DEĞİŞTİRİLDİ: Mesaj gönderirken çerez aramak yerine ID'yi direkt parametre (authorId) olarak alıyoruz. 
// Bu sayede çerezi olmayanlar engellenmeyecek!
export async function sendMessage(content: string, authorId: string) {
  if (!content || content.trim() === '' || !authorId) return;

  await prisma.chatMessage.create({
    data: {
      content: content.trim(),
      authorUuid: authorId,
    },
  });
}