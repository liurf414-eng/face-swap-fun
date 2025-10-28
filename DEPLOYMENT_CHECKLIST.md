# 🚀 部署检查清单

## ✅ 已完成

- [x] 代码已推送到 GitHub
- [x] 包含最新的 Google 登录功能
- [x] vercel.json 配置已存在
- [x] 环境变量配置已定义

## 🔍 需要检查的事项

### 1. Vercel 项目连接状态

登录 [Vercel Dashboard](https://vercel.com/dashboard) 检查：
- [ ] 项目是否已连接到 GitHub 仓库 `liurf414-eng/face-swap-fun`
- [ ] 最新部署是否基于 commit `74bccd5`
- [ ] 部署状态是否为 "Success"

### 2. 环境变量配置

在 Vercel 项目设置中检查以下环境变量：
- [ ] `REPLICATE_API_TOKEN` - 已配置
- [ ] `AIFACESWAP_API_KEY` - 已配置（如果需要）
- [ ] `GOOGLE_CLIENT_ID` - 需要在 Vercel 中添加
  - 值：`457199816989-e16gt3va81kalp0nphhqf0rj0v39ij0b.apps.googleusercontent.com`

### 3. Google OAuth 配置

在 Google Cloud Console 检查：
- [ ] 已授权的 JavaScript 源包含生产域名：
  - `https://faceaihub.com`
  - `https://www.faceaihub.com`
- [ ] 已授权的重定向 URI 包含生产域名
- [ ] 已添加测试用户（如果需要）

### 4. 网站功能验证

访问网站 https://faceaihub.com 测试：
- [ ] 网站可以正常访问
- [ ] 右上角显示 "Log In" 按钮
- [ ] 点击 Log In 按钮可以弹出 Google 登录窗口
- [ ] 视频模板正常显示
- [ ] 换脸功能正常工作

## 🔧 如果遇到问题

### 问题：部署失败
**解决**：检查 Vercel 部署日志，查看错误信息

### 问题：网站显示旧版本
**解决**：
1. 在 Vercel Dashboard 中手动触发重新部署
2. 清除浏览器缓存
3. 等待几分钟后再次访问

### 问题：Google 登录不工作
**解决**：
1. 确认 Google Cloud Console 中已添加生产域名
2. 确认 Client ID 在 Vercel 环境变量中正确配置（如果需要）
3. 检查浏览器控制台是否有错误信息

### 问题：CORS 错误
**解决**：
1. 检查 `server/index.js` 中的 CORS 配置
2. 确认允许的源包含你的域名

## 📊 部署状态检查命令

如果你想通过命令行检查部署状态：

```bash
# 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 登录 Vercel
vercel login

# 查看项目信息
vercel inspect

# 查看部署列表
vercel list
```

## 📞 需要帮助？

如果遇到部署问题：
1. 查看 Vercel 部署日志
2. 检查环境变量配置
3. 验证 Google OAuth 设置
4. 查看浏览器控制台错误信息

