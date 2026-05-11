import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NotFound() {
  return (
    <main className="main-container py-20">
      <Card className="text-center">
        <h1 className="text-4xl font-semibold text-white">页面未找到</h1>
        <p className="mt-4 text-slate-300">抱歉，我们无法找到你要访问的内容。</p>
        <Button className="mt-8" href="/">返回首页</Button>
      </Card>
    </main>
  );
}
