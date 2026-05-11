import { Suspense } from 'react';
import PricingClient from './PricingClient';

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="main-container py-16 text-center text-white">加载中...</div>}>
      <PricingClient />
    </Suspense>
  );
}
