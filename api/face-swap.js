import Replicate from 'replicate'

const taskStore = new Map()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET' && req.query?.taskId) {
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
    const AIFACESWAP_API_KEY = process.env.AIFACESWAP_API_KEY
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY
    const FACESWAP_API = process.env.FACESWAP_API || 'replicate'

    if (!IMGBB_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'IMGBB_API_KEY is not configured'
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

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    res.json({
      success: true,
      taskId: taskId,
      status: 'processing',
      message: 'Task created, processing in background...'
    })

    // 根据配置选择 API
    if (FACESWAP_API === 'aifaceswap' && AIFACESWAP_API_KEY) {
      processFaceSwapAIFaceSwap(taskId, targetImage, sourceImage, AIFACESWAP_API_KEY, IMGBB_API_KEY).catch(error => {
        console.error('AIFaceSwap processing error:', error)
        taskStore.set(taskId, {
          status: 'failed',
          progress: 100,
          error: error.message || 'Processing failed'
        })
      })
    } else if (REPLICATE_API_TOKEN) {
      processFaceSwapReplicate(taskId, targetImage, sourceImage, REPLICATE_API_TOKEN, IMGBB_API_KEY).catch(error => {
        console.error('Replicate processing error:', error)
        taskStore.set(taskId, {
          status: 'failed',
          progress: 100,
          error: error.message || 'Processing failed'
        })
      })
    } else {
      taskStore.set(taskId, {
        status: 'failed',
        progress: 0,
        error: 'No API configured. Please set REPLICATE_API_TOKEN or AIFACESWAP_API_KEY'
      })
    }

  } catch (error) {
    console.error('Face swap error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Face swap processing failed'
    })
  }
}

// AIFaceSwap 处理（通常更快）
async function processFaceSwapAIFaceSwap(taskId, targetImage, sourceImage, API_KEY, IMGBB_API_KEY) {
  const API_BASE_URL = 'https://aifaceswap.io/api/aifaceswap/v1'

  taskStore.set(taskId, {
    status: 'processing',
    progress: 5,
    message: 'Uploading image to ImgBB...'
  })

  try {
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

      const uploadData = await uploadResponse.json()

      if (!uploadData.success || !uploadData.data?.url) {
        throw new Error(`ImgBB upload failed: ${uploadData.error?.message || 'Unknown error'}`)
      }

      faceImageUrl = uploadData.data.url
      console.log('Image uploaded to ImgBB:', faceImageUrl)
    }

    taskStore.set(taskId, {
      status: 'processing',
      progress: 15,
      message: 'Creating webhook for callback...'
    })

    // 创建 webhook
    const webhookResponse = await fetch('https://webhook.site/token', {
      method: 'POST'
    })
    const webhookData = await webhookResponse.json()
    const webhookUrl = `https://webhook.site/${webhookData.uuid}`

    taskStore.set(taskId, {
      status: 'processing',
      progress: 20,
      message: 'Submitting to AIFaceSwap API...'
    })

    // 提交换脸任务
    const submitResponse = await fetch(`${API_BASE_URL}/video_faceswap`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_video: targetImage,
        face_image: faceImageUrl,
        duration: 3,
        enhance: 0,
        webhook: webhookUrl
      })
    })

    const submitData = await submitResponse.json()

    if (submitData.code !== 200 || !submitData.data?.task_id) {
      throw new Error(submitData.message || `API error: ${submitData.code || submitResponse.status}`)
    }

    const aiTaskId = submitData.data.task_id

    // 轮询 webhook 获取结果（最多 5 分钟）
    const maxAttempts = 300
    let progress = 25

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const webhookCheck = await fetch(`https://webhook.site/token/${webhookData.uuid}/requests?sorting=newest`, {
        headers: {
          'Api-Key': webhookData.uuid
        }
      })

      const webhookRequests = await webhookCheck.json()

      if (webhookRequests.data && webhookRequests.data.length > 0) {
        const latestRequest = webhookRequests.data[0]
        const callbackData = JSON.parse(latestRequest.content)

        if (callbackData.success === 1 && callbackData.result_image) {
          taskStore.set(taskId, {
            status: 'completed',
            progress: 100,
            message: 'Face swap completed!',
            result: callbackData.result_image
          })
          return
        }
      }

      progress = Math.min(25 + Math.floor((attempt / maxAttempts) * 70), 95)
      taskStore.set(taskId, {
        status: 'processing',
        progress: progress,
        message: `Processing... (${Math.floor(attempt * 2 / 60)}m ${(attempt * 2) % 60}s)`
      })
    }

    throw new Error('Processing timeout after 10 minutes')

  } catch (error) {
    console.error('AIFaceSwap error:', error)
    taskStore.set(taskId, {
      status: 'failed',
      progress: 100,
      error: error.message || 'Processing failed'
    })
  }
}

// Replicate 处理（较慢，但更稳定）
async function processFaceSwapReplicate(taskId, targetImage, sourceImage, REPLICATE_API_TOKEN, IMGBB_API_KEY) {
  taskStore.set(taskId, {
    status: 'processing',
    progress: 10,
    message: 'Uploading image to ImgBB...'
  })

  try {
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
      message: 'Calling Replicate API (this may take 5-10 minutes)...'
    })

    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN })

    // 开始时间追踪
    const startTime = Date.now()
    let lastUpdate = startTime

    const output = await replicate.run(
      'wan-video/wan-2.2-animate-replace',
      {
        input: {
          video: targetImage,
          character_image: faceImageUrl
        }
      }
    )

    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    console.log(`Replicate API completed in ${elapsed}s`)

    taskStore.set(taskId, {
      status: 'completed',
      progress: 100,
      message: 'Face swap completed!',
      result: output
    })

  } catch (error) {
    console.error('Replicate error:', error)
    taskStore.set(taskId, {
      status: 'failed',
      progress: 100,
      error: error.message || 'Processing failed'
    })
  }
}
