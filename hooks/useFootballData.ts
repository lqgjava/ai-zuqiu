'use client';

import { useEffect, useState } from 'react';
import type { MatchEvent, Standing } from '@/types';

export function useLiveMatches(initialMatches: MatchEvent[]) {
  const [matches, setMatches] = useState<MatchEvent[]>(initialMatches);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'official' | 'fallback'>('fallback');

  useEffect(() => {
    let active = true;

    async function loadMatches() {
      try {
        const response = await fetch('/api/football?type=live');
        const data = await response.json();
        if (active && data.matches) {
          setMatches(data.matches);
          setSource('official');
        }
      } catch (err) {
        setError('无法获取实时比赛，已使用备用数据。');
        setSource('fallback');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMatches();
    return () => {
      active = false;
    };
  }, []);

  return { matches, loading, error, source };
}

export function useWorldCupData<T extends Record<string, any>>(initialMatches: T[], initialStandings: Standing[]) {
  const [matches, setMatches] = useState<T[]>(initialMatches);
  const [standings, setStandings] = useState<Standing[]>(initialStandings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'official' | 'fallback'>('fallback');

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const response = await fetch('/api/football?type=worldcup');
        const data = await response.json();
        if (active) {
          if (data.matches) setMatches(data.matches);
          if (data.standings) setStandings(data.standings);
          setSource('official');
        }
      } catch (err) {
        setError('无法获取世界杯实时数据，已使用备用数据。');
        setSource('fallback');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  return { matches, standings, loading, error, source };
}

export function useJingcaiData(initialMatches: MatchEvent[]) {
  const [matches, setMatches] = useState<MatchEvent[]>(initialMatches);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'official' | 'fallback'>('fallback');

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval>;

    async function loadJingcai() {
      try {
        const response = await fetch('/api/football?type=jingcai');
        const data = await response.json();
        if (active && data.matches) {
          setMatches(data.matches);
          setSource('official');
        }
      } catch (err) {
        setError('无法获取竞彩实时数据，已使用备用数据。');
        setSource('fallback');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadJingcai();
    intervalId = setInterval(loadJingcai, 60_000); // 每分钟刷新竞彩数据

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  return { matches, loading, error, source };
}
