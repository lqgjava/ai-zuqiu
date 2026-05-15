import { NextResponse } from 'next/server';
import { allMatches } from '@/lib/sampleData';
import { getParlayAdvice, getParlayOutcome, predictMatch } from '@/services/aiAnalysis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;

    // Single match prediction
    if (action === 'predict' && body.matchData) {
      const prediction = await predictMatch(body.matchData);
      return NextResponse.json({ prediction });
    }

    // Parlay analysis (default)
    const ids = Array.isArray(body.matchIds) ? body.matchIds : [];
    const matches = allMatches.filter((match) => ids.includes(match.id));
    const advice = getParlayAdvice(matches);
    const outcome = getParlayOutcome(matches);

    return NextResponse.json({ advice, outcome, selectedMatches: matches });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 },
    );
  }
}
