import { Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import CategoryPage from './pages/CategoryPage'
import TemplateDetailPage from './pages/TemplateDetailPage'
import HowToPage from './pages/HowToPage'
import BestToolPage from './pages/BestToolPage'
import NoWatermarkPage from './pages/NoWatermarkPage'
import FAQPage from './pages/FAQPage'
import TikTokPage from './pages/TikTokPage'
import InstagramPage from './pages/InstagramPage'
import BirthdayPage from './pages/BirthdayPage'
import NotFoundPage from './pages/NotFoundPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/templates/:categorySlug" element={<CategoryPage />} />
      <Route path="/templates/:categorySlug/:templateSlug" element={<TemplateDetailPage />} />
      {/* 重定向旧URL到规范URL，避免重复内容 */}
      <Route path="/how-to-face-swap" element={<Navigate to="/how-to-create-face-swap-video" replace />} />
      <Route path="/how-to-create-face-swap-video" element={<HowToPage />} />
      <Route path="/best-face-swap-tool" element={<BestToolPage />} />
      <Route path="/no-watermark-face-swap" element={<NoWatermarkPage />} />
      <Route path="/faq" element={<FAQPage />} />
      {/* P2级别：长尾关键词页面 */}
      <Route path="/face-swap-for-tiktok" element={<TikTokPage />} />
      <Route path="/face-swap-for-instagram" element={<InstagramPage />} />
      <Route path="/birthday-face-swap-video" element={<BirthdayPage />} />
      {/* 404页面 - 必须放在最后 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes

