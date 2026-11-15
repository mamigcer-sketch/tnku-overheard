import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userUuid = searchParams.get('uuid');

    const votes = await prisma.vote.findMany();
    const totalVotes = votes.length;

    const popCount = votes.filter(v => v.genre === 'POP').length;
    const rapCount = votes.filter(v => v.genre === 'RAP').length;
    const rockCount = votes.filter(v => v.genre === 'ROCK').length;

    const popPercent = totalVotes > 0 ? Math.round((popCount / totalVotes) * 100) : 0;
    const rapPercent = totalVotes > 0 ? Math.round((rapCount / totalVotes) * 100) : 0;
    const rockPercent = totalVotes > 0 ? Math.round((rockCount / totalVotes) * 100) : 0;

    let userVote: string | null = null;
    if (userUuid) {
      const vote = votes.find(v => v.userUuid === userUuid);
      if (vote) userVote = vote.genre;
    }

    let leading = 'POP';
    if (rapCount > popCount && rapCount >= rockCount) leading = 'RAP';
    else if (rockCount > popCount && rockCount > rapCount) leading = 'ROCK';

    return NextResponse.json({
      totalVotes,
      userVote,
      leading,
      stats: {
        POP: { count: popCount, percent: popPercent },
        RAP: { count: rapCount, percent: rapPercent },
        ROCK: { count: rockCount, percent: rockPercent },
      }
    });
  } catch (error: any) {
    console.error("API Hatası:", error);
    return NextResponse.json({ error: "Veriler alınamadı." }, { status: 500 });
  }
}