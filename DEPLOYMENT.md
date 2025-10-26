# 🚀 FaceAI Hub 部署指南

## 📋 部署步骤

### 方式一：使用 Vercel 部署（推荐）

#### 1. 准备 GitHub 仓库
```bash
# 在 GitHub 创建新仓库
# 然后推送代码
git remote add origin https://github.com/YOUR_USERNAME/face-swap-fun.git
git branch -M main
git push -u origin main
```

#### 2. 连接 Vercel
1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "Add New Project"
4. 导入你的 GitHub 仓库
5. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 3. 配置环境变量
在 Vercel 项目设置中添加：
- `REPLICATE_API_TOKEN`: 你的 Replicate API Token
- `AIFACESWAP_API_KEY`: 你的 AIFaceSwap API Key
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账号ID
- `CLOUDFLARE_R2_ACCESS_KEY_ID`: R2 Access Key
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`: R2 Secret Key
- `CLOUDFLARE_R2_BUCKET`: 你的 bucket 名称

#### 4. 部署
- Vercel 会自动检测你的代码并部署
- 你会获得一个类似 `face-swap-fun.vercel.app` 的 URL

#### 5. 绑定自定义域名
1. 在 Vercel 项目设置中选择 "Domains"
2. 添加你的域名 `faceaihub.com`
3. Vercel 会提供 DNS 记录
4. 在你的域名提供商添加这些记录：
   - A 记录: `@` → Vercel IP
   - CNAME 记录: `www` → cname.vercel-dns.com

### 方式二：使用 Netlify 部署

#### 1. 准备 GitHub 仓库（同上）

#### 2. 连接 Netlify
1. 访问 https://netlify.com
2. 使用 GitHub 账号登录
3. 点击 "Add new site" → "Import an existing project"
4. 选择你的 GitHub 仓库
5. 配置构建设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Install command**: `npm install`

#### 3. 配置环境变量（同上）

#### 4. 部署
- Netlify 会自动部署
- 你会获得一个类似 `face-swap-fun.netlify.app` 的 URL

#### 5. 绑定自定义域名
1. 在 Netlify 项目设置中选择 "Domain management"
2. 添加你的域名
3. 配置 DNS（Netlify 会提供详细说明）

## 🔧 本地测试部署

### 先构建项目
```bash
npm run build
```

### 测试构建结果
```bash
npm run preview
```

## 📝 注意事项

1. **环境变量**：确保所有 API 密钥都正确配置
2. **域名 DNS**：需要 24-48 小时生效
3. **HTTPS**：Vercel/Netlify 会自动配置
4. **CDN**：使用 Cloudflare CDN 提升性能

## 🎉 部署完成

部署完成后，你的网站将可以通过：
- 临时 URL: `your-site.vercel.app` 或 `your-site.netlify.app`
- 自定义域名: `faceaihub.com`

## 📞 支持

如果遇到问题，可以：
1. 查看 Vercel/Netlify 的部署日志
2. 检查环境变量配置
3. 确认 DNS 设置
