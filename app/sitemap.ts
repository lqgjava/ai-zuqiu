import { allMatches } from '@/lib/sampleData';

function buildUrl(path: string) {
  return `https://your-domain.com${path}`;
}

export default function sitemap() {
  const staticPaths = ['/', '/parlay', '/worldcup'];

  const dynamicPaths = allMatches.map((match) => ({
    url: buildUrl(`/match/${match.id}`),
    lastModified: new Date().toISOString(),
  }));

  return [...staticPaths.map((loc) => ({ url: buildUrl(loc) })), ...dynamicPaths];
}
