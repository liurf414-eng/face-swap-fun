# 🧪 网站功能测试清单

## ✅ 基础功能测试

### 1. 开发服务器启动
- [ ] 服务器成功启动
- [ ] 无编译错误
- [ ] 控制台无错误信息

### 2. 首页功能
- [ ] 首页正常加载
- [ ] Hero区域显示正常
- [ ] 模板列表正常显示
- [ ] 搜索功能正常
- [ ] 模板选择功能正常
- [ ] 图片上传功能正常
- [ ] 视频生成功能正常

### 3. 路由功能
- [ ] 首页路由 `/` 正常
- [ ] 分类页面路由 `/templates/:categorySlug` 正常
- [ ] 模板详情页路由 `/templates/:categorySlug/:templateSlug` 正常
- [ ] SEO页面路由正常（how-to, best-tool, no-watermark, faq）

### 4. 分类页面测试
测试以下分类页面：
- [ ] `/templates/emotional-reactions`
- [ ] `/templates/burlesque-dance`
- [ ] `/templates/duo-interaction`
- [ ] `/templates/magic-effects`
- [ ] `/templates/sci-fi-effects`
- [ ] `/templates/slapstick-comedy`
- [ ] `/templates/style-makeovers`

### 5. 模板详情页测试
测试以下模板详情页：
- [ ] `/templates/emotional-reactions/laughing-face-swap-video`
- [ ] `/templates/burlesque-dance/girl-dance-face-swap-video`
- [ ] `/templates/duo-interaction/couple-touching-face-swap-video`

### 6. SEO功能测试
- [ ] 页面标题正确显示
- [ ] Meta描述正确显示
- [ ] 结构化数据正确
- [ ] Open Graph标签正确
- [ ] 面包屑导航正常

### 7. 搜索功能测试
测试以下搜索关键词：
- [ ] "laughing" - 应该找到相关模板
- [ ] "dance" - 应该找到舞蹈相关模板
- [ ] "couple" - 应该找到双人模板
- [ ] "tiktok" - 应该找到TikTok相关模板
- [ ] "magic" - 应该找到魔法效果模板

### 8. 响应式设计测试
- [ ] 桌面端显示正常
- [ ] 平板端显示正常
- [ ] 移动端显示正常

---

## 🔍 检查步骤

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问首页**
   - 打开浏览器访问 `http://localhost:5173`
   - 检查页面是否正常加载

3. **测试路由**
   - 点击分类链接
   - 点击模板卡片
   - 使用浏览器前进/后退按钮

4. **测试搜索**
   - 在搜索框输入关键词
   - 检查搜索结果是否正确

5. **检查控制台**
   - 打开浏览器开发者工具
   - 检查Console是否有错误
   - 检查Network请求是否正常

---

## 🐛 常见问题排查

### 问题1: 路由不工作
- 检查 `main.jsx` 是否正确配置了 `BrowserRouter`
- 检查 `AppRoutes.jsx` 路由配置是否正确
- 检查 `App.jsx` 是否被正确导入

### 问题2: 模板详情页404
- 检查模板slug生成是否正确
- 检查分类slug映射是否正确
- 检查 `TemplateDetailPage.jsx` 是否正确加载模板数据

### 问题3: SEO标签不显示
- 检查 `HelmetProvider` 是否正确配置
- 检查页面组件是否正确使用 `Helmet`
- 检查页面是否正确渲染

### 问题4: 搜索功能不工作
- 检查搜索逻辑是否正确
- 检查模板数据是否正确加载
- 检查关键词匹配逻辑

---

## 📝 测试结果记录

### 测试时间：___________

### 测试环境：
- 浏览器：___________
- 操作系统：___________
- Node版本：___________

### 测试结果：
- [ ] 所有功能正常
- [ ] 部分功能有问题（详见下方）
- [ ] 严重问题（详见下方）

### 问题记录：
1. ___________
2. ___________
3. ___________

---

**测试完成后，请将结果反馈给开发人员**

