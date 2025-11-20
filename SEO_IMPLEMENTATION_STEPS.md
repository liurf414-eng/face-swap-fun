# 🚀 SEO优化实施步骤

## 第一步：安装必要的依赖

```bash
npm install react-router-dom react-helmet-async
```

## 第二步：更新 main.jsx 添加路由和Helmet Provider

更新 `src/main.jsx`：

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
```

## 第三步：更新 App.jsx 添加路由配置

在 `src/App.jsx` 文件开头添加路由导入：

```jsx
import { Routes, Route, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
```

然后导入页面组件：

```jsx
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import FAQPage from './pages/FAQPage'
import HowToPage from './pages/HowToPage'
import BestToolPage from './pages/BestToolPage'
import NoWatermarkPage from './pages/NoWatermarkPage'
```

将现有的 App 组件内容移到 `HomePage.jsx`，然后在 App.jsx 中添加路由：

```jsx
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/templates/:categorySlug" element={<CategoryPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/how-to-create-face-swap-video" element={<HowToPage />} />
      <Route path="/best-face-swap-video-tool" element={<BestToolPage />} />
      <Route path="/no-watermark-face-swap" element={<NoWatermarkPage />} />
    </Routes>
  )
}
```

## 第四步：创建 HomePage.jsx

将现有的 `App.jsx` 中的主逻辑复制到 `src/pages/HomePage.jsx`，并添加 SEO meta 标签。

## 第五步：更新 sitemap.xml

更新 `public/sitemap.xml` 包含所有新页面。

## 第六步：添加内部链接

在现有页面中添加指向新SEO页面的内部链接，例如：
- 首页添加链接到教程页面
- 模板页面添加链接到相关分类页面
- FAQ页面添加链接到教程页面

## 第七步：测试

1. 运行 `npm run dev` 测试所有路由
2. 检查每个页面的 meta 标签
3. 验证结构化数据
4. 测试内部链接

## 第八步：部署

1. 运行 `npm run build`
2. 提交代码到 Git
3. Vercel 会自动部署

## 注意事项

- 确保所有页面都有唯一的 title 和 description
- 每个页面都应该有 canonical URL
- 添加结构化数据（Schema.org）
- 确保内部链接合理分布
- 定期更新 sitemap.xml

