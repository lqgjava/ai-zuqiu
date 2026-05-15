import type {
  AiPredictionInput,
  AiPredictionResult,
  AiFactor,
  MatchEvent,
  ParlayAdvice,
  ParlayOutcome,
  Standing,
} from '@/types';

// ============================================================
// Deterministic algorithm fallback
// ============================================================

function eloExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function clampProbability(value: number): number {
  return Math.max(0.15, Math.min(0.75, value));
}

function generateAlgorithmicPrediction(input: AiPredictionInput): AiPredictionResult {
  const { homeTeam, awayTeam, leagueContext, oddsHistory, analytics, headToHead } = input;

  // Base: ELO-style expected score from team rankings
  const homeRanking = homeTeam.ranking || 50;
  const awayRanking = awayTeam.ranking || 50;
  const homeElo = eloExpectedScore(homeRanking, awayRanking);

  // Home advantage boost based on league tier (tier 1 = top leagues, less home bias)
  const tier = leagueContext.tier ?? 3;
  const homeBoost = 0.04 + (tier - 1) * 0.01; // 0.04 for tier 1, up to 0.10

  // Form adjustment
  const homeForm = homeTeam.form ?? 0.5;
  const awayForm = awayTeam.form ?? 0.5;
  const formDelta = (homeForm - awayForm) * 0.08;

  // Analytics adjustment
  let analyticsBoost = 0;
  if (analytics) {
    if (analytics.xG.home > analytics.xG.away) analyticsBoost += 0.02;
    if (analytics.possession.home > analytics.possession.away) analyticsBoost += 0.01;
  }

  // H2H adjustment
  let h2hBoost = 0;
  if (headToHead && headToHead.length > 0) {
    const homeWins = headToHead.filter((h) => {
      const [homeScore, awayScore] = h.score.split('-').map(Number);
      return homeScore > awayScore;
    }).length;
    h2hBoost = ((homeWins / headToHead.length) - 0.5) * 0.06;
  }

  // Odds stability → confidence
  let oddsVolatility = 0;
  if (oddsHistory && oddsHistory.length > 1) {
    const changes = oddsHistory.map((p) => Math.abs(p.home - oddsHistory[0].home));
    oddsVolatility = changes.reduce((a, b) => a + b, 0) / changes.length;
  }

  // Combine
  let home = clampProbability(homeElo + homeBoost + formDelta + analyticsBoost + h2hBoost);
  const leagueDrawBase = tier <= 2 ? 0.24 : 0.27;
  const draw = Math.max(0.15, Math.min(0.32, leagueDrawBase - Math.abs(home - 0.5) * 0.3));
  const away = 1 - home - draw;

  // Risk rating
  const maxProb = Math.max(home, draw, away);
  let riskRating: 'Low' | 'Medium' | 'High';
  if (maxProb > 0.58 && oddsVolatility < 0.05) {
    riskRating = 'Low';
  } else if (maxProb < 0.42 || oddsVolatility > 0.12) {
    riskRating = 'High';
  } else {
    riskRating = 'Medium';
  }

  // Confidence
  const confidence = Math.min(0.92, 0.55 + maxProb * 0.35 - oddsVolatility * 0.5);

  // Factors
  const factors: AiFactor[] = [];
  if (homeRanking < awayRanking) {
    factors.push({
      title: '排名优势',
      text: `${homeTeam.name} 排名第 ${homeRanking} 位，高于 ${awayTeam.name} 的第 ${awayRanking} 位`,
      weight: 0.35,
    });
  } else if (awayRanking < homeRanking) {
    factors.push({
      title: '排名劣势',
      text: `${awayTeam.name} 排名第 ${awayRanking} 位，高于 ${homeTeam.name} 的第 ${homeRanking} 位`,
      weight: 0.35,
    });
  }
  if (analytics && analytics.xG.home > analytics.xG.away) {
    factors.push({
      title: '预期进球优势',
      text: `${homeTeam.name} 预期进球 ${analytics.xG.home.toFixed(1)} 高于对手 ${analytics.xG.away.toFixed(1)}`,
      weight: 0.25,
    });
  }
  if (headToHead && headToHead.length > 0) {
    factors.push({
      title: '历史交锋',
      text: `近 ${headToHead.length} 次交锋数据已纳入分析模型`,
      weight: 0.2,
    });
  }
  if (oddsVolatility > 0.05) {
    factors.push({
      title: '赔率波动',
      text: oddsVolatility > 0.1
        ? '赔率波动较大，市场意见分歧明显'
        : '赔率小幅波动，市场预期趋于稳定',
      weight: 0.2,
    });
  }
  if (homeBoost > 0.05) {
    factors.push({
      title: '主场优势',
      text: `${homeTeam.name} 在 ${leagueContext.name} 主场作战具有明显优势`,
      weight: 0.15,
    });
  }
  // Ensure at least 2 factors
  while (factors.length < 2) {
    factors.push({
      title: '综合评估',
      text: `结合球队状态与联赛数据，AI 综合评估比赛走势`,
      weight: 0.25,
    });
  }
  // Normalize factor weights
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  factors.forEach((f) => { f.weight = Math.round((f.weight / totalWeight) * 100) / 100; });

  // Summary
  const summary = home > away && home > draw
    ? `AI 分析显示 ${homeTeam.name} 主场胜率 ${Math.round(home * 100)}%，排名与状态均占优。`
    : away > home && away > draw
    ? `AI 识别 ${awayTeam.name} 客场胜率 ${Math.round(away * 100)}%，具备爆冷实力。`
    : `AI 判断双方势均力敌，平局概率 ${Math.round(draw * 100)}%，建议谨慎选择。`;

  return { home, draw, away, riskRating, confidence, summary, factors };
}

