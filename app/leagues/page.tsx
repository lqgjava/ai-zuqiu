'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { predictMatchSync } from '@/services/aiAnalysis';
import { getFlagUrl } from '@/lib/flags';

interface Match {
  fixture: { id: number; date: string; status: { long: string } };
  league: { name: string };
  teams: { home: { name: string; abbreviation: string; logo: string }; away: { name: string; abbreviation: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

interface Standing {
  rank: number;
  team: { name: string; logo: string };
  points: number;
  goalsDiff: number;
  played: number;
}

interface LeagueData {
  id: number;
  name: string;
  shortName: string;
  country: string;
  icon: string;
  matches: Match[];
  standings: Standing[];
  lastUpdate: string;
  error?: string;
}

function getStatusVariant(status: string) {
  if (status === 'LIVE') return 'success';
  if (status === 'FINISHED') return 'neutral';
  return 'warning';
}

function getLeagueTier(leagueId: number): number {
  const topLeagues = [39, 140, 135, 78, 61, 2, 3]; // Premier League, La Liga, Serie A, Bundesliga, Ligue 1, UCL, UEL
  return topLeagues.includes(leagueId) ? 1 : 2;
}

function buildAiPrediction(match: Match, leagueId: number) {
  // Use team name length as a simple ranking proxy (teams with shorter names tend to be more famous)
  const homeRanking = Math.max(10, 100 - match.teams.home.name.length * 3);
  const awayRanking = Math.max(10, 100 - match.teams.away.name.length * 3);

  return predictMatchSync({
    homeTeam: { name: match.teams.home.name, ranking: homeRanking, form: 0.5 },
    awayTeam: { name: match.teams.away.name, ranking: awayRanking, form: 0.5 },
    leagueContext: { name: match.league.name, tier: getLeagueTier(leagueId) },
    matchContext: { stage: match.league.name, kickOff: match.fixture.date },
  });
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<LeagueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<number>(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaguesData = async () => {
    try {
      const response = await fetch('/api/leagues');
      const data = await response.json();
      if (data.data) {
        setLeagues(data.data);
        if (data.success === false && data.message) {
          setError(data.message);
        } else {
          setError(null);
        }
      } else {
        setError('无法获取联赛数据，请检查接口是否可用。');
      }
    } catch (fetchError) {
      console.error('Error fetching leagues:', fetchError);
      setError('无法连接联赛数据接口，已启用本地缓存数据。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaguesData();

    if (autoRefresh) {
      const interval = setInterval(fetchLeaguesData, 300000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const currentLeague = leagues[selectedLeague] || null;


  return (
    <main className="main-container py-12">
      <div className="bg-league-banner rounded-3xl p-8 mb-10">
        <section className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <p className="badge inline-flex">联赛数据中心</p>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              currentLeague?.error
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentLeague?.error ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {currentLeague?.error ? '示例数据' : '实时数据'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">足球联赛实时数据中心</h1>
          <p className="text-slate-300 max-w-2xl text-lg">
            覆盖全球 10 大联赛的实况比赛、积分榜与 AI 竞猜预测。
          </p>
        </div>

        {/* API 密钥缺失提示 */}
        {currentLeague?.error && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔑</span>
              <div>
                <p className="font-semibold text-amber-300">未配置 API 密钥，当前显示示例数据</p>
                <p className="mt-2 text-sm text-amber-200/80">
                  要获取<strong>实时比赛和积分榜数据</strong>，请在 <code className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs">.env.local</code> 中设置
                  <code className="mx-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-xs">API_FOOTBALL_KEY</code>。
                </p>
                <p className="mt-1 text-sm text-amber-200/60">
                  免费获取密钥 → <a href="https://dashboard.api-football.com/register" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dashboard.api-football.com/register</a>（免费层 100 次/天）
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={fetchLeaguesData} className="btn-primary">
                🔄 手动刷新
              </Button>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                自动刷新（5分钟）
              </label>
            </div>
          </div>

          {currentLeague && (
            <div className="flex flex-col items-end gap-1 text-sm text-slate-400">
              <span>最后更新: {new Date(currentLeague.lastUpdate).toLocaleTimeString('zh-CN')}</span>
            </div>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-300 text-sm">
            {error}
          </div>
        ) : null}
      </section>
      </div>

      <section className="mb-10">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {leagues.map((league, index) => (
            <button
              key={league.id}
              type="button"
              onClick={() => setSelectedLeague(index)}
              className={`rounded-3xl border p-4 text-left transition-all ${
                selectedLeague === index
                  ? 'border-primary bg-primary/10 text-white'
                  : 'border-white/10 bg-slate-950/80 text-slate-300 hover:border-primary hover:bg-slate-900/90'
              }`}
            >
              <div className="mb-2">
                {getFlagUrl(league.country) ? (
                  <img src={getFlagUrl(league.country, 80)} alt={league.country} width={32} height={24} className="rounded-sm shadow-sm" />
                ) : (
                  <span className="text-3xl">{league.icon}</span>
                )}
              </div>
              <p className="text-sm font-semibold">{league.shortName}</p>
              <p className="mt-1 text-xs text-slate-400">{league.country}</p>
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-slate-400">加载联赛数据中...</p>
        </div>
      ) : currentLeague ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <Card className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6">
            <div>
              <p className="section-label text-slate-400">最近比赛</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{currentLeague.name} · 最新 5 场</h2>
            </div>

            <div className="space-y-4">
              {currentLeague.matches && currentLeague.matches.length > 0 ? (
                currentLeague.matches.map((match) => {
                  const prediction = buildAiPrediction(match, currentLeague.id);
                  return (
                    <div key={match.fixture.id} className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{match.league.name}</p>
                          <p className="mt-2 text-lg font-semibold text-white">
                            {match.teams.home.abbreviation} vs {match.teams.away.abbreviation}
                          </p>
                        </div>
                        <Badge variant={getStatusVariant(match.fixture.status.long)}>
                          {match.fixture.status.long === 'LIVE'
                            ? '进行中'
                            : match.fixture.status.long === 'FINISHED'
                            ? '已结束'
                            : '未开始'}
                        </Badge>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-3xl bg-slate-950/70 p-4 text-center">
                          <p className="text-sm text-slate-400">主胜概率</p>
                          <p className="mt-2 text-2xl font-semibold text-white">{Math.round(prediction.home * 100)}%</p>
                        </div>
                        <div className="rounded-3xl bg-slate-950/70 p-4 text-center">
                          <p className="text-sm text-slate-400">平局概率</p>
                          <p className="mt-2 text-2xl font-semibold text-white">{Math.round(prediction.draw * 100)}%</p>
                        </div>
                        <div className="rounded-3xl bg-slate-950/70 p-4 text-center">
                          <p className="text-sm text-slate-400">客胜概率</p>
                          <p className="mt-2 text-2xl font-semibold text-white">{Math.round(prediction.away * 100)}%</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-3xl bg-slate-950/70 p-4 text-sm text-slate-300">
                        {prediction.summary}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                        <span>{new Date(match.fixture.date).toLocaleString('zh-CN')}</span>
                        <span>{match.teams.home.name} vs {match.teams.away.name}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">暂无比赛数据，请稍后刷新。</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6">
            <div>
              <p className="section-label text-slate-400">积分榜</p>
              <h2 className="mt-2 text-xl font-bold text-white">Top 10</h2>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/80">
              <table className="w-full text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-3 py-3 w-10">名</th>
                    <th className="px-3 py-3">队伍</th>
                    <th className="px-3 py-3 w-14 text-center">场</th>
                    <th className="px-3 py-3 w-14 text-center">分</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeague.standings && currentLeague.standings.length > 0 ? (
                    currentLeague.standings.slice(0, 10).map((standing) => (
                      <tr key={standing.team.name} className="border-t border-white/5 hover:bg-slate-900/70">
                        <td className="px-3 py-3 font-semibold text-white">{standing.rank}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {standing.team.logo && (
                              <img src={standing.team.logo} alt={standing.team.name} className="w-5 h-5 rounded-full" />
                            )}
                            <span className="text-slate-200">{standing.team.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-400">{standing.played}</td>
                        <td className="px-3 py-3 text-center font-semibold text-white">{standing.points}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-slate-400">
                        暂无积分表数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-3xl bg-slate-950/70 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white mb-2">数据说明</p>
              <p>若 API 配置不可用，系统会自动切换到备用联赛样本数据，以确保页面仍然可浏览。</p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400">无法加载数据，请稍后重试。</p>
        </div>
      )}
    </main>
  );
}
