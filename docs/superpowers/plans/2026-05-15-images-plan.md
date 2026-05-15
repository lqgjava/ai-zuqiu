# Images Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add legitimate, copyright-safe images (Unsplash backgrounds, API-Football team badges, FlagCDN flags, SVG logo) to enhance the visual experience of the football AI platform.

**Architecture:** Create a reusable `TeamBadge` component with CDN-primary + CSS-fallback rendering, then wire it into 7 pages. Add Unsplash background images to hero and page banners via CSS. Replace emoji with SVG icons for branding and FlagCDN for country flags.

**Tech Stack:** Next.js 15, `next/Image`, Tailwind CSS, Unsplash (free CDN), FlagCDN, SVG

---

## Files Map

| File | Action | Purpose |
|------|--------|---------|
| `components/ui/team-badge.tsx` | Create | Reusable team badge component (CDN + fallback) |
| `public/favicon.svg` | Create | SVG favicon |
| `public/logo.svg` | Create | SVG app logo for navbar |
| `lib/flags.ts` | Create | Country name → ISO code mapping + FlagCDN URL builder |
| `app/globals.css` | Modify | Hero background image, league banner styles |
| `app/layout.tsx` | Modify | Favicon path, OG image metadata |
| `components/navbar.tsx` | Modify | Replace ⚽ with logo SVG |
| `components/user-menu.tsx` | Modify | Gradient avatar style |
| `app/page.tsx` | Modify | Hero bg style, team badges in match cards |
| `app/jingcai/page.tsx` | Modify | Team badges in match cards, header banner |
| `app/worldcup/page.tsx` | Modify | Team badges in match cards, header banner |
| `app/leagues/page.tsx` | Modify | Team badges, league selector flags, league banner |
| `app/match/[id]/page.tsx` | Modify | Team badges in header, stadium photo bg |
| `app/parlay/page.tsx` | Modify | Team badges in match selection |
| `app/favorites/page.tsx` | Modify | Team badges in favorites list |
| `lib/sampleData.ts` | Modify | Improve empty badgeUrl placeholders |

---

### Task 1: Create TeamBadge component

**Files:**
- Create: `components/ui/team-badge.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

const GRADIENTS = [
  'from-blue-600 to-blue-400',
  'from-red-600 to-red-400',
  'from-emerald-600 to-emerald-400',
  'from-amber-500 to-orange-500',
  'from-purple-600 to-purple-400',
  'from-rose-600 to-rose-400',
  'from-cyan-600 to-cyan-400',
  'from-indigo-600 to-indigo-400',
];

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface TeamBadgeProps {
  name: string;
  badgeUrl?: string | null;
  size?: number;
}

export function TeamBadge({ name, badgeUrl, size = 48 }: TeamBadgeProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = badgeUrl && !imgError;
  const gradient = GRADIENTS[hashString(name) % GRADIENTS.length];
  const initial = name.charAt(0);

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center rounded-full bg-white shadow-lg overflow-hidden"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={badgeUrl}
          alt={name}
          width={size}
          height={size}
          className="object-contain p-[2px]"
          onError={() => setImgError(true)}
          unoptimized
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="text-white font-bold select-none" style={{ fontSize: size * 0.42 }}>
            {initial}
          </span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify the file exists**

Run: `ls -la components/ui/team-badge.tsx`

---

### Task 2: Create favicon and logo SVGs

**Files:**
- Create: `public/favicon.svg`
- Create: `public/logo.svg`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1F4FA1"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#bg)"/>
  <text x="16" y="22" text-anchor="middle" font-size="18">⚽</text>
</svg>
```

- [ ] **Step 2: Create logo.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
  <defs>
    <linearGradient id="lbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1F4FA1"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
  </defs>
  <rect width="28" height="28" rx="6" fill="url(#lbg)"/>
  <text x="14" y="20" text-anchor="middle" font-size="16">⚽</text>
