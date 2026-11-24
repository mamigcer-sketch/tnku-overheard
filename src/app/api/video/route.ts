import { NextResponse } from 'next/server';

let videoState = {
  active: false,
  loop: false,
  startedAt: 0,
};

export async function GET() {
  return NextResponse.json(videoState);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'play') {
      videoState = {
        active: true,
        loop: Boolean(body.loop),
        startedAt: Date.now(),
      };
    } else if (body.action === 'stop') {
      videoState = {
        active: false,
        loop: false,
        startedAt: 0,
      };
    }

    return NextResponse.json(videoState);
  } catch (error) {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
}