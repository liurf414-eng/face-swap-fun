# 🚀 FAL.ai 快速换脸配置指南

## 📝 获取 FAL.ai API Key

### 步骤1：注册账号
1. 访问 https://fal.ai
2. 点击 "Sign Up" 注册账号
3. 使用邮箱或 Google 账号登录

### 步骤2：获取 API Key
1. 登录后进入 Dashboard
2. 点击 "API Keys" 或 "Settings"
3. 生成新的 API Key
4. 复制 Key（格式类似：`fal_xxxxx...`）

### 步骤3：配置环境变量

#### 本地开发 (.env文件)
```env
FAL_API_KEY=fal_your_key_here
FACESWAP_API=fal
```

#### Vercel部署
在Vercel项目设置中添加：
- **Name**: `FAL_API_KEY`
- **Value**: `fal_your_key_here`
- **Name**: `FACESWAP_API`
- **Value**: `fal`

## 🎯 切换不同API

在环境变量中设置 `FACESWAP_API` 即可切换：

| API | 设置值 | 速度 | 质量 |
|-----|-------|------|------|
| **FAL.ai** (推荐) | `fal` | ⚡⚡⚡ 3-8秒 | ⭐⭐⭐⭐ |
| **Replicate** | `replicate` | ⚡⚡ 15-30秒 | ⭐⭐⭐⭐⭐ |
| **AIFaceSwap** | `aifaceswap` | ⚡ 30-90秒 | ⭐⭐⭐ |

## 💡 使用建议

### 推荐配置
```env
FACESWAP_API=fal  # 默认使用最快最快的FAL.ai
```

### 高质量场景
如果需要更高质量，可以临时切换到 Replicate：
```env
FACESWAP_API=replicate
```

## 📊 API对比

### FAL.ai ⚡ 最快
- ✅ 速度：3-8秒
- ✅ 质量：高
- ✅ 价格：按次付费（价格合理）
- ✅ 推荐度：⭐⭐⭐⭐⭐

### Replicate ⚖️ 平衡
- ⚖️ 速度：15-30秒
- ✅ 质量：很高
- ⚖️ 价格：按次付费
- ✅ 推荐度：⭐⭐⭐⭐

### AIFaceSwap 🐢 备用
- ⚠️ 速度：30-90秒
- ⚖️ 质量：较高
- ⚖️ 价格：按次付费
- ✅ 推荐度：⭐⭐⭐

## 🔧 配置完成后

1. 重启本地服务器（如果有运行）
2. 重新部署到 Vercel
3. 测试换脸功能

## ✅ 验证配置

配置完成后，换脸速度应该提升到 **3-8秒**！

## 💰 价格参考

FAL.ai 价格：
- 快速模型：约 $0.01-$0.05/次
- 价格合理，适合高频使用

相关链接：
- https://fal.ai/pricing
- https://fal.ai/models
