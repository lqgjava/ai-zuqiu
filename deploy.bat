@echo off
echo 🚀 开始部署 AI 足球智能预测平台到 Vercel

REM 检查是否安装了 Vercel CLI
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI 未安装，请先运行: npm install -g vercel
    pause
    exit /b 1
)

REM 检查是否已登录
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 请先登录 Vercel:
    vercel login
)

REM 部署到 Vercel
echo 📦 部署到 Vercel...
vercel --prod

echo ✅ 部署完成！
echo 📝 记得在 Vercel 控制台设置环境变量（参考 VERCEL_DEPLOYMENT.md）
pause