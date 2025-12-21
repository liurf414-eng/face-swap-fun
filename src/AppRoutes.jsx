import { Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import CategoryPage from './pages/CategoryPage'
import TemplateDetailPage from './pages/TemplateDetailPage'
import HowToPage from './pages/HowToPage'
import BestToolPage from './pages/BestToolPage'
import NoWatermarkPage from './pages/NoWatermarkPage'
import FAQPage from './pages/FAQPage'
import NotFoundPage from './pages/NotFoundPage'

function AppRoutes() {
  return (
    <Routes>
      {/* 主要应用路由 - 由App组件内部处理内容渲染 */}
      <Route path="/" element={<App />} />
      <Route path="/ai-studio/text-to-image" element={<App />} />
      <Route path="/ai-studio/text-to-video" element={<App />} />
      <Route path="/ai-studio/image-to-video" element={<App />} />
      <Route path="/ai-studio" element={<Navigate to="/ai-studio/text-to-image" replace />} />
      <Route path="/create-from-community" element={<App />} />
      <Route path="/my-videos" element={<App />} />
      <Route path="/community" element={<App />} />
      
      {/* P2级别：长尾关键词页面 - 现在集成到App布局中 */}
      <Route path="/face-swap-for-tiktok" element={<App />} />
      <Route path="/face-swap-for-instagram" element={<App />} />
      <Route path="/birthday-face-swap-video" element={<App />} />
      <Route path="/face-swap-gif-maker" element={<App />} />
      <Route path="/face-swap-video-maker" element={<App />} />

      {/* 独立页面 (暂时保持无Sidebar状态，或者是全屏落地页) */}
      <Route path="/templates/:categorySlug" element={<CategoryPage />} />
      <Route path="/templates/:categorySlug/:templateSlug" element={<TemplateDetailPage />} />
      
      {/* 重定向旧URL到规范URL，避免重复内容 */}
      <Route path="/how-to-face-swap" element={<Navigate to="/how-to-create-face-swap-video" replace />} />
      <Route path="/how-to-create-face-swap-video" element={<HowToPage />} />
      <Route path="/best-face-swap-tool" element={<BestToolPage />} />
      <Route path="/no-watermark-face-swap" element={<NoWatermarkPage />} />
      <Route path="/faq" element={<FAQPage />} />

      {/* 404页面 - 必须放在最后 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
