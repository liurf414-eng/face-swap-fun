import 'dotenv/config'
import fetch from 'node-fetch'
import Replicate from 'replicate'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
const IMGBB_API_KEY = process.env.IMGBB_API_KEY

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

    // 上传用户照片到图床
    console.log('📤 Uploading user photo to imgbb...')
    const base64Data = sourceImage.replace(/^data:image\/\w+;base64,/, '')
    const formData = new URLSearchParams()
    formData.append('image', base64Data)

    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    })

    const imgbbData = await imgbbResponse.json()

    if (!imgbbData.success || !imgbbData.data?.url) {
      return res.status(500).json({
        success: false,
        error: 'Image upload failed: ' + (imgbbData.error?.message || 'Unknown error. Please configure IMGBB_API_KEY in Vercel.')
      })
    }

    const faceImageUrl = imgbbData.data.url
    console.log('✅ Photo uploaded successfully:', faceImageUrl)

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
