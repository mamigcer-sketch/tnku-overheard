import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const VIDEO_LOCATION = 'SYSTEM_VIDEO_STATE';

export async function GET() {
  try {
    const record = await prisma.post.findFirst({
      where: { location: VIDEO_LOCATION },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || !record.content) {
      return NextResponse.json({ active: false, loop: false, startedAt: 0 });
    }

    const parsed = JSON.parse(record.content);
    return NextResponse.json({
      active: Boolean(parsed.active),
      loop: Boolean(parsed.loop),
      startedAt: Number(parsed.startedAt) || 0,
    });
  } catch (error) {
    return NextResponse.json({ active: false, loop: false, startedAt: 0 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nextState =
      body.action === 'play'
        ? { active: true, loop: Boolean(body.loop), startedAt: Date.now() }
        : { active: false, loop: false, startedAt: 0 };

    const existing = await prisma.post.findFirst({
      where: { location: VIDEO_LOCATION },
    });

    if (existing) {
      await prisma.post.update({
        where: { id: existing.id },
        data: {
          content: JSON.stringify(nextState),
          status: nextState.active ? 'APPROVED' : 'COMPLETED',
        },
      });
    } else {
      await prisma.post.create({
        data: {
          type: 'SYSTEM',
          location: VIDEO_LOCATION,
          content: JSON.stringify(nextState),
          status: nextState.active ? 'APPROVED' : 'COMPLETED',
        },
      });
    }

    return NextResponse.json(nextState);
  } catch (error) {
    return NextResponse.json({ error: 'Video durumu güncellenemedi' }, { status: 500 });
  }
}