# ⚙️ Vercel构建配置参考

## 📋 在Vercel Dashboard中需要设置的配置

### 项目设置路径
**Vercel Dashboard** → 项目 `face-swap-fun` → **Settings** → **General** → **Build & Development Settings**

---

## 🔧 推荐配置

### Framework Preset
```
Vite
```
或
```
Other
```

### Root Directory
```
./
```
（留空或填写 `./`）

### Build Command
```
npm run build
```

### Output Directory
```
dist
```

### Install Command
```
npm install --legacy-peer-deps
```
**重要：** 必须使用 `--legacy-peer-deps` 因为 React 19 有依赖冲突

### Development Command
```
npm run dev
```
（可选，用于预览环境）

---

## 🌍 环境变量配置

### 路径
**Settings** → **Environment Variables**

### 必需的环境变量

#### Production环境
```
REPLICATE_API_TOKEN = [你的Replicate API Token]
VMODEL_API_TOKEN = [你的VModel API Token]
IMGBB_API_KEY = [你的ImgBB API Key]
CLOUDFLARE_ACCOUNT_ID = [你的Cloudflare Account ID]
CLOUDFLARE_R2_ACCESS_KEY_ID = [你的R2 Access Key ID]
CLOUDFLARE_R2_SECRET_ACCESS_KEY = [你的R2 Secret Access Key]
CLOUDFLARE_R2_BUCKET = [你的R2 Bucket名称]
```

#### 环境选择
确保所有变量都勾选：
- ✅ Production
- ✅ Preview  
- ✅ Development

---

## 📦 Node.js版本

### 在package.json中已设置
```json
"engines": {
  "node": ">=18.0.0"
}
```

Vercel会自动使用Node.js 18或更高版本。

---

## 🔄 Git集成设置

### 路径
**Settings** → **Git**

### 配置项

#### Connected Git Repository
```
liurf414-eng/face-swap-fun
```

#### Production Branch
```
main
```

#### Automatic Deployments
```
✅ Enabled (启用)
```

#### Ignored Build Step
```
留空（不忽略任何构建）
```

---

## 📝 完整配置检查清单

### Build Settings
- [ ] Framework Preset: `Vite` 或 `Other`
- [ ] Root Directory: `./`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install --legacy-peer-deps`

### Git Settings
- [ ] Connected Repository: `liurf414-eng/face-swap-fun`
- [ ] Production Branch: `main`
- [ ] Automatic Deployments: ✅ Enabled

### Environment Variables
- [ ] 所有必需变量已添加
- [ ] 所有环境（Production/Preview/Development）都已勾选

---

## 🚨 常见配置错误

### 错误1：Install Command没有使用--legacy-peer-deps
**症状：** 构建失败，提示peer dependency冲突

**解决：** 改为 `npm install --legacy-peer-deps`

### 错误2：Output Directory错误
**症状：** 部署后显示404或空白页

**解决：** 确保是 `dist`（不是 `build` 或 `public`）

### 错误3：Build Command错误
**症状：** 构建失败

**解决：** 确保是 `npm run build`（不是 `npm build`）

---

## ✅ 验证配置

配置完成后：

1. **手动触发一次部署**
   - Deployments → Redeploy

2. **查看构建日志**
   - 确认没有错误
   - 确认构建成功

3. **测试自动部署**
   - 推送一个空提交：`git commit --allow-empty -m "test" && git push`
   - 观察Vercel是否自动开始部署

---

**配置完成后，保存设置，Vercel会自动使用这些配置进行构建和部署！**

