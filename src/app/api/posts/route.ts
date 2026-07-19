import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // Araya dosya koymadan direkt burada başlattık.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newPost = await prisma.post.create({
      data: {
        type: body.type,
        content: body.content,
      },
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}