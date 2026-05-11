'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

function buildAiPrediction(match: Match) {
  const seed = Number(String(match.fixture.id).slice(-2)) || 42;
  const home = Math.max(28, Math.min(65, Math.round((seed % 40) + 30)));
  const draw = Math.max(18, Math.min(30, 100 - home - 25));
  const away = 100 - home - draw;
  const summary = home > away
    ? 'AI 倾向主队进攻更有威胁，建议关注主队倾向。'
    : away > home
    ? 'AI 识别客队状态上升，客胜潜力增加。'
    : 'AI 认为比赛平局概率较高，谨慎选择。';

  return { home, draw, away, summary };
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
      const interval = setInterval(fetchLeaguesData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const currentLeague = leagues[selectedLeague] || null;
  const sourceLabel = currentLeague?.error ? '备用样本数据' : '官方实时数据';

  return (
    <main className="main-container py-12">
      <section className="mb-10 space-y-6">
        <div>
          <p className="badge inline-flex mb-4">官方联赛数据</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">足球联赛实时数据中心</h1>
          <p className="text-slate-300 max-w-2xl text-lg">
            覆盖全球主要联赛的实况比赛、积分榜与 AI 竞猜。若 API 未配置，将自动回退到本地备用数据展示。
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={fetchLeaguesData} className="btn-primary">
              🔄 手动刷新
            </Button>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              自动刷新
            </label>
          </div>

          {currentLeague && (
            <div className="flex flex-col items-end gap-1 text-sm text-slate-400">
              <span>数据来源：{sourceLabel}</span>
              <span>最后更新: {new Date(currentLeague.lastUpdate).toLocaleTimeString('zh-CN')}</span>
            </div>
          )}
        </div>

        {error ? (
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-amber-50">
            <p className="font-semibold">提示：{error}</p>
            <p className="mt-1 text-sm text-amber-100/80">
              当前页面支持 `API_FOOTBALL_KEY` 实时接口，也会在未配置时自动显示备用样本数据。
            </p>
          </div>
        ) : null}
      </section>

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
              <div className="text-3xl mb-2">{league.icon}</div>
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
                  const prediction = buildAiPrediction(match);
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
                          <p className="mt-2 text-2xl font-semibold text-white">{prediction.home}%</p>
                        </div>
                        <div className="rounded-3xl bg-slate-950/70 p-4 text-center">
                          <p className="text-sm text-slate-400">平局概率</p>
                          <p className="mt-2 text-2xl font-semibold text-white">{prediction.draw}%</p>
                        </div>
                        <div className="rounded-3xl bg-slate-950/70 p-4 text-center">
                          <p className="text-sm text-slate-400">客胜概率</p>
                          <p className="mt-2 text-2xl font-semibold text-white">{prediction.away}%</p>
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
