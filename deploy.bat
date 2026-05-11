@echo off
echo 🚀 AI 足球智能预测平台 - 完整部署流程
echo.

REM 检查 Git 状态
echo 📋 检查 Git 状态...
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 当前目录不是 Git 仓库，请先运行: git init
    pause
    exit /b 1
)

REM 检查是否有未提交的更改
git status --porcelain | findstr . >nul
if %errorlevel% equ 0 (
    echo 🔄 发现未提交的更改，正在提交...
    git add .
    git commit -m "Auto commit: %date% %time%"
)

REM 检查远程仓库
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ❓ 未配置 GitHub 远程仓库
    echo 请先在 GitHub 上创建仓库，然后运行:
    echo git remote add origin https://github.com/YOUR_USERNAME/ai-zuqiu.git
    echo.
    echo 详细步骤请查看 GITHUB_UPLOAD.md 文件
    pause
    exit /b 1
)

REM 推送到 GitHub
echo 📤 推送到 GitHub...
git push origin master
if %errorlevel% neq 0 (
    echo ❌ GitHub 推送失败，可能需要配置认证信息
    echo 请查看 GITHUB_UPLOAD.md 文件获取详细说明
    pause
    exit /b 1
)

echo ✅ GitHub 推送成功！
echo.

REM 检查是否安装了 Vercel CLI
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Vercel CLI 未安装，跳过 Vercel 部署
    echo 如需部署到 Vercel，请先运行: npm install -g vercel
    echo 然后查看 VERCEL_DEPLOYMENT.md 获取详细部署指南
    pause
    exit /b 0
)

REM 检查是否已登录 Vercel
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Vercel 未登录，正在登录...
    vercel login
)

REM 部署到 Vercel
echo 📦 部署到 Vercel...
vercel --prod

echo ✅ 完整部署流程完成！
echo 📝 记得在 Vercel 控制台设置环境变量（参考 VERCEL_DEPLOYMENT.md）
pause