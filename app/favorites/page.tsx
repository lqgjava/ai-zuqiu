'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { allMatches } from '@/lib/sampleData';
import type { MatchEvent } from '@/types';
import { TeamBadge } from '@/components/ui/team-badge';

const STORAGE_KEY = 'qiuzhi-ai-favorites';

function loadFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteMatches, setFavoriteMatches] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = loadFavorites();
    setFavoriteIds(ids);
    setFavoriteMatches(allMatches.filter((m) => ids.includes(m.id)));
    setLoading(false);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    const next = favoriteIds.filter((fid) => fid !== id);
    setFavoriteIds(next);
    setFavoriteMatches((prev) => prev.filter((m) => m.id !== id));
    saveFavorites(next);
  }, [favoriteIds]);

  if (!user) {
    return (
      <main className="main-container py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">请先登录</h1>
          <p className="text-slate-300 mb-6">登录后可查看您的收藏比赛</p>
          <Button href="/login">登录</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="main-container py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">我的收藏</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">收藏的比赛</h1>
          <p className="mt-2 text-slate-300">查看您关注的比赛和 AI 预测</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">加载中...</p>
          </div>
        ) : favoriteMatches.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-6xl mb-4">⭐</p>
            <h2 className="text-xl font-semibold text-white mb-2">暂无收藏</h2>
            <p className="text-slate-300 mb-6">浏览比赛后将它们添加到收藏，随时关注 AI 预测变化。</p>
            <Button href="/">浏览比赛</Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {favoriteMatches.map((match) => (
              <Card key={match.id} className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-slate-400">{match.league}</span>
                      <Badge variant={match.aiPrediction.riskRating === 'High' ? 'danger' : match.aiPrediction.riskRating === 'Medium' ? 'warning' : 'success'}>
                        {match.aiPrediction.riskRating}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <TeamBadge name={match.homeTeam.short} badgeUrl={match.homeTeam.badgeUrl} size={36} />
                      <p className="text-lg font-semibold text-white">
                        {match.homeTeam.short} vs {match.awayTeam.short}
                      </p>
                      <TeamBadge name={match.awayTeam.short} badgeUrl={match.awayTeam.badgeUrl} size={36} />
                    </div>
                    <p className="mt-1 text-sm text-slate-300">
                      {new Date(match.kickOff).toLocaleDateString()} · {match.stage}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
                      <span>主胜 {Math.round(match.aiPrediction.home * 100)}%</span>
                      <span>平 {Math.round(match.aiPrediction.draw * 100)}%</span>
                      <span>客胜 {Math.round(match.aiPrediction.away * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/match/${match.id}`}>
                      <Button variant="secondary">查看详情</Button>
                    </Link>
                    <Button variant="ghost" onClick={() => removeFavorite(match.id)}>
                      移除
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
