// 简化的 Vercel Serverless Function
// Vercel 会自动检测并使用 server/index.js 作为 API 路由
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'API is working',
    timestamp: new Date().toISOString()
  })
}

