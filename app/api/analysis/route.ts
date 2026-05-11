import { NextResponse } from 'next/server';
import { allMatches } from '@/lib/sampleData';
import { getParlayAdvice, getParlayOutcome } from '@/services/aiAnalysis';

export async function POST(request: Request) {
  const body = await request.json();
  const ids = Array.isArray(body.matchIds) ? body.matchIds : [];
  const matches = allMatches.filter((match) => ids.includes(match.id));
  const advice = getParlayAdvice(matches);
  const outcome = getParlayOutcome(matches);

  return NextResponse.json({ advice, outcome, selectedMatches: matches });
}
