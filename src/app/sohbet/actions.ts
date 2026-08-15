"use server";

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { addPoints } from '@/lib/gamification';

export async function getChatData() {
  const cookieStore = await cookies();
  
  // 🔥 ÇİFTE SİGORTA: Sitede hangi çerez kullanılıyorsa onu yakalayacak!
  const userUuid = cookieStore.get('user_uuid')?.value || cookieStore.get('tnku_author_id')?.value || '';

  // 🔥 AVATARLAR DA VERİTABANINDAN ÇEKİLİYOR
  const [customNicknamesDb, userBadgesDb, initialMessagesDb, userAvatarsDb] = await Promise.all([
    (prisma as any).customNickname.findMany().catch(() => []),
    (prisma as any).userBadge.findMany().catch(() => []),
    (prisma as any).chatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    }).catch(() => []),
    (prisma as any).userAvatar.findMany().catch(() => []) // 🔥 BU SATIR EKLENDİ
  ]);

  const customNicknamesMap = (customNicknamesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.nickname;
    return acc;
  }, {});

  const userBadgesMap = (userBadgesDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.badgeName;
    return acc;
  }, {});

  // 🔥 AVATARLAR HARİTALANDIRILDI
  const userAvatarsMap = (userAvatarsDb || []).reduce((acc: any, curr: any) => {
    acc[curr.userUuid] = curr.avatarUrl;
    return acc;
  }, {});

  const initialMessages = (initialMessagesDb || []).reverse();

  // 🔥 EKRANA ARTIK "userAvatarsMap" DE GİDİYOR
  return { userUuid, customNicknamesMap, userBadgesMap, initialMessages, userAvatarsMap };
}

export async function sendMessage(content: string, authorId: string) {
  if (!content || content.trim() === '' || !authorId) return;

  await prisma.chatMessage.create({
    data: {
      content: content.trim(),
      authorUuid: authorId,
    },
  });

  // 🔥 İŞTE BURASI: Mesaj başarıyla atıldığı an kullanıcıya şak diye +2 puan veriyoruz!
  await addPoints(authorId, 2);
}