</svg>
```

- [ ] **Step 3: Update layout.tsx favicon path**

In `app/layout.tsx`, change `icon: '/favicon.ico'` to `icon: '/favicon.svg'` and add OG image:

```tsx
icons: {
  icon: '/favicon.svg',
},
openGraph: {
  // ... existing fields
  images: [{ url: '/og-image.png', width: 1200, height: 630 }],
},
twitter: {
  // ... existing fields
  images: ['/og-image.png'],
},
```

---

### Task 3: Add hero background image

**Files:**
- Modify: `app/globals.css`
- Modify: `app/page.tsx`

- [ ] **Step 1: Add hero background CSS**

In `app/globals.css`, replace the `.bg-football-hero` rule:

```css
.bg-football-hero {
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.85) 100%),
    url('https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=1400&q=80') center/cover no-repeat;
}
```

- [ ] **Step 2: Verify hero renders background**

Run: `npm run dev`, open browser, check homepage hero section shows stadium background.

---

### Task 4: Replace navbar emoji with SVG logo

**Files:**
- Modify: `components/navbar.tsx`

- [ ] **Step 1: Update navbar logo**

In `components/navbar.tsx` line 19, replace:
```tsx
<span className="text-2xl">⚽</span>
```
with:
```tsx
<img src="/logo.svg" alt="" width={28} height={28} className="w-7 h-7" />
```

---

### Task 5: Add team badges to home page match cards

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add import**

At top of `app/page.tsx`, add:
```tsx
import { TeamBadge } from '@/components/ui/team-badge';
```

- [ ] **Step 2: Add badges to main match cards (lines 159-171)**

Replace the `match-teams` div content (lines 159-171):
```tsx
<div className="match-teams">
  <div className="team-info">
    <TeamBadge name={match.homeTeam.short} badgeUrl={match.homeTeam.badgeUrl} size={44} />
    <p className="team-name text-lg mt-2">{match.homeTeam.short}</p>
  </div>
  <div className="match-score">
    <span className="score">{match.homeScore ?? '-'}</span>
    <span className="text-slate-600 text-xl">:</span>
    <span className="score">{match.awayScore ?? '-'}</span>
  </div>
  <div className="team-info">
    <TeamBadge name={match.awayTeam.short} badgeUrl={match.awayTeam.badgeUrl} size={44} />
    <p className="team-name text-lg mt-2">{match.awayTeam.short}</p>
  </div>
</div>
```

- [ ] **Step 3: Add badges to World Cup match cards (lines 237-245)**

Replace the `match-teams` div for World Cup matches:
```tsx
<div className="match-teams">
  <div className="team-info">
    <TeamBadge name={item.home} size={40} />
    <p className="team-name">{item.home}</p>
  </div>
  <div className="match-score">
    <span className={`score ${item.status === 'LIVE' ? 'text-emerald-400' : ''}`}>{item.score || item.time}</span>
  </div>
  <div className="team-info">
    <TeamBadge name={item.away} size={40} />
    <p className="team-name">{item.away}</p>
  </div>
</div>
```

---

### Task 6: Add team badges to jingcai page

**Files:**
- Modify: `app/jingcai/page.tsx`

- [ ] **Step 1: Add import and render badges in match cards**

Add import:
```tsx
import { TeamBadge } from '@/components/ui/team-badge';
```

Find the match card rendering section and add `TeamBadge` alongside each team name, using `match.homeTeam.badgeUrl` and `match.awayTeam.badgeUrl`.

---

### Task 7: Add team badges to worldcup page

**Files:**
- Modify: `app/worldcup/page.tsx`

- [ ] **Step 1: Add import and render badges**

Add import:
```tsx
import { TeamBadge } from '@/components/ui/team-badge';
```

In the match list rendering, add badges alongside team names.

---

### Task 8: Add team badges to leagues page

**Files:**
- Modify: `app/leagues/page.tsx`

- [ ] **Step 1: Add import**

```tsx
import { TeamBadge } from '@/components/ui/team-badge';
```

- [ ] **Step 2: Add badges to match cards**

In the match rendering section (around line 206-246), add `TeamBadge` with `match.teams.home.logo` and `match.teams.away.logo` for real API data.

- [ ] **Step 3: Replace standings logo img with TeamBadge**

Replace the `<img>` tag at line 280-281:
```tsx
<TeamBadge name={standing.team.name} badgeUrl={standing.team.logo} size={20} />
```

---

### Task 9: Add team badges to match detail page

**Files:**
- Modify: `app/match/[id]/page.tsx`

- [ ] **Step 1: Add import and badges to header**

```tsx
import { TeamBadge } from '@/components/ui/team-badge';
```

In the header section, wrap the team names with `TeamBadge` using `homeTeam.badgeUrl` and `awayTeam.badgeUrl`.

---

### Task 10: Add team badges to parlay page

**Files:**
- Modify: `app/parlay/page.tsx`

- [ ] **Step 1: Add import and badges to match selection**

```tsx
import { TeamBadge } from '@/components/ui/team-badge';
```

In match selection list, add `TeamBadge` components alongside match team names.

---

### Task 11: Add team badges to favorites page

**Files:**
- Modify: `app/favorites/page.tsx`

- [ ] **Step 1: Add import and badges to favorites list**

```tsx
import { TeamBadge } from '@/components/ui/team-badge';
```

In the favorites match list, add `TeamBadge` components.

---

### Task 12: Create flag utility and apply to leagues

**Files:**
- Create: `lib/flags.ts`
- Modify: `app/leagues/page.tsx`

- [ ] **Step 1: Create flag utility**

```ts
const COUNTRY_TO_ISO: Record<string, string> = {
  England: 'gb', 'Great Britain': 'gb', Brazil: 'br', France: 'fr',
  Spain: 'es', Italy: 'it', Germany: 'de', Portugal: 'pt',
  Netherlands: 'nl', Argentina: 'ar', Belgium: 'be', Croatia: 'hr',
  Denmark: 'dk', Sweden: 'se', Norway: 'no', Finland: 'fi',
  Poland: 'pl', Switzerland: 'ch', Austria: 'at', Greece: 'gr',
  Turkey: 'tr', Russia: 'ru', Ukraine: 'ua', Czech: 'cz',
  Scotland: 'gb-sct', Wales: 'gb-wls', 'Saudi Arabia': 'sa',
  Saudi: 'sa', China: 'cn', Japan: 'jp', 'South Korea': 'kr',
  Australia: 'au', 'United States': 'us', Mexico: 'mx', Canada: 'ca',
  Egypt: 'eg', Morocco: 'ma', Senegal: 'sn', Nigeria: 'ng',
  Ghana: 'gh', Cameroon: 'cm', 'Ivory Coast': 'ci', Tunisia: 'tn',
  Serbia: 'rs', Hungary: 'hu', Romania: 'ro', Bulgaria: 'bg',
  Slovakia: 'sk', Slovenia: 'si', Ireland: 'ie',
};

