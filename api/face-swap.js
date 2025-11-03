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
    const VMODEL_API_TOKEN = process.env.VMODEL_API_TOKEN
    const PIAPI_API_KEY = process.env.PIAPI_API_KEY || 'a456b8f0b6cdc6e30e5b195eb66197740b8ca501da3d1051861dad4c2f6d8377'
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY
    const FACESWAP_API = process.env.FACESWAP_API || 'piapi'  // 默认使用 PiAPI

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

    const { targetImage, sourceImage, mode } = body || {}

    if (!targetImage || !sourceImage) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: targetImage and sourceImage'
      })
    }

    // 检测输入类型：如果是图片 URL 或 base64 图片，使用快速模式
    const isImageInput = targetImage.startsWith('data:image') || 
                        (typeof targetImage === 'string' && targetImage.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ||
                        mode === 'fast' // 用户明确选择快速模式

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    res.json({
      success: true,
      taskId: taskId,
      status: 'processing',
      message: isImageInput ? 'Fast mode: Processing image (10-30 seconds)...' : 'Processing video with PiAPI...'
    })

    // 根据配置选择 API（优先使用 PiAPI）
    if (FACESWAP_API === 'piapi' && PIAPI_API_KEY && !isImageInput) {
      // PiAPI 专门用于视频换脸
      processFaceSwapPiAPI(taskId, targetImage, sourceImage, PIAPI_API_KEY, IMGBB_API_KEY).catch(error => {
        console.error('PiAPI processing error:', error)
        taskStore.set(taskId, {
          status: 'failed',
          progress: 100,
          error: error.message || 'Processing failed'
        })
      })
    } else if (FACESWAP_API === 'vmodel' && VMODEL_API_TOKEN && !isImageInput) {
      // VModel 专门用于视频换脸（最快，约15秒）
      processFaceSwapVModel(taskId, targetImage, sourceImage, VMODEL_API_TOKEN, IMGBB_API_KEY).catch(error => {
        console.error('VModel processing error:', error)
        taskStore.set(taskId, {
          status: 'failed',
          progress: 100,
          error: error.message || 'Processing failed'
        })
      })
    } else if (FACESWAP_API === 'aifaceswap' && AIFACESWAP_API_KEY) {
      // AIFaceSwap 主要用于视频，如果检测到图片，提示用户
      if (isImageInput) {
        console.log('AIFaceSwap only supports video. Switching to Replicate for image...')
        if (REPLICATE_API_TOKEN) {
          processFaceSwapImageReplicate(taskId, targetImage, sourceImage, REPLICATE_API_TOKEN, IMGBB_API_KEY).catch(error => {
            console.error('Replicate image processing error:', error)
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
            error: 'Image face swap requires REPLICATE_API_TOKEN. AIFaceSwap only supports video.'
          })
        }
      } else {
        processFaceSwapAIFaceSwap(taskId, targetImage, sourceImage, AIFACESWAP_API_KEY, IMGBB_API_KEY).catch(error => {
          console.error('AIFaceSwap processing error:', error)
          taskStore.set(taskId, {
            status: 'failed',
            progress: 100,
            error: error.message || 'Processing failed'
          })
        })
      }
    } else if (REPLICATE_API_TOKEN) {
      // Replicate 支持图片和视频
      if (isImageInput) {
        // 快速模式：图片换脸（10-30秒）
        processFaceSwapImageReplicate(taskId, targetImage, sourceImage, REPLICATE_API_TOKEN, IMGBB_API_KEY).catch(error => {
          console.error('Replicate image processing error:', error)
          taskStore.set(taskId, {
            status: 'failed',
            progress: 100,
            error: error.message || 'Processing failed'
          })
        })
      } else {
        // 标准模式：视频换脸（5-10分钟）
        processFaceSwapReplicate(taskId, targetImage, sourceImage, REPLICATE_API_TOKEN, IMGBB_API_KEY).catch(error => {
          console.error('Replicate video processing error:', error)
          taskStore.set(taskId, {
            status: 'failed',
            progress: 100,
            error: error.message || 'Processing failed'
          })
        })
      }
    } else {
      taskStore.set(taskId, {
        status: 'failed',
        progress: 0,
        error: 'No API configured. Please set PIAPI_API_KEY, VMODEL_API_TOKEN, REPLICATE_API_TOKEN, or AIFACESWAP_API_KEY'
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

// PiAPI 处理（视频换脸）
async function processFaceSwapPiAPI(taskId, targetImage, sourceImage, PIAPI_API_KEY, IMGBB_API_KEY) {
  const PIAPI_API_URL = 'https://api.piapi.ai/api/v1'
  const MODEL_NAME = 'Qubico/video-toolkit'

  taskStore.set(taskId, {
    status: 'processing',
    progress: 10,
    message: 'Uploading images to ImgBB...'
  })

  try {
    // 上传用户照片到 ImgBB
    let faceImageUrl = sourceImage
    if (sourceImage.startsWith('data:image')) {
      const base64Data = sourceImage.replace(/^data:image\/\w+;base64,/, '')
      const formData = new URLSearchParams()
      formData.append('image', base64Data)

      const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      const uploadData = await uploadResponse.json()
      if (!uploadData.success || !uploadData.data?.url) {
        throw new Error(`Failed to upload image: ${uploadData.error?.message || 'Unknown error'}`)
      }
      faceImageUrl = uploadData.data.url
      console.log('Image uploaded to ImgBB:', faceImageUrl)
    }

    taskStore.set(taskId, {
      status: 'processing',
      progress: 30,
      message: 'Creating face swap task with PiAPI...'
    })

    // 创建 PiAPI 任务
    const createResponse = await fetch(`${PIAPI_API_URL}/task`, {
      method: 'POST',
      headers: {
        'x-api-key': PIAPI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        task_type: 'face-swap',
        input: {
          swap_image: faceImageUrl,      // 要替换的人脸图片
          target_video: targetImage,      // 目标视频
          swap_faces_index: "0",          // 使用第一张脸（索引0）
          target_faces_index: "0"         // 替换视频中第一张脸（索引0）
        }
      })
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      throw new Error(`PiAPI API error: ${createResponse.status} - ${errorText}`)
    }

    const createData = await createResponse.json()
    console.log('PiAPI task creation response:', JSON.stringify(createData, null, 2))
    
    // 检查响应 - 可能有多种响应格式
    if (createData.code !== 200) {
      throw new Error(`PiAPI error: ${createData.message || JSON.stringify(createData)}`)
    }
    
    // 尝试多种方式获取 task_id
    const piapiTaskId = createData.data?.task_id || 
                       createData.task_id || 
                       createData.data?.id ||
                       createData.id
    
    if (!piapiTaskId) {
      console.error('Failed to extract task_id from response:', JSON.stringify(createData, null, 2))
      throw new Error(`PiAPI error: No task_id in response. Response: ${JSON.stringify(createData)}`)
    }
    
    console.log('PiAPI task created successfully, task_id:', piapiTaskId)

    taskStore.set(taskId, {
      status: 'processing',
      progress: 40,
      message: 'PiAPI processing video...'
    })

    // 轮询任务状态（最多等待10分钟，因为视频处理可能需要更长时间）
    const maxAttempts = 600  // 10分钟 = 600次 * 1秒
    let progress = 40
    let lastStatus = null

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 每2秒检查一次
      
      console.log(`[${new Date().toISOString()}] PiAPI polling attempt ${attempt}/${maxAttempts}, task_id: ${piapiTaskId}`)

      let statusResponse
      try {
        statusResponse = await fetch(`${PIAPI_API_URL}/task/${piapiTaskId}`, {
          method: 'GET',
          headers: {
            'x-api-key': PIAPI_API_KEY
          }
        })

        if (!statusResponse.ok) {
          throw new Error(`PiAPI status check failed: ${statusResponse.status}`)
        }

        const statusData = await statusResponse.json()
        
        // 添加详细日志
        console.log(`PiAPI status check [${attempt}]:`, JSON.stringify(statusData, null, 2))

        // 更新进度
        progress = Math.min(40 + Math.floor((attempt / maxAttempts) * 55), 95)
        const elapsed = Math.floor(attempt * 2)
        
        taskStore.set(taskId, {
          status: 'processing',
          progress: progress,
          message: `PiAPI processing... (${Math.floor(elapsed / 60)}m ${elapsed % 60}s elapsed)`
        })

        // 检查响应格式（可能有多种格式）
        if (statusData.code === 200) {
          const taskData = statusData.data || statusData
          const taskStatus = taskData.status || statusData.status
          
          console.log('Task status:', taskStatus, 'Data:', JSON.stringify(taskData, null, 2))
          
          // 检查完成状态（可能有多种表示方式）
          if (taskStatus === 'completed' || taskStatus === 'success' || taskStatus === 'finished' || taskStatus === 'done') {
            // 任务完成 - 尝试多种方式获取输出URL
            const outputUrl = taskData.output?.video_url || 
                            taskData.video_url || 
                            taskData.output?.url ||
                            taskData.output ||
                            statusData.output?.video_url ||
                            statusData.video_url

            console.log('Task completed, output URL:', outputUrl)

            if (!outputUrl) {
              console.error('No video URL found in response:', JSON.stringify(statusData, null, 2))
              throw new Error('No video URL in PiAPI response. Response: ' + JSON.stringify(statusData))
            }

            taskStore.set(taskId, {
              status: 'completed',
              progress: 100,
              message: `Face swap completed!`,
              result: outputUrl
            })
            return
          } else if (taskStatus === 'failed' || taskStatus === 'error' || taskStatus === 'failure') {
            const errorMsg = taskData.message || statusData.message || taskData.error || 'PiAPI processing failed'
            console.error('Task failed:', errorMsg)
            throw new Error(`PiAPI processing failed: ${errorMsg}`)
          } else if (taskStatus === 'pending' || taskStatus === 'processing' || taskStatus === 'running') {
            // 继续轮询
            console.log(`Task still ${taskStatus}, continuing to poll...`)
          } else {
            // 未知状态，记录但继续轮询
            console.warn(`Unknown task status: ${taskStatus}, continuing to poll...`)
          }
        } else {
          // API 返回错误代码
          console.error('PiAPI returned error code:', statusData.code, statusData)
          const errorMsg = statusData.message || 'PiAPI API error'
          throw new Error(`PiAPI error (code ${statusData.code}): ${errorMsg}`)
        }

      } catch (fetchError) {
        console.error('PiAPI status check error:', fetchError)
        // 继续重试，不要立即失败
        if (attempt === maxAttempts) {
          throw new Error(`Failed to check PiAPI status: ${fetchError.message}`)
        }
      }
    }

    // 超时
    throw new Error('PiAPI processing timeout (exceeded 5 minutes)')

  } catch (error) {
    console.error('PiAPI processing error:', error)
    taskStore.set(taskId, {
      status: 'failed',
      progress: 100,
      error: error.message || 'PiAPI processing failed'
    })
  }
}

// VModel 处理（最快，约15秒）
async function processFaceSwapVModel(taskId, targetImage, sourceImage, VMODEL_API_TOKEN, IMGBB_API_KEY) {
  const VMODEL_API_URL = 'https://api.vmodel.ai/api/tasks/v1'
  const MODEL_VERSION = '537e83f7ed84751dc56aa80fb2391b07696c85a49967c72c64f002a0ca2bb224'

  taskStore.set(taskId, {
    status: 'processing',
    progress: 10,
    message: 'Uploading images to ImgBB...'
  })

  try {
    // 上传用户照片到 ImgBB
    let faceImageUrl = sourceImage
    if (sourceImage.startsWith('data:image')) {
      const base64Data = sourceImage.replace(/^data:image\/\w+;base64,/, '')
      const formData = new URLSearchParams()
      formData.append('image', base64Data)

      const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      const uploadData = await uploadResponse.json()
      if (!uploadData.success || !uploadData.data?.url) {
        throw new Error(`Failed to upload image: ${uploadData.error?.message || 'Unknown error'}`)
      }
      faceImageUrl = uploadData.data.url
      console.log('Image uploaded to ImgBB:', faceImageUrl)
    }

    taskStore.set(taskId, {
      status: 'processing',
      progress: 30,
      message: 'Creating face swap task with VModel (usually ~15 seconds)...'
    })

    // 创建 VModel 任务
    const createResponse = await fetch(`${VMODEL_API_URL}/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VMODEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: {
          target: faceImageUrl,  // 要替换的人脸图片
          source: targetImage,   // 原始视频
          disable_safety_checker: false
        }
      })
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      let errorMessage = `VModel API error: ${createResponse.status} - ${errorText}`
      
      // 处理 402 错误（需要支付）
      if (createResponse.status === 402) {
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = `Payment Required: ${errorData.message?.en || errorData.message?.zh || 'Your VModel account balance is insufficient. Please add credits to continue.'}`
        } catch (e) {
          errorMessage = 'Payment Required: Your VModel account balance is insufficient. Please add credits at https://vmodel.ai'
        }
      }
      
      throw new Error(errorMessage)
    }

    const createData = await createResponse.json()
    
    // 检查是否有错误代码
    if (createData.code === 402 || createData.message) {
      const errorMsg = createData.message?.en || createData.message?.zh || 'Payment Required'
      throw new Error(`VModel Error: ${errorMsg}. Please check your account balance at https://vmodel.ai`)
    }
    
    const vmodelTaskId = createData.task_id || createData.id

    if (!vmodelTaskId) {
      throw new Error(`Invalid VModel response: ${JSON.stringify(createData)}`)
    }

    console.log('VModel task created:', vmodelTaskId)

    taskStore.set(taskId, {
      status: 'processing',
      progress: 40,
      message: 'VModel processing video (usually completes in ~15 seconds)...'
    })

    // 轮询任务状态（最多等待2分钟）
    const maxAttempts = 120  // 2分钟 = 120次 * 1秒
    let progress = 40

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 每秒检查一次

      let statusResponse
      try {
        statusResponse = await fetch(`${VMODEL_API_URL}/${vmodelTaskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${VMODEL_API_TOKEN}`
          }
        })

        if (!statusResponse.ok) {
          let errorMsg = `VModel status check failed: ${statusResponse.status}`
          if (statusResponse.status === 402) {
            errorMsg = 'Payment Required: Your VModel account balance is insufficient'
          }
          throw new Error(errorMsg)
        }

        const statusData = await statusResponse.json()
        
        // 检查响应中的错误代码
        if (statusData.code === 402) {
          const errorMsg = statusData.message?.en || statusData.message?.zh || 'Payment Required'
          throw new Error(`VModel Error: ${errorMsg}`)
        }

        // 更新进度
        progress = Math.min(40 + Math.floor((attempt / maxAttempts) * 50), 95)
        const elapsed = Math.floor(attempt)
        
        taskStore.set(taskId, {
          status: 'processing',
          progress: progress,
          message: `VModel processing... (${elapsed}s elapsed, usually ~15s)`
        })

        if (statusData.status === 'succeeded') {
          // 任务完成
          const outputUrl = statusData.output && statusData.output[0] ? statusData.output[0] : statusData.output

          if (!outputUrl) {
            throw new Error('No output URL in VModel response')
          }

          taskStore.set(taskId, {
            status: 'completed',
            progress: 100,
            message: `Face swap completed in ${elapsed}s!`,
            result: outputUrl
          })
          return
        } else if (statusData.status === 'failed' || statusData.status === 'error') {
          throw new Error(statusData.error || 'VModel processing failed')
        }
        // 如果状态是 'processing' 或 'pending'，继续轮询

      } catch (fetchError) {
        console.error('VModel status check error:', fetchError)
        // 继续重试，不要立即失败
        if (attempt === maxAttempts) {
          throw new Error(`Failed to check VModel status: ${fetchError.message}`)
        }
      }
    }

    // 超时
    throw new Error('VModel processing timeout (exceeded 2 minutes)')

  } catch (error) {
    console.error('VModel processing error:', error)
    taskStore.set(taskId, {
      status: 'failed',
      progress: 100,
      error: error.message || 'VModel processing failed'
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

    // 创建 webhook (添加错误处理)
    let webhookUrl
    let webhookData
    try {
      const webhookResponse = await fetch('https://webhook.site/token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (!webhookResponse.ok) {
        throw new Error(`Webhook creation failed: ${webhookResponse.status}`)
      }
      
      webhookData = await webhookResponse.json()
      if (!webhookData.uuid) {
        throw new Error('Invalid webhook response')
      }
      webhookUrl = `https://webhook.site/${webhookData.uuid}`
    } catch (webhookError) {
      console.error('Webhook creation error:', webhookError)
      throw new Error(`Failed to create webhook: ${webhookError.message}`)
    }

    taskStore.set(taskId, {
      status: 'processing',
      progress: 20,
      message: 'Submitting to AIFaceSwap API...'
    })

    // 提交换脸任务
    let submitResponse
    try {
      submitResponse = await fetch(`${API_BASE_URL}/video_faceswap`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_video: targetImage,
          face_image: faceImageUrl,
          duration: 2,  // 减少到2秒，加快处理速度
          enhance: 0,   // 关闭增强，加快速度
          webhook: webhookUrl
        })
      })
      
      if (!submitResponse.ok) {
        const errorText = await submitResponse.text()
        throw new Error(`AIFaceSwap API error: ${submitResponse.status} - ${errorText}`)
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      throw new Error(`Failed to connect to AIFaceSwap API: ${fetchError.message}`)
    }

    let submitData
    try {
      submitData = await submitResponse.json()
    } catch (parseError) {
      throw new Error(`Failed to parse AIFaceSwap response: ${parseError.message}`)
    }

    if (submitData.code !== 200 || !submitData.data?.task_id) {
      throw new Error(submitData.message || `API error: ${submitData.code || submitResponse.status}`)
    }

    const aiTaskId = submitData.data.task_id

    // 轮询 webhook 获取结果（最多 3 分钟，因为视频已优化）
    const maxAttempts = 180  // 3分钟 = 180次 * 1秒
    let progress = 25

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 改为1秒检查一次，更快响应

      let webhookCheck
      try {
        webhookCheck = await fetch(`https://webhook.site/token/${webhookData.uuid}/requests?sorting=newest`, {
          headers: {
            'Api-Key': webhookData.uuid
          }
        })
        
        if (!webhookCheck.ok) {
          // 如果 webhook 检查失败，继续等待
          progress = Math.min(25 + Math.floor((attempt / maxAttempts) * 70), 95)
          taskStore.set(taskId, {
            status: 'processing',
            progress: progress,
            message: `Processing... (${Math.floor(attempt * 2 / 60)}m ${(attempt * 2) % 60}s)`
          })
          continue
        }
      } catch (webhookFetchError) {
        // 网络错误，继续等待
        progress = Math.min(25 + Math.floor((attempt / maxAttempts) * 70), 95)
        taskStore.set(taskId, {
          status: 'processing',
          progress: progress,
          message: `Processing... (${Math.floor(attempt * 2 / 60)}m ${(attempt * 2) % 60}s)`
        })
        continue
      }

      let webhookRequests
      try {
        webhookRequests = await webhookCheck.json()
      } catch (parseError) {
        continue
      }

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

// Replicate 快速图片换脸（10-30秒）
async function processFaceSwapImageReplicate(taskId, targetImage, sourceImage, REPLICATE_API_TOKEN, IMGBB_API_KEY) {
  taskStore.set(taskId, {
    status: 'processing',
    progress: 10,
    message: 'Uploading images to ImgBB... (Fast mode: 10-30 seconds)'
  })

  try {
    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN })
    const startTime = Date.now()

    // 上传两张图片到 ImgBB
    let targetImageUrl = targetImage
    let faceImageUrl = sourceImage

    // 上传目标图片
    if (targetImage.startsWith('data:image')) {
      const base64Data = targetImage.replace(/^data:image\/\w+;base64,/, '')
      const formData = new URLSearchParams()
      formData.append('image', base64Data)

      const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      const uploadData = await uploadResponse.json()
      if (!uploadData.success || !uploadData.data?.url) {
        throw new Error(`Failed to upload target image: ${uploadData.error?.message || 'Unknown error'}`)
      }
      targetImageUrl = uploadData.data.url
    }

    // 上传源图片（用户照片）
    if (sourceImage.startsWith('data:image')) {
      const base64Data = sourceImage.replace(/^data:image\/\w+;base64,/, '')
      const formData = new URLSearchParams()
      formData.append('image', base64Data)

      const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      const uploadData = await uploadResponse.json()
      if (!uploadData.success || !uploadData.data?.url) {
        throw new Error(`Failed to upload source image: ${uploadData.error?.message || 'Unknown error'}`)
      }
      faceImageUrl = uploadData.data.url
    }

    taskStore.set(taskId, {
      status: 'processing',
      progress: 50,
      message: 'Processing face swap (fast mode: usually 10-30 seconds)...'
    })

    // 使用 Replicate 的图片换脸模型（快速）
    // 尝试使用 logofusion/face-swap 或其他快速模型
    const output = await replicate.run(
      'logofusion/face-swap:42e5134d7f0bf93f90ba64e3e4f97ea3c55adefe',
      {
        input: {
          source_image: faceImageUrl,
          target_image: targetImageUrl
        }
      }
    )

    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    console.log(`Fast image face swap completed in ${elapsed}s`)

    taskStore.set(taskId, {
      status: 'completed',
      progress: 100,
      message: `Face swap completed in ${elapsed}s!`,
      result: output
    })

  } catch (error) {
    console.error('Fast image face swap error:', error)
    taskStore.set(taskId, {
      status: 'failed',
      progress: 100,
      error: error.message || 'Fast image processing failed'
    })
  }
}

