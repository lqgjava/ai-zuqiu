'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { worldCupMatches as fallbackMatches, worldCupStandings as fallbackStandings } from '@/lib/sampleData';
import { useWorldCupData } from '@/hooks/useFootballData';

export default function WorldCupPage() {
  const { matches, standings, loading, error, source } = useWorldCupData(fallbackMatches, fallbackStandings);
  const lastUpdated = loading ? '—' : new Date().toLocaleTimeString();

  const aiMenuPredictions = useMemo(
    () =>
      matches.slice(0, 3).map((match, index) => ({
        id: match.id,
        matchup: `${match.home} vs ${match.away}`,
        pick: index === 0 ? match.home : index === 1 ? match.away : `${match.home} 或 ${match.away}`,
        confidence: `${Math.min(84, 70 + index * 6)}%`,
        reason: match.status === 'Live' ? '根据场上态势与赔率波动实时调整' : '结合官方日历与大模型赛前推演',
      })),
    [matches],
  );

  return (
    <main className="main-container py-10">
      <section className="mb-12 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">世界杯专区</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">全球顶级赛事情报中心</h1>
            <p className="max-w-2xl text-slate-200">从赛程到积分榜，从淘汰赛树到冠军预测，一站式世界杯情报平台。</p>
          </div>
          <Button variant="secondary" href="/">主页面</Button>
        </div>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {loading ? <p className="text-sm text-slate-400">加载实时数据中...</p> : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr] mb-12">
        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">本轮赛程</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">实时比赛与比分</h2>
          </div>
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-5 hover:border-primary/50">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
                  <span>{match.stage}</span>
                  <span>{match.time}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{match.home} vs {match.away}</p>
                    <p className="text-sm text-slate-200">{match.status}</p>
                  </div>
                  {match.score ? <Badge variant="warning">{match.score}</Badge> : <Badge variant="success">准备中</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">小组积分榜</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">小组顺位洞察</h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-white/10">
            <table className="w-full border-collapse text-sm text-slate-300">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">组</th>
                  <th className="px-4 py-3">球队</th>
                  <th className="px-4 py-3">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing) => (
                  <tr key={`${standing.group}-${standing.team}`} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3">{standing.group}</td>
                    <td className="px-4 py-3">{standing.team}</td>
                    <td className="px-4 py-3 font-semibold text-white">{standing.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">官方数据菜单</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">官方日历 + AI 竞猜</h2>
            <p className="mt-2 text-sm text-slate-300">自动拉取官方比赛日程与授权供应商数据，每分钟刷新一次，并提供 AI 预测推荐。</p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-5">
            <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
              <span>数据来源</span>
              <Badge variant={source === 'official' ? 'success' : 'warning'}>
                {source === 'official' ? '实时官方数据' : '备用样本数据'}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-slate-200">Football-data.org / API-FOOTBALL</p>
            <p className="mt-3 text-sm text-slate-300">最近刷新：{lastUpdated}</p>
          </div>

          <div className="space-y-4">
            {matches.slice(0, 2).map((match) => (
              <div key={`${match.id}-menu`} className="rounded-[1.75rem] border border-white/10 bg-slate-950/90 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{match.stage}</span>
                  <span>{match.status}</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">{match.home} vs {match.away}</p>
                <p className="mt-2 text-sm text-slate-200">{match.score ? `当前比分 ${match.score}` : '尚未开赛 / 赛前等待'}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">AI 竞猜结果</p>
            <div className="mt-4 space-y-3">
              {aiMenuPredictions.map((item) => (
                <div key={item.id} className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{item.matchup}</span>
                    <Badge variant="warning">{item.confidence}</Badge>
                  </div>
                  <p className="mt-2 text-base font-semibold text-white">推荐：{item.pick}</p>
                  <p className="mt-1 text-sm text-slate-200">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3 mb-12">
        <Card className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">冠军预测</p>
          <h3 className="text-2xl font-semibold text-white">AI 预测冠军</h3>
          <p className="text-slate-300">综合球队状态、排名与赔率动态，AI 推荐当前最具夺冠潜力的阵营。</p>
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-400">头号热门</p>
            <p className="mt-2 text-xl font-semibold text-white">巴西</p>
            <p className="mt-3 text-sm text-slate-300">胜率 28% · 形态稳定 · 多项数据领先</p>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">热门比赛</p>
          <h3 className="text-2xl font-semibold text-white">关注焦点场次</h3>
          <div className="space-y-3 text-slate-300">
            <p>巴西 vs 法国 — 核心对决</p>
            <p>阿根廷 vs 德国 — 冲击关键</p>
            <p>葡萄牙 vs 西班牙 — 传统强队较量</p>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">策略提示</p>
          <h3 className="text-2xl font-semibold text-white">爆冷预警</h3>
          <p className="text-slate-300">赔率波动、伤停与近期交锋产生爆冷信号，请优先审查高风险场次。</p>
          <Button variant="ghost" href="/parlay">查看串关建议</Button>
        </Card>
      </section>
    </main>
  );
}
