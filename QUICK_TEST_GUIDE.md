# 🚀 快速测试指南

## 1. 检查开发服务器

开发服务器应该已经在运行。如果没有，请运行：

```bash
npm run dev
```

默认地址：`http://localhost:5173`

---

## 2. 基础功能测试

### ✅ 首页测试
1. 打开浏览器访问 `http://localhost:5173`
2. 检查以下内容：
   - [ ] 页面正常加载
   - [ ] Hero区域显示正常（"AI Face Swap Video Generator"）
   - [ ] 模板列表显示正常
   - [ ] 搜索框可以输入
   - [ ] 可以点击模板卡片

### ✅ 搜索功能测试
在搜索框输入以下关键词测试：
- `laughing` - 应该显示相关模板
- `dance` - 应该显示舞蹈相关模板
- `couple` - 应该显示双人模板
- `tiktok` - 应该显示TikTok相关模板
- `magic` - 应该显示魔法效果模板

### ✅ 分类页面测试
在浏览器地址栏直接访问以下URL：

1. **Emotional Reactions**
   ```
   http://localhost:5173/templates/emotional-reactions
   ```
   - [ ] 页面正常加载
   - [ ] 显示9个模板
   - [ ] SEO标题正确

2. **Burlesque Dance**
   ```
   http://localhost:5173/templates/burlesque-dance
   ```
   - [ ] 页面正常加载
   - [ ] 显示6个模板

3. **Duo Interaction**
   ```
   http://localhost:5173/templates/duo-interaction
   ```
   - [ ] 页面正常加载
   - [ ] 显示6个模板

### ✅ 模板详情页测试
访问以下模板详情页：

1. **Laughing Face Swap**
   ```
   http://localhost:5173/templates/emotional-reactions/man-covered-mouth-laughed
   ```
   - [ ] 页面正常加载
   - [ ] 显示视频预览
   - [ ] 显示模板信息
   - [ ] 显示相关模板

2. **Girl Dance**
   ```
   http://localhost:5173/templates/burlesque-dance/girl-stand-dance
   ```
   - [ ] 页面正常加载
   - [ ] 显示视频预览

3. **Couple Touching**
   ```
   http://localhost:5173/templates/duo-interaction/couple-touching
   ```
   - [ ] 页面正常加载
   - [ ] 显示视频预览

### ✅ SEO页面测试
访问以下SEO页面：

1. **How To Page**
   ```
   http://localhost:5173/how-to-face-swap
   ```
   - [ ] 页面正常加载
   - [ ] 显示教程内容

2. **Best Tool Page**
   ```
   http://localhost:5173/best-face-swap-tool
   ```
   - [ ] 页面正常加载

3. **No Watermark Page**
   ```
   http://localhost:5173/no-watermark-face-swap
   ```
   - [ ] 页面正常加载

4. **FAQ Page**
   ```
   http://localhost:5173/faq
   ```
   - [ ] 页面正常加载

---

## 3. 检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 检查是否有错误信息

**常见错误：**
- ❌ `Cannot read property 'xxx' of undefined` - 数据加载问题
- ❌ `Route not found` - 路由配置问题
- ❌ `Module not found` - 导入路径问题

---

## 4. 检查网络请求

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 刷新页面
4. 检查以下请求：
   - [ ] `/templates.json` - 应该返回200状态码
   - [ ] 视频资源 - 应该正常加载
   - [ ] 没有404错误

---

## 5. 快速问题排查

### 问题：页面显示空白
**解决方案：**
1. 检查浏览器控制台错误
2. 检查 `main.jsx` 是否正确配置
3. 检查 `AppRoutes.jsx` 路由配置

### 问题：路由不工作
**解决方案：**
1. 检查 `main.jsx` 是否包含 `BrowserRouter`
2. 检查 `AppRoutes.jsx` 是否正确导入
3. 检查路由路径是否正确

### 问题：模板详情页404
**解决方案：**
1. 检查模板slug生成是否正确
2. 检查 `TemplateDetailPage.jsx` 是否正确加载数据
3. 检查模板文件名是否正确

### 问题：搜索功能不工作
**解决方案：**
1. 检查 `App.jsx` 中的搜索逻辑
2. 检查模板数据是否正确加载
3. 检查关键词匹配逻辑

---

## 6. 测试结果

### ✅ 所有功能正常
如果所有测试都通过，网站可以正常使用！

### ⚠️ 部分功能有问题
记录问题并反馈：
1. 问题描述：___________
2. 复现步骤：___________
3. 错误信息：___________

### ❌ 严重问题
如果网站无法启动或出现严重错误：
1. 检查Node版本（需要Node 18+）
2. 检查依赖是否正确安装：`npm install`
3. 检查端口是否被占用
4. 查看完整错误信息

---

## 📝 测试检查清单

- [ ] 开发服务器启动成功
- [ ] 首页正常加载
- [ ] 搜索功能正常
- [ ] 分类页面正常
- [ ] 模板详情页正常
- [ ] SEO页面正常
- [ ] 浏览器控制台无错误
- [ ] 网络请求正常

---

**测试完成后，请将结果反馈！**

