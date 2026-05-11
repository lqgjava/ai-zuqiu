import { allMatches } from '@/lib/sampleData';
import type { MatchEvent } from '@/types';

export function getMatches(): MatchEvent[] {
  return allMatches;
}

export function getMatchById(id: string): MatchEvent | undefined {
  return allMatches.find((match) => match.id === id);
}
