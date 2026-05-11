import { NextResponse } from 'next/server';
import { fetchLiveMatches } from '@/services/footballApi';

export async function GET() {
  const matches = await fetchLiveMatches();
  return NextResponse.json({ matches });
}
