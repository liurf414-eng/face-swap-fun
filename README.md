# 趣换脸 - 有趣的表情包生成器

一个简单有趣的在线换脸应用，让你轻松制作搞笑表情包和视频！

## 功能特点

✅ 30个精选模板（表情包 + 小视频）
✅ 简单上传照片
✅ 一键生成换脸效果
✅ 直接下载结果

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173 即可使用

### 构建生产版本
```bash
npm run build
```

## 使用说明

1. **选择模板**: 从30个模板中选择你喜欢的
2. **上传照片**: 点击上传按钮，选择你的照片
3. **一键生成**: 点击生成按钮，等待处理完成
4. **下载保存**: 预览满意后下载到本地

## 下一步优化

### 集成真实换脸功能

目前使用的是模拟数据，要实现真实换脸效果，可以选择以下方案：

#### 方案1: 使用 Replicate API（推荐）
```javascript
// 安装 replicate 包
npm install replicate

// 在 App.jsx 中集成
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: '你的API密钥'
})

const handleGenerate = async () => {
  const output = await replicate.run(
    "yan-ops/face_swap:...",
    {
      input: {
        target_image: uploadedImage,
        swap_image: selectedTemplate.thumbnail
      }
    }
  )
  setResult({ url: output })
}
```

#### 方案2: 使用免费的 Face-API.js（浏览器端）
```bash
npm install face-api.js
```

#### 方案3: 准备真实素材
- 将 30 个真实的表情包/视频放入 `public/templates/` 目录
- 更新 `App.jsx` 中的 templates 数据源

## 技术栈

- React 19
- Vite 7
- 纯前端实现（无后端）

## 许可

MIT
