import { NextResponse } from 'next/server';

// 官方联赛配置
const LEAGUES = [
  { id: 39, name: 'English Premier League', shortName: '英超', country: '英格兰', icon: '🇬🇧' },
  { id: 140, name: 'La Liga', shortName: '西甲', country: '西班牙', icon: '🇪🇸' },
  { id: 135, name: 'Serie A', shortName: '意甲', country: '意大利', icon: '🇮🇹' },
  { id: 78, name: 'Bundesliga', shortName: '德甲', country: '德国', icon: '🇩🇪' },
  { id: 61, name: 'Ligue 1', shortName: '法甲', country: '法国', icon: '🇫🇷' },
  { id: 88, name: 'Eredivisie', shortName: '荷甲', country: '荷兰', icon: '🇳🇱' },
  { id: 94, name: 'Primeira Liga', shortName: '葡超', country: '葡萄牙', icon: '🇵🇹' },
  { id: 848, name: 'Chinese Super League', shortName: '中超', country: '中国', icon: '🇨🇳' },
  { id: 2, name: 'UEFA Champions League', shortName: '欧冠', country: '欧洲', icon: '🏆' },
  { id: 3, name: 'UEFA Europa League', shortName: '欧罗巴', country: '欧洲', icon: '🏅' },
];

function createFallbackMatches(league: { id: number; name: string; shortName: string }) {
  const pool = [
    { home: `${league.shortName} 队`, away: `${league.shortName} 星` },
    { home: `${league.shortName} 联`, away: `${league.shortName} 霸` },
    { home: `${league.shortName} 火`, away: `${league.shortName} 雷` },
  ];

  return pool.map((item, index) => ({
    fixture: {
      id: league.id * 100 + index + 1,
      date: new Date(Date.now() + index * 60 * 60 * 1000).toISOString(),
      status: { long: index === 0 ? 'LIVE' : index === 1 ? 'FINISHED' : 'NS' },
    },
    league: { name: league.name },
    teams: {
      home: {
        name: item.home,
        abbreviation: item.home.slice(0, 3).toUpperCase(),
        logo: `https://via.placeholder.com/48/0f172a/ffffff?text=${encodeURIComponent(item.home.slice(0, 1))}`,
      },
      away: {
        name: item.away,
        abbreviation: item.away.slice(0, 3).toUpperCase(),
        logo: `https://via.placeholder.com/48/0f172a/ffffff?text=${encodeURIComponent(item.away.slice(0, 1))}`,
      },
    },
    goals: {
      home: index === 1 ? 2 : null,
      away: index === 1 ? 1 : null,
    },
  }));
}

function createFallbackStandings(league: { shortName: string }) {
  return Array.from({ length: 8 }, (_, index) => ({
    rank: index + 1,
    team: {
      name: `${league.shortName} ${index + 1}`,
      logo: `https://via.placeholder.com/24/0f172a/ffffff?text=${index + 1}`,
    },
    points: 24 - index * 2,
    goalsDiff: 12 - index,
    played: 18,
  }));
}

export async function GET() {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      console.warn('API_FOOTBALL_KEY 缺失，使用本地备用联赛数据');
      const fallback = LEAGUES.map((league) => ({
        ...league,
        matches: createFallbackMatches(league),
        standings: createFallbackStandings(league),
        lastUpdate: new Date().toISOString(),
        error: 'API key not configured, using fallback data',
      }));

      return NextResponse.json(
        {
          success: false,
          message: 'API key not configured, fallback data loaded',
          data: fallback,
        },
        { status: 200 }
      );
    }

    const leaguesData = await Promise.all(
      LEAGUES.map(async (league) => {
        try {
          const matchesResponse = await fetch(
            `https://v3.football.api-sports.io/fixtures?league=${league.id}&season=2026&last=5`,
            {
              headers: { 'x-apisports-key': apiKey },
              cache: 'no-store',
            }
          );
          const matchesData = await matchesResponse.json();

          const standingsResponse = await fetch(
            `https://v3.football.api-sports.io/standings?league=${league.id}&season=2026`,
            {
              headers: { 'x-apisports-key': apiKey },
              cache: 'no-store',
            }
          );
          const standingsData = await standingsResponse.json();

          return {
            ...league,
            matches: Array.isArray(matchesData.response)
              ? matchesData.response.slice(0, 5)
              : createFallbackMatches(league),
            standings:
              Array.isArray(standingsData.response) && standingsData.response[0]?.standings
                ? standingsData.response[0].standings
                : createFallbackStandings(league),
            lastUpdate: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Error fetching data for ${league.name}:`, error);
          return {
            ...league,
            matches: createFallbackMatches(league),
            standings: createFallbackStandings(league),
            lastUpdate: new Date().toISOString(),
            error: 'Failed to fetch live data, fallback loaded',
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: leaguesData,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in leagues API:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
