import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const latestMessage = await (prisma as any).post.findFirst({
      where: {
        OR: [
          { people: 'PARTI_MODU' },
          { location: { in: ['PARTY_ITIRAF', 'PARTY_REZIL', 'PARTY_OVERHEARD'] } },
          { people: { in: ['PARTY_ITIRAF', 'PARTY_REZIL', 'PARTY_OVERHEARD'] } }
        ]
        // status: 'APPROVED' -> Eğer mesajların hemen görünmesini istiyorsan buradaki status filtresini şimdilik kaldırabiliriz veya onay sistemine bağlıysa bırakabiliriz.
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ message: latestMessage || null }, { 
      headers: { 
        'Cache-Control': 'no-store, no-cache, must-validate, max-age=0' 
      } 
    });
  } catch (error: any) {
    return NextResponse.json({ message: null, error: error.message }, { status: 500 });
  }
}