# 🔧 修复Vercel自动部署问题

## 问题诊断

**症状：**
- ✅ Git仓库在Vercel中显示已连接
- ✅ 代码已推送到GitHub
- ❌ Vercel没有自动部署
- ❌ GitHub Webhooks页面是空的

**根本原因：**
虽然Vercel显示Git仓库已连接，但GitHub端没有创建webhook，所以GitHub无法通知Vercel有新提交。

---

## 🎯 解决方案：重新连接Git仓库

### 步骤1：在Vercel中断开连接

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入项目 `face-swap-fun`
3. 点击 **Settings**（设置）
4. 在左侧菜单找到 **Git**
5. 找到 **"Connected Git Repository"** 部分
6. 点击 **"Disconnect"** 按钮
7. 确认断开连接

### 步骤2：重新连接仓库

1. 在同一个 **Settings → Git** 页面
2. 点击 **"Connect Git Repository"** 按钮
3. 选择 **GitHub**
4. 如果提示授权，点击 **"Authorize Vercel"**
5. 搜索并选择仓库：`liurf414-eng/face-swap-fun`
6. 点击 **"Connect"** 或 **"Deploy"**

### 步骤3：等待Webhook创建

重新连接后：
1. 等待2-3分钟
2. 打开GitHub仓库：https://github.com/liurf414-eng/face-swap-fun
3. 进入 **Settings → Webhooks**
4. 应该能看到Vercel的webhook（URL包含 `vercel.com` 或 `api.vercel.com`）
5. 确认webhook状态是绿色的（Active）

### 步骤4：测试自动部署

Webhook创建后：
1. 推送一个测试提交
2. 立即打开Vercel Dashboard
3. 进入 **Deployments** 页面
4. 应该能看到新的部署自动开始

---

## 🔄 如果重新连接后还是没有Webhook

### 可能原因1：GitHub App权限不足

**检查：**
1. GitHub → Settings → Applications → Authorized OAuth Apps
2. 找到Vercel
3. 检查权限是否完整

**解决：**
1. 点击Vercel应用
2. 检查是否有仓库访问权限
3. 如果没有，重新授权

### 可能原因2：仓库访问权限

**检查：**
1. GitHub仓库 → Settings → Collaborators
2. 确认你的账号有管理员权限

**解决：**
- 如果是私有仓库，确保Vercel有访问权限
- 或者将仓库设为公开（临时测试）

---

## 🚀 临时解决方案：使用Vercel CLI手动部署

如果自动部署一直不工作，可以先用CLI手动部署：

```bash
# 在项目目录中
cd "d:\Web Project\face-swap-fun"

# 部署到生产环境
vercel --prod --yes
```

这会立即触发部署，不依赖webhook。

---

## 📋 完整修复流程

1. **Vercel Dashboard** → 项目 → **Settings** → **Git**
2. 点击 **"Disconnect"** 断开连接
3. 点击 **"Connect Git Repository"** 重新连接
4. 选择 `liurf414-eng/face-swap-fun`
5. 等待2-3分钟
6. 检查GitHub Webhooks页面
7. 如果看到webhook，测试推送代码
8. 如果还是没有webhook，检查GitHub App权限

---

## ✅ 验证清单

- [ ] 已在Vercel中断开Git连接
- [ ] 已重新连接Git仓库
- [ ] 等待了2-3分钟
- [ ] GitHub Webhooks页面有Vercel的webhook
- [ ] Webhook状态是Active（绿色）
- [ ] 推送代码后Vercel自动开始部署

---

**完成这些步骤后，自动部署应该就能正常工作了！**

