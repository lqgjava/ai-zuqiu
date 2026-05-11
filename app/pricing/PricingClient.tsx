'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

const plans = [
  {
    id: 'free',
    name: '免费版',
    price: 0,
    period: '永久',
    description: '基础 AI 赛事洞察',
    features: [
      '每日 3 场 AI 预测',
      '基础赔率分析',
      '串关建议（每周 1 次）',
      '世界杯赛程查询',
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: '专业版',
    price: 29,
    period: '每月',
    description: '进阶 AI 分析工具',
    features: [
      '每日不限场次 AI 预测',
      '实时赔率波动分析',
      '智能串关优化',
      '历史数据回测',
      '竞彩足球专项预测',
      '优先客服支持',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: '尊贵版',
    price: 99,
    period: '每月',
    description: '专业级 AI 预测服务',
    features: [
      '所有专业版功能',
      'VIP 专家预测解读',
      '定制化分析报告',
      '实时比赛数据推送',
      '专属分析师咨询',
      '数据导出功能',
    ],
    popular: false,
  },
];

export default function PricingClient() {
  const { user } = useAuth();
  const { subscription, planName } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    if (success) {
      alert('支付成功！您的套餐已升级。');
    } else if (canceled) {
      alert('支付已取消。如需升级，请重新选择套餐。');
    }
  }, [success, canceled]);

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (subscription?.plan_id === planId) {
      alert('您已经是这个套餐了');
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.id,
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('升级失败:', error);
      alert('升级失败，请稍后重试');
    } finally {
      setLoading(null);
    }
  };

  const getButtonText = (planId: string) => {
    if (loading === planId) return '处理中...';
    if (subscription?.plan_id === planId) return '当前使用';
    if (planId === 'free') return '免费使用';
    return '立即升级';
  };

  const isCurrentPlan = (planId: string) => subscription?.plan_id === planId;

  return (
    <main className="main-container py-16">
      {/* Header Section */}
      <div className="text-center mb-16">
        <p className="badge inline-flex mb-4">订阅套餐</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">{`球智 AI 预测服务`}</h1>
        <p className="mt-4 text-muted max-w-2xl mx-auto text-lg">
          选择适合您的套餐，享受专业级的足球 AI 分析和实时数据服务。
        </p>
        {user && (
          <div className="mt-6 bg-surface rounded-lg p-4 inline-block">
            <p className="text-sm text-muted">当前订阅：<span className="font-bold text-primary">{planName}</span></p>
            {subscription && (
              <p className="text-xs text-muted mt-1">
                到期时间：{subscription.current_period_end.toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative rounded-lg overflow-hidden transition-all hover:shadow-card-hover ${plan.popular ? 'border-primary border-2 shadow-card-hover' : 'border border-neutral-dark'}`}>
            {plan.popular && (
              <div className="bg-primary text-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-center">
                ⭐ 最受欢迎
              </div>
            )}

            <div className="p-8">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-primary mb-4">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-primary">¥{plan.price}</span>
                  <span className="text-muted ml-2">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted font-medium">{plan.description}</p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5"></div>
                    <span className="text-sm text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular 
                    ? 'btn-primary' 
                    : isCurrentPlan(plan.id) 
                    ? 'btn-secondary' 
                    : 'btn-primary'
                }`}
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id || isCurrentPlan(plan.id)}
              >
                {getButtonText(plan.id)}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-primary mb-12">常见问题</h2>
        <div className="grid gap-6 max-w-4xl mx-auto lg:grid-cols-2">
          {[
            {
              q: '如何取消订阅？',
              a: '您可以在账户设置中随时取消订阅，取消后仍可使用至当前计费周期结束。'
            },
            {
              q: '支持哪些支付方式？',
              a: '目前支持支付宝、微信支付和银行卡支付，确保安全便捷的交易体验。'
            },
            {
              q: '有试用期吗？',
              a: '专业版和尊贵版提供 7 天免费试用，您可以先体验后再决定是否订阅。'
            },
            {
              q: '数据是实时的吗？',
              a: '是的，所有高级套餐都包含实时数据更新，确保您获得最新的比赛信息和 AI 预测。'
            }
          ].map((faq, index) => (
            <Card key={index} className="card rounded-lg p-6 text-left hover:shadow-card-hover">
              <p className="font-bold text-primary text-sm mb-2">Q：{faq.q}</p>
              <p className="text-muted text-sm">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
