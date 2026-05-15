import { allMatches } from '@/lib/sampleData';

function buildUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qiuzhi-ai.vercel.app';
  return `${baseUrl}${path}`;
}

export default function sitemap() {
  const staticPaths = [
    '/',
    '/jingcai',
    '/leagues',
    '/parlay',
    '/worldcup',
    '/pricing',
    '/login',
    '/register',
    '/account',
  ];

  const staticEntries = staticPaths.map((loc) => ({
    url: buildUrl(loc),
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: loc === '/' ? 1.0 : 0.8,
  }));

  const dynamicEntries = allMatches.map((match) => ({
    url: buildUrl(`/match/${match.id}`),
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...dynamicEntries];
}
