export interface Team {
  id: string;
  name: string;
  slug: string;
  short: string;
  country: string;
  ranking: number;
  badgeUrl: string;
}

export interface MatchEvent {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  league: string;
  stage: string;
  kickOff: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  weather: string;
  stadium: string;
  injuries?: string;
  preview?: string;
  aiPrediction: PredictionSummary;
  analytics: MatchAnalytics;
  oddsHistory: OddsPoint[];
  history: HeadToHead[];
}

export interface AiFactor {
  title: string;
  text: string;
  weight: number;
}

export interface PredictionSummary {
  home: number;
  draw: number;
  away: number;
  riskRating: 'Low' | 'Medium' | 'High';
  summary: string;
  confidence?: number;
  factors?: AiFactor[];
}

export interface AiPredictionInput {
  homeTeam: { name: string; ranking: number; form?: number };
  awayTeam: { name: string; ranking: number; form?: number };
  leagueContext: { name: string; tier?: number };
  matchContext: { stage: string; kickOff: string };
  headToHead?: HeadToHead[];
  oddsHistory?: OddsPoint[];
  analytics?: {
    xG: { home: number; away: number };
    possession: { home: number; away: number };
  };
}

export interface AiPredictionResult {
  home: number;
  draw: number;
  away: number;
  riskRating: 'Low' | 'Medium' | 'High';
  confidence: number;
  summary: string;
  factors: AiFactor[];
}

export interface MatchAnalytics {
  xG: { home: number; away: number };
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  corners: { home: number; away: number };
  defense: { interceptions: number; tackles: number };
}

export interface OddsPoint {
  time: string;
  home: number;
  draw: number;
  away: number;
}

export interface HeadToHead {
  id: string;
  date: string;
  home: string;
  away: string;
  score: string;
  competition: string;
}

export interface Recommendation {
  label: string;
  title: string;
  odds: string;
  confidence: number;
  note: string;
  highlight: string;
}

export interface Standing {
  group: string;
  team: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  points: number;
}

export interface WorldCupMatch {
  id: string;
  home: string;
  away: string;
  time: string;
  status: string;
  score?: string;
  stage: string;
}

export interface ParlayAdvice {
  name: string;
  risk: 'Low' | 'Medium' | 'High';
  impact: string;
  suggestion: string;
}

export interface ParlayOutcome {
  title: string;
  changedOdds: string;
  winProbability: number;
  riskTier: 'Conservative' | 'Balanced' | 'Aggressive';
}
