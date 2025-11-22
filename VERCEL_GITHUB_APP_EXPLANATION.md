# 🔍 Vercel GitHub集成说明

## 📊 为什么GitHub Webhooks页面是空的？

### 重要说明

**Vercel可能使用GitHub App而不是传统Webhook！**

现代版本的Vercel使用**GitHub App**进行集成，而不是传统的webhook。这意味着：

- ✅ **GitHub App方式**：不会在Webhooks页面显示
- ✅ **查看位置**：GitHub → Settings → Applications → Installed GitHub Apps
- ✅ **功能相同**：GitHub App也能接收推送事件并触发部署

---

## 🔍 如何检查GitHub App

### 步骤1：检查已安装的GitHub App

1. 打开GitHub：https://github.com/settings/apps
2. 或者：GitHub → Settings（个人设置）→ Applications → Installed GitHub Apps
3. 查找 **"Vercel"** 应用
4. 确认它已安装并有权访问 `liurf414-eng/face-swap-fun` 仓库

### 步骤2：检查仓库的GitHub App权限

1. 打开仓库：https://github.com/liurf414-eng/face-swap-fun
2. 进入 **Settings** → **Integrations** → **GitHub Apps**
3. 查找 **"Vercel"** 应用
4. 确认它已安装并配置

---

## 🧪 测试自动部署是否工作

即使Webhooks页面是空的，自动部署可能仍然工作！

### 测试方法：

1. **推送一个测试提交**
   ```bash
   git commit --allow-empty -m "Test auto-deploy with GitHub App"
   git push
   ```

2. **立即检查Vercel Dashboard**
   - 打开Vercel Dashboard
   - 进入项目的 **Deployments** 页面
   - 观察是否有新部署自动开始

3. **如果自动开始部署**
   - ✅ 说明GitHub App工作正常
   - ✅ 不需要webhook也能工作
   - ✅ 问题已解决！

---

## 🔧 如果自动部署还是不工作

### 方案1：检查GitHub App权限

1. GitHub → Settings → Applications → Installed GitHub Apps
2. 找到Vercel应用
3. 点击进入详情
4. 检查：
   - 是否有仓库访问权限
   - 权限是否完整
   - 是否授权了 `face-swap-fun` 仓库

### 方案2：重新安装GitHub App

1. 在Vercel中：Settings → Git → Disconnect
2. 在GitHub中：Settings → Applications → Installed GitHub Apps → 找到Vercel → 卸载
3. 在Vercel中：重新Connect Git Repository
4. 重新授权GitHub App

### 方案3：使用Deploy Hooks（手动触发）

如果自动部署一直不工作，可以使用Deploy Hooks：

1. Vercel Dashboard → Settings → Git → Deploy Hooks
2. 点击 "Create Hook"
3. 设置：
   - Name: `Manual Deploy`
   - Branch: `main`
4. 复制生成的URL
5. 每次需要部署时，访问这个URL即可触发部署

---

## 📋 检查清单

### GitHub App方式（可能的情况）
- [ ] GitHub → Settings → Applications → Installed GitHub Apps → 有Vercel应用
- [ ] 仓库 → Settings → Integrations → GitHub Apps → 有Vercel应用
- [ ] 推送代码后Vercel自动部署

### 传统Webhook方式
- [ ] GitHub → Settings → Webhooks → 有Vercel的webhook
- [ ] Webhook状态是Active
- [ ] 推送代码后Vercel自动部署

---

## 🎯 推荐操作

1. **先测试自动部署**
   - 推送代码
   - 检查Vercel是否自动部署
   - 如果工作，说明GitHub App方式正常

2. **如果还是不工作**
   - 检查GitHub App权限
   - 或使用Deploy Hooks作为备选方案

---

**关键点：即使Webhooks页面是空的，只要GitHub App正确安装，自动部署仍然可以工作！**

