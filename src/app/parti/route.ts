import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Supabase'den parti_modu etiketli ve en son eklenen onaylı mesajı çekiyoruz
    const latestMessage = await (prisma as any).post.findFirst({
      where: {
        people: 'PARTI_MODU',
        status: 'APPROVED'
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
    console.error("API Parti Hatası:", error);
    return NextResponse.json({ message: null, error: error.message }, { status: 500 });
  }
}