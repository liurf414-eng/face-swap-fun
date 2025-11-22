# 🔧 Vercel部署问题排查指南

## 问题描述
代码已推送到GitHub，但Vercel没有自动部署。

## 可能的原因和解决方案

### 1. 检查Vercel项目连接状态

**步骤：**
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目 `face-swap-fun`
3. 检查项目状态：
   - 查看 "Settings" → "Git"
   - 确认GitHub仓库连接正常
   - 检查是否有错误提示

**可能的问题：**
- GitHub连接断开
- 权限问题
- Webhook失效

**解决方案：**
- 如果连接断开，重新连接GitHub仓库
- 检查GitHub App权限是否完整

---

### 2. 检查Webhook配置

**步骤：**
1. 在Vercel项目设置中查看 "Git" → "Deploy Hooks"
2. 检查GitHub仓库的Webhook设置：
   - 进入GitHub仓库 → Settings → Webhooks
   - 查看是否有Vercel的webhook
   - 检查webhook是否正常（绿色勾号）

**可能的问题：**
- Webhook被删除
- Webhook配置错误
- GitHub App权限不足

**解决方案：**
- 如果webhook缺失，在Vercel中重新连接仓库
- 检查GitHub App是否有仓库访问权限

---

### 3. 检查分支设置

**步骤：**
1. Vercel项目设置 → "Git" → "Production Branch"
2. 确认生产分支设置为 `main`（或你的主分支名）

**可能的问题：**
- 分支设置错误
- 推送到错误的分支

**解决方案：**
- 确保推送到正确的分支（通常是 `main`）
- 在Vercel中设置正确的生产分支

---

### 4. 检查构建配置

**步骤：**
1. Vercel项目设置 → "General" → "Build & Development Settings"
2. 检查以下设置：
   - **Framework Preset**: 应该是 "Vite" 或 "Other"
   - **Build Command**: 应该是 `npm run build`
   - **Output Directory**: 应该是 `dist`
   - **Install Command**: 应该是 `npm install` 或 `npm install --legacy-peer-deps`

**当前配置检查：**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "vite"
}
```

---

### 5. 检查环境变量

**步骤：**
1. Vercel项目设置 → "Environment Variables"
2. 确认所有必需的环境变量都已设置
3. 检查是否有变量缺失导致构建失败

**可能的问题：**
- 环境变量缺失
- 环境变量值错误

---

### 6. 手动触发部署

**临时解决方案：**

**方法1：通过Vercel Dashboard**
1. 登录Vercel Dashboard
2. 进入项目页面
3. 点击 "Deployments" 标签
4. 点击右上角的 "Redeploy" 按钮
5. 选择最新的提交进行重新部署

**方法2：通过Vercel CLI**
```bash
# 安装Vercel CLI（如果还没有）
npm i -g vercel

# 登录
vercel login

# 在项目目录中部署
vercel --prod
```

**方法3：创建空提交触发部署**
```bash
git commit --allow-empty -m "Trigger Vercel deployment"
git push
```

---

### 7. 检查最近的提交

**查看最近的提交：**
```bash
git log --oneline -10
```

**确认提交已推送到GitHub：**
```bash
git log origin/main --oneline -10
```

如果本地和远程不一致，可能需要：
```bash
git push origin main
```

---

### 8. 检查Vercel部署日志

**步骤：**
1. Vercel Dashboard → 项目 → "Deployments"
2. 查看最近的部署记录
3. 检查是否有失败的部署
4. 查看构建日志，查找错误信息

**常见错误：**
- 构建超时
- 依赖安装失败
- 环境变量缺失
- 构建命令错误

---

### 9. 重新连接GitHub仓库

**如果以上方法都不行，尝试重新连接：**

1. Vercel Dashboard → 项目 → Settings → Git
2. 点击 "Disconnect" 断开连接
3. 点击 "Connect Git Repository"
4. 重新选择GitHub仓库
5. 确认分支和设置
6. 重新部署

---

### 10. 检查.vercelignore文件

**检查是否有.vercelignore文件阻止了部署：**
```bash
# 查看是否有.vercelignore
cat .vercelignore
```

如果存在，检查是否意外忽略了重要文件。

---

## 快速检查清单

- [ ] GitHub仓库连接正常
- [ ] Webhook配置正确
- [ ] 分支设置正确（main）
- [ ] 构建配置正确
- [ ] 环境变量完整
- [ ] 最近的提交已推送到GitHub
- [ ] 没有构建错误
- [ ] 尝试手动触发部署

---

## 推荐的解决方案

### 立即执行（按顺序）：

1. **检查最近的部署状态**
   - 登录Vercel Dashboard
   - 查看Deployments页面
   - 检查是否有失败的部署

2. **手动触发部署**
   - 在Vercel Dashboard中点击 "Redeploy"
   - 或使用Vercel CLI: `vercel --prod`

3. **检查Git连接**
   - 确认GitHub仓库连接正常
   - 如有问题，重新连接

4. **检查构建配置**
   - 确认Build Command: `npm run build`
   - 确认Output Directory: `dist`
   - 确认Install Command: `npm install --legacy-peer-deps`

5. **如果仍然不行**
   - 创建空提交触发: `git commit --allow-empty -m "Trigger deployment" && git push`
   - 或联系Vercel支持

---

## 预防措施

1. **设置部署通知**
   - 在Vercel中设置邮件通知
   - 或集成Slack/Discord通知

2. **定期检查**
   - 每周检查一次部署状态
   - 确保自动部署正常工作

3. **使用Vercel CLI**
   - 安装Vercel CLI进行本地测试
   - 可以提前发现构建问题

---

## 联系支持

如果以上方法都无法解决问题：
- Vercel支持: https://vercel.com/support
- 检查Vercel状态: https://www.vercel-status.com/

---

**最后更新：** 2025-01-27