// ============================================================
// LLM-based prediction (server-side only)
// ============================================================

async function generateAiPredictionWithLLM(input: AiPredictionInput): Promise<AiPredictionResult> {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_API_BASE_URL || 'https://api.deepseek.com/v1';

  if (!apiKey) {
    throw new Error('AI_API_KEY not configured');
  }

  const prompt = `You are a football match prediction expert. Analyze the following match data and return a JSON prediction.

Match: ${input.homeTeam.name} vs ${input.awayTeam.name}
League: ${input.leagueContext.name}
Stage: ${input.matchContext.stage}
Kickoff: ${input.matchContext.kickOff}
Home Ranking: ${input.homeTeam.ranking}
Away Ranking: ${input.awayTeam.ranking}
Home Form: ${input.homeTeam.form ?? 'unknown'}
Away Form: ${input.awayTeam.form ?? 'unknown'}
${input.analytics ? `xG: Home ${input.analytics.xG.home} - Away ${input.analytics.xG.away}` : ''}
${input.analytics ? `Possession: Home ${input.analytics.possession.home}% - Away ${input.analytics.possession.away}%` : ''}
${input.headToHead ? `Recent H2H: ${input.headToHead.length} matches` : ''}

Return ONLY a JSON object (no markdown, no extra text) with this exact structure:
{
  "home": number (0-1, win probability for home team),
  "draw": number (0-1),
  "away": number (0-1),
  "riskRating": "Low" | "Medium" | "High",
  "confidence": number (0-1),
  "summary": "string (one sentence analysis in Chinese)",
  "factors": [
    { "title": "string", "text": "string", "weight": number }
  ]
}

Requirements:
- home + draw + away must sum to exactly 1.0
- Include exactly 4 factors with weights summing to 1.0
- Summary must be in Chinese`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a football prediction expert. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Parse JSON from response (strip potential markdown backticks)
  const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const result = JSON.parse(jsonStr);

  // Validate
  if (typeof result.home !== 'number' || typeof result.draw !== 'number' || typeof result.away !== 'number') {
    throw new Error('LLM response missing required probability fields');
  }

  // Normalize
  const total = result.home + result.draw + result.away;
  if (Math.abs(total - 1) > 0.01) {
    result.home /= total;
    result.draw /= total;
    result.away /= total;
  }

  return {
    home: result.home,
    draw: result.draw,
    away: result.away,
    riskRating: ['Low', 'Medium', 'High'].includes(result.riskRating) ? result.riskRating : 'Medium',
    confidence: result.confidence || 0.7,
    summary: result.summary || '',
    factors: Array.isArray(result.factors) ? result.factors.slice(0, 4) : [],
  };
}

