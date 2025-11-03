# 快速模式使用指南

## 概述

为了解决 API 处理速度慢的问题，我们新增了**快速图片换脸模式**，可以在 10-30 秒内完成处理，而不是等待 5-10 分钟。

## 两种模式对比

### 快速模式（图片换脸）
- ⚡ **处理时间**: 10-30 秒
- 📸 **输入类型**: 静态图片（JPG、PNG、WebP）
- ✅ **适用场景**: 表情包、头像、单张图片
- 🔧 **技术**: Replicate 图片换脸模型 (`logofusion/face-swap`)

### 标准模式（视频换脸）
- ⏱️ **处理时间**: 5-10 分钟
- 🎬 **输入类型**: 视频/GIF/MP4
- ✅ **适用场景**: 视频、动画 GIF
- 🔧 **技术**: Replicate 视频换脸模型 (`wan-video/wan-2.2-animate-replace`) 或 AIFaceSwap API

## 自动检测机制

系统会自动检测输入类型：

1. **自动检测为图片**：
   - Base64 图片数据 (`data:image/...`)
   - 图片 URL（以 `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` 结尾）

2. **自动检测为视频**：
   - 视频 URL（`.mp4`, `.mov`, `.webm` 等）
   - GIF URL（`.gif`）

3. **手动指定模式**：
   - 可以在请求中添加 `mode: 'fast'` 强制使用快速模式

## API 使用示例

### 自动检测（推荐）

```javascript
// 前端代码会自动检测，无需手动指定
const response = await fetch('/api/face-swap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetImage: 'data:image/jpeg;base64,...', // 图片 → 自动使用快速模式
    sourceImage: 'data:image/png;base64,...'
  })
})
```

### 手动指定快速模式

```javascript
const response = await fetch('/api/face-swap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetImage: targetImageUrl,
    sourceImage: sourceImageUrl,
    mode: 'fast' // 强制使用快速模式
  })
})
```

## 性能优化建议

### 对于图片模板
如果你的模板是静态图片，系统会自动使用快速模式，用户可以在 10-30 秒内获得结果。

### 对于视频模板
如果需要更快的视频处理，可以考虑：
1. 降低视频时长（减少 `duration` 参数）
2. 使用 GIF 替代视频（某些情况下可以自动使用快速模式）
3. 预先处理视频为较短片段

## 前端集成

前端代码已经自动支持快速模式。当检测到图片输入时，会显示：
```
Fast mode: Processing image (10-30 seconds)...
```

当检测到视频输入时，会显示：
```
Processing video (5-10 minutes)...
```

## 技术细节

### 快速模式使用的模型
- **模型**: `logofusion/face-swap:42e5134d7f0bf93f90ba64e3e4f97ea3c55adefe`
- **输入**: `source_image` (用户照片), `target_image` (目标图片)
- **输出**: 换脸后的图片 URL

### 标准模式使用的模型
- **Replicate**: `wan-video/wan-2.2-animate-replace`
- **AIFaceSwap**: 其视频换脸 API

## 常见问题

### Q: 为什么快速模式只支持图片？
A: 视频换脸需要逐帧处理，计算量远大于单张图片。快速模式的图片换脸模型专门针对单帧优化，所以速度快。

### Q: 能否让视频也快速处理？
A: 视频换脸本身就需要更多计算资源，5-10 分钟是行业标准。可以考虑：
- 使用更短的视频（2-3秒）
- 降低视频分辨率
- 使用专业硬件加速服务

### Q: 快速模式的质量如何？
A: 快速模式使用 Replicate 的专业图片换脸模型，质量与视频换脸的单帧质量相当，适合静态表情包和头像场景。

## 配置要求

快速模式需要：
- ✅ `REPLICATE_API_TOKEN` 环境变量
- ✅ `IMGBB_API_KEY` 环境变量（用于图片上传）

标准模式需要：
- ✅ `REPLICATE_API_TOKEN` 或 `AIFACESWAP_API_KEY`
- ✅ `IMGBB_API_KEY`

## 总结

通过自动检测和快速模式，大部分用户（使用图片模板）可以在 10-30 秒内获得结果，大大改善了用户体验！

