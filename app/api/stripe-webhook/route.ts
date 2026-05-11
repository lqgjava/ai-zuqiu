import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Stripe Webhook 未配置，请设置 STRIPE_SECRET_KEY 和 STRIPE_WEBHOOK_SECRET' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // 处理不同的事件类型
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook处理失败:', error);
    return NextResponse.json({ error: 'Webhook处理失败' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id!;
  const planId = session.metadata?.planId!;

  if (!supabase) {
    console.error('Supabase未配置');
    return;
  }

  // 更新用户订阅状态
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_id: planId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      status: 'active',
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
      updated_at: new Date(),
    });

  if (error) {
    console.error('更新用户订阅失败:', error);
  } else {
    console.log(`用户 ${userId} 成功升级到 ${planId} 套餐`);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!supabase) return;

  // 从invoice的subscription字段获取订阅ID
  const subscriptionId = (invoice as any).subscription;

  if (!subscriptionId) return;

  // 更新订阅的到期时间
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      current_period_end: new Date(invoice.lines.data[0].period.end * 1000),
      updated_at: new Date(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('更新订阅到期时间失败:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  if (!supabase) return;

  // 将订阅状态改为取消
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('取消订阅失败:', error);
  }
}