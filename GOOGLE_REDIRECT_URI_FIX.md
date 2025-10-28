# 🔧 Google OAuth redirect_uri_mismatch 错误修复指南

## ❌ 错误信息

```
错误 400: redirect_uri_mismatch
禁止访问: 'FaceAI Meme' 的请求无效
```

## 📋 问题原因

**redirect_uri_mismatch** 表示：
- 代码中使用的 `redirect_uri` 与 Google Cloud Console 中配置的不匹配
- Google 拒绝了登录请求，因为 URL 不匹配

## 🎯 解决方案

### 步骤 1: 访问 Google Cloud Console

1. 打开：https://console.cloud.google.com/
2. 选择你的项目（FaceAI Meme）
3. 进入 **API 和服务** → **凭据**
4. 找到你的 OAuth 2.0 客户端 ID：`457199816989-e16gt3va81kalp0nphhqf0rj0v39ij0b.apps.googleusercontent.com`
5. 点击该客户端 ID 进行编辑

### 步骤 2: 添加已授权的重定向 URI

在编辑页面的 **"已授权的重定向 URI"** 部分，点击 **"+ 添加 URI"** 添加以下 URI：

#### 🚀 生产环境（最重要）
```
https://faceaihub.com
https://www.faceaihub.com
```

#### 🌐 Vercel 域名（如果有）
```
https://your-app-name.vercel.app
```
（将 `your-app-name` 替换为你的实际 Vercel 应用名称）

#### 🧪 测试环境（本地开发）
```
http://localhost:5176
http://localhost:5173
http://localhost:3000
```

### 步骤 3: 保存配置

1. 点击 **"保存"**
2. 等待几秒钟让配置生效

---

## ✅ 验证修复

配置完成后：

1. **等待 1-2 分钟**（Google 配置需要时间生效）
2. 刷新网站
3. 再次点击 "Log In" 按钮
4. 应该能正常弹出 Google 登录窗口 ✅

---

## 🔍 如何找到你的实际 Redirect URI

### 方法 1: 检查代码

在 `src/App.jsx` 中，登录按钮使用的 redirect URI 是：

```javascript
const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=457199816989-e16gt3va81kalp0nphhqf0rj0v39ij0b.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code&scope=openid%20email%20profile`
```

这里的 `${window.location.origin}` 会替换为：
- 生产环境：`https://faceaihub.com`
- 本地环境：`http://localhost:5176`

### 方法 2: 在浏览器检查

1. 打开网站
2. 按 F12 打开开发者工具
3. 查看 Console 标签页
4. 点击 "Log In" 按钮
5. 查看 Network 标签页中的请求
6. 找到 `redirect_uri` 参数的值

---

## 📝 完整配置示例

在 Google Cloud Console 中，"已授权的重定向 URI" 应该包含：

```
已授权的 JavaScript 源:
1. https://faceaihub.com
2. https://www.faceaihub.com
3. http://localhost
4. http://localhost:5176
5. http://localhost:5173

已授权的重定向 URI:
1. https://faceaihub.com
2. https://www.faceaihub.com
3. http://localhost:5176
4. http://localhost:5173
5. http://localhost:3000
```

**重要提示**：
- ✅ JavaScript 源不需要端口号（`http://localhost` 而不是 `http://localhost:5176`）
- ✅ 重定向 URI 需要完整的 URL（包括端口号，如果需要）
- ✅ 两者都需要添加相同的域名

---

## ⚠️ 常见错误

### 错误 1: 添加了错误的 URI
**错误**: `https://faceaihub.com/`
**正确**: `https://faceaihub.com` （末尾不要有斜杠）

### 错误 2: 忘记添加生产域名
**错误**: 只添加了 `localhost`
**正确**: 同时添加生产域名和本地域名

### 错误 3: JavaScript 源使用带端口的 URL
**错误**: `http://localhost:5176`
**正确**: `http://localhost`（JavaScript 源不使用端口）

---

## 🧪 测试登录

配置完成后，测试步骤：

1. 访问你的网站
2. 点击 "Log In" 按钮
3. 应该弹出 Google 登录窗口 ✅
4. 选择 Google 账号
5. 授权应用
6. 应该成功登录 ✅

---

## 📞 如果还是不行

如果配置后仍然出现错误：

1. 确认在 Google Cloud Console 中点击了 **"保存"**
2. 等待 **5-10 分钟**（Google 配置需要时间）
3. 清除浏览器缓存并刷新页面
4. 检查实际使用的 redirect_uri（使用步骤 2）

如果问题仍然存在，请提供：
- 你在 Google Cloud Console 中配置的完整 URI 列表
- 浏览器控制台中的错误信息

