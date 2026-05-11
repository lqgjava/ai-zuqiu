'use client';

import Link from 'next/link';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { allMatches } from '@/lib/sampleData';
import { formatDateTime } from '@/lib/utils';

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const match = allMatches.find((item) => item.id === resolvedParams.id);

  if (!match) {
    return (
      <main className="main-container py-10">
        <Card>
          <h1 className="text-3xl font-semibold text-white">赛事未找到</h1>
          <p className="mt-3 text-slate-300">请返回首页选择其他比赛。</p>
          <Button className="mt-6" href="/">返回首页</Button>
        </Card>
      </main>
    );
  }

  const chartData = match.oddsHistory.map((item) => ({ ...item, value: item.home }));

  return (
    <main className="main-container py-10">
      <section className="mb-12 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">比赛详情</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">{match.homeTeam.name} vs {match.awayTeam.name}</h1>
            <p className="mt-2 text-slate-300">{match.league} · {match.stage} · {formatDateTime(match.kickOff)}</p>
          </div>
          <Button variant="secondary" href="/parlay">回到串关助手</Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_0.65fr] mb-12">
        <Card className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">场馆信息</p>
              <p className="text-lg text-white">{match.stadium}</p>
              <p className="text-sm text-slate-300">天气：{match.weather}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">当前状态</p>
              <p className="text-lg text-white">{match.status}</p>
              <p className="text-sm text-slate-300">比分：{match.homeScore ?? 0} - {match.awayScore ?? 0}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: '主胜', value: `${Math.round(match.aiPrediction.home * 100)}%` },
              { label: '平局', value: `${Math.round(match.aiPrediction.draw * 100)}%` },
              { label: '客胜', value: `${Math.round(match.aiPrediction.away * 100)}%` },
            ].map((item) => (
              <div key={item.label} className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-5 text-center">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">风险评级</p>
                <p className="mt-2 text-2xl font-semibold text-white">{match.aiPrediction.riskRating}</p>
              </div>
              <Badge variant={match.aiPrediction.riskRating === 'High' ? 'danger' : match.aiPrediction.riskRating === 'Medium' ? 'warning' : 'success'}>
                {match.aiPrediction.riskRating} 风险
              </Badge>
            </div>
            <p className="text-slate-300">{match.aiPrediction.summary}</p>
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">赔率趋势</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">实时变化曲线</h2>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 16, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }} labelStyle={{ color: '#f8fafc' }} itemStyle={{ color: '#7c3aed' }} />
                <Area type="monotone" dataKey="home" stroke="#6b72ff" fill="rgba(107,114,255,0.2)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_0.65fr] mb-12">
        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI 分析理由</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">关键因子解读</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: '历史战绩', text: '历史对阵表现稳定，巴西近 5 次面对传统强队保持优势。' },
              { title: '阵容完整度', text: '法国存在后防伤病，巴西攻击端更为齐整。' },
              { title: '主客场表现', text: '巴西主场数据更强，控球与进攻效率领先。' },
              { title: '赔率变化', text: '主胜概率在近 6 小时内持续上涨，AI 识别价值点。' },
            ].map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-5">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-3 text-sm text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">数据分析</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">关键指标对比</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'xG', home: match.analytics.xG.home, away: match.analytics.xG.away },
              { label: '控球率', home: match.analytics.possession.home, away: match.analytics.possession.away },
              { label: '射门', home: match.analytics.shots.home, away: match.analytics.shots.away },
              { label: '角球', home: match.analytics.corners.home, away: match.analytics.corners.away },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{item.label}</span>
                  <span>{item.home}/{item.away}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${item.home / (item.home + item.away) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 mb-12">
        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">历史交锋</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">近期 10 场对比</h2>
          </div>
          <div className="space-y-3">
            {match.history.map((item) => (
              <div key={item.id} className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-4">
                <p className="text-sm text-slate-400">{item.date} · {item.competition}</p>
                <p className="mt-2 text-base font-semibold text-white">{item.home} {item.score} {item.away}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">阵容与伤病</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">关键影响因素</h2>
          </div>
          <p className="text-slate-300">巴西攻势选择健康、法国防线有一名主力受伤。AI 结合阵容完整度与数据形态，识别爆冷预警。</p>
          <div className="grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">伤病关注</p>
              <p className="mt-2 text-sm text-white">法国关键中卫缺阵，后场结构需临场观察。</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">阵容完整度</p>
              <p className="mt-2 text-sm text-white">巴西首发与替补深度均优于对手。</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
