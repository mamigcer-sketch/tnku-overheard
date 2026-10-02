import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Veritabanındaki en son eklenen mesajı doğrudan çekiyoruz
    const latestMessage = await (prisma as any).post.findFirst({
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