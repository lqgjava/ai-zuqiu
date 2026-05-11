'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { allMatches, parlayAdvice, parlayOutcome, recommendations } from '@/lib/sampleData';
import { useLiveMatches } from '@/hooks/useFootballData';

const chartData = [
  { name: 'Start', value: 0.52 },
  { name: 'After Filter', value: 0.58 },
  { name: 'AI Optimize', value: 0.63 },
];

export default function ParlayPage() {
  const { matches: liveMatches, loading, error, source } = useLiveMatches(allMatches);

  return (
    <main className="main-container py-10">
      <section className="mb-12 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI 串关助手</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">智能风险排序与组合优化</h1>
            <p className="max-w-2xl text-slate-300">选择比赛，AI 自动分析危险场次，并给出最优串关策略与爆冷预警。</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={source === 'official' ? 'success' : 'warning'}>
              {source === 'official' ? '实时官方数据' : '备用样本数据'}
            </Badge>
            <Button href="/">返回首页</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_0.7fr] mb-12">
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">简介</p>
              <p className="mt-2 text-xl font-semibold text-white">从数据到决策，链路全量可视。</p>
            </div>
            <Badge variant="success">AI 核心</Badge>
          </div>
          <p className="text-slate-300">本页展示规则引擎输出：风险排序、爆冷提示、场次删除建议与命中率变化。后续可扩展为 RAG 一体化分析与模型驱动策略。</p>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">目标</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">稳定提升串关命中率</h2>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-5">
              <p className="text-sm text-slate-300">优化后胜率</p>
              <p className="mt-2 text-3xl font-semibold text-white">{Math.round(parlayOutcome.winProbability * 100)}%</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-5">
              <p className="text-sm text-slate-300">组合评级</p>
              <p className="mt-2 text-2xl font-semibold text-white">{parlayOutcome.riskTier}</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] mb-12">
        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">风险趋势</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">AI 组合收益与波动图</h2>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b72ff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6b72ff" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis domain={[0.4, 0.7]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                <Tooltip formatter={(value: number) => `${Math.round(value * 100)}%`} contentStyle={{ backgroundColor: '#0e1117', border: '1px solid rgba(255,255,255,0.08)' }} labelStyle={{ color: '#f8fafc' }} itemStyle={{ color: '#6b72ff' }} />
                <Area type="monotone" dataKey="value" stroke="#6b72ff" strokeWidth={3} fill="url(#probGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">优化建议</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">AI 场次处理</h2>
          </div>
          <div className="space-y-4">
            {parlayAdvice.map((item) => (
              <motion.div key={item.name} className="rounded-3xl border border-white/10 bg-slate-950/90 p-5" whileHover={{ scale: 1.01 }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{item.name}</p>
                  <Badge variant={item.risk === 'High' ? 'danger' : item.risk === 'Medium' ? 'warning' : 'success'}>{item.risk}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-200">{item.suggestion}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{item.impact}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI 推荐场次</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">可纳入串关的核心比赛</h2>
          </div>
          <div className="grid gap-4">
            {recommendations.map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-white">{item.title}</p>
                  <Badge variant={item.label === 'Upset Alert' ? 'danger' : item.label === 'High Odds' ? 'warning' : 'success'}>{item.label}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-300">{item.note}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                  <span>{item.highlight}</span>
                  <span>{item.odds}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">当前赛事池</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">已选比赛列表</h2>
          </div>
          <div className="grid gap-4">
            {allMatches.map((match) => (
              <div key={match.id} className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white">{match.homeTeam.short} vs {match.awayTeam.short}</p>
                  <span className="text-sm text-slate-300">{match.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-200">{match.league} · {match.stage}</p>
                <Link className="mt-4 inline-flex text-sm text-primary hover:text-indigo-300" href={`/match/${match.id}`}>
                  查看赛事分析 →
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
