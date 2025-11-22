# 🚀 Vercel立即部署指南

## 📍 当前状态

你已经完成了：
- ✅ 创建新项目
- ✅ 连接GitHub仓库
- ✅ 配置项目设置

现在需要**开始部署**！

---

## 🎯 部署步骤

### 步骤1：检查配置页面

在Vercel项目配置页面，确认以下设置：

**Framework Preset:**
- 选择：**"Vite"** 或 **"Other"**

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install --legacy-peer-deps
```

**Root Directory:**
- 留空（如果项目在根目录）

### 步骤2：环境变量（如果还没填）

如果还没填写环境变量，可以：
- **现在填写**：添加 `VMODEL_API_TOKEN` 和 `IMGBB_API_KEY`
- **稍后填写**：先部署，部署成功后再添加（需要重新部署）

### 步骤3：点击部署按钮

在配置页面底部，找到：
- **"Deploy"** 按钮（通常是蓝色或绿色的大按钮）

点击 **"Deploy"** 按钮！

---

## ⏳ 部署过程

### 部署阶段

部署会经历以下阶段：

1. **Installing dependencies** (安装依赖)
   - 执行 `npm install --legacy-peer-deps`
   - 通常需要 30-60 秒

2. **Building** (构建项目)
   - 执行 `npm run build`
   - 通常需要 30-60 秒

3. **Deploying** (部署到CDN)
   - 上传文件到Vercel CDN
   - 通常需要 10-30 秒

### 实时查看进度

部署过程中，你可以：
- 查看实时构建日志
- 看到每个步骤的进度
- 如果有错误，会显示在日志中

---

## ✅ 部署成功

### 成功标志

部署成功后，你会看到：
- ✅ **"Ready"** 状态
- 🌐 **部署URL**（例如：`https://face-swap-fun-xxx.vercel.app`）
- 📊 部署信息（提交信息、构建时间等）

### 下一步

1. **访问网站**
   - 点击部署URL
   - 测试网站是否正常加载

2. **测试功能**
   - 测试换脸功能（如果已配置API密钥）
   - 检查页面是否正常显示

3. **验证自动部署**
   - 推送一个测试提交到GitHub
   - 检查Vercel是否自动开始新部署

---

## 🚨 如果部署失败

### 常见错误及解决方法

#### 错误1：Build failed - 依赖安装失败
**原因**: `npm install` 失败
**解决**: 
- 检查 `package.json` 是否正确
- 确认 `Install Command` 是 `npm install --legacy-peer-deps`

#### 错误2：Build failed - 构建命令失败
**原因**: `npm run build` 失败
**解决**:
- 检查 `package.json` 中是否有 `build` 脚本
- 查看构建日志中的具体错误信息

#### 错误3：Module not found
**原因**: 缺少依赖或路径错误
**解决**:
- 检查所有依赖是否在 `package.json` 中
- 确认文件路径正确

#### 错误4：Environment variable missing
**原因**: 代码中使用了环境变量但未配置
**解决**:
- 添加必需的环境变量
- 重新部署

---

## 📋 部署检查清单

部署前确认：
- [ ] Framework Preset: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install --legacy-peer-deps`
- [ ] 环境变量已配置（如果需要）
- [ ] 点击了 "Deploy" 按钮

---

## 🎯 快速操作

### 如果找不到"Deploy"按钮

1. **检查页面位置**
   - 确保在项目配置页面
   - 不是项目列表页面

2. **检查配置完整性**
   - 所有必填项都已填写
   - 没有红色错误提示

3. **刷新页面**
   - 按 `F5` 刷新
   - 重新进入配置页面

---

## 📝 部署后操作

### 1. 查看部署详情

1. 进入 Vercel Dashboard
2. 点击你的项目
3. 进入 **"Deployments"** 标签
4. 查看最新部署的详细信息

### 2. 查看部署日志

1. 点击最新部署
2. 查看 **"Build Logs"** 和 **"Function Logs"**
3. 确认没有错误

### 3. 测试自动部署

推送测试提交：
```bash
git commit --allow-empty -m "Test auto-deploy"
git push
```

然后检查Vercel Dashboard，应该能看到新部署自动开始。

---

**现在就去点击 "Deploy" 按钮，开始部署吧！** 🚀

