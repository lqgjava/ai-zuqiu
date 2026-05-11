# ⚽ AI 足球智能预测平台

一个基于 Next.js 15 的现代化足球数据分析和 AI 预测平台，采用 SofaScore 风格的设计，提供实时联赛数据、AI 串关助手和智能预测功能。

## ✨ 主要功能

- 🏆 **实时联赛数据** - 覆盖全球主要足球联赛的实时比赛和积分榜
- 🤖 **AI 预测引擎** - 基于机器学习的比赛结果预测
- 🎯 **智能串关助手** - 自动分析风险并优化组合
- 🌍 **世界杯专区** - 专门的世界杯数据和预测中心
- 🎲 **竞彩足球分析** - 专业的竞彩数据分析工具
- 🎨 **现代化 UI** - 采用 SofaScore 风格的深色主题设计
- 🌐 **多语言支持** - 支持中文、英文等多种语言

## 🚀 技术栈

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Prisma + PostgreSQL
- **Authentication**: NextAuth.js
- **Payment**: Stripe
- **Deployment**: Vercel
- **APIs**: Football-Data.org, API-Football

## 🛠️ 本地开发

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/ai-zuqiu.git
   cd ai-zuqiu
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境配置**
   ```bash
   cp .env.example .env.local
   ```

   编辑 `.env.local` 文件，填入以下必需的环境变量：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   DATABASE_URL=your-database-url
   API_FOOTBALL_KEY=your-api-football-key
   FOOTBALL_DATA_KEY=your-football-data-org-key
   NEXTAUTH_SECRET=your-random-secret
   ```

4. **运行开发服务器**
   ```bash
   npm run dev
   ```

   访问 [http://localhost:3000](http://localhost:3000) 查看应用

## 📦 部署到 Vercel

详细的部署指南请查看 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## 📁 项目结构

```
ai-zuqiu/
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   ├── leagues/           # 联赛数据页面
│   ├── parlay/            # AI 串关助手
│   ├── worldcup/          # 世界杯专区
│   └── jingcai/           # 竞彩分析
├── components/            # React 组件
├── hooks/                 # 自定义 React Hooks
├── lib/                   # 工具库和配置
├── services/              # 外部服务集成
├── types/                 # TypeScript 类型定义
└── public/                # 静态资源
```

## 🔑 API 密钥获取

- **Football-Data.org**: [申请 API 密钥](https://www.football-data.org/)
- **API-Football**: [申请 API 密钥](https://api-sports.io/)
- **Supabase**: [创建项目](https://supabase.com/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系我们

如有问题或建议，请通过 GitHub Issues 联系我们。