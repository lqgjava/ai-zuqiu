import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const plans = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    name: '专业版',
    price: 29,
  },
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    name: '尊贵版',
    price: 99,
  },
};

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe 未配置，请设置 STRIPE_SECRET_KEY' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const { planId, userId } = await request.json();

  if (!plans[planId as keyof typeof plans]) {
    return NextResponse.json({ error: '无效的套餐ID' }, { status: 400 });
  }

  const plan = plans[planId as keyof typeof plans];
  if (!plan.priceId) {
    return NextResponse.json(
      { error: 'Stripe 价格ID 未配置' },
      { status: 500 }
    );
  }

  // 创建Stripe checkout session
  const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'alipay', 'wechat_pay'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
      client_reference_id: userId,
      metadata: {
        planId,
        userId,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('创建checkout session失败:', error);
    return NextResponse.json(
      { error: '创建支付会话失败' },
      { status: 500 }
    );
  }
}