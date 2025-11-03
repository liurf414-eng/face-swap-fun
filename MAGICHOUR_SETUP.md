# Magic Hour API 集成指南

## 🚀 Magic Hour 概述

Magic Hour 是一个 AI 视频创作平台，提供高质量的视频换脸服务。根据测试，通常在几秒至几十秒内完成处理。

参考文档：https://docs.magichour.ai/api-reference/video-projects/face-swap-video

## 📋 API 信息

### 端点
- **创建任务**: `POST https://api.magichour.ai/v1/face-swap`
- **查询任务**: `GET https://api.magichour.ai/v1/video/{video_id}`

### 认证
- Header: `Authorization: Bearer <api_key>`

### 请求参数

```json
{
  "start_seconds": 0.0,
  "end_seconds": 15.0,
  "assets": {
    "face_mappings": [
      {
        "new_face": "图片URL",
        "original_face": "0-0"
      }
    ],
    "face_swap_mode": "all-faces",
    "video_file_path": "视频URL",
    "video_source": "url"
  },
  "name": "Face Swap",
  "style": {
    "version": "default"
  }
}
```

## ⚙️ 配置

### 环境变量

在 `.env` 文件或 Vercel Dashboard 中添加：

```bash
# Magic Hour API Key
MAGICHOUR_API_KEY=mhk_live_6FBxHAfqe43imx12rAALt88Ux8j7s8HDfeezMinKCG7zh8Fv4QrfOd2Uh35Hb6c0MfBjhhOawc0EWBEk

# 选择使用的 API
FACESWAP_API=magichour  # 或 piapi, vmodel, replicate

# 必需：图片上传服务
IMGBB_API_KEY=你的imgbb_key
```

### Vercel 部署

在 Vercel Dashboard 中添加环境变量：

1. 进入项目设置 → Environment Variables
2. 添加：
   - `MAGICHOUR_API_KEY` = `mhk_live_6FBxHAfqe43imx12rAALt88Ux8j7s8HDfeezMinKCG7zh8Fv4QrfOd2Uh35Hb6c0MfBjhhOawc0EWBEk`
   - `FACESWAP_API` = `magichour`（测试时）
   - `IMGBB_API_KEY` = `你的imgbb_key`

## 📊 API 特点

### 处理速度
- **几秒到几十秒**完成处理
- 比 PiAPI 更快（PiAPI 通常需要几分钟）

### 质量
- 高质量换脸效果
- 适用于娱乐内容制作
- 专业品质输出

### 定价
- 按帧数计费（基于 30 FPS 估算）
- 实际费用在视频完成后结算
- 如果失败会退款

## 🔧 技术细节

### 人脸映射格式

```json
{
  "new_face": "图片URL",      // 要替换的人脸
  "original_face": "0-0"      // 视频中的人脸索引（格式：人脸索引-帧索引）
}
```

### 视频源选项

- `"url"`: 使用视频 URL（我们使用这个）
- `"file"`: 使用已上传的文件 ID

### 状态值

- `pending` / `queued` - 等待处理
- `processing` / `in_progress` - 处理中
- `complete` / `completed` / `success` - 已完成
- `failed` / `error` / `failure` - 失败

## 💰 成本估算

根据文档，成本估算基于 30 FPS：
- 3 秒视频 = 90 帧
- 10 秒视频 = 300 帧
- 实际费用在完成后结算

## 🧪 测试对比

可以通过切换 `FACESWAP_API` 环境变量来测试不同 API：

### PiAPI vs Magic Hour

| 指标 | PiAPI | Magic Hour |
|------|-------|------------|
| 处理时间 | 2-10分钟 | 几秒到几十秒 ⚡ |
| 质量 | 高质量 | 高质量 |
| 价格 | $0.004/帧 | 按帧计费 |
| 稳定性 | 偶有超时 | 较快稳定 |

### 如何切换测试

1. **测试 Magic Hour**:
   ```bash
   FACESWAP_API=magichour
   ```

2. **测试 PiAPI**:
   ```bash
   FACESWAP_API=piapi
   ```

3. **在 Vercel**:
   - 进入环境变量设置
   - 修改 `FACESWAP_API` 的值
   - 重新部署

## 🐛 故障排除

### 问题 1: 401 Unauthorized

**解决**:
- 检查 API Key 是否正确
- 确保格式为 `Bearer mhk_live_...`

### 问题 2: 422 Validation Error

**可能原因**:
- 视频 URL 无效
- 图片 URL 无效
- 参数格式错误

**解决**:
- 检查 URL 是否可访问
- 查看错误消息中的具体验证问题

### 问题 3: 视频源不支持 URL

如果收到错误说视频源必须是 "file" 格式，可能需要：
1. 先上传视频到 Magic Hour
2. 获取文件 ID
3. 使用文件 ID 而不是 URL

（当前代码尝试使用 URL，如果不行需要添加上传步骤）

## 📚 相关文档

- [Magic Hour API 文档](https://docs.magichour.ai/api-reference/video-projects/face-swap-video)
- [开发者中心](https://magichour.ai)

## ✅ 总结

Magic Hour 的优势：
- ⚡ **处理速度快**（几秒到几十秒）
- 🎨 **高质量输出**
- 💰 **按实际使用计费**
- 🔄 **失败自动退款**

立即开始使用 Magic Hour 进行视频换脸测试！

