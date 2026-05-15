'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { signInWithOtp } = useAuth();

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
      setMessage('请输入邮箱地址以继续。');
      setStatus('error');
      return;
    }

    try {
      await signInWithOtp(email);
      setMessage('邮件已发送，请前往邮箱完成登录。');
      setStatus('success');
      setEmail('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '登录失败，请稍后重试';
      setMessage(errorMsg);
      setStatus('error');
    }
  }

  return (
    <main className="main-container py-16">
      <Card className="mx-auto max-w-2xl p-10">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">用户登录</p>
          <h1 className="text-4xl font-semibold text-white">访问球智 AI 会员功能</h1>
          <p className="text-slate-300">使用电子邮箱登录后，可保存串关组合、同步个人偏好和实时AI分析报告。</p>
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
            {status === 'loading' ? '发送中...' : '发送登录链接'}
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
            <span>还没有账户？</span>
            <Link href="/register" className="text-primary hover:underline">
              立即注册
            </Link>
          </div>
        </form>
      </Card>
    </main>
  );
}
