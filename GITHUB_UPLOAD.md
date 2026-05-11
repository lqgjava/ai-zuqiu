# GitHub 上传指南

## 步骤 1: 在 GitHub 上创建仓库

1. 访问 [GitHub.com](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `ai-zuqiu` 或你喜欢的名字
   - **Description**: `AI 足球智能预测平台 - 基于 Next.js 的现代化足球数据分析应用`
   - **Visibility**: 选择 Public（公开）或 Private（私有）
4. **不要**勾选 "Add a README file"（因为我们已经有了）
5. 点击 "Create repository"

## 步骤 2: 获取仓库 URL

创建仓库后，GitHub 会显示仓库的 URL，格式如下：
```
https://github.com/YOUR_USERNAME/ai-zuqiu.git
```

## 步骤 3: 添加远程仓库并推送

在你的本地项目目录中运行以下命令（将 `YOUR_USERNAME` 替换为你的 GitHub 用户名）：

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/ai-zuqiu.git

# 推送到 GitHub
git push -u origin master
```

## 步骤 4: 验证推送成功

推送完成后，刷新你的 GitHub 仓库页面，应该能看到所有文件都已经上传。

## 故障排除

### 如果推送失败：

1. **认证问题**：
   ```bash
   # 使用个人访问令牌（推荐）
   git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/ai-zuqiu.git
   ```

2. **分支名称问题**：
   ```bash
   # 如果你的默认分支是 main 而不是 master
   git branch -M main
   git push -u origin main
   ```

3. **强制推送**（如果需要覆盖远程仓库）：
   ```bash
   git push -u origin master --force
   ```

## 下一步

推送完成后，你就可以：
1. 在 Vercel 中连接这个 GitHub 仓库进行自动部署
2. 与其他开发者协作
3. 设置 CI/CD 工作流

---

## 快速推送脚本

如果你想自动化这个过程，可以运行项目中的 `deploy.bat` 脚本（需要先配置好 GitHub 仓库 URL）。