// ============================================================
// Main entry point
// ============================================================

export async function predictMatch(input: AiPredictionInput): Promise<AiPredictionResult> {
  // Try LLM first if API key is available (server-side only)
  if (typeof process !== 'undefined' && process.env.AI_API_KEY) {
    try {
      return await generateAiPredictionWithLLM(input);
    } catch (error) {
      console.warn('LLM prediction failed, using algorithm fallback:', (error as Error).message);
    }
  }
  return generateAlgorithmicPrediction(input);
}

// Client-safe synchronous version (no LLM, always uses algorithm)
export function predictMatchSync(input: AiPredictionInput): AiPredictionResult {
  return generateAlgorithmicPrediction(input);
}

// ============================================================
// Champion prediction
// ============================================================

export function predictChampion(standings: Standing[]): { team: string; probability: number; summary: string }[] {
  if (!standings || standings.length === 0) {
    return [
      { team: '数据不足', probability: 0, summary: '暂无足够积分榜数据生成冠军预测' },
    ];
  }

  const totalPoints = standings.reduce((sum, s) => sum + s.points, 0) || 1;
  const predictions = standings
    .map((s) => {
      const pointShare = s.points / totalPoints;
      const winRate = s.win / Math.max(s.played, 1);
      const probability = pointShare * 0.6 + winRate * 0.4;
      return {
        team: s.team,
        probability,
        summary: `胜率 ${Math.round(winRate * 100)}% · 积分 ${s.points} · 排名靠前`,
      };
    })
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);

  const totalProb = predictions.reduce((s, p) => s + p.probability, 0) || 1;
  return predictions.map((p) => ({
    ...p,
    probability: Math.round((p.probability / totalProb) * 1000) / 1000,
  }));
}

// ============================================================
// Parlay analysis (updated to use prediction engine)
// ============================================================

export function calculateRisk(prediction: { home: number; draw: number; away: number }): 'Low' | 'Medium' | 'High' {
  const maxProb = Math.max(prediction.home, prediction.draw, prediction.away);
  if (maxProb > 0.58) return 'Low';
  if (maxProb < 0.42) return 'High';
  return 'Medium';
}

export function getParlayAdvice(matches: MatchEvent[]): ParlayAdvice[] {
  return matches.map((match) => {
    const risk = calculateRisk(match.aiPrediction);
    return {
      name: `${match.homeTeam.short} vs ${match.awayTeam.short}`,
      risk,
      impact: `胜率 ${Math.round(Math.max(match.aiPrediction.home, match.aiPrediction.draw, match.aiPrediction.away) * 100)}%`,
      suggestion: risk === 'High'
        ? '建议剔除该场以保护组合。'
        : risk === 'Medium'
        ? '保留但需关注临场变化。'
        : '推荐保留，适合稳定串关。',
    };
  });
}

export function getParlayOutcome(matches: MatchEvent[]): ParlayOutcome {
  if (matches.length === 0) {
    return {
      title: '请选择比赛',
      changedOdds: '0x',
      winProbability: 0,
      riskTier: 'Conservative',
    };
  }

  const winProbs = matches.map((m) => Math.max(m.aiPrediction.home, m.aiPrediction.draw, m.aiPrediction.away));
  const avgWinProb = winProbs.reduce((a, b) => a + b, 0) / winProbs.length;
  const combinedProb = Math.min(0.85, avgWinProb * Math.pow(0.92, matches.length - 1));
  const changedOdds = (matches.length * 1.2 * combinedProb / avgWinProb).toFixed(1);

  let riskTier: 'Conservative' | 'Balanced' | 'Aggressive';
  if (combinedProb > 0.55) riskTier = 'Conservative';
  else if (combinedProb > 0.38) riskTier = 'Balanced';
  else riskTier = 'Aggressive';

  return {
    title: `AI 组合优化结果 (${matches.length}场)`,
    changedOdds: `${changedOdds}x`,
    winProbability: Math.round(combinedProb * 100) / 100,
    riskTier,
  };
}
