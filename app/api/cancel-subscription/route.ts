import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe 未配置，请设置 STRIPE_SECRET_KEY' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: '缺少订阅ID' }, { status: 400 });
    }

    // 取消Stripe订阅
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // 更新数据库状态
    if (supabase) {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date(),
        })
        .eq('stripe_subscription_id', subscriptionId);

      if (error) {
        console.error('更新订阅状态失败:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('取消订阅失败:', error);
    return NextResponse.json(
      { error: '取消订阅失败' },
      { status: 500 }
    );
  }
}