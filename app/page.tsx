'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import { allMatches, parlayOutcome, recommendations, worldCupMatches, worldCupStandings } from '@/lib/sampleData';
import { useLiveMatches, useWorldCupData } from '@/hooks/useFootballData';
import { useLanguage } from '@/components/language-provider';
import { TeamBadge } from '@/components/ui/team-badge';

const animatedList = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { strings } = useLanguage();
  const { matches: liveMatches } = useLiveMatches(allMatches);
  const { matches: liveWorldCupMatches, standings: liveWorldCupStandings } = useWorldCupData(worldCupMatches, worldCupStandings);

  return (
    <main className="main-container py-10">
      {/* ============================================================
          Hero Section — SofaScore dark style with football atmosphere
          ============================================================ */}
      <section className="relative mb-16 overflow-hidden rounded-[2rem] bg-football-hero border border-white/8 p-8 md:p-12">
        {/* Decorative football icons */}
        <div className="absolute top-6 right-8 text-6xl opacity-5 select-none">⚽</div>
        <div className="absolute bottom-6 left-8 text-4xl opacity-5 select-none rotate-12">🏟️</div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <span className="live-dot" />
                {strings.home.heroBadge}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
              className="space-y-5"
            >
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                  {strings.home.heroTitle}
                </h1>
                <p className="max-w-2xl text-lg text-slate-300 leading-relaxed">
                  {strings.home.heroSubtitle}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.0 }}
                className="grid gap-4 sm:grid-cols-3"
              >
                {strings.home.featureCards.map((item) => (
                  <div key={item.label} className="card rounded-xl p-5 corner-decoration">
                    <p className="section-label">{item.label}</p>
                    <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Data Highlight Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
            className="glow-panel rounded-2xl p-8"
          >
            <div className="space-y-6">
              <div>
                <p className="section-label">{strings.home.dataPanelLabel}</p>
                <h2 className="text-3xl font-bold text-primary mt-2">{strings.home.dataPanelTitle}</h2>
              </div>
              <p className="text-slate-300">{strings.home.dataPanelText}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {strings.home.statsHighlights.map((panel) => (
                  <div key={panel.title} className="rounded-xl bg-white/3 border border-white/6 p-4">
                    <p className="section-label text-xs">{panel.title}</p>
                    <p className="mt-3 text-2xl font-bold text-primary">{panel.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          Feature Cards Grid
          ============================================================ */}
      <section className="grid gap-6 lg:grid-cols-3 mb-16">
        {strings.home.overviewCards.map((item) => (
          <div key={item.title} className="card rounded-2xl p-6">
            <p className="section-label">{item.title}</p>
            <p className="mt-4 text-slate-300 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </section>

      {/* ============================================================
          Today's Matches + AI Insights
          ============================================================ */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] mb-16">
        <Card className="space-y-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-label">{strings.home.todayMatchesLabel}</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{strings.home.todayMatchesTitle}</h2>
            </div>
            <Button variant="ghost">{strings.home.todayMatchesButton}</Button>
          </div>

          <div className="space-y-4">
            {liveMatches.map((match) => (
              <motion.div
                key={match.id}
                variants={animatedList}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
                className={`match-card ${match.status === 'LIVE' ? 'live' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {match.status === 'LIVE' && <span className="live-dot" />}
                    <div>
                      <p className="section-label text-xs">{match.league}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{formatDateTime(match.kickOff)}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      match.aiPrediction.riskRating === 'High'
                        ? 'danger'
                        : match.aiPrediction.riskRating === 'Medium'
                        ? 'warning'
                        : 'success'
                    }
                  >
                    {strings.home.matchRiskTemplate.replace('{risk}', match.aiPrediction.riskRating)}
                  </Badge>
                </div>

                <div className="match-teams">
                  <div className="team-info">
                    <TeamBadge name={match.homeTeam.short} badgeUrl={match.homeTeam.badgeUrl} size={44} />
                    <p className="team-name text-lg mt-2">{match.homeTeam.short}</p>
                  </div>
                  <div className="match-score">
                    <span className="score">{match.homeScore ?? '-'}</span>
                    <span className="text-slate-600 text-xl">:</span>
                    <span className="score">{match.awayScore ?? '-'}</span>
                  </div>
                  <div className="team-info">
                    <TeamBadge name={match.awayTeam.short} badgeUrl={match.awayTeam.badgeUrl} size={44} />
                    <p className="team-name text-lg mt-2">{match.awayTeam.short}</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-4 text-xs">
                  <span className="text-slate-400">H {Math.round(match.aiPrediction.home * 100)}%</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">D {Math.round(match.aiPrediction.draw * 100)}%</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">A {Math.round(match.aiPrediction.away * 100)}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* AI Insights Sidebar */}
        <Card className="space-y-6 rounded-2xl football-icon-bg">
          <div>
            <p className="section-label">{strings.home.aiInsightsLabel}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{strings.home.aiInsightsTitle}</h2>
          </div>

          <div className="grid gap-4">
            {recommendations.map((item) => (
              <div key={item.title} className="prediction-block">
                <div className="flex items-center justify-between mb-2">
                  <p className="section-label text-xs">{item.label}</p>
                  <Badge
                    variant={
                      item.label === 'Upset Alert' ? 'danger' : item.label === 'High Odds' ? 'warning' : 'success'
                    }
                  >
                    {item.label}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.note}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Odds {item.odds}</span>
                  <span className="font-semibold text-primary">{Math.round(item.confidence * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ============================================================
          World Cup Section
          ============================================================ */}
      <section className="grid gap-6 lg:grid-cols-[0.9fr_0.7fr] mb-16">
        <Card className="space-y-6 rounded-2xl">
          <div>
            <p className="section-label">{strings.home.worldcupPanelLabel}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{strings.home.worldcupPanelTitle}</h2>
          </div>

          <div className="grid gap-4">
            {liveWorldCupMatches.map((item) => (
              <div key={item.id} className="match-card rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="section-label text-xs">{item.stage}</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                    {item.status === 'LIVE' && <span className="live-dot" />}
                    {item.status}
                  </span>
                </div>
                <div className="match-teams">
                  <div className="team-info">
                    <TeamBadge name={item.home} size={40} />
                    <p className="team-name">{item.home}</p>
                  </div>
                  <div className="match-score">
                    <span className={`score ${item.status === 'LIVE' ? 'text-emerald-400' : ''}`}>{item.score || item.time}</span>
                  </div>
                  <div className="team-info">
                    <TeamBadge name={item.away} size={40} />
                    <p className="team-name">{item.away}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Standings Table */}
        <Card className="space-y-4 rounded-2xl">
          <div>
            <p className="section-label">{strings.home.standingsPanelLabel}</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="sofa-table w-full">
              <thead>
                <tr>
                  <th className="text-left">Team</th>
                  <th className="text-center">P</th>
                  <th className="text-center">W</th>
                  <th className="text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {liveWorldCupStandings.map((standing) => (
                  <tr key={`${standing.group}-${standing.team}`}>
                    <td className="font-semibold text-white">{standing.team}</td>
                    <td className="text-center">{standing.played}</td>
                    <td className="text-center">{standing.win}</td>
                    <td className="text-center font-bold text-primary">{standing.win * 3 + standing.draw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ============================================================
          Parlay Section
          ============================================================ */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] mb-24">
        <Card className="space-y-6 rounded-2xl bg-grass-field">
          <div>
            <p className="section-label">{strings.home.parlayLabel}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{strings.home.parlayTitle}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="data-block rounded-xl">
              <p className="section-label text-xs">{strings.home.parlayCard1Title}</p>
              <p className="mt-3 text-2xl font-bold text-primary">{strings.home.parlayCard1Detail}</p>
            </div>
            <div className="data-block rounded-xl">
              <p className="section-label text-xs">{strings.home.parlayCard2Title}</p>
              <p className="mt-3 text-2xl font-bold text-primary">{strings.home.parlayCard2Detail}</p>
            </div>
            <div className="data-block rounded-xl">
              <p className="section-label text-xs">{strings.home.parlayCard3Title}</p>
              <p className="mt-3 text-2xl font-bold text-primary">{strings.home.parlayCard3Detail}</p>
            </div>
          </div>
          <Link href="/jingcai">
            <Button className="btn-primary w-full py-2.5 rounded-xl mt-4">
              ⚽ {strings.home.parlayButton}
            </Button>
          </Link>
        </Card>

        <Card className="space-y-6 rounded-2xl">
          <div className="space-y-4">
            <p className="section-label">{strings.home.parlayLabel}</p>
            <h3 className="text-xl font-bold text-white">{parlayOutcome.title}</h3>
            <p className="text-slate-400">{strings.home.parlayOutcomeTitle}: {parlayOutcome.changedOdds}</p>
          </div>
          <div className="grid gap-3">
            <div className="data-block-primary rounded-xl p-5">
              <p className="section-label text-xs">{strings.home.parlayOutcomeDetail}</p>
              <p className="mt-3 text-3xl font-bold text-primary">{Math.round(parlayOutcome.winProbability * 100)}%</p>
            </div>
            <div className="data-block rounded-xl p-5">
              <p className="section-label text-xs">{strings.home.parlayCard3Title}</p>
              <p className="mt-2 text-2xl font-bold text-primary">{parlayOutcome.riskTier}</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
