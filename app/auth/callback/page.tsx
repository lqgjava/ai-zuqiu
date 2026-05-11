'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { session, loading, error } = useAuth();
  const [statusMessage, setStatusMessage] = useState('验证中...');

  useEffect(() => {
    if (!loading) {
      if (session?.user) {
        setStatusMessage('登录成功！正在跳转...');
        // 延迟 1 秒后跳转到主页
        const timer = setTimeout(() => {
          router.push('/');
        }, 1000);
        return () => clearTimeout(timer);
      }

      if (error) {
        setStatusMessage(`验证失败：${error}`);
      } else {
        setStatusMessage('验证已完成，但未获得会话。请重新尝试。');
      }
    }
  }, [session, loading, error, router]);

  return (
    <main className="main-container py-16">
      <Card className="mx-auto max-w-md p-10 text-center space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">邮箱验证</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">验证中</h1>
        </div>

        <div className="flex justify-center">
          {loading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          )}
        </div>

        <p className="text-slate-300">{statusMessage}</p>
      </Card>
    </main>
  );
}
