# 🔐 Vercel环境变量配置指南

## 📋 必需的环境变量

你的项目需要以下**2个必需的环境变量**：

### 1. `VMODEL_API_TOKEN`
- **用途**: VModel AI API的认证令牌
- **获取方式**: 
  1. 访问 https://vmodel.ai
  2. 登录你的账号
  3. 进入 API 设置页面
  4. 复制你的 API Token
- **格式**: 通常是一串长字符串（至少10个字符）

### 2. `IMGBB_API_KEY`
- **用途**: ImgBB图片上传服务的API密钥
- **获取方式**:
  1. 访问 https://api.imgbb.com/
  2. 注册账号（如果还没有）
  3. 获取你的API Key
- **格式**: 通常是一串字符

---

## 🔧 在Vercel中配置环境变量

### 步骤1：添加环境变量

1. 在Vercel项目配置页面，找到 **"Environment Variables"** 部分
2. 点击 **"Add More"** 按钮
3. 添加第一个变量：
   - **Key**: `VMODEL_API_TOKEN`
   - **Value**: 你的VModel API Token
   - 点击 **"-"** 按钮旁边的区域确认

4. 再次点击 **"Add More"** 按钮
5. 添加第二个变量：
   - **Key**: `IMGBB_API_KEY`
   - **Value**: 你的ImgBB API Key
   - 点击确认

### 步骤2：选择环境（重要！）

每个环境变量都需要选择应用环境：
- ✅ **Production** - 生产环境（必须）
- ✅ **Preview** - 预览环境（推荐）
- ✅ **Development** - 开发环境（可选）

**建议**: 至少勾选 **Production** 和 **Preview**

---

## 📝 可选环境变量

### `ALLOWED_ORIGINS`（可选）
- **用途**: 限制CORS允许的来源
- **格式**: 逗号分隔的域名列表，例如：`https://faceaihub.com,https://www.faceaihub.com`
- **默认值**: 如果不设置，将允许所有来源（`*`）
- **建议**: 生产环境建议设置，提高安全性

---

## ✅ 配置检查清单

- [ ] `VMODEL_API_TOKEN` 已添加
- [ ] `IMGBB_API_KEY` 已添加
- [ ] 两个变量都选择了 **Production** 环境
- [ ] 变量值正确（没有多余空格）
- [ ] 如果需要，添加了 `ALLOWED_ORIGINS`

---

## 🚨 常见问题

### 问题1：找不到API密钥
- **VModel API Token**: 登录 https://vmodel.ai → 进入API设置
- **ImgBB API Key**: 访问 https://api.imgbb.com/ → 注册并获取

### 问题2：部署后API调用失败
- 检查环境变量是否正确设置
- 确认选择了正确的环境（Production/Preview）
- 检查API密钥是否有效
- 查看Vercel部署日志中的错误信息

### 问题3：环境变量不生效
- 环境变量修改后，需要**重新部署**才能生效
- 在Vercel Dashboard中点击 **"Redeploy"** 按钮

---

## 📌 重要提示

1. **不要提交API密钥到Git仓库**
   - 环境变量应该只在Vercel中配置
   - 不要将 `.env` 文件提交到GitHub

2. **保护你的API密钥**
   - 不要分享你的API密钥
   - 定期轮换密钥（如果可能）

3. **测试环境变量**
   - 部署后，测试API调用是否正常
   - 查看Vercel函数日志确认

---

**配置完环境变量后，点击 "Deploy" 开始部署！**

