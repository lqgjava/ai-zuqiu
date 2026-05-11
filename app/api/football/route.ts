import { NextResponse } from 'next/server';
import { fetchLiveMatches, fetchMatchById, fetchWorldCupMatches, fetchWorldCupStandings, fetchJingcaiMatches } from '@/services/footballApi';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') ?? 'live';
  const id = url.searchParams.get('id');

  switch (type) {
    case 'live': {
      const matches = await fetchLiveMatches();
      return NextResponse.json({ matches });
    }
    case 'worldcup': {
      const matches = await fetchWorldCupMatches();
      const standings = await fetchWorldCupStandings();
      return NextResponse.json({ matches, standings });
    }
    case 'jingcai': {
      const matches = await fetchJingcaiMatches();
      return NextResponse.json({ matches });
    }
    case 'match': {
      if (!id) {
        return NextResponse.json({ error: 'Missing match id' }, { status: 400 });
      }
      const match = await fetchMatchById(id);
      return match ? NextResponse.json({ match }) : NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    default:
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  }
}
