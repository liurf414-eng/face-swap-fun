# Vercel 环境变量配置

## 📝 必需的环境变量

要在 Vercel 上部署并运行 FaceAI Meme，需要在 Vercel Dashboard 中添加以下环境变量：

### 1. REPLICATE_API_TOKEN

**获取方法：**
1. 访问 [Replicate](https://replicate.com/)
2. 注册/登录账号
3. 进入 [API Tokens 页面](https://replicate.com/account/api-tokens)
4. 复制您的 API Token

**添加到 Vercel：**
- 名称：`REPLICATE_API_TOKEN`
- 值：您的 Replicate API Token

### 2. IMGBB_API_KEY（必需）

Replicate API 需要公开可访问的图片 URL，不能直接使用 base64 图片。我们需要使用 ImgBB 上传图片。

**获取方法：**
1. 访问 [ImgBB](https://imgbb.com/)
2. 注册/登录账号
3. 进入 [API 页面](https://api.imgbb.com/)
4. 点击 "Get API Key" 或使用以下链接直接生成：https://api.imgbb.com/
5. 复制您的 API Key

**添加到 Vercel：**
- 名称：`IMGBB_API_KEY`
- 值：您的 ImgBB API Key

### 3. FACESWAP_API（可选，默认值：replicate）

- 名称：`FACESWAP_API`
- 值：`replicate`

## 🚀 在 Vercel 中添加环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目 `face-swap-fun`
3. 进入 **Settings** → **Environment Variables**
4. 添加上述环境变量
5. 确保选择环境：**Production, Preview, Development**（全部勾选）
6. 点击 **Save**
7. 重新部署项目（自动触发或手动重新部署）

## ✅ 验证配置

部署完成后，访问您的网站测试换脸功能。如果配置正确，应该能够成功生成换脸视频。

## ⚠️ 常见问题

### 问题 1：Image upload failed
- **原因**：ImgBB API Key 未配置或无效
- **解决**：检查 Vercel 环境变量中的 `IMGBB_API_KEY` 是否正确配置

### 问题 2：ITTION is not defined
- **原因**：Replicate API Token 未配置
- **解决**：检查 Vercel 环境变量中的 `REPLICATE_API_TOKEN` 是否正确配置

### 问题 3：422 Unprocessable Entity
- **原因**：API 参数格式错误（已修复）
- **解决**：确保使用最新版本的代码

## 📞 支持

如遇问题，请检查 Vercel Deployment Logs 以查看详细错误信息。

