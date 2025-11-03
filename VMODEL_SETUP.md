# VModel API 集成指南

## 🚀 为什么选择 VModel？

VModel 是目前**最快的视频换脸 API**：

| API | 处理时间 | 价格 |
|-----|---------|------|
| **VModel** | **~15秒** ⚡ | $0.03/秒 |
| Replicate | 2-10分钟 | 按使用量 |
| AIFaceSwap | 2-5分钟 | 按任务 |

**VModel 比其他方案快 8-40 倍！**

## 📋 快速开始

### 步骤 1：注册 VModel 账号

1. 访问 [VModel.ai](https://vmodel.ai)
2. 注册账号（支持 Google/GitHub 登录）
3. **新用户可获得 $10 免费额度**（约 330 秒的视频处理）

### 步骤 2：获取 API Token

1. 登录后访问 [API Token 页面](https://vmodel.ai/settings/api-tokens)
2. 点击 "Create Token" 创建新的 API Key
3. 复制生成的 Token（格式：`vm_xxxxx...`）

### 步骤 3：配置环境变量

在项目根目录的 `.env` 文件中添加：

```bash
# VModel API (推荐，最快 - 约15秒)
VMODEL_API_TOKEN=vm_你的token

# 选择使用的 API（默认使用 VModel）
FACESWAP_API=vmodel

# 其他 API（备选）
REPLICATE_API_TOKEN=r8_xxx
AIFACESWAP_API_KEY=xxx

# 必需：图片上传服务
IMGBB_API_KEY=你的imgbb_key
```

### 步骤 4：部署到 Vercel

在 Vercel Dashboard 中添加环境变量：

1. 进入项目设置 → Environment Variables
2. 添加以下变量：
   - `VMODEL_API_TOKEN` = `vm_你的token`
   - `FACESWAP_API` = `vmodel`
   - `IMGBB_API_KEY` = `你的imgbb_key`

### 步骤 5：测试

1. 启动开发服务器
2. 选择一个视频模板
3. 上传照片
4. 点击生成
5. **等待约 15 秒**即可看到结果！

## 💰 价格说明

### VModel 定价
- **$0.03 / 秒**的视频处理
- **$1 可以处理 33 秒**的视频
- **新用户 $10 免费额度** = 约 330 秒

### 实际使用示例
- 处理一个 3 秒的视频 = **$0.09**
- 处理 10 个 3 秒的视频 = **$0.90**
- 使用 $10 免费额度可以处理约 **110 个视频**

### 成本对比

假设处理 100 个 3 秒的视频：

| API | 时间 | 成本 |
|-----|------|------|
| **VModel** | **25 分钟** | **$9** |
| Replicate | 3-17 小时 | 按使用量 |
| AIFaceSwap | 3-8 小时 | 按任务 |

**VModel 不仅快，而且性价比高！**

## 🔧 API 技术细节

### VModel API 端点

```bash
POST https://api.vmodel.ai/api/tasks/v1/create
Authorization: Bearer $VMODEL_API_TOKEN
Content-Type: application/json
```

### 请求参数

```json
{
  "version": "537e83f7ed84751dc56aa80fb2391b07696c85a49967c72c64f002a2bb224",
  "input": {
    "target": "https://example.com/face.jpg",    // 要替换的人脸图片
    "source": "https://example.com/video.mp4",   // 原始视频
    "disable_safety_checker": false
  }
}
```

### 响应格式

```json
{
  "task_id": "d9oo2z1s89lobg8oz5",
  "status": "processing",
  ...
}
```

### 检查任务状态

```bash
GET https://api.vmodel.ai/api/tasks/v1/{task_id}
Authorization: Bearer $VMODEL_API_TOKEN
```

### 完成后的响应

```json
{
  "task_id": "d9oo2z1s89lobg8oz5",
  "status": "succeeded",
  "output": [
    "https://data.vmodel.ai/.../result.mp4"
  ],
  "total_time": 15
}
```

## 📊 性能优化

VModel API 已经自动优化：
- ✅ 快速处理（~15秒）
- ✅ 高质量输出
- ✅ 支持多种视频格式
- ✅ 自动处理图片上传

## ⚙️ 配置选项

### 环境变量

```bash
# 选择 API 提供商
FACESWAP_API=vmodel          # vmodel | replicate | aifaceswap

# VModel API Token
VMODEL_API_TOKEN=vm_xxx

# 其他 API（备选）
REPLICATE_API_TOKEN=r8_xxx
AIFACESWAP_API_KEY=xxx

# 图片上传服务（必需）
IMGBB_API_KEY=xxx
```

### 代码中的优先级

1. **如果配置了 VModel** → 优先使用 VModel（最快）
2. **如果没有 VModel** → 使用 Replicate
3. **如果都没有** → 使用 AIFaceSwap

## 🐛 故障排除

### 问题 1：API Token 无效

**症状**: 401 Unauthorized

**解决**:
1. 检查 `.env` 文件中的 `VMODEL_API_TOKEN`
2. 确保 Token 以 `vm_` 开头
3. 在 VModel 网站重新生成 Token

### 问题 2：余额不足

**症状**: 403 Forbidden 或错误提示

**解决**:
1. 登录 VModel 检查账户余额
2. 新用户可以领取 $10 免费额度
3. 充值账户

### 问题 3：任务超时

**症状**: "timeout" 错误

**解决**:
- 通常不会发生（15秒内完成）
- 如果视频太长，可能需要更长时间
- 检查视频 URL 是否可访问

## 📚 相关文档

- [VModel 官方文档](https://vmodel.ai/docs)
- [API 参考](https://vmodel.ai/api-reference)
- [定价页面](https://vmodel.ai/pricing)

## ✅ 总结

VModel 是目前**最快、最可靠的视频换脸 API**：

- ⚡ **15秒处理时间**（比 Replicate 快 40 倍）
- 💰 **$0.03/秒**（性价比高）
- 🎁 **$10 免费额度**（新用户）
- 🔒 **商业授权**（可用于商业用途）

立即开始使用，享受极速换脸体验！

