"use server";

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function getChatData() {
  const cookieStore = await cookies();
  const userUuid = cookieStore.get('user_uuid')?.value || '';

  // 🔥 ŞAHESER DOKUNUŞ: Nickler ve rozetlerle birlikte SON 50 MESAJI da Prisma ile çekiyoruz!
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

  // Mesajları en eskiden en yeniye doğru sıralıyoruz ki sohbet akışı düzgün görünsün
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