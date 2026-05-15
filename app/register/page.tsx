'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { signUp } = useAuth();

  const isSupabaseConfigured = supabase !== null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setStatus('loading');

    if (!isSupabaseConfigured) {
      setMessage('Supabase 未配置。请在 .env.local 中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。');
      setStatus('error');
      return;
    }

    if (!email) {
      setMessage('请输入邮箱地址。');
      setStatus('error');
      return;
    }

    try {
      await signUp(email);
      setMessage('注册链接已发送到您的邮箱，请检查收件箱完成注册。');
      setStatus('success');
      setEmail('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '注册失败，请稍后重试';
      setMessage(errorMsg);
      setStatus('error');
    }
  }

  return (
    <main className="main-container py-16">
      <Card className="mx-auto max-w-2xl p-10">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">新用户注册</p>
          <h1 className="text-4xl font-semibold text-white">创建球智 AI 账户</h1>
          <p className="text-slate-300">注册后可享受串关组合保存、个人偏好同步和实时 AI 分析报告等会员功能。</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300">
            <p className="font-semibold">Supabase 未配置</p>
            <p className="mt-1">
              请在项目根目录的 <code className="rounded bg-amber-500/10 px-1 py-0.5 text-xs">.env.local</code> 中设置
              NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY，
              然后重启开发服务器。
            </p>
          </div>
        )}

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-200">邮箱地址</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={status === 'loading'}
            />
          </div>

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? '发送中...' : '发送注册链接'}
          </Button>

          {message && (
            <p
              className={`text-sm ${
                status === 'success' ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {message}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-slate-400">
            <span>已有账户？</span>
            <Link href="/login" className="text-primary hover:underline">
              立即登录
            </Link>
          </div>
        </form>
      </Card>
    </main>
  );
}
