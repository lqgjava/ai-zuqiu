'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { allMatches } from '@/lib/sampleData';
import { useLiveMatches } from '@/hooks/useFootballData';
import type { ParlayAdvice, ParlayOutcome } from '@/types';

export default function ParlayPage() {
  const { matches: liveMatches, loading, error, source } = useLiveMatches(allMatches);
  const displayMatches = liveMatches.length > 0 ? liveMatches : allMatches;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(displayMatches.map((m) => m.id)));
  const [analysis, setAnalysis] = useState<{ advice: ParlayAdvice[]; outcome: ParlayOutcome } | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    setSelectedIds(new Set(displayMatches.map((m) => m.id)));
  }, [source]);

  const toggleMatch = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === displayMatches.length) return new Set();
      return new Set(displayMatches.map((m) => m.id));
    });
  }, [displayMatches]);

  const selectedMatches = useMemo(
    () => displayMatches.filter((m) => selectedIds.has(m.id)),
    [displayMatches, selectedIds],
  );

  useEffect(() => {
    let active = true;

    async function fetchAnalysis() {
      setAnalysisLoading(true);
      try {
        const res = await fetch('/api/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchIds: [...selectedIds] }),
        });
        const data = await res.json();
        if (active) setAnalysis(data);
      } catch {
        // silently fail, keep old analysis
      } finally {
        if (active) setAnalysisLoading(false);
      }
    }

    fetchAnalysis();
    return () => { active = false; };
  }, [selectedIds]);

  const allWinProbs = useMemo(
    () => displayMatches.map((m) => Math.max(m.aiPrediction.home, m.aiPrediction.draw, m.aiPrediction.away)),
    [displayMatches],
  );

  const selectedWinProbs = useMemo(
    () => selectedMatches.map((m) => Math.max(m.aiPrediction.home, m.aiPrediction.draw, m.aiPrediction.away)),
    [selectedMatches],
  );

  const baseProb = allWinProbs.length > 0 ? allWinProbs.reduce((a, b) => a + b, 0) / allWinProbs.length : 0;
  const filteredProb = selectedWinProbs.length > 0 ? selectedWinProbs.reduce((a, b) => a + b, 0) / selectedWinProbs.length : 0;
  const optimizedProb = analysis?.outcome?.winProbability ?? filteredProb;

  const chartData = [
    { name: '全部比赛', value: baseProb },
    { name: '筛选后', value: filteredProb },
    { name: 'AI 优化', value: Math.max(optimizedProb, filteredProb * 0.95) },
  ];

  const deltaPercent = Math.round((chartData[1].value - chartData[0].value) * 100);

  return (
    <main className="main-container py-10">
      <div className="bg-parlay-banner rounded-3xl p-8 mb-12">
        <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI 串关助手</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">智能风险排序与组合优化</h1>
            <p className="max-w-2xl text-slate-300">勾选比赛，AI 自动分析危险场次，并给出最优串关策略与爆冷预警。</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={source === 'official' ? 'success' : 'warning'}>
              {source === 'official' ? '实时官方数据' : '备用样本数据'}
            </Badge>
            <Button href="/">返回首页</Button>
          </div>
        </div>
      </section>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_0.7fr] mb-12">
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">简介</p>
              <p className="mt-2 text-xl font-semibold text-white">从数据到决策，链路全量可视。</p>
            </div>
            <Badge variant="success">AI 核心</Badge>
          </div>
          <p className="text-slate-300">勾选比赛后 AI 实时计算：风险排序、爆冷提示、场次删除建议与命中率变化。</p>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">目标</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">稳定提升串关命中率</h2>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-5">
              <p className="text-sm text-slate-300">优化后胜率</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-semibold text-white">{Math.round(optimizedProb * 100)}%</p>
                {deltaPercent !== 0 && (
                  <span className={`text-sm ${deltaPercent > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {deltaPercent > 0 ? '+' : ''}{deltaPercent}%
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-5">
              <p className="text-sm text-slate-300">组合评级</p>
              <p className="mt-2 text-2xl font-semibold text-white">{analysis?.outcome?.riskTier ?? '-'}</p>
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
                <YAxis domain={[0.35, 0.75]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                <Tooltip formatter={(v: number) => `${Math.round(v * 100)}%`} contentStyle={{ backgroundColor: '#0e1117', border: '1px solid rgba(255,255,255,0.08)' }} labelStyle={{ color: '#f8fafc' }} itemStyle={{ color: '#6b72ff' }} />
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
          {analysisLoading && <p className="text-sm text-slate-400">分析中...</p>}
          <div className="space-y-4">
            {analysis?.advice?.map((item) => (
              <motion.div key={item.name} className="rounded-3xl border border-white/10 bg-slate-950/90 p-5" whileHover={{ scale: 1.01 }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{item.name}</p>
                  <Badge variant={item.risk === 'High' ? 'danger' : item.risk === 'Medium' ? 'warning' : 'success'}>
                    {item.risk}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-slate-200">{item.suggestion}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{item.impact}</p>
              </motion.div>
            )) ?? (
              <p className="text-slate-400">加载分析结果中...</p>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">当前赛事池</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                已选 {selectedMatches.length}/{displayMatches.length} 场比赛
              </h2>
            </div>
            <Button variant="ghost" onClick={toggleAll}>
              {selectedIds.size === displayMatches.length ? '取消全选' : '全选'}
            </Button>
          </div>
          <div className="grid gap-4">
            {displayMatches.map((match) => {
              const isSelected = selectedIds.has(match.id);
              return (
                <div
                  key={match.id}
                  className={`rounded-[2rem] border p-5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary/50 bg-slate-950/90'
                      : 'border-white/10 bg-slate-950/50 opacity-60'
                  }`}
                  onClick={() => toggleMatch(match.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMatch(match.id)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <p className="text-base font-semibold text-white">{match.homeTeam.short} vs {match.awayTeam.short}</p>
                        <p className="mt-1 text-sm text-slate-200">{match.league} · {match.stage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={match.aiPrediction.riskRating === 'High' ? 'danger' : match.aiPrediction.riskRating === 'Medium' ? 'warning' : 'success'}>
                        {match.aiPrediction.riskRating}
                      </Badge>
                      <Link
                        className="mt-2 block text-sm text-primary hover:text-indigo-300"
                        href={`/match/${match.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        查看分析 →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">串关详情</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">优化结果</h2>
          </div>
          {analysis?.outcome && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                <p className="text-sm text-slate-400">组合赔率</p>
                <p className="mt-2 text-3xl font-bold text-white">{analysis.outcome.changedOdds}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                <p className="text-sm text-slate-400">命中率</p>
                <p className="mt-2 text-3xl font-bold text-white">{Math.round(analysis.outcome.winProbability * 100)}%</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                <p className="text-sm text-slate-400">风险等级</p>
                <p className="mt-2 text-2xl font-bold text-white">{analysis.outcome.riskTier}</p>
              </div>
            </div>
          )}
          <div className="rounded-3xl bg-slate-950/70 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white mb-2">提示</p>
            <p>体育彩票有风险，AI 预测仅供参考。高风险场次建议作为串关结构调整或剔除，以保护组合稳定性。</p>
          </div>
        </Card>
      </section>
    </main>
  );
}
