import { allMatches, jingcaiMatches } from '@/lib/sampleData';
import type { MatchEvent } from '@/types';
import { predictMatch } from './aiAnalysis';

const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io';
const FOOTBALL_DATA_BASE = 'https://api.football-data.org/v4';

function buildHeaders(provider: 'api-football' | 'football-data'): Record<string, string> {
  if (provider === 'api-football') {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) throw new Error('API_FOOTBALL_KEY is not configured');
    return { 'x-apisports-key': apiKey };
  }

  const authToken = process.env.FOOTBALL_DATA_KEY;
  if (!authToken) throw new Error('FOOTBALL_DATA_KEY is not configured');
  return { 'X-Auth-Token': authToken };
}

async function fetchApi<T>(url: string, headers: Record<string, string>): Promise<T> {
  const response = await fetch(url, { headers, cache: 'no-store' });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Fetch failed: ${response.status} ${response.statusText} ${message}`);
  }
  return response.json();
}

async function buildAiPrediction(
  item: any,
  homeName: string,
  awayName: string,
  homeRanking: number,
  awayRanking: number,
  leagueName: string,
): Promise<MatchEvent['aiPrediction']> {
  try {
    const result = await predictMatch({
      homeTeam: { name: homeName, ranking: homeRanking || 50, form: 0.5 },
      awayTeam: { name: awayName, ranking: awayRanking || 50, form: 0.5 },
      leagueContext: { name: leagueName, tier: 1 },
      matchContext: {
        stage: item.league?.round || leagueName,
        kickOff: item.fixture?.date || new Date().toISOString(),
      },
      analytics: {
        xG: {
          home: item.statistics?.find((s: any) => s.type === 'xG')?.stats?.[0]?.value ?? 1.0,
          away: item.statistics?.find((s: any) => s.type === 'xG')?.stats?.[1]?.value ?? 0.9,
        },
        possession: {
          home: item.statistics?.find((s: any) => s.type === 'Ball Possession')?.stats?.[0]?.value ?? 50,
          away: item.statistics?.find((s: any) => s.type === 'Ball Possession')?.stats?.[1]?.value ?? 50,
        },
      },
      oddsHistory: item.odds?.[0]?.update?.map((p: any) => ({
        time: p.time,
        home: p.home,
        draw: p.draw,
        away: p.away,
      })),
    });
    return {
      home: result.home,
      draw: result.draw,
      away: result.away,
      riskRating: result.riskRating,
      summary: result.summary,
      confidence: result.confidence,
      factors: result.factors,
    };
  } catch {
    return {
      home: 0.45,
      draw: 0.28,
      away: 0.27,
      riskRating: 'Medium',
      summary: '基于历史数据与赔率动态，AI 识别稳定比赛价值。',
    };
  }
}

export async function fetchLiveMatches(): Promise<MatchEvent[]> {
  try {
    const data = await fetchApi<{ response: Array<any> }>(
      `${API_FOOTBALL_BASE}/fixtures?live=all&season=2026`,
      buildHeaders('api-football'),
    );

    const items = data.response.slice(0, 6);
    const matches = await Promise.all(
      items.map(async (item) => {
        const homeName = item.teams.home.name;
        const awayName = item.teams.away.name;
        const homeRanking = item.teams.home.rank || 0;
        const awayRanking = item.teams.away.rank || 0;

        return {
          id: String(item.fixture.id),
          league: item.league.name,
          stage: item.league.round || item.league.name,
          kickOff: item.fixture.date,
          status: item.fixture.status.long,
          homeTeam: {
            id: String(item.teams.home.id),
            name: homeName,
            slug: homeName.toLowerCase().replace(/\s+/g, '-'),
            short: item.teams.home.abbreviation || homeName.slice(0, 3).toUpperCase(),
            country: item.teams.home.country || homeName,
            ranking: homeRanking,
            badgeUrl: item.teams.home.logo,
          },
          awayTeam: {
            id: String(item.teams.away.id),
            name: awayName,
            slug: awayName.toLowerCase().replace(/\s+/g, '-'),
            short: item.teams.away.abbreviation || awayName.slice(0, 3).toUpperCase(),
            country: item.teams.away.country || awayName,
            ranking: awayRanking,
            badgeUrl: item.teams.away.logo,
          },
          weather: item.fixture.weather?.description || 'N/A',
          stadium: item.fixture.venue.name || 'Unknown Stadium',
          homeScore: item.goals.home,
          awayScore: item.goals.away,
          aiPrediction: await buildAiPrediction(
            item, homeName, awayName, homeRanking, awayRanking, item.league.name,
          ),
          analytics: {
            xG: {
              home: item.statistics?.find((s: any) => s.type === 'xG')?.stats[0]?.value ?? 1.0,
              away: item.statistics?.find((s: any) => s.type === 'xG')?.stats[1]?.value ?? 0.9,
            },
            possession: {
              home: item.statistics?.find((s: any) => s.type === 'Ball Possession')?.stats[0]?.value ?? 50,
              away: item.statistics?.find((s: any) => s.type === 'Ball Possession')?.stats[1]?.value ?? 50,
            },
            shots: {
              home: item.statistics?.find((s: any) => s.type === 'Shots Total')?.stats[0]?.value ?? 8,
              away: item.statistics?.find((s: any) => s.type === 'Shots Total')?.stats[1]?.value ?? 7,
            },
            corners: {
              home: item.statistics?.find((s: any) => s.type === 'Corners')?.stats[0]?.value ?? 4,
              away: item.statistics?.find((s: any) => s.type === 'Corners')?.stats[1]?.value ?? 3,
            },
            defense: { interceptions: 0, tackles: 0 },
          },
          oddsHistory: item.odds?.length
            ? item.odds[0].update?.map((p: any) => ({
              time: p.time,
              home: p.home,
              draw: p.draw,
              away: p.away,
            }))
            : [],
          history: [],
        };
      }),
    );
    return matches;
  } catch (error) {
    return allMatches;
  }
}

export async function fetchWorldCupStandings() {
  try {
    const data = await fetchApi<{ standings: any[] }>(
      `${FOOTBALL_DATA_BASE}/competitions/WC/standings`,
      buildHeaders('football-data'),
    );

    return data.standings?.flatMap((group) =>
      group.table.map((item: any) => ({
        group: group.group,
        team: item.team.name,
        played: item.playedGames,
        win: item.won,
        draw: item.draw,
        loss: item.lost,
        points: item.points,
      })),
    );
  } catch (error) {
    return [];
  }
}

export async function fetchWorldCupMatches() {
  try {
    const data = await fetchApi<{ matches: any[] }>(
      `${FOOTBALL_DATA_BASE}/competitions/WC/matches?status=SCHEDULED,LIVE,FINISHED`,
      buildHeaders('football-data'),
    );

    return data.matches.slice(0, 8).map((item) => ({
      id: String(item.id),
      home: item.homeTeam.name,
      away: item.awayTeam.name,
      time: item.utcDate,
      status: item.status,
      score: item.score.fullTime?.home && item.score.fullTime?.away
        ? `${item.score.fullTime.home}-${item.score.fullTime.away}`
        : undefined,
      stage: item.stage || item.group || 'Group',
    }));
  } catch (error) {
    return [];
  }
}

export async function fetchMatchById(matchId: string): Promise<MatchEvent | undefined> {
  try {
    const data = await fetchApi<{ response: Array<any> }>(
      `${API_FOOTBALL_BASE}/fixtures?id=${matchId}`,
      buildHeaders('api-football'),
    );

    const item = data.response[0];
    if (!item) return undefined;

    const homeName = item.teams.home.name;
    const awayName = item.teams.away.name;
    const homeRanking = item.teams.home.rank || 0;
    const awayRanking = item.teams.away.rank || 0;

    return {
      id: String(item.fixture.id),
      league: item.league.name,
      stage: item.league.round || item.league.name,
      kickOff: item.fixture.date,
      status: item.fixture.status.long,
      homeTeam: {
        id: String(item.teams.home.id),
        name: homeName,
        slug: homeName.toLowerCase().replace(/\s+/g, '-'),
        short: item.teams.home.abbreviation || homeName.slice(0, 3).toUpperCase(),
        country: item.teams.home.country || homeName,
        ranking: homeRanking,
        badgeUrl: item.teams.home.logo,
      },
      awayTeam: {
        id: String(item.teams.away.id),
        name: awayName,
        slug: awayName.toLowerCase().replace(/\s+/g, '-'),
        short: item.teams.away.abbreviation || awayName.slice(0, 3).toUpperCase(),
        country: item.teams.away.country || awayName,
        ranking: awayRanking,
        badgeUrl: item.teams.away.logo,
      },
      weather: item.fixture.weather?.description || 'N/A',
      stadium: item.fixture.venue.name || 'Unknown Stadium',
      homeScore: item.goals.home,
      awayScore: item.goals.away,
      aiPrediction: await buildAiPrediction(
        item, homeName, awayName, homeRanking, awayRanking, item.league.name,
      ),
      analytics: {
        xG: { home: 1.1, away: 0.9 },
        possession: { home: 54, away: 46 },
        shots: { home: 10, away: 8 },
        corners: { home: 4, away: 3 },
        defense: { interceptions: 12, tackles: 16 },
      },
      oddsHistory: item.odds?.length
        ? item.odds[0].update?.map((p: any) => ({
          time: p.time,
          home: p.home,
          draw: p.draw,
          away: p.away,
        }))
        : [],
      history: [],
    };
  } catch (error) {
    return allMatches.find((match) => match.id === matchId);
  }
}

export async function fetchJingcaiMatches(): Promise<MatchEvent[]> {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = tomorrow.toISOString().split('T')[0];

    const data = await fetchApi<{ response: Array<any> }>(
      `${API_FOOTBALL_BASE}/fixtures?date=${dateFrom}&date=${dateTo}&season=2026`,
      buildHeaders('api-football'),
    );

    const jingcaiLeagues = [
      'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1',
      'Champions League', 'Europa League', 'Conference League',
    ];

    const jingcaiFixtures = data.response
      .filter((item) => jingcaiLeagues.includes(item.league.name))
      .slice(0, 12);

    const matches = await Promise.all(
      jingcaiFixtures.map(async (item) => {
        const homeName = item.teams.home.name;
        const awayName = item.teams.away.name;
        const homeRanking = item.teams.home.rank || 0;
        const awayRanking = item.teams.away.rank || 0;

        return {
          id: String(item.fixture.id),
          league: item.league.name,
          stage: item.league.round || item.league.name,
          kickOff: item.fixture.date,
          status: item.fixture.status.long,
          homeTeam: {
            id: String(item.teams.home.id),
            name: homeName,
            slug: homeName.toLowerCase().replace(/\s+/g, '-'),
            short: item.teams.home.abbreviation || homeName.slice(0, 3).toUpperCase(),
            country: item.teams.home.country || homeName,
            ranking: homeRanking,
            badgeUrl: item.teams.home.logo,
          },
          awayTeam: {
            id: String(item.teams.away.id),
            name: awayName,
            slug: awayName.toLowerCase().replace(/\s+/g, '-'),
            short: item.teams.away.abbreviation || awayName.slice(0, 3).toUpperCase(),
            country: item.teams.away.country || awayName,
            ranking: awayRanking,
            badgeUrl: item.teams.away.logo,
          },
          weather: item.fixture.weather?.description || 'N/A',
          stadium: item.fixture.venue.name || 'Unknown Stadium',
          homeScore: item.goals.home,
          awayScore: item.goals.away,
          aiPrediction: await buildAiPrediction(
            item, homeName, awayName, homeRanking, awayRanking, item.league.name,
          ),
          analytics: {
            xG: {
              home: item.statistics?.find((s: any) => s.type === 'xG')?.stats[0]?.value ?? 1.2,
              away: item.statistics?.find((s: any) => s.type === 'xG')?.stats[1]?.value ?? 1.0,
            },
            possession: {
              home: item.statistics?.find((s: any) => s.type === 'Ball Possession')?.stats[0]?.value ?? 52,
              away: item.statistics?.find((s: any) => s.type === 'Ball Possession')?.stats[1]?.value ?? 48,
            },
            shots: {
              home: item.statistics?.find((s: any) => s.type === 'Shots Total')?.stats[0]?.value ?? 9,
              away: item.statistics?.find((s: any) => s.type === 'Shots Total')?.stats[1]?.value ?? 8,
            },
            corners: {
              home: item.statistics?.find((s: any) => s.type === 'Corners')?.stats[0]?.value ?? 5,
              away: item.statistics?.find((s: any) => s.type === 'Corners')?.stats[1]?.value ?? 4,
            },
            defense: { interceptions: 0, tackles: 0 },
          },
          oddsHistory: item.odds?.length
            ? item.odds[0].update?.map((p: any) => ({
              time: p.time,
              home: p.home,
              draw: p.draw,
              away: p.away,
            }))
            : [],
          history: [],
        };
      }),
    );
    return matches;
  } catch (error) {
    return jingcaiMatches;
  }
}
