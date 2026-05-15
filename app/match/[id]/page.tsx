import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchMatchById } from '@/services/footballApi';
import { formatDateTime } from '@/lib/utils';
import { MatchOddsChart } from './MatchOddsChart';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const match = await fetchMatchById(id);
  if (!match) return { title: '赛事未找到 - 球智 AI' };
  return {
    title: `${match.homeTeam.name} vs ${match.awayTeam.name} - 球智 AI`,
    description: match.aiPrediction.summary,
  };
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await fetchMatchById(id);

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

  const { homeTeam, awayTeam, aiPrediction, analytics, oddsHistory, history } = match;

  return (
    <main className="main-container py-10">
      <div className="bg-stadium-banner rounded-3xl p-8 mb-12">
        <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">比赛详情</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">{homeTeam.name} vs {awayTeam.name}</h1>
            <p className="mt-2 text-slate-300">{match.league} · {match.stage} · {formatDateTime(match.kickOff)}</p>
          </div>
          <Button variant="secondary" href="/parlay">回到串关助手</Button>
        </div>
      </section>
      </div>

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
              { label: '主胜', value: `${Math.round(aiPrediction.home * 100)}%` },
              { label: '平局', value: `${Math.round(aiPrediction.draw * 100)}%` },
              { label: '客胜', value: `${Math.round(aiPrediction.away * 100)}%` },
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
                <p className="mt-2 text-2xl font-semibold text-white">{aiPrediction.riskRating}</p>
              </div>
              <Badge variant={aiPrediction.riskRating === 'High' ? 'danger' : aiPrediction.riskRating === 'Medium' ? 'warning' : 'success'}>
                {aiPrediction.riskRating} 风险
              </Badge>
            </div>
            <p className="text-slate-300">{aiPrediction.summary}</p>
            {aiPrediction.confidence && (
              <p className="text-sm text-slate-400">AI 置信度：{Math.round(aiPrediction.confidence * 100)}%</p>
            )}
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">赔率趋势</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">实时变化曲线</h2>
          </div>
          <MatchOddsChart oddsHistory={oddsHistory} />
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_0.65fr] mb-12">
        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI 分析理由</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">关键因子解读</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(aiPrediction.factors && aiPrediction.factors.length > 0
              ? aiPrediction.factors
              : [
                  { title: '排名对比', text: `${homeTeam.name} 排名第 ${homeTeam.ranking} 位，${awayTeam.name} 排名第 ${awayTeam.ranking} 位`, weight: 0.3 },
                  { title: '联赛数据', text: `${match.league} · ${match.stage}`, weight: 0.25 },
                  { title: '比赛状态', text: match.status, weight: 0.25 },
                  { title: '赔率参考', text: oddsHistory.length > 0 ? '赔率数据已纳入分析模型' : '暂无赔率波动数据', weight: 0.2 },
                ]
            ).map((item) => (
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
              { label: 'xG', home: analytics.xG.home, away: analytics.xG.away },
              { label: '控球率', home: analytics.possession.home, away: analytics.possession.away },
              { label: '射门', home: analytics.shots.home, away: analytics.shots.away },
              { label: '角球', home: analytics.corners.home, away: analytics.corners.away },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{item.label}</span>
                  <span>{item.home}/{item.away}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${item.home / (item.home + item.away || 1) * 100}%` }}
                  />
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
            <h2 className="mt-2 text-2xl font-semibold text-white">近期对比</h2>
          </div>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-sm text-slate-400">{item.date} · {item.competition}</p>
                  <p className="mt-2 text-base font-semibold text-white">{item.home} {item.score} {item.away}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">暂无历史交锋数据</p>
          )}
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">阵容与伤病</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">关键影响因素</h2>
          </div>
          {match.injuries ? (
            <p className="text-slate-300">{match.injuries}</p>
          ) : (
            <p className="text-slate-300">伤病数据暂未获取，请关注官方渠道获取最新球队阵容信息。</p>
          )}
          <div className="grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">阵容评估</p>
              <p className="mt-2 text-sm text-white">
                {homeTeam.name} 排名第 {homeTeam.ranking} 位 · {awayTeam.name} 排名第 {awayTeam.ranking} 位
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">数据来源</p>
              <p className="mt-2 text-sm text-white">AI 分析基于 API-Football 官方数据与历史统计</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
