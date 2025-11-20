import { Routes, Route } from 'react-router-dom'
import App from './App'
import CategoryPage from './pages/CategoryPage'
import TemplateDetailPage from './pages/TemplateDetailPage'
import HowToPage from './pages/HowToPage'
import BestToolPage from './pages/BestToolPage'
import NoWatermarkPage from './pages/NoWatermarkPage'
import FAQPage from './pages/FAQPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/templates/:categorySlug" element={<CategoryPage />} />
      <Route path="/templates/:categorySlug/:templateSlug" element={<TemplateDetailPage />} />
      <Route path="/how-to-face-swap" element={<HowToPage />} />
      <Route path="/how-to-create-face-swap-video" element={<HowToPage />} />
      <Route path="/best-face-swap-tool" element={<BestToolPage />} />
      <Route path="/no-watermark-face-swap" element={<NoWatermarkPage />} />
      <Route path="/faq" element={<FAQPage />} />
    </Routes>
  )
}

export default AppRoutes

