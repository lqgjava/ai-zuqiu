'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/components/language-provider';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { subscription, planName, loading: subLoading } = useSubscription();
  const { locale, setLocale, localeNames } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!supabase || !user) return;
    setSaving(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });
      if (error) throw error;
      setMessage('保存成功');
    } catch (err) {
      setMessage('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <main className="main-container py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">请先登录</h1>
          <p className="text-slate-300 mb-6">登录后可管理您的个人资料</p>
          <Button href="/login">登录</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="main-container py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">个人资料</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">管理您的账户</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">基本信息</h2>

            <div>
              <label className="text-sm font-medium text-slate-200">邮箱地址</label>
              <Input type="email" value={user.email || ''} disabled className="mt-2 opacity-60" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200">显示名称</label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="输入显示名称"
                className="mt-2"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存修改'}
              </Button>
              {message && (
                <span className={`text-sm ${message.includes('成功') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {message}
                </span>
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">偏好设置</h2>

            <div>
              <label className="text-sm font-medium text-slate-200">语言</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(['zh', 'en', 'es', 'fr', 'ja', 'ko'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocale(l)}
                    className={`rounded-xl px-3 py-2 text-sm transition ${
                      locale === l
                        ? 'bg-primary text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {localeNames[l]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200">主题</label>
              <div className="mt-2 flex gap-2">
                {['dark', 'light'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`rounded-xl px-4 py-2 text-sm transition ${
                      theme === t
                        ? 'bg-primary text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t === 'dark' ? '深色' : '浅色'}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">订阅状态</h2>
          {subLoading ? (
            <p className="text-slate-400">加载中...</p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Badge variant={subscription?.status === 'active' ? 'success' : 'warning'}>
                  {subscription?.status === 'active' ? '活跃' : planName}
                </Badge>
                <span className="text-white">{planName}</span>
              </div>
              {subscription && (
                <p className="text-sm text-slate-300">
                  {subscription.status === 'active' ? '下次续费' : '到期时间'}：
                  {subscription.current_period_end.toLocaleDateString()}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                {!subscription && <Button href="/pricing">升级套餐</Button>}
                {subscription && <Button href="/pricing" variant="secondary">管理套餐</Button>}
              </div>
            </>
          )}
        </Card>

        <Card className="p-6 space-y-4 border-red-500/20">
          <h2 className="text-xl font-semibold text-red-300">危险区域</h2>
          <p className="text-sm text-slate-300">删除账户后所有数据将被永久移除，此操作不可撤销。</p>
          <Button variant="danger" onClick={signOut}>
            退出登录
          </Button>
        </Card>
      </div>
    </main>
  );
}
