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

    // 尝试将 base64 转换为可访问的 URL
    console.log('📤 Processing user photo...')
    const base64Data = sourceImage.replace(/^data:image\/\w+;base64,/, '')
    
    let faceImageUrl = sourceImage  // 默认使用 base64
    
    // 尝试上传到免费的图片托管服务
    try {
      // 使用 File.io API（临时文件存储）
      const fileBuffer = Buffer.from(base64Data, 'base64')
      const blob = new Blob([fileBuffer], { type: 'image/jpeg' })
      
      const formData = new FormData()
      formData.append('file', blob, 'photo.jpg')
      
      const uploadResponse = await fetch('https://file.io/?expires=1h', {
        method: 'POST',
        body: formData
      })
      
      const uploadData = await uploadResponse.json()
      
      if (uploadData.success && uploadData.link) {
        faceImageUrl = uploadData.link
        console.log('✅ Photo uploaded to file.io:', faceImageUrl)
      } else {
        console.warn('Upload failed, using base64 as fallback')
      }
    } catch (uploadError) {
      console.warn('Upload attempt failed, using base64:', uploadError.message)
      // 继续使用 base64
    }

    // 调用 Replicate API
    console.log('📤 Submitting face swap task to Replicate...')

    const output = await replicate.run(
      'wan-video/wan-2.2-animate-replace',
      {
        input: {
          video: targetImage,
          character_image: faceImageUrl
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
