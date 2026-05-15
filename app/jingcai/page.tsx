'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { jingcaiMatches } from '@/lib/sampleData';
import { useJingcaiData } from '@/hooks/useFootballData';
import { useLanguage } from '@/components/language-provider';

function bestResult(match: { aiPrediction: { home: number; draw: number; away: number } }, strings: any) {
  if (match.aiPrediction.home > match.aiPrediction.away && match.aiPrediction.home > match.aiPrediction.draw) {
    return strings.jingcai.homeWin;
  }
  if (match.aiPrediction.away > match.aiPrediction.home && match.aiPrediction.away > match.aiPrediction.draw) {
    return strings.jingcai.awayWin;
  }
  return strings.jingcai.draw;
}

export default function JingcaiPage() {
  const { strings } = useLanguage();
  const { matches, loading, error, source, lastUpdated, refresh } = useJingcaiData(jingcaiMatches);

  return (
    <main className="main-container py-12">
      {/* Header Section */}
      <div className="bg-jingcai-banner rounded-3xl p-8 mb-12">
        <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="badge">{strings.jingcai.badge}</p>
            <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">{strings.jingcai.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-300">{strings.jingcai.subtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={source === 'official' ? 'success' : 'warning'}>
              {source === 'official' ? '实时官方数据' : '备用样本数据'}
            </Badge>
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">最近刷新：{lastUpdated}</span>
                <Button variant="ghost" onClick={refresh} className="btn-ghost">
                  手动刷新
                </Button>
              </div>
              <p className="text-xs text-slate-500">已改为只在手动刷新时拉取数据，避免频繁请求外部接口。</p>
            </div>
            <Button variant="secondary" href="/" className="btn-secondary">{strings.jingcai.backHome}</Button>
          </div>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {loading ? <p className="text-sm text-slate-300">{strings.jingcai.refreshStatus(true)}</p> : null}
      </section>
      </div>

      {/* Topic Overview Section */}
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr] mb-12">
        <div className="data-block-primary rounded-lg p-6">
          <p className="section-label">{strings.jingcai.topicLabel}</p>
          <h2 className="mt-3 text-2xl font-bold text-white">{strings.jingcai.topicTitle}</h2>
          <p className="mt-3 text-slate-300">{strings.jingcai.topicText}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="card rounded-lg p-4">
              <p className="section-label text-xs">{strings.jingcai.dimension1}</p>
              <p className="mt-3 text-lg font-bold text-primary">{strings.jingcai.dimension1Detail}</p>
            </div>
            <div className="card rounded-lg p-4">
              <p className="section-label text-xs">{strings.jingcai.dimension2}</p>
              <p className="mt-3 text-lg font-bold text-primary">{strings.jingcai.dimension2Detail}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            {
              title: strings.jingcai.dimension1,
              description: strings.jingcai.dimension1Detail,
            },
            {
              title: strings.jingcai.badge,
              description: strings.jingcai.subtitle,
            },
          ].map((item) => (
            <div key={item.title} className="card rounded-lg p-5 hover:shadow-card-hover">
              <p className="section-label">{item.title}</p>
              <p className="mt-3 text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr] mb-12">
        {/* Matches List */}
        <Card className="space-y-6 rounded-lg">
          <div>
            <p className="section-label">{strings.jingcai.matchListLabel}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{strings.jingcai.matchListTitle}</h2>
          </div>
          <div className="space-y-4">
            {matches.slice(0, 8).map((match) => (
              <div key={match.id} className="match-card">
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="section-label">{match.league}</span>
                  <span className="badge text-xs">{new Date(match.kickOff).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="match-teams mb-3">
                  <div className="team-info">
                    <p className="team-name">{match.homeTeam.short}</p>
                  </div>
                  <div className="match-score">
                    <span className="score">{match.homeScore ?? '-'}</span>
                    <span className="text-slate-300">:</span>
                    <span className="score">{match.awayScore ?? '-'}</span>
                  </div>
                  <div className="team-info">
                    <p className="team-name">{match.awayTeam.short}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-sm text-slate-300 mb-2">{match.stage} · {match.status}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={match.aiPrediction.riskRating === 'High' ? 'danger' : match.aiPrediction.riskRating === 'Medium' ? 'warning' : 'success'}>
                      {match.aiPrediction.riskRating}
                    </Badge>
                    <span className="text-sm font-semibold text-primary">{bestResult(match, strings)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Data Menu */}
        <Card className="space-y-6 rounded-lg">
          <div>
            <p className="section-label">{strings.jingcai.dataMenuTitle}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{strings.jingcai.dataMenuSubtitle}</h2>
            <p className="mt-2 text-sm text-slate-300">{strings.jingcai.subtitle}</p>
          </div>

          <div className="data-block rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label text-xs">{strings.jingcai.dimension2}</p>
              <Badge variant="success">{strings.jingcai.dataMenuSubtitle}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-300">{strings.jingcai.subtitle}</p>
          </div>

          <div className="space-y-3">
            {matches.slice(0, 3).map((match) => (
              <div key={`${match.id}-menu`} className="card rounded-lg p-4">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="section-label">{match.stage}</span>
                  <span className="badge text-xs">{match.status}</span>
                </div>
                <p className="font-bold text-primary text-sm">{match.homeTeam.short} vs {match.awayTeam.short}</p>
                <p className="mt-2 text-sm text-slate-300">{match.homeScore !== undefined && match.awayScore !== undefined ? `Score: ${match.homeScore}-${match.awayScore}` : 'Pending'}</p>
                <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                  <div className="data-block rounded p-1.5 text-center">
                    <p className="text-primary font-semibold">{Math.round(match.aiPrediction.home * 100)}%</p>
                  </div>
                  <div className="data-block rounded p-1.5 text-center">
                    <p className="text-primary font-semibold">{Math.round(match.aiPrediction.draw * 100)}%</p>
                  </div>
                  <div className="data-block rounded p-1.5 text-center">
                    <p className="text-primary font-semibold">{Math.round(match.aiPrediction.away * 100)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Recommendations */}
        <Card className="space-y-6 rounded-lg">
          <div>
            <p className="section-label">{strings.jingcai.aiRecommendationLabel}</p>
            <h2 className="mt-2 text-xl font-bold text-white">{strings.jingcai.aiRecommendationTitle}</h2>
          </div>

          <div className="space-y-3">
            {matches.slice(0, 5).map((match) => (
              <div key={match.id} className="prediction-block">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-primary">{match.homeTeam.short} vs {match.awayTeam.short}</span>
                  <Badge variant={match.aiPrediction.riskRating === 'High' ? 'danger' : match.aiPrediction.riskRating === 'Medium' ? 'warning' : 'success'}>
                    {match.aiPrediction.riskRating}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-primary">{bestResult(match, strings)}</p>
                <p className="mt-1 text-xs text-slate-300">{match.aiPrediction.summary}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Summary Section */}
      <section className="grid gap-6 lg:grid-cols-3 mb-12">
        <Card className="rounded-lg p-6">
          <p className="section-label">{strings.jingcai.matchListLabel}</p>
          <h3 className="mt-3 text-2xl font-bold text-white">{strings.jingcai.matchListTitle}</h3>
          <p className="mt-3 text-slate-300">{strings.jingcai.subtitle}</p>
        </Card>

        <Card className="rounded-lg p-6">
          <p className="section-label">{strings.jingcai.coreMatchLabel}</p>
          <h3 className="mt-3 text-xl font-bold text-white">{strings.jingcai.coreMatchLabel}</h3>
          <div className="space-y-2 mt-3 text-sm text-slate-300">
            <p>🏆 Roma vs Fiorentina — Serie A Classic</p>
            <p>⚽ Everton vs Manchester City — Premier League</p>
            <p>🇪🇸 Sevilla vs Real Sociedad — LaLiga</p>
          </div>
        </Card>

        <Card className="rounded-lg p-6">
          <p className="section-label">{strings.jingcai.riskAlertLabel}</p>
          <h3 className="mt-3 text-xl font-bold text-danger">{strings.jingcai.riskAlertTitle}</h3>
          <p className="mt-3 text-slate-300 text-sm">{strings.jingcai.riskAlertText}</p>
          <Button href="/jingcai" className="btn-primary mt-4 w-full py-2 rounded-lg text-sm">{strings.jingcai.reviewParlayButton}</Button>
        </Card>
      </section>
    </main>
  );
}
