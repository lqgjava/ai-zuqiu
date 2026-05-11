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

const animatedList = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { strings } = useLanguage();
  const { matches: liveMatches } = useLiveMatches(allMatches);
  const { matches: liveWorldCupMatches, standings: liveWorldCupStandings } = useWorldCupData(worldCupMatches, worldCupStandings);

  return (
    <main className="main-container py-12">
      {/* Hero Section */}
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] mb-12 items-start">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="badge"
          >
            {strings.home.heroBadge}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
            className="space-y-5"
          >
            <div className="space-y-4">
              <p className="text-4xl font-bold text-primary sm:text-5xl">{strings.home.heroTitle}</p>
              <p className="max-w-2xl text-muted text-lg">{strings.home.heroSubtitle}</p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.0 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              {strings.home.featureCards.map((item) => (
                <div key={item.label} className="card p-5 rounded-lg">
                  <p className="section-label">{item.label}</p>
                  <p className="mt-3 text-lg font-semibold text-primary">{item.value}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Data Highlight Panel */}
        <div className="data-block-primary rounded-lg p-8 h-full">
          <div className="space-y-6">
            <div>
              <p className="section-label">{strings.home.dataPanelLabel}</p>
              <h2 className="text-3xl font-bold text-primary mt-2">{strings.home.dataPanelTitle}</h2>
            </div>
            <p className="text-muted">{strings.home.dataPanelText}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {strings.home.statsHighlights.map((panel) => (
                <div key={panel.title} className="bg-white rounded-lg p-4 border border-neutral-dark">
                  <p className="section-label">{panel.title}</p>
                  <p className="mt-3 text-2xl font-bold text-primary">{panel.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="grid gap-6 lg:grid-cols-3 mb-16">
        {strings.home.overviewCards.map((item) => (
          <div key={item.title} className="card p-6 rounded-lg hover:shadow-card-hover">
            <p className="section-label">{item.title}</p>
            <p className="mt-4 text-muted text-base">{item.description}</p>
          </div>
        ))}
      </section>

      {/* Today's Matches + AI Insights */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] mb-16">
        <Card className="space-y-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-label">{strings.home.todayMatchesLabel}</p>
              <h2 className="mt-2 text-2xl font-bold text-primary">{strings.home.todayMatchesTitle}</h2>
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
                className="match-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="section-label">{match.league}</p>
                    <p className="mt-1 text-sm font-semibold text-muted">{formatDateTime(match.kickOff)}</p>
                  </div>
                  <Badge variant={match.aiPrediction.riskRating === 'High' ? 'danger' : match.aiPrediction.riskRating === 'Medium' ? 'warning' : 'success'}>
                    {strings.home.matchRiskTemplate.replace('{risk}', match.aiPrediction.riskRating)}
                  </Badge>
                </div>
                
                <div className="match-teams">
                  <div className="team-info">
                    <p className="team-name">{match.homeTeam.short}</p>
                  </div>
                  <div className="match-score">
                    <span className="score">{match.homeScore ?? '-'}</span>
                    <span className="text-muted">:</span>
                    <span className="score">{match.awayScore ?? '-'}</span>
                  </div>
                  <div className="team-info">
                    <p className="team-name">{match.awayTeam.short}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-dark text-xs">
                  <span className="text-muted">{`Prediction: Home ${Math.round(match.aiPrediction.home * 100)}% / Draw ${Math.round(match.aiPrediction.draw * 100)}% / Away ${Math.round(match.aiPrediction.away * 100)}%`}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* AI Insights Sidebar */}
        <Card className="space-y-6 rounded-lg">
          <div>
            <p className="section-label">{strings.home.aiInsightsLabel}</p>
            <h2 className="mt-2 text-2xl font-bold text-primary">{strings.home.aiInsightsTitle}</h2>
          </div>

          <div className="grid gap-4">
            {recommendations.map((item) => (
              <div key={item.title} className="prediction-block">
                <div className="flex items-center justify-between mb-2">
                  <p className="section-label text-xs">{item.label}</p>
                  <Badge variant={item.label === 'Upset Alert' ? 'danger' : item.label === 'High Odds' ? 'warning' : 'success'}>
                    {item.label}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.note}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted">
                  <span>{`Odds ${item.odds}`}</span>
                  <span className="font-semibold text-primary">{`${Math.round(item.confidence * 100)}%`}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* World Cup Section */}
      <section className="grid gap-6 lg:grid-cols-[0.9fr_0.7fr] mb-16">
        <Card className="space-y-6 rounded-lg">
          <div>
            <p className="section-label">{strings.home.worldcupPanelLabel}</p>
            <h2 className="mt-2 text-2xl font-bold text-primary">{strings.home.worldcupPanelTitle}</h2>
          </div>

          <div className="grid gap-4">
            {liveWorldCupMatches.map((item) => (
              <div key={item.id} className="card p-5 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="section-label text-xs">{item.stage}</span>
                  <span className="badge text-xs">{item.status}</span>
                </div>
                <div className="match-teams">
                  <div className="team-info">
                    <p className="team-name">{item.home}</p>
                  </div>
                  <div className="match-score">
                    <span className="score">{item.score || item.time}</span>
                  </div>
                  <div className="team-info">
                    <p className="team-name">{item.away}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Standings Table */}
        <Card className="space-y-4 rounded-lg">
          <div>
            <p className="section-label">{strings.home.standingsPanelLabel}</p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-neutral-dark">
            <table className="w-full text-sm">
              <thead className="bg-surface-dark border-b border-neutral-dark">
                <tr>
                  <th className="px-3 py-2 text-left section-label text-xs">Team</th>
                  <th className="px-3 py-2 text-center section-label text-xs">P</th>
                  <th className="px-3 py-2 text-center section-label text-xs">W</th>
                  <th className="px-3 py-2 text-center section-label text-xs">Pts</th>
                </tr>
              </thead>
              <tbody>
                {liveWorldCupStandings.map((standing) => (
                  <tr key={`${standing.group}-${standing.team}`} className="border-b border-neutral-dark hover:bg-surface">
                    <td className="px-3 py-2 font-semibold text-primary">{standing.team}</td>
                    <td className="px-3 py-2 text-center text-muted">{standing.played}</td>
                    <td className="px-3 py-2 text-center text-muted">{standing.win}</td>
                    <td className="px-3 py-2 text-center font-bold text-primary">{standing.win * 3 + standing.draw}</td>
                    <td className="px-3 py-2 font-semibold text-primary">{standing.team}</td>
                    <td className="px-3 py-2 text-center text-muted">{standing.played}</td>
                    <td className="px-3 py-2 text-center text-muted">{standing.win}</td>
                    <td className="px-3 py-2 text-center font-bold text-primary">{standing.win * 3 + standing.draw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Parlay Section */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] mb-24">
        <Card className="space-y-6 rounded-lg">
          <div>
            <p className="section-label">{strings.home.parlayLabel}</p>
            <h2 className="mt-2 text-2xl font-bold text-primary">{strings.home.parlayTitle}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="data-block rounded-lg">
              <p className="section-label text-xs">{strings.home.parlayCard1Title}</p>
              <p className="mt-3 text-2xl font-bold text-primary">{strings.home.parlayCard1Detail}</p>
            </div>
            <div className="data-block rounded-lg">
              <p className="section-label text-xs">{strings.home.parlayCard2Title}</p>
              <p className="mt-3 text-2xl font-bold text-primary">{strings.home.parlayCard2Detail}</p>
            </div>
            <div className="data-block rounded-lg">
              <p className="section-label text-xs">{strings.home.parlayCard3Title}</p>
              <p className="mt-3 text-2xl font-bold text-primary">{strings.home.parlayCard3Detail}</p>
            </div>
          </div>
          <Button href="/jingcai" className="btn-primary w-full py-2 rounded-lg">{strings.home.parlayButton}</Button>
        </Card>

        <Card className="space-y-6 rounded-lg">
          <div className="space-y-4">
            <p className="section-label">{strings.home.parlayLabel}</p>
            <h3 className="text-xl font-bold text-primary">{parlayOutcome.title}</h3>
            <p className="text-muted">{strings.home.parlayOutcomeTitle}: {parlayOutcome.changedOdds}</p>
          </div>
          <div className="grid gap-3">
            <div className="data-block-primary rounded-lg p-5">
              <p className="section-label text-xs">{strings.home.parlayOutcomeDetail}</p>
              <p className="mt-3 text-3xl font-bold text-primary">{Math.round(parlayOutcome.winProbability * 100)}%</p>
            </div>
            <div className="data-block rounded-lg p-5">
              <p className="section-label text-xs">{strings.home.parlayCard3Title}</p>
              <p className="mt-2 text-2xl font-bold text-primary">{parlayOutcome.riskTier}</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
