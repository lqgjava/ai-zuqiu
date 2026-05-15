# 看球智AI — 图片添加设计文档

**日期**: 2026-05-15  
**状态**: 已确认

## 概述

为网站添加合法来源的图片，提升视觉体验。所有图片使用免费商用或已授权来源，确保无版权风险。

## 图片来源

| 来源 | 用途 | 版权状态 |
|------|------|----------|
| Unsplash | 球场俯拍背景、联赛 banner 照片、场馆照片 | 免费商用，无需署名 |
| API-Football CDN | 球队队徽（通过现有 API 订阅授权） | API 授权 |
| FlagCDN | 国家国旗 SVG | 免费使用 |
| 自绘 SVG | favicon、app logo、队徽 fallback | 自有资产 |

## 实施步骤

### Step 1: 全局基础图片

**Hero 背景**：首页 hero section 使用 Unsplash 满场观众球场俯拍照片作为背景图，覆盖暗色渐变遮罩（`rgba(15,23,42,0.55)` → `rgba(15,23,42,0.8)`）保证文字可读性。

**Favicon**：SVG 格式，蓝-青渐变圆角方块 + 足球图案，16×16 和 32×32。

**App Logo**：Navbar 中使用 SVG 图标（同 favicon 风格）+ "看球智AI" 文字。

### Step 2: 比赛卡片队徽渲染

创建可复用的 `TeamBadge` 组件：
- **正常状态**：白色圆形底 + `next/Image` 渲染 `badgeUrl`（API-Football CDN）
- **Fallback**：`badgeUrl` 为空或加载失败时，显示渐变纯色圆形 + 球队名首汉字
- 颜色根据球队名确定性生成（多种预定义渐变色）

涉及页面：首页、竞彩、世界杯、联赛、比赛详情、串关、收藏（7 个页面）

数据模型已包含 `badgeUrl` 字段，当前仅需渲染层改动。

### Step 3: 联赛和页面横幅

**联赛页 Banner**：Unsplash 联赛相关照片 + 暗色渐变遮罩覆盖。Banner 内显示联赛国旗、名称、级别、球队数和比赛数。

**各页面 Header 风格**：
- 世界杯：赛事球场 + 奖杯元素
- 竞彩足球：战术板纹理 + 数据图表元素
- AI 串关：数据流 + 科技感纹理
- 比赛详情：比赛两队主色调渐变

### Step 4: 细节打磨

- **国旗图标**：联赛列表中的 emoji 国旗替换为 FlagCDN SVG（`flagcdn.com`），跨平台统一显示
- **用户头像**：渐变圆形 + 用户邮箱首字母大写
- **场馆照片**：比赛详情页用 Unsplash 球场照片做顶部背景
- **Open Graph 图**：AI 生成或服务端渲染的社交分享预览图

## 技术要点

- 使用 `next/Image` 组件优化图片加载
- 外部图片域名已在 `next.config.mjs` 中配置 `remotePatterns: [{ hostname: '**' }]`
- 图片加载失败时使用 `onError` 回调切换到 fallback
- 队徽颜色确定性生成：`stringHash(teamName) % colorPresets.length`

## 不上线的范围

- 球员照片（来源受限）
- Sofascore 等商业网站图片抓取（版权风险）
