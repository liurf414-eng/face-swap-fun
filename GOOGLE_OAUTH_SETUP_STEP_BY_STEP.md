# Google OAuth 配置步骤（详细指南）

## 📋 准备工作

确保你有以下信息：
- ✅ 一个 Gmail 账号
- ✅ 域名（或者使用 `localhost` 测试）
- ✅ 访问 [Google Cloud Console](https://console.cloud.google.com/) 的权限

---

## 🚀 第一步：创建 Google Cloud 项目

1. **访问 Google Cloud Console**
   - 打开浏览器，访问：https://console.cloud.google.com/
   - 使用你的 Gmail 账号登录

2. **创建新项目**
   - 点击页面顶部的项目下拉菜单
   - 点击 **"新建项目"**（New Project）
   - 项目名称填写：`FaceAI Meme`
   - 点击 **"创建"**（Create）

3. **等待项目创建完成**（几秒钟）

---

## 🔧 第二步：配置 OAuth 同意屏幕

1. **进入 API 和服务**
   - 在左侧菜单中，找到 **"API 和服务"**（APIs & Services）
   - 点击 **"OAuth 同意屏幕"**（OAuth consent screen）

2. **选择用户类型**
   - 选择 **"外部"**（External）← 这个很重要！
   - 点击 **"创建"**（Create）

3. **填写应用信息**
   ```
   应用名称: FaceAI Meme
   用户支持电子邮件: [你的 Gmail 邮箱]
   应用徽标: （可选，跳过）
   应用首页链接: https://faceaihub.com（或你的域名）
   应用隐私政策链接: https://faceaihub.com/privacy（可选）
   应用服务条款链接: https://faceaihub.com/terms（可选）
   开发者联系信息: [你的 Gmail 邮箱]
   ```

4. **添加作用域（Scopes）**
   - 点击 **"添加或移除作用域"**
   - 滚动到底部，勾选以下作用域：
     - `.../auth/userinfo.email`（查看你的电子邮件地址）
     - `.../auth/userinfo.profile`（查看你的基本个人资料）
   - 点击 **"更新"**
   - 点击 **"保存并继续"**

5. **添加测试用户**（开发阶段必需）
   - 点击 **"添加用户"**
   - 输入你自己的 Gmail 地址
   - 点击 **"添加"**
   - 点击 **"保存并继续"**

6. **查看摘要**
   - 点击 **"返回到信息中心"**

---

## 🔑 第三步：创建 OAuth 客户端 ID

1. **进入凭据页面**
   - 在左侧菜单中，点击 **"凭据"**（Credentials）
   - 点击 **"+ 创建凭据"**（+ CREATE CREDENTIALS）
   - 选择 **"OAuth 客户端 ID"**

2. **如果提示"配置 OAuth 同意屏幕"**
   - 点击 **"配置 OAuth 同意屏幕"**
   - 按照第二步重新配置

3. **创建 OAuth 客户端 ID**
   - **应用类型**: 选择 **"Web 应用"**（Web application）
   - **名称**: `FaceAI Meme Web Client`

4. **已授权的 JavaScript 源**
   添加以下 URL（每行一个）：
   ```
   http://localhost
   http://localhost:5176
   http://localhost:5173
   http://localhost:3000
   https://faceaihub.com
   https://www.faceaihub.com
   ```

5. **已授权的重定向 URI**
   添加以下 URL（每行一个）：
   ```
   http://localhost:5176
   http://localhost:5173
   http://localhost:3000
   https://faceaihub.com
   https://www.faceaihub.com
   ```

6. **创建客户端**
   - 点击 **"创建"**
   - **重要**: 会弹出一个对话框，显示你的 **Client ID** 和 **Client Secret**
   - **立即复制这些信息！**

---

## 📝 第四步：更新项目代码

1. **获取 Client ID**
   - 从第三步创建的对话框中复制 **Client ID**
   格式类似：`123456789-abcdefghijklmnop.apps.googleusercontent.com`

2. **更新代码**
   - 打开项目中的 `src/App.jsx`
   - 找到第 183 行附近的代码：
   ```javascript
   client_id: 'YOUR_GOOGLE_CLIENT_ID', // 需要替换为真实的 Client ID
   ```
   - 将 `'YOUR_GOOGLE_CLIENT_ID'` 替换为你的真实 Client ID
   - 保存文件

---

## 🧪 第五步：测试登录功能

1. **启动项目**
   ```bash
   npm run dev
   ```

2. **测试登录**
   - 打开浏览器，访问 http://localhost:5176
   - 点击右上角的 **"Log In"** 按钮
   - 应该会弹出 Google 登录窗口
   - 选择一个 Gmail 账号登录
   - 登录成功后，页面会显示你的头像和昵称

---

## ⚠️ 常见问题

### Q: 提示"此应用无法验证"
**A**: 这是因为你的应用还在测试模式。需要添加测试用户到 OAuth 同意屏幕。

### Q: 点击登录没有反应
**A**: 
- 检查浏览器控制台是否有错误
- 确认 Client ID 是否正确
- 确认 Google API 脚本已加载

### Q: "redirect_uri_mismatch" 错误
**A**: 检查 OAuth 客户端设置中，是否正确添加了所有需要的 URI（包括 localhost）。

### Q: 如何添加其他用户？
**A**: 在 OAuth 同意屏幕中添加更多测试用户。

---

## 🚀 生产环境部署

### 部署到 Vercel 后

1. **更新 OAuth 设置**
   - 访问 Google Cloud Console
   - 进入 OAuth 客户端设置
   - 添加生产域名到已授权的 JavaScript 源
   - 添加生产域名到已授权的重定向 URI

2. **发布应用**
   - 完成 OAuth 同意屏幕的所有检查清单
   - 点击 **"发布应用"**（Publish App）
   - 选择所有作用域
   - 提交审核（如果不审核，只能测试用户使用）

---

## 📞 需要帮助？

如果遇到问题：
1. 检查浏览器控制台错误
2. 确认 Client ID 格式正确
3. 确认所有 URI 都添加了
4. 确认你使用的是测试用户列表中的邮箱

