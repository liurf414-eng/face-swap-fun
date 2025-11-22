# 🔄 Vercel手动重新部署指南

## 📍 在Vercel Dashboard中找到Redeploy按钮

### 步骤详解（带截图说明）

#### 方法1：通过Deployments页面（最常用）

1. **登录Vercel Dashboard**
   - 访问：https://vercel.com/dashboard
   - 使用GitHub账号登录

2. **进入项目**
   - 在项目列表中找到 `face-swap-fun`
   - 点击项目名称进入项目主页

3. **打开Deployments标签**
   - 在项目顶部导航栏，点击 **"Deployments"** 标签
   - 你会看到所有部署历史记录

4. **找到Redeploy按钮**
   - **方式A**：在部署列表的右上角，找到 **"..."** 菜单（三个点图标）
     - 点击 **"..."** → 选择 **"Redeploy"**
   
   - **方式B**：点击任意一个部署进入详情页
     - 在部署详情页的右上角，找到 **"Redeploy"** 按钮
     - 点击即可重新部署

#### 方法2：通过部署详情页

1. 进入项目 → "Deployments"
2. 点击最新的部署（或任意一个部署）
3. 进入部署详情页面
4. 在页面右上角找到 **"Redeploy"** 按钮
5. 点击后会弹出确认对话框
6. 选择要重新部署的提交（通常选择最新的）
7. 点击 **"Redeploy"** 确认

---

## 🖥️ 使用Vercel CLI手动部署

如果Dashboard中找不到按钮，可以使用命令行：

### 安装Vercel CLI

```bash
npm install -g vercel
```

### 登录Vercel

```bash
vercel login
```

这会打开浏览器让你登录。

### 部署到生产环境

```bash
# 在项目目录中
cd "d:\Web Project\face-swap-fun"

# 部署到生产环境
vercel --prod
```

### 部署到预览环境

```bash
vercel
```

---

## 🔍 检查部署状态

### 在Vercel Dashboard中

1. 进入项目 → "Deployments"
2. 查看部署列表：
   - ✅ **绿色勾号** = 部署成功
   - ⏳ **黄色圆圈** = 正在部署
   - ❌ **红色叉号** = 部署失败
   - ⚠️ **黄色警告** = 部署有警告

3. 点击部署查看详情：
   - 查看构建日志
   - 查看部署URL
   - 查看构建时间

---

## 🚨 常见问题

### Q1: 找不到Redeploy按钮？

**可能原因：**
- 你没有项目的编辑权限
- Vercel界面版本不同

**解决方案：**
- 使用Vercel CLI：`vercel --prod`
- 或联系项目所有者添加权限

### Q2: Redeploy后还是旧版本？

**可能原因：**
- 浏览器缓存
- CDN缓存

**解决方案：**
1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 硬刷新页面（Ctrl+F5）
3. 等待几分钟让CDN更新
4. 使用无痕模式访问

### Q3: 部署一直失败？

**检查：**
1. 查看部署日志中的错误信息
2. 检查环境变量是否完整
3. 检查构建配置是否正确
4. 检查 `package.json` 中的依赖

---

## 📋 快速检查清单

- [ ] 已登录Vercel Dashboard
- [ ] 已进入正确的项目
- [ ] 已打开Deployments页面
- [ ] 找到了Redeploy按钮或使用CLI
- [ ] 部署状态显示为"Building"或"Ready"
- [ ] 检查了部署日志（如果有错误）

---

## 🎯 推荐操作流程

1. **首先尝试Dashboard**
   - 登录 → 项目 → Deployments → Redeploy

2. **如果找不到，使用CLI**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

3. **检查部署状态**
   - 等待部署完成
   - 查看部署日志
   - 访问网站验证

---

**最后更新：** 2025-01-27

