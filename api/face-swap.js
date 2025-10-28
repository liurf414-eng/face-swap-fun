import 'dotenv/config'
import fetch from 'node-fetch'
import Replicate from 'replicate'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN

// 初始化 Replicate 客户端
const replicate = REPLICATE_API_TOKEN ? new Replicate({ auth: REPLICATE_API_TOKEN }) : null

export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { targetImage, sourceImage } = req.body

    if (!targetImage || !sourceImage) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: targetImage and sourceImage'
      })
    }

    console.log('🎬 Starting face swap request...')

    if (!REPLICATE_API_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'REPLICATE_API_TOKEN is not defined'
      })
    }

    // 直接使用 base64 数据，无需上传到图床
    console.log('📤 Using base64 image directly...')
    const faceImageUrl = sourceImage  // 直接使用 base64 图片
    console.log('✅ Image prepared')

    // 调用 Replicate API
    console.log('📤 Submitting face swap task to Replicate...')

    const output = await replicate.run(
      'wan-video/wan-2.2-animate-replace',
      {
        input: {
          target_video: targetImage,
          swap_source: faceImageUrl
        }
      }
    )

    console.log('✅ Replicate processing completed!')

    // 直接返回结果
    res.json({
      success: true,
      status: 'completed',
      progress: 100,
      message: '✅ Face swap completed!',
      result: output
    })

  } catch (error) {
    console.error('❌ Face swap failed:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Face swap processing failed, please try again later'
    })
  }
}
