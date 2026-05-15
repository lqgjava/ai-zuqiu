'use client';

import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { OddsPoint } from '@/types';

interface MatchOddsChartProps {
  oddsHistory: OddsPoint[];
}

export function MatchOddsChart({ oddsHistory }: MatchOddsChartProps) {
  if (!oddsHistory || oddsHistory.length === 0) {
    return (
      <div className="h-[340px] flex items-center justify-center text-slate-400">
        暂无赔率历史数据
      </div>
    );
  }

  const chartData = oddsHistory.map((item) => ({ ...item }));

  return (
    <div className="h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 16, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}
            labelStyle={{ color: '#f8fafc' }}
            itemStyle={{ color: '#7c3aed' }}
          />
          <Area type="monotone" dataKey="home" stroke="#6b72ff" fill="rgba(107,114,255,0.2)" strokeWidth={3} name="主胜赔率" />
          <Area type="monotone" dataKey="draw" stroke="#22d3ee" fill="rgba(34,211,238,0.15)" strokeWidth={2} name="平局赔率" />
          <Area type="monotone" dataKey="away" stroke="#f472b6" fill="rgba(244,114,182,0.15)" strokeWidth={2} name="客胜赔率" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
