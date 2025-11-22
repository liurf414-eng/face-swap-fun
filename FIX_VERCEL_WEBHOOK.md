# 🔧 修复Vercel Webhook问题

## 问题诊断

**症状：** GitHub仓库的Webhooks页面是空的，Vercel没有自动部署。

**原因：** Vercel的Git集成没有正确设置，或者连接断开了。

---

## 🎯 解决方案：重新连接GitHub仓库

### 方法1：在Vercel Dashboard中重新连接（推荐）

#### 步骤1：断开现有连接

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入项目 `face-swap-fun`
3. 点击 **Settings**（设置）
4. 在左侧菜单中找到 **Git**
5. 找到 **"Connected Git Repository"** 部分
6. 点击 **"Disconnect"** 按钮
7. 确认断开连接

#### 步骤2：重新连接仓库

1. 在同一个 **Settings → Git** 页面
2. 点击 **"Connect Git Repository"** 按钮
3. 选择 **GitHub**
4. 如果提示授权，点击 **"Authorize Vercel"**
5. 搜索并选择仓库：`liurf414-eng/face-swap-fun`
6. 确认以下设置：
   - **Production Branch**: `main`
   - **Root Directory**: `./`（默认）
   - **Framework Preset**: `Vite` 或 `Other`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
7. 点击 **"Deploy"** 或 **"Save"**

#### 步骤3：验证Webhook

连接成功后：
1. 回到GitHub仓库
2. 进入 **Settings → Webhooks**
3. 应该能看到Vercel的webhook（通常URL包含 `vercel.com`）
4. 确认webhook状态是绿色的（正常）

---

### 方法2：创建新项目（如果方法1不行）

如果重新连接不行，可以创建新项目：

1. 访问：https://vercel.com/new
2. 点击 **"Import Git Repository"**
3. 搜索 `face-swap-fun`
4. 选择仓库：`liurf414-eng/face-swap-fun`
5. 配置项目：
   - **Project Name**: `face-swap-fun`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
6. 添加环境变量（从旧项目复制）
7. 点击 **"Deploy"**

---

## 🔍 验证Webhook是否创建成功

### 在GitHub中检查

1. 进入GitHub仓库：https://github.com/liurf414-eng/face-swap-fun
2. 点击 **Settings**（仓库设置）
3. 在左侧菜单中找到 **Webhooks**
4. 应该能看到：
   - **Payload URL**: 类似 `https://api.vercel.com/v1/integrations/...`
   - **Content type**: `application/json`
   - **Events**: `push`, `pull_request` 等
   - **Status**: 绿色勾号（Active）

### 在Vercel中检查

1. Vercel Dashboard → 项目 → Settings → Git
2. 应该显示：
   - **Git Repository**: `liurf414-eng/face-swap-fun`
   - **Production Branch**: `main`
   - **Automatic deployments**: Enabled

---

## 🧪 测试自动部署

重新连接后，测试是否正常工作：

### 方法1：创建测试提交

```bash
git commit --allow-empty -m "Test Vercel auto-deploy"
git push
```

### 方法2：查看Vercel Dashboard

1. 推送后，立即打开Vercel Dashboard
2. 进入项目的 **Deployments** 页面
3. 应该能看到新的部署自动开始（状态显示 "Building"）

---

## ⚠️ 常见问题

### Q1: 重新连接后还是没有webhook？

**可能原因：**
- GitHub App权限不足
- 仓库是私有的，需要授权

**解决方案：**
1. 检查GitHub App权限：
   - GitHub → Settings → Applications → Authorized OAuth Apps
   - 找到Vercel，检查权限是否完整
2. 如果是私有仓库，确保Vercel有访问权限

### Q2: Webhook创建了但还是不自动部署？

**检查：**
1. 确认推送到的是 `main` 分支（或Production Branch设置的分支）
2. 检查Vercel项目设置中的 "Automatic deployments" 是否启用
3. 查看GitHub Webhook的Recent Deliveries，看是否有错误

### Q3: 提示权限不足？

**解决方案：**
1. 在GitHub中，进入仓库 → Settings → Collaborators
2. 确认你的账号有管理员权限
3. 或者在GitHub App设置中重新授权Vercel

---

## 📋 完整检查清单

- [ ] 在Vercel中断开并重新连接GitHub仓库
- [ ] 确认GitHub Webhooks页面有Vercel的webhook
- [ ] Webhook状态显示为Active（绿色）
- [ ] Vercel项目设置中显示正确的仓库和分支
- [ ] "Automatic deployments" 已启用
- [ ] 测试推送后Vercel自动开始部署

---

## 🚀 快速修复步骤总结

1. **Vercel Dashboard** → 项目 → **Settings** → **Git**
2. 点击 **"Disconnect"** 断开连接
3. 点击 **"Connect Git Repository"** 重新连接
4. 选择 `liurf414-eng/face-swap-fun`
5. 确认设置后保存
6. 检查GitHub Webhooks页面，确认webhook已创建
7. 测试推送代码，验证自动部署

---

**完成这些步骤后，Vercel应该能够自动检测GitHub的推送并自动部署了！**