export function getFlagUrl(country: string, width = 40): string {
  const code = COUNTRY_TO_ISO[country];
  if (!code) return '';
  return `https://flagcdn.com/w${width}/${code}.png`;
}
```

- [ ] **Step 2: Use FlagCDN in leagues page**

In `app/leagues/page.tsx`, add import and replace emoji `{league.icon}` with flag images:
```tsx
import { getFlagUrl } from '@/lib/flags';

// In the league selector button (line 181):
<img
  src={getFlagUrl(league.country, 80)}
  alt={league.country}
  width={40}
  height={30}
  className="rounded-sm shadow-sm"
/>
```

---

### Task 13: Add league banner with Unsplash photo

**Files:**
- Modify: `app/leagues/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add league banner CSS class**

In `app/globals.css`:
```css
.bg-league-banner {
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%),
    url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80') center/cover no-repeat;
}
```

- [ ] **Step 2: Apply banner to leagues page header**

Wrap the leagues page header in a div with the `bg-league-banner` class and rounded corners.

---

### Task 14: Add page header banners for worldcup, jingcai, parlay

**Files:**
- Modify: `app/globals.css`
- Modify: `app/worldcup/page.tsx`
- Modify: `app/jingcai/page.tsx`
- Modify: `app/parlay/page.tsx`

- [ ] **Step 1: Add banner CSS classes**

In `app/globals.css`:
```css
.bg-worldcup-banner {
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%),
    url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80') center/cover no-repeat;
}

.bg-jingcai-banner {
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.92) 100%),
    url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80') center/cover no-repeat;
}

.bg-parlay-banner {
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%),
    url('https://images.unsplash.com/photo-1551958219-acbc608e6377?w=1200&q=80') center/cover no-repeat;
}
```

- [ ] **Step 2: Apply banner classes to each page's header section**

Add the respective CSS class to the header `<section>` of worldcup, jingcai, and parlay pages.

---

### Task 15: Add stadium photo to match detail page

**Files:**
- Modify: `app/match/[id]/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add stadium banner CSS**

In `app/globals.css`:
```css
.bg-stadium-banner {
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.95) 100%),
    url('https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80') center/cover no-repeat;
}
```

- [ ] **Step 2: Apply to match detail header**

In `app/match/[id]/page.tsx`, add the CSS class to the header section.

---

### Task 16: Upgrade user avatar style

**Files:**
- Modify: `components/user-menu.tsx`

- [ ] **Step 1: Update avatar to gradient style**

Replace the avatar div at line 41-43:
```tsx
<div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs font-bold shadow-sm">
  {(user.email?.[0] || 'U').toUpperCase()}
</div>
```

---

### Task 17: Verify all pages render correctly

- [ ] **Step 1: Run dev server and check all pages**

Run: `npm run dev`

Check each page at:
- http://localhost:3000/ (hero bg + team badges)
- http://localhost:3000/jingcai (team badges + header banner)
- http://localhost:3000/worldcup (team badges + header banner)
- http://localhost:3000/leagues (flags + team badges + league banner)
- http://localhost:3000/parlay (team badges + header banner)
- http://localhost:3000/match/match-001 (team badges + stadium photo)
- http://localhost:3000/favorites (team badges)

- [ ] **Step 2: Verify image fallback works**

Set `badgeUrl` to empty string on one match card to confirm fallback renders colored circle with initial letter.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add images across all pages — hero background, team badges, page banners, favicon, flags"
```
