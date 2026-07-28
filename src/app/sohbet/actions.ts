"use server";

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function getChatData() {
  const cookieStore = await cookies();
  
  // 🔥 ÇİFTE SİGORTA: Sitede hangi çerez kullanılıyorsa onu yakalayacak!
  const userUuid = cookieStore.get('user_uuid')?.value || cookieStore.get('tnku_author_id')?.value || '';

  const [customNicknamesDb, userBadgesDb, initialMessagesDb] = await Promise.all([
    (prisma as any).customNickname.findMany().catch(() => []),
    (prisma as any).userBadge.findMany().catch(() => []),
    (prisma as any).chatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    }).catch(() => [])
  ]);

  const customNicknamesMap = (customNicknamesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.nickname;
    return acc;
  }, {});

  const userBadgesMap = (userBadgesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.badgeName;
    return acc;
  }, {});

  const initialMessages = (initialMessagesDb || []).reverse();

  return { userUuid, customNicknamesMap, userBadgesMap, initialMessages };
}

export async function sendMessage(content: string, authorId: string) {
  if (!content || content.trim() === '' || !authorId) return;

  await prisma.chatMessage.create({
    data: {
      content: content.trim(),
      authorUuid: authorId,
    },
  });
}