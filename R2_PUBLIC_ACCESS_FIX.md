# 🔧 Cloudflare R2 视频模板无法显示 - 解决方案

## ❌ 问题
视频模板上传成功，但网站上无法显示视频。测试显示 `401 Unauthorized`。

## 🔍 原因
Cloudflare R2 存储桶的**公共访问权限未启用**。

## 🎯 解决方案

### 方法 1：启用 R2 公共访问（推荐）

#### 步骤 1：登录 Cloudflare Dashboard
1. 访问：https://dash.cloudflare.com/
2. 登录你的账号

#### 步骤 2：进入 R2 存储管理
1. 在左侧菜单中找到 "**R2**"
2. 点击进入 R2 管理页面

#### 步骤 3：选择存储桶
1. 找到你的存储桶：`face-swap-templates`
2. 点击进入存储桶详情

#### 步骤 4：启用公共访问
1. 点击 "**Settings**" 标签
2. 找到 "**Public access**" 部分
3. 点击 "**Allow Access**" 或 "**Enable**"
4. 确认启用

#### 步骤 5：验证
访问以下 URL，应该可以看到视频：
```
https://pub-e16bf760ac66d217a5a6cf474a895357.r2.dev/templates/video.mp4
```

---

### 方法 2：使用自定义域名（可选）

如果你有自定义域名，可以：

1. **绑定域名到 R2**
   - 在 Cloudflare R2 中设置自定义域名
   - 配置 DNS CNAME 记录

2. **更新 templates.json**
   - 使用自定义域名替换 `pub-` URL
   - 重新生成 templates.json

---

## 📊 验证视频是否可用

### 在浏览器中测试
访问以下任意一个视频 URL：
```
https://pub-e16bf760ac66d217a5a6cf474a895357.r2.dev/templates/video.mp4
https://pub-e16bf760ac66d217a5a6cf474a895357.r2.dev/templates/replicate-prediction-13g23vf881rm80ct08f8h9ag50.mp4
```

### 期望结果
- ✅ 200 OK - 视频可以播放
- ❌ 401 Unauthorized - 公共访问未启用
- ❌ 403 Forbidden - 权限配置有问题
- ❌ 404 Not Found - 文件路径错误

---

## 🔄 如果问题仍然存在

### 检查清单
- [ ] R2 存储桶已启用公共访问
- [ ] 使用正确的 URL 格式（`pub-{accountId}.r2.dev`）
- [ ] 文件确实已上传到 R2
- [ ] 浏览器控制台没有 CORS 错误

### 重新上传
如果以上都确认无误，可以尝试重新上传：
```bash
npm run upload-templates
```

---

## 📝 技术细节

### R2 URL 格式
```
https://pub-{ACCOUNT_ID}.r2.dev/{BUCKET_NAME}/{FILE_PATH}
```

你的配置：
- Account ID: `e16bf760ac66d217a5a6cf474a895357`
- Bucket: `face-swap-templates`
- 路径: `templates/video.mp4`

完整 URL: `https://pub-e16bf760ac66d217a5a6cf474a895357.r2.dev/templates/video.mp4`

---

## 🆘 需要帮助？

如果按照上述步骤操作后仍然无法访问视频，请提供：
1. R2 Dashboard 截图
2. 视频 URL 测试结果
3. 浏览器控制台错误信息

