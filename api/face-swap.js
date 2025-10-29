import Replicate from 'replicate'

// 简单的内存存储（生产环境应使用 Vercel KV 或数据库）
const taskStore = new Map()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET' && req.query?.taskId) {
    // 查询任务状态
    const task = taskStore.get(req.query.taskId)
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      })
    }
    return res.json({
      success: true,
      ...task
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY

    if (!REPLICATE_API_TOKEN || !IMGBB_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'API tokens not configured'
      })
    }

    let body
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON in request body'
      })
    }

    const { targetImage, sourceImage } = body || {}

    if (!targetImage || !sourceImage) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: targetImage and sourceImage'
      })
    }

    // 生成任务 ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 立即返回任务 ID
    res.json({
      success: true,
      taskId: taskId,
      status: 'processing',
      message: 'Task created, processing in background...'
    })

    // 异步处理（不阻塞响应）
    processFaceSwap(taskId, targetImage, sourceImage, REPLICATE_API_TOKEN, IMGBB_API_KEY).catch(error => {
      console.error('Background processing error:', error)
      taskStore.set(taskId, {
        status: 'failed',
        progress: 100,
        error: error.message || 'Processing failed'
      })
    })

  } catch (error) {
    console.error('Face swap error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Face swap processing failed'
    })
  }
}

// 后台处理函数
async function processFaceSwap(taskId, targetImage, sourceImage, REPLICATE_API_TOKEN, IMGBB_API_KEY) {
  taskStore.set(taskId, {
    status: 'processing',
    progress: 10,
    message: 'Uploading image...'
  })

  try {
    // Step 1: 上传图片到 ImgBB
    let faceImageUrl = sourceImage

    if (sourceImage.startsWith('data:image')) {
      const base64Data = sourceImage.replace(/^data:image\/\w+;base64,/, '')
      const formData = new URLSearchParams()
      formData.append('image', base64Data)

      const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      if (!uploadResponse.ok) {
        throw new Error(`ImgBB upload failed: ${uploadResponse.status}`)
      }

      const uploadData = await uploadResponse.json()

      if (!uploadData.success || !uploadData.data?.url) {
        throw new Error(`ImgBB upload failed: ${uploadData.error?.message || 'Unknown error'}`)
      }

      faceImageUrl = uploadData.data.url
      console.log('Image uploaded to ImgBB:', faceImageUrl)
    }

    taskStore.set(taskId, {
      status: 'processing',
      progress: 30,
      message: 'Calling Replicate API...'
    })

    // Step 2: 调用 Replicate API
    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN })

    const output = await replicate.run(
      'wan-video/wan-2.2-animate-replace',
      {
        input: {
          video: targetImage,
          character_image: faceImageUrl
        }
      }
    )

    console.log('Replicate API completed')

    taskStore.set(taskId, {
      status: 'completed',
      progress: 100,
      message: 'Face swap completed!',
      result: output
    })

  } catch (error) {
    console.error('Processing error:', error)
    taskStore.set(taskId, {
      status: 'failed',
      progress: 100,
      error: error.message || 'Processing failed'
    })
  }
}
