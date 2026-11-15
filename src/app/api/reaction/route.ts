import { NextResponse } from 'next/server';

// Geçici hafızada emojileri tutan dizi
let recentReactions: { id: number; emoji: string; timestamp: number }[] = [];

export async function POST(request: Request) {
  try {
    const { emoji } = await request.json();
    if (!emoji) return NextResponse.json({ error: "Emoji eksik" }, { status: 400 });

    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      timestamp: Date.now()
    };

    recentReactions.push(newReaction);
    
    // Son 10 saniyedeki emojileri tut, eskileri temizle
    recentReactions = recentReactions.filter(r => Date.now() - r.timestamp < 10000);

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET() {
  // Süresi dolmuş emojileri temizle
  recentReactions = recentReactions.filter(r => Date.now() - r.timestamp < 10000);
  return NextResponse.json({ reactions: recentReactions }, { headers: { 'Cache-Control': 'no-store' } });
}