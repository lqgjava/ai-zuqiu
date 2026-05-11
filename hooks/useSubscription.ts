'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: Date;
  current_period_end: Date;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    async function fetchSubscription() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const currentUser = user;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userId = currentUser.id;
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (active) {
          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('获取订阅信息失败:', error);
          } else if (data) {
            setSubscription({
              ...data,
              current_period_start: new Date(data.current_period_start),
              current_period_end: new Date(data.current_period_end),
            });
          } else {
            setSubscription(null);
          }
        }
      } catch (err) {
        console.error('获取订阅信息失败:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchSubscription();

    return () => {
      active = false;
    };
  }, [user]);

  const isPro = subscription?.plan_id === 'pro' || subscription?.plan_id === 'premium';
  const isPremium = subscription?.plan_id === 'premium';

  return {
    subscription,
    loading,
    isPro,
    isPremium,
    planName: subscription?.plan_id === 'pro' ? '专业版' :
             subscription?.plan_id === 'premium' ? '尊贵版' : '免费版',
  };
}