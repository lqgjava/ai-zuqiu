import { fetchLiveMatches, fetchMatchById } from '@/services/footballApi';
import { allMatches } from '@/lib/sampleData';
import type { MatchEvent } from '@/types';

export async function getMatches(): Promise<MatchEvent[]> {
  try {
    return await fetchLiveMatches();
  } catch {
    return allMatches;
  }
}

export async function getMatchById(id: string): Promise<MatchEvent | undefined> {
  try {
    const match = await fetchMatchById(id);
    return match || allMatches.find((m) => m.id === id);
  } catch {
    return allMatches.find((m) => m.id === id);
  }
}
