import { NextResponse } from 'next/server';

// 联赛配置 - 包含真实球队名称的备用数据
const LEAGUES_CONFIG = [
  {
    id: 39, name: 'English Premier League', shortName: '英超', country: '英格兰', icon: '🇬🇧',
    fallbackTeams: ['Manchester City', 'Arsenal', 'Liverpool', 'Chelsea', 'Tottenham', 'Newcastle', 'Man United', 'Aston Villa'],
  },
  {
    id: 140, name: 'La Liga', shortName: '西甲', country: '西班牙', icon: '🇪🇸',
    fallbackTeams: ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Real Sociedad', 'Villarreal', 'Athletic Club', 'Valencia'],
  },
  {
    id: 135, name: 'Serie A', shortName: '意甲', country: '意大利', icon: '🇮🇹',
    fallbackTeams: ['Inter Milan', 'AC Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio', 'Atalanta', 'Fiorentina'],
  },
  {
    id: 78, name: 'Bundesliga', shortName: '德甲', country: '德国', icon: '🇩🇪',
    fallbackTeams: ['Bayern Munich', 'Dortmund', 'RB Leipzig', 'Leverkusen', 'Frankfurt', 'Stuttgart', 'Wolfsburg', 'Freiburg'],
  },
  {
    id: 61, name: 'Ligue 1', shortName: '法甲', country: '法国', icon: '🇫🇷',
    fallbackTeams: ['PSG', 'Marseille', 'Lyon', 'Monaco', 'Lille', 'Rennes', 'Nice', 'Lens'],
  },
  {
    id: 88, name: 'Eredivisie', shortName: '荷甲', country: '荷兰', icon: '🇳🇱',
    fallbackTeams: ['Ajax', 'PSV', 'Feyenoord', 'AZ Alkmaar', 'Twente', 'Utrecht', 'Sparta', 'Heerenveen'],
  },
  {
    id: 94, name: 'Primeira Liga', shortName: '葡超', country: '葡萄牙', icon: '🇵🇹',
    fallbackTeams: ['Benfica', 'Porto', 'Sporting CP', 'Braga', 'Vitoria', 'Boavista', 'Rio Ave', 'Famalicao'],
  },
  {
    id: 848, name: 'Chinese Super League', shortName: '中超', country: '中国', icon: '🇨🇳',
    fallbackTeams: ['上海海港', '山东泰山', '北京国安', '上海申花', '成都蓉城', '武汉三镇', '浙江队', '天津津门虎'],
  },
  {
    id: 2, name: 'UEFA Champions League', shortName: '欧冠', country: '欧洲', icon: '🏆',
    fallbackTeams: ['Real Madrid', 'Man City', 'Bayern Munich', 'Barcelona', 'PSG', 'Inter Milan', 'Arsenal', 'Dortmund'],
  },
  {
    id: 3, name: 'UEFA Europa League', shortName: '欧联杯', country: '欧洲', icon: '🏅',
    fallbackTeams: ['Liverpool', 'Roma', 'Leverkusen', 'Marseille', 'Brighton', 'West Ham', 'Atalanta', 'Sporting CP'],
  },
];

function createFallbackMatches(league: typeof LEAGUES_CONFIG[0]) {
  const teams = league.fallbackTeams;
  const matchups = [
    { home: teams[0], away: teams[1] },
    { home: teams[2], away: teams[3] },
    { home: teams[4], away: teams[5] },
    { home: teams[6], away: teams[7] },
    { home: teams[3], away: teams[0] },
  ];

  return matchups.map((item, index) => ({
    fixture: {
      id: league.id * 100 + index + 1,
      date: new Date(Date.now() + (index - 2) * 3600 * 1000).toISOString(),
      status: { long: index === 0 ? 'LIVE' : index < 3 ? 'FINISHED' : 'NS' },
    },
    league: { name: league.name },
    teams: {
      home: {
        name: item.home,
        abbreviation: item.home.replace(/\s+/g, '').slice(0, 3).toUpperCase(),
        logo: `https://via.placeholder.com/48/0f172a/ffffff?text=${encodeURIComponent(item.home.slice(0, 2))}`,
      },
      away: {
        name: item.away,
        abbreviation: item.away.replace(/\s+/g, '').slice(0, 3).toUpperCase(),
        logo: `https://via.placeholder.com/48/0f172a/ffffff?text=${encodeURIComponent(item.away.slice(0, 2))}`,
      },
    },
    goals: {
      home: index < 3 ? (index + 1) % 3 + 1 : null,
      away: index < 3 ? index % 2 : null,
    },
  }));
}

function createFallbackStandings(league: typeof LEAGUES_CONFIG[0]) {
  return league.fallbackTeams.slice(0, 8).map((name, index) => ({
    rank: index + 1,
    team: {
      name,
      logo: `https://via.placeholder.com/24/0f172a/ffffff?text=${index + 1}`,
    },
    points: 24 - index * 2 + (index === 0 ? 3 : 0),
    goalsDiff: 15 - index * 3,
    played: 18 + (index % 3),
  }));
}

export async function GET() {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      console.warn('API_FOOTBALL_KEY 缺失，使用本地备用联赛数据');
      const fallback = LEAGUES_CONFIG.map((league) => ({
        id: league.id,
        name: league.name,
        shortName: league.shortName,
        country: league.country,
        icon: league.icon,
        matches: createFallbackMatches(league),
        standings: createFallbackStandings(league),
        lastUpdate: new Date().toISOString(),
        error: 'API_FOOTBALL_KEY 未配置，当前显示示例数据。获取免费密钥 → https://www.api-football.com/',
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

    // 并行拉取所有联赛的实时数据
    const leaguesData = await Promise.all(
      LEAGUES_CONFIG.map(async (league) => {
        try {
          const [matchesRes, standingsRes] = await Promise.all([
            fetch(
              `https://v3.football.api-sports.io/fixtures?league=${league.id}&season=2026&last=5`,
              { headers: { 'x-apisports-key': apiKey }, cache: 'no-store' }
            ),
            fetch(
              `https://v3.football.api-sports.io/standings?league=${league.id}&season=2026`,
              { headers: { 'x-apisports-key': apiKey }, cache: 'no-store' }
            ),
          ]);

          const [matchesData, standingsData] = await Promise.all([
            matchesRes.json(),
            standingsRes.json(),
          ]);

          // API-Football 免费层有速率限制，检查是否有错误
          const hasMatchesError = matchesData.errors && Object.keys(matchesData.errors).length > 0;
          const hasStandingsError = standingsData.errors && Object.keys(standingsData.errors).length > 0;

          if (hasMatchesError || hasStandingsError) {
            const rateLimitMsg = matchesData.errors?.rateLimit || standingsData.errors?.rateLimit || '';
            return {
              ...league,
              matches: createFallbackMatches(league),
              standings: createFallbackStandings(league),
              lastUpdate: new Date().toISOString(),
              error: rateLimitMsg || 'API 请求受限，显示备用数据',
            };
          }

          return {
            id: league.id,
            name: league.name,
            shortName: league.shortName,
            country: league.country,
            icon: league.icon,
            matches: Array.isArray(matchesData.response)
              ? matchesData.response.slice(0, 5)
              : createFallbackMatches(league),
            standings:
              Array.isArray(standingsData.response) && standingsData.response[0]?.league?.standings
                ? standingsData.response[0].league.standings
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
            error: '拉取失败，显示备用数据',
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
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
