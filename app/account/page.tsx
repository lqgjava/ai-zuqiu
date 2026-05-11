'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const { subscription, planName, loading } = useSubscription();
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (!confirm('确定要取消订阅吗？取消后您仍可使用至当前计费周期结束。')) {
      return;
    }

    setCancelLoading(true);

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
        }),
      });

      if (response.ok) {
        alert('订阅已取消。您仍可使用至当前计费周期结束。');
        window.location.reload();
      } else {
        throw new Error('取消订阅失败');
      }
    } catch (error) {
      console.error('取消订阅失败:', error);
      alert('取消订阅失败，请稍后重试');
    } finally {
      setCancelLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="main-container py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">请先登录</h1>
          <p className="text-slate-300 mb-6">登录后即可查看账户信息</p>
          <Button href="/login">登录</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="main-container py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">账户设置</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">管理您的账户</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 账户信息 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">账户信息</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">邮箱地址</p>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">注册时间</p>
                <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">当前套餐</p>
                <div className="flex items-center gap-2">
                  <p className="text-white">{planName}</p>
                  {subscription && (
                    <Badge variant={subscription.status === 'active' ? 'success' : 'danger'}>
                      {subscription.status === 'active' ? '活跃' : '已取消'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" onClick={signOut}>
                退出登录
              </Button>
            </div>
          </Card>

          {/* 订阅管理 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">订阅管理</h2>
            {loading ? (
              <p className="text-slate-400">加载中...</p>
            ) : subscription ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">套餐详情</p>
                  <p className="text-white font-medium">{planName}</p>
                  <p className="text-sm text-slate-300">
                    {subscription.status === 'active' ? '下次续费' : '到期时间'}：
                    {subscription.current_period_end.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button href="/pricing" variant="secondary">
                    升级套餐
                  </Button>
                  {subscription.status === 'active' && (
                    <Button
                      variant="danger"
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? '取消中...' : '取消订阅'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-slate-300 mb-4">您当前使用的是免费版</p>
                <Button href="/pricing">升级到付费版</Button>
              </div>
            )}
          </Card>
        </div>

        {/* 使用统计 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">使用统计</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-sm text-slate-400">本月预测次数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">85%</p>
              <p className="text-sm text-slate-400">预测准确率</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-sm text-slate-400">串关组合</p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}