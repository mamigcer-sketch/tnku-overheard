import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// BU DOSYAYI NEXT.JS ASLA ÖNBELLEĞE ALAMAZ!
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const msg = await (prisma as any).post.findFirst({
      where: {
        location: { in: ['PARTY_ITIRAF', 'PARTY_REZIL', 'PARTY_OVERHEARD'] }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ message: msg });
  } catch (error) {
    return NextResponse.json({ message: null, error: String(error) });
  }
}