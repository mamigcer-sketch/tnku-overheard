'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createAnnouncement(formData: FormData) {
  const content = formData.get('content') as string;
  if (!content) return;

  await prisma.announcement.create({
    data: { content, isActive: true },
  });

  revalidatePath('/admin/announcements');
  revalidatePath('/');
}

export async function toggleAnnouncement(formData: FormData) {
  const id = formData.get('id') as string;
  const currentState = formData.get('isActive') === 'true';

  await prisma.announcement.update({
    where: { id },
    data: { isActive: !currentState },
  });

  revalidatePath('/admin/announcements');
  revalidatePath('/');
}

export async function deleteAnnouncement(formData: FormData) {
  const id = formData.get('id') as string;

  await prisma.announcement.delete({
    where: { id },
  });

  revalidatePath('/admin/announcements');
  revalidatePath('/');
}