# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
npm run dev        # 启动开发服务器 (http://localhost:3000)
npm run build      # 生产构建
npm run start      # 启动生产服务器
npm run lint       # 运行 ESLint
```

数据库: Prisma + PostgreSQL。修改 `prisma/schema.prisma` 后运行 `npx prisma generate`（已配置 `postinstall` 自动执行）。

没有配置测试框架。

## 环境变量

完整列表见 `.env.example`：

| 变量 | 用途 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 客户端初始化 (`lib/supabaseClient.ts`) |
| `DATABASE_URL` | Prisma PostgreSQL 连接 |
| `API_FOOTBALL_KEY` | API-Football v3 (`x-apisports-key` header) |
| `FOOTBALL_DATA_KEY` | Football-Data.org v4 (`X-Auth-Token` header) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe 支付 |
| `STRIPE_PRO_PRICE_ID` / `STRIPE_PREMIUM_PRICE_ID` | Stripe 订阅套餐 Price ID |
| `NEXT_PUBLIC_SITE_URL` | Stripe checkout 重定向 URL（默认 `http://localhost:3000`） |
| `AI_API_KEY` / `AI_API_BASE_URL` / `AI_MODEL` | LLM 预测（默认 deepseek-chat） |
| `NEXTAUTH_SECRET` | **未使用** — 项目使用 Supabase Auth 而非 NextAuth |

## 架构概览

**路径别名**: `@/*` → 项目根目录

### 分层结构

| 目录 | 职责 |
|------|------|
| `app/` | Next.js 15 App Router — 页面和 API 路由 |
| `components/` | React 组件（UI 原语 `ui/`、providers、navbar、user-menu） |
| `hooks/` | 自定义 hooks（全部 `'use client'`）— `useAuth`、`useSubscription`、`useFootballData` |
| `lib/` | 工具函数、示例数据、i18n、Prisma/Supabase 客户端单例 |
| `services/` | 外部 API 集成、AI 分析（规则算法 + LLM） |
| `types/` | TypeScript 类型定义（`types/index.ts`） |
| `prisma/` | 数据库 schema — User, Team, Match, Odds, Prediction, Parlay, UserSubscription |

### 数据流

1. **页面** 使用 `hooks/useFootballData.ts` 中的 hooks（`useLiveMatches`、`useWorldCupData`、`useJingcaiData`）
2. **Hooks** 以示例数据初始化 state，然后调用 `/api/football?type=live|worldcup|jingcai` 获取实时数据
3. **API 路由** (`app/api/football/route.ts`) 委托给 `services/footballApi.ts`
4. **footballApi.ts** 调用外部 API（API-Football v3、Football-Data.org v4），**失败时优雅降级回 `lib/sampleData.ts` 中的示例数据**
5. **AI 分析** 通过 `/api/analysis` → `services/aiAnalysis.ts`：
   - 优先调用 LLM API（deepseek-chat），失败时回退到基于 ELO 的规则算法
   - 客户端安全版本 `predictMatchSync()` 仅使用规则算法（无 LLM 依赖）
6. **Stripe 支付** 通过 `/api/create-checkout-session`、`/api/stripe-webhook`、`/api/cancel-subscription` 处理

### 认证

**Supabase Auth** — 无密码 magic-link OTP 方式：
- `lib/supabaseClient.ts` → 从环境变量创建 Supabase 客户端单例（环境变量缺失时返回 `null`）
- `hooks/useAuth.ts` → 提供 `user`、`session`、`signInWithOtp(email)`、`signUp(email)`、`signOut()`、`verifyOtp()`
- `app/auth/callback/` → OTP magic-link 重定向回调页面
- **无 middleware.ts** — 认证门控完全在客户端实现（页面组件中检查 `user` 状态）
- `app/api/auth/session/` → Supabase session 辅助路由

### API 路由