// Replicate 视频换脸处理（较慢，但更稳定，5-10分钟）
async function processFaceSwapReplicate(taskId, targetImage, sourceImage, REPLICATE_API_TOKEN, IMGBB_API_KEY) {
  taskStore.set(taskId, {
    status: 'processing',
    progress: 10,
    message: 'Uploading image to ImgBB...'
  })

  try {
    let faceImageUrl = sourceImage

    if (sourceImage.startsWith('data:image')) {
      try {
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
          const errorText = await uploadResponse.text()
          throw new Error(`ImgBB upload failed: ${uploadResponse.status} - ${errorText}`)
        }

        const uploadData = await uploadResponse.json()

        if (!uploadData.success || !uploadData.data?.url) {
          throw new Error(`ImgBB upload failed: ${uploadData.error?.message || 'Unknown error'}`)
        }

        faceImageUrl = uploadData.data.url
        console.log('Image uploaded to ImgBB:', faceImageUrl)
      } catch (uploadError) {
        console.error('ImgBB upload error:', uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }
    }

    taskStore.set(taskId, {
      status: 'processing',
      progress: 30,
      message: 'Calling Replicate API (optimized: 2-4 minutes with fast mode)...'
    })

    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN })

    // 开始时间追踪
    const startTime = Date.now()
    
    // 定期更新进度（每10秒更新一次，让用户知道还在处理）
    const progressInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      const estimatedProgress = Math.min(30 + Math.floor((elapsed / 240) * 65), 95) // 4分钟从30%到95%（优化后）
      
      taskStore.set(taskId, {
        status: 'processing',
        progress: estimatedProgress,
        message: `Processing with Replicate API (optimized: 2-4 min)... (${minutes}m ${seconds}s elapsed)`
      })
    }, 10000) // 每10秒更新一次

    // 优化视频处理参数以加快速度
    // 限制视频时长到2秒（如果URL中没有时间片段，添加它）
    let optimizedVideoUrl = targetImage
    if (!targetImage.includes('#t=') && !targetImage.includes('?t=')) {
      // 添加时间片段限制（0-2秒）
      optimizedVideoUrl = targetImage.includes('?') 
        ? `${targetImage}&t=0,2` 
        : `${targetImage}#t=0,2`
    }

    try {
      const output = await replicate.run(
        'wan-video/wan-2.2-animate-replace',
        {
          input: {
            video: optimizedVideoUrl,  // 使用优化后的URL（限制2秒）
            character_image: faceImageUrl,
            go_fast: true,              // 启用快速模式
            resolution: "480",          // 降低分辨率到480p（更快）
            frames_per_second: 15       // 降低帧率到15fps（更快）
          }
        }
      )

      // 停止进度更新
      clearInterval(progressInterval)

      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      console.log(`Replicate API completed in ${elapsed}s`)

      taskStore.set(taskId, {
        status: 'completed',
        progress: 100,
        message: 'Face swap completed!',
        result: output
      })
    } catch (error) {
      // 停止进度更新
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      
      console.error('Replicate API call error:', error)
      throw error // 重新抛出错误，让外层 catch 处理
    }

  } catch (error) {
    // 外层 catch：处理所有未捕获的错误
    console.error('Replicate processing error:', error)
    taskStore.set(taskId, {
      status: 'failed',
      progress: 100,
      error: error.message || 'Processing failed'
    })
  }
}
