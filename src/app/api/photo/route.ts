import { NextResponse } from 'next/server';

// Anlık fotoğraf modu durumu
let currentPhotoState: {
  active: boolean;
  photoUrl: string | null;
  caption: string;
} = {
  active: false,
  photoUrl: null,
  caption: 'GECENİN EN GÜZEL KARESİ 📸',
};

export async function GET() {
  return NextResponse.json(currentPhotoState, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.action === 'upload') {
      currentPhotoState = {
        active: true,
        photoUrl: body.photoUrl,
        caption: body.caption || 'GECENİN EN GÜZEL KARESİ 📸',
      };
    } else if (body.action === 'close') {
      currentPhotoState.active = false;
    }

    return NextResponse.json({ success: true, state: currentPhotoState });
  } catch (e) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}