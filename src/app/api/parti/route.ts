import { NextResponse } from "next/server";

let activeBroadcast: { id: string | number; content: string; location?: string | null } | null = null;

export async function GET() {
  return NextResponse.json(
    { message: activeBroadcast },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "CLEAR") {
      activeBroadcast = null;
      return NextResponse.json({ success: true, message: "Temizlendi" });
    }

    if (body.content) {
      activeBroadcast = {
        id: Date.now(),
        content: body.content,
        location: body.location || "PARTY_ITIRAF",
      };
      return NextResponse.json({ success: true, message: activeBroadcast });
    }

    return NextResponse.json({ error: "İçerik bulunamadı" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}