| 路由 | 方法 | 用途 |
|------|------|------|
| `/api/football` | GET | `?type=live\|worldcup\|jingcai` — 比赛数据 |
| `/api/analysis` | POST | AI 预测分析 |
| `/api/leagues` | GET | 联赛数据 |
| `/api/auth/session` | GET/POST | Supabase session 管理 |
| `/api/create-checkout-session` | POST | Stripe 创建 checkout |
| `/api/stripe-webhook` | POST | Stripe webhook 处理 |
| `/api/cancel-subscription` | POST | 取消订阅 |

### 页面

| 路由 | 文件 | 说明 |
|------|------|------|
| `/` | `app/page.tsx` | 首页：实时比赛、AI 洞察、世界杯数据、串关区域 |
| `/jingcai` | `app/jingcai/page.tsx` | 竞彩足球分析 |
| `/leagues` | `app/leagues/page.tsx` | 联赛数据 |
| `/parlay` | `app/parlay/page.tsx` | AI 串关助手 |
| `/worldcup` | `app/worldcup/page.tsx` | 世界杯专区 |
| `/pricing` | `app/pricing/page.tsx` | 订阅套餐 |
| `/match/[id]` | `app/match/[id]/page.tsx` | 比赛详情（含 AI 预测、赔率走势图、数据对比） |
| `/favorites` | `app/favorites/page.tsx` | 收藏比赛（localStorage 持久化） |
| `/profile` | `app/profile/page.tsx` | 个人设置（昵称、语言、主题、订阅状态） |
| `/login` `/register` `/account` | 认证页面 | magic-link OTP 登录/注册 |
| `/auth/callback` | `app/auth/callback/page.tsx` | OTP 回调处理 |

### `lib/sampleData.ts` 的角色

示例数据是**核心回退机制** — 并非仅用于开发。当外部 API 调用失败时，`services/footballApi.ts` 中的每个函数都会返回示例数据。页面 hooks 以示例数据初始化 state，因此 UI 始终可渲染。`services/matchService.ts` 目前完全依赖示例数据。

### `lib/` 文件

| 文件 | 用途 |
|------|------|
| `lib/sampleData.ts` | 示例数据 — 所有 API 的回退数据源 |
| `lib/i18n.ts` | 14 种语言的翻译对象 + `LanguageProvider` 实现 |
| `lib/supabaseClient.ts` | Supabase 客户端单例（含 URL 验证） |
| `lib/prisma.ts` | Prisma 客户端单例（global 缓存防止热重载重复创建） |
| `lib/utils.ts` | `cn()` (clsx+tailwind-merge)、`formatPercentage`、`formatDateTime`、`clamp` |

### i18n

14 种语言通过 `LanguageProvider`（React context）支持，locale 保存到 localStorage。翻译存储在 `lib/i18n.ts` → `translations` 对象中。组件使用 `useLanguage()` hook，通过 `strings` 对象访问翻译。目前仅 `en` 和 `zh` 是完整的；其他语言仅翻译了导航栏、用户菜单和首页/竞彩/定价部分内容。

### UI 系统

- **主题**: 暗色主题由 `next-themes` 通过 `ThemeProvider` 实现（`defaultTheme="dark"`，`enableSystem=false`，基于 class 切换）
- **样式**: Tailwind CSS（`class` 暗色模式策略），SofaScore 风格的自定义颜色调色板（`primary: #1F4FA1`、`secondary: #0EA5E9`、`accent: #06B6D4` 等），含自定义阴影和背景色，字体 Inter
- **组件**: 仿 shadcn/ui 原语（`Button`、`Card`、`Badge`、`Input`），使用 `cn()` 工具函数合并类名
- **动画**: `framer-motion`
- **图标**: `lucide-react`
- **图表**: `recharts`（`MatchOddsChart` 中使用 `AreaChart` 展示赔率走势）
- **布局**: `app/layout.tsx` 按 `ThemeProvider` → `LanguageProvider` → `Navbar` 顺序包裹 children
- **图片**: `next.config.mjs` 中配置 `images.remotePatterns` 允许所有 HTTPS 域名
