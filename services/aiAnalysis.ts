import type { MatchEvent, ParlayAdvice, ParlayOutcome } from '@/types';

export function calculateRisk(match: MatchEvent) {
  const base = match.aiPrediction.home * 0.4 + match.aiPrediction.away * 0.4 + match.aiPrediction.draw * 0.2;
  const oddsVariance = match.oddsHistory.reduce((acc, point) => acc + Math.abs(point.home - match.oddsHistory[0].home), 0) / match.oddsHistory.length;
  const riskScore = base + oddsVariance * 0.05;

  if (riskScore > 0.72) return 'Low';
  if (riskScore > 0.55) return 'Medium';
  return 'High';
}

export function getParlayAdvice(matches: MatchEvent[]): ParlayAdvice[] {
  return matches.map((match) => ({
    name: `${match.homeTeam.short} vs ${match.awayTeam.short}`,
    risk: match.aiPrediction.riskRating === 'High' ? 'High' : match.aiPrediction.riskRating === 'Medium' ? 'Medium' : 'Low',
    impact: `赔率波动${Math.round(match.oddsHistory[match.oddsHistory.length - 1].home * 100) / 100}`,
    suggestion: match.aiPrediction.riskRating === 'High' ? '建议剔除该场以保护组合。' : '建议保留，适合稳定串关。',
  }));
}

export function getParlayOutcome(matches: MatchEvent[]): ParlayOutcome {
  const winProbability = matches.reduce((acc, match) => acc + Math.max(match.aiPrediction.home, match.aiPrediction.away, match.aiPrediction.draw), 0) / matches.length;
  const riskTier = winProbability > 0.6 ? 'Balanced' : 'Aggressive';

  return {
    title: 'AI 组合优化结果',
    changedOdds: `${(matches.length * 1.6).toFixed(1)}x`,
    winProbability: Math.min(0.86, winProbability * 0.92),
    riskTier,
  };
}
