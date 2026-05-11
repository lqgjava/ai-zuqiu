# AI 足球智能预测平台

## 部署到 Vercel

### 1. 准备工作

确保你的项目已经推送到 GitHub 仓库。

### 2. 在 Vercel 上创建项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 连接你的 GitHub 账户
4. 选择包含此项目的仓库
5. 配置项目设置：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (留空)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. 设置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量：
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://your-database-url
API_FOOTBALL_KEY=your-api-football-key
FOOTBALL_DATA_KEY=your-football-data-org-key
NEXTAUTH_SECRET=your-random-secret-string
```

#### 可选的环境变量（用于支付功能）：
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRO_PRICE_ID=price_your_pro_price_id
STRIPE_PREMIUM_PRICE_ID=price_your_premium_price_id
NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
```

### 4. 数据库设置

如果你使用 Supabase：
1. 在 [supabase.com](https://supabase.com) 创建项目
2. 获取项目 URL 和 API Key
3. 在 Supabase 中运行数据库迁移（如果有的话）

### 5. 部署

1. 在 Vercel 中点击 "Deploy"
2. 等待构建完成
3. 访问生成的 URL 查看你的应用

### 6. 故障排除

- 如果构建失败，检查环境变量是否正确设置
- 如果数据库连接失败，确保 DATABASE_URL 格式正确
- 如果 API 调用失败，检查足球 API 密钥是否有效

### 7. 自定义域名（可选）

在 Vercel 项目设置中，你可以添加自定义域名。

---

## 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env.local

# 运行开发服务器
npm run dev
```

## 技术栈

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma + PostgreSQL
- **Authentication**: NextAuth.js
- **Payment**: Stripe
- **Deployment**: Vercel