# Google 登录设置指南

## 📋 概述

网站已集成 Google 登录功能，用户可以通过 Google 账号登录，创建的视频会自动保存到"我的视频"页面。

## 🔧 配置步骤

### 1. 创建 Google OAuth 2.0 客户端

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择或创建项目
3. 导航到 **API 和服务** > **凭据**
4. 点击 **创建凭据** > **OAuth 2.0 客户端 ID**
5. 如果提示配置 OAuth 同意屏幕，请先完成配置：
   - 用户类型选择：外部
   - 填写应用名称：FaceAI Meme
   - 填写支持邮箱
   - 添加 scopes: `profile`, `email`
   - 添加测试用户（你的 Gmail 地址）
6. 创建 OAuth 客户端：
   - 应用类型：Web 应用
   - 名称：FaceAI Meme Web Client
   - 已授权的 JavaScript 源：
     - `http://localhost:5176`
     - `https://faceaihub.com`
     - （你的其他域名）
   - 已授权的重定向 URI：
     - `http://localhost:5176`
     - `https://faceaihub.com`
7. 获取 **客户端 ID**（格式：`xxxxx.apps.googleusercontent.com`）

### 2. 更新项目配置

在 `src/App.jsx` 中找到以下代码：

```javascript
window.google.accounts.id.initialize({
  client_id: 'YOUR_GOOGLE_CLIENT_ID', // 替换这里
  callback: handleGoogleSignIn,
  auto_select: false,
  cancel_on_tap_outside: true
})
```

将 `'YOUR_GOOGLE_CLIENT_ID'` 替换为你的真实客户端 ID。

## 🎯 功能说明

### 已实现功能

✅ Google 登录按钮（右上角）  
✅ 用户信息显示（头像+昵称）  
✅ "我的视频"入口按钮  
✅ 自动保存生成的视频到"我的"列表  
✅ 本地存储（localStorage）  
✅ 登出功能  

### 技术栈

- Google Identity Services (GIS)
- React Hooks (useState, useEffect)
- localStorage API
- 响应式设计

## 🔒 数据存储

### 本地存储结构

```javascript
// localStorage 键
- 'user': 用户信息
  {
    email: "user@gmail.com",
    name: "User Name",
    picture: "https://...",
    sub: "google_user_id"
  }

- 'myVideos': 视频列表
  [
    {
      id: timestamp,
      url: "video_url",
      template: "template_name",
      timestamp: "2025-01-01T00:00:00.000Z",
      userId: "google_user_id"
    }
  ]
```

## 🚀 生产环境部署

1. 在 Google Cloud Console 中添加生产域名到已授权的 JavaScript 源
2. 更新 `client_id` 为生产环境的值
3. 确保域名已启用 HTTPS

## 📱 移动端适配

- 响应式布局
- 小屏幕自动隐藏用户名
- 触屏优化

## ⚠️ 注意事项

1. 需要 HTTPS 环境（生产环境）
2. 测试时使用 localhost 或使用 Google OAuth 测试用户
3. 生产环境前移除所有测试用户限制

## 🐛 故障排除

### 登录按钮不显示
- 检查 Google API 脚本是否加载
- 检查 client_id 是否正确
- 打开浏览器控制台查看错误

### 登录后视频不保存
- 检查 localStorage 是否可用
- 查看浏览器控制台错误信息

### "我的视频"显示空
- 确认已登录
- 确认已生成视频
- 检查 localStorage 数据

## 📞 需要帮助？

如果遇到问题，请检查：
1. Google Cloud Console 配置
2. 浏览器控制台错误
3. 网络连接状态

