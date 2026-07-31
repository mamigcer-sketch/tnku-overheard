"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Postu Onayla (Status: APPROVED yapıyoruz)
export async function approvePost(postId: string) {
  await prisma.post.update({
    where: { id: postId },
    data: { status: 'APPROVED' },
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

// Postu Reddet / Sil
export async function deletePost(postId: string) {
  await prisma.post.delete({
    where: { id: postId },
  }).catch(() => {});
  revalidatePath('/admin');
  revalidatePath('/');
}

// Raporu Çözüldü Olarak Kaldır / Sil
export async function deleteReport(reportId: string) {
  await (prisma as any).report.delete({
    where: { id: reportId },
  }).catch(() => {});
  revalidatePath('/admin');
}

// Kullanıcıyı Banla
export async function banUser(userUuid: string) {
  if (!userUuid) return;
  await (prisma as any).bannedUser.upsert({
    where: { userUuid },
    update: {},
    create: { userUuid },
  }).catch(() => {});
  revalidatePath('/admin');
}
export async function clearAllChatMessages() {
  'use server';
  try {
    await (prisma as any).chatMessage.deleteMany({});
  } catch (e) {
    // Eğer tablo ismi farklıysa hata yakalanır
  }
  revalidatePath('/sohbet');
  revalidatePath('/admin');
}