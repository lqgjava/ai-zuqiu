#!/bin/bash

echo "🚀 开始部署 AI 足球智能预测平台到 Vercel"

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，请先运行: npm install -g vercel"
    exit 1
fi

# 检查是否已登录
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录 Vercel:"
    vercel login
fi

# 部署到 Vercel
echo "📦 部署到 Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo "📝 记得在 Vercel 控制台设置环境变量（参考 VERCEL_DEPLOYMENT.md）"