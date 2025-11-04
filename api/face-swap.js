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
    const VMODEL_API_TOKEN = process.env.VMODEL_API_TOKEN || '3RqdT2vcZj3EB3WWJD-3M6O505kUnd6Q3HtUEoagnbJP96lL_c6AXQp8YdxaL82Q6KKpgm4Y3VBY0fYwL5uZKQ=='
    const PIAPI_API_KEY = process.env.PIAPI_API_KEY || 'a456b8f0b6cdc6e30e5b195eb66197740b8ca501da3d1051861dad4c2f6d8377'
    const MAGICHOUR_API_KEY = process.env.MAGICHOUR_API_KEY || 'mhk_live_6FBxHAfqe43imx12rAALt88Ux8j7s8HDfeezMinKCG7zh8Fv4QrfOd2Uh35Hb6c0MfBjhhOawc0EWBEk'
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY
    const FACESWAP_API = process.env.FACESWAP_API || 'piapi'  // 默认使用 PiAPI（Magic Hour 需要上传 API，目前不可用）

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
      message: isImageInput ? 'Fast mode: Processing image (10-30 seconds)...' : 'Processing video...'
    })

    // 根据配置选择 API
    if (FACESWAP_API === 'magichour' && MAGICHOUR_API_KEY && !isImageInput) {
      // Magic Hour 视频换脸
      processFaceSwapMagicHour(taskId, targetImage, sourceImage, MAGICHOUR_API_KEY, IMGBB_API_KEY).catch(error => {
        console.error('Magic Hour processing error:', error)
        taskStore.set(taskId, {
          status: 'failed',
          progress: 100,
          error: error.message || 'Processing failed'
        })
      })
    } else if (FACESWAP_API === 'piapi' && PIAPI_API_KEY && !isImageInput) {
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
        error: 'No API configured. Please set PIAPI_API_KEY, MAGICHOUR_API_KEY, VMODEL_API_TOKEN, REPLICATE_API_TOKEN, or AIFACESWAP_API_KEY'
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

// Magic Hour 处理（视频换脸）
async function processFaceSwapMagicHour(taskId, targetImage, sourceImage, MAGICHOUR_API_KEY, IMGBB_API_KEY) {
  const MAGICHOUR_API_URL = 'https://api.magichour.ai/v1'

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
      message: 'Creating face swap task with Magic Hour...'
    })

    // 创建 Magic Hour 任务
    // Magic Hour 只支持 "file" 或 "youtube" 作为 video_source
    // 检测是否是 YouTube URL
    const isYouTubeUrl = targetImage.includes('youtube.com') || targetImage.includes('youtu.be')
    
    // 如果是 YouTube URL，使用 youtube source，否则需要先上传文件
    // 由于我们的视频通常是普通 URL，我们需要先上传
    // 但为了简化，我们先尝试使用 YouTube 检测，如果不是就切换到 file 模式
    let videoSource = isYouTubeUrl ? "youtube" : "file"
    let videoPath = targetImage
    
    // 如果不是 YouTube，需要先上传视频到 Magic Hour
    if (!isYouTubeUrl) {
      taskStore.set(taskId, {
        status: 'processing',
        progress: 35,
        message: 'Uploading video to Magic Hour...'
      })
      
      try {
        // 使用 Magic Hour 的 Upload Asset URLs API 上传视频
        // 根据文档，端点是 POST /assets/upload-urls（但实际路径可能不同）
        // 尝试多个可能的端点路径
        // Magic Hour 上传端点（注意：MAGICHOUR_API_URL 已经包含 /v1）
        const uploadEndpoints = [
          `${MAGICHOUR_API_URL}/assets/upload-urls`,      // 文档中提到的端点
          `/assets/upload-urls`,                           // 相对路径（如果 base URL 已包含 /v1）
          `${MAGICHOUR_API_URL.replace('/v1', '')}/assets/upload-urls`, // 去掉 /v1 前缀
          `${MAGICHOUR_API_URL}/upload-assets`,           // 简化版本
          `${MAGICHOUR_API_URL}/assets/upload`,           // 更短版本
          `https://api.magichour.ai/assets/upload-urls`    // 完整路径（不带版本号）
        ]
        
        let uploadData = null
        let lastError = null
        
        for (const endpoint of uploadEndpoints) {
          try {
            console.log(`Trying upload endpoint: ${endpoint}`)
            const uploadResponse = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${MAGICHOUR_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                urls: [targetImage]  // 上传视频 URL
              })
            })
            
            if (uploadResponse.ok) {
              uploadData = await uploadResponse.json()
              console.log(`Upload succeeded at ${endpoint}:`, JSON.stringify(uploadData, null, 2))
              break
            } else {
              const errorText = await uploadResponse.text()
              console.warn(`Upload endpoint ${endpoint} failed (${uploadResponse.status}):`, errorText.substring(0, 200))
              lastError = errorText
            }
          } catch (fetchError) {
            console.warn(`Upload endpoint ${endpoint} error:`, fetchError.message)
            lastError = fetchError.message
            continue
          }
        }
        
        if (!uploadData) {
          // 所有端点都失败了，Magic Hour 的上传 API 可能不存在或需要不同的方式
          // 提示用户切换到 PiAPI，因为它支持直接 URL
          throw new Error(`Magic Hour upload API not found (404). Magic Hour requires pre-uploaded files or YouTube URLs. For direct video URL support, please switch to PiAPI by setting FACESWAP_API=piapi in your environment variables.`)
        }
        
        // 获取上传后的文件 ID
        // 根据文档示例，格式可能是 "api-assets/id/xxx" 或类似
        if (uploadData.data && Array.isArray(uploadData.data) && uploadData.data.length > 0) {
          videoPath = uploadData.data[0].id || 
                     uploadData.data[0].file_id || 
                     uploadData.data[0].path ||
                     uploadData.data[0].asset_id
          videoSource = "file"
          console.log('Video uploaded successfully, file ID:', videoPath)
        } else if (uploadData.id || uploadData.file_id || uploadData.path || uploadData.asset_id) {
          videoPath = uploadData.id || uploadData.file_id || uploadData.path || uploadData.asset_id
          videoSource = "file"
          console.log('Video uploaded successfully, file ID:', videoPath)
        } else {
          // 如果上传 API 返回成功但没有文件 ID，记录完整响应以便调试
          console.error('Upload succeeded but no file ID found. Response:', JSON.stringify(uploadData, null, 2))
          throw new Error(`Magic Hour upload response format not recognized. Response: ${JSON.stringify(uploadData)}. Please check Magic Hour documentation.`)
        }
      } catch (uploadError) {
        console.error('Magic Hour upload error:', uploadError)
        throw new Error(`Magic Hour requires video upload. Upload failed: ${uploadError.message}. Magic Hour only supports YouTube URLs or uploaded files. Consider switching to PiAPI which supports direct video URLs.`)
      }
    }
    
    // 根据文档，Magic Hour API 使用下划线命名（snake_case）
    // 但 JavaScript SDK 使用驼峰命名（camelCase）
    // REST API 应该使用下划线命名
    const requestBody = {
      start_seconds: 0.0,
      end_seconds: 15.0, // 限制15秒以加快处理
      assets: {
        face_mappings: [
          {
            new_face: faceImageUrl,  // 要替换的人脸图片（URL 或文件 ID，如 "api-assets/id/xxx.png"）
            original_face: "0-0",     // 使用第一个检测到的人脸（格式：人脸索引-帧索引，如 "0-0"）
          }
        ],
        face_swap_mode: "all-faces", // 替换所有人脸（或 "single-face"）
        video_file_path: videoPath,   // 视频文件路径（上传后的文件 ID 或 YouTube URL）
        video_source: videoSource,    // "file" 或 "youtube"
        // 可选：如果图片也需要上传，可能需要 image_file_path
        // image_file_path: faceImageUrl,
      },
      name: `Face Swap ${Date.now()}`,
      style: {
        version: "default"
      }
    }

    console.log('Magic Hour request body:', JSON.stringify(requestBody, null, 2))

    const createResponse = await fetch(`${MAGICHOUR_API_URL}/face-swap`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAGICHOUR_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      
      // 处理特定错误代码
      if (createResponse.status === 401) {
        throw new Error('Magic Hour API authentication failed. Please check your API key.')
      } else if (createResponse.status === 502 || createResponse.status === 503 || createResponse.status === 504) {
        throw new Error('Magic Hour server is temporarily unavailable (502/503/504). Please try again in a moment or switch to another API.')
      } else if (createResponse.status === 422) {
        // 检查是否是 HTML 响应（服务器错误页面）
        if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
          throw new Error(`Magic Hour server returned HTML error page (${createResponse.status}). The service may be temporarily unavailable.`)
        }
        throw new Error(`Magic Hour validation error: ${errorText.substring(0, 200)}`)
      }
      
      // 检查是否是 HTML 响应（通常表示服务器错误）
      if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
        throw new Error(`Magic Hour server returned HTML instead of JSON (status ${createResponse.status}). The service may be temporarily unavailable.`)
      }
      
      throw new Error(`Magic Hour API error (${createResponse.status}): ${errorText.substring(0, 200)}`)
    }

    const createData = await createResponse.json()
    console.log('Magic Hour task creation response:', JSON.stringify(createData, null, 2))
    
    const videoId = createData.id
    if (!videoId) {
      throw new Error(`Magic Hour error: No video ID in response. Response: ${JSON.stringify(createData)}`)
    }
    
    console.log('Magic Hour task created successfully, video_id:', videoId)

    taskStore.set(taskId, {
      status: 'processing',
      progress: 40,
      message: 'Magic Hour processing video...'
    })

    // 轮询任务状态（最多等待10分钟）
    const maxAttempts = 600  // 10分钟 = 600次 * 1秒
    let progress = 40

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 每2秒检查一次
      
      console.log(`[${new Date().toISOString()}] Magic Hour polling attempt ${attempt}/${maxAttempts}, video_id: ${videoId}`)

      let statusResponse
      try {
        statusResponse = await fetch(`${MAGICHOUR_API_URL}/video/${videoId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${MAGICHOUR_API_KEY}`
          }
        })

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text()
          
          // 处理特定错误代码
          if (statusResponse.status === 404) {
            console.warn('Magic Hour video not found, will retry...')
            continue
          } else if (statusResponse.status === 502 || statusResponse.status === 503 || statusResponse.status === 504 || statusResponse.status === 522) {
            console.warn(`Magic Hour service error (${statusResponse.status}), will retry...`)
            continue
          }
          
          throw new Error(`Magic Hour status check failed: ${statusResponse.status} - ${errorText.substring(0, 200)}`)
        }

        let statusData
        try {
          const responseText = await statusResponse.text()
          // 检查是否是 HTML 响应
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            console.warn('Magic Hour returned HTML instead of JSON, will retry...')
            continue
          }
          statusData = JSON.parse(responseText)
        } catch (parseError) {
          console.error('Failed to parse Magic Hour response:', parseError)
          if (attempt === maxAttempts) {
            throw new Error('Magic Hour returned invalid response format')
          }
          continue
        }
        
        // 添加详细日志
        console.log(`Magic Hour status check [${attempt}]:`, JSON.stringify(statusData, null, 2))

        // 更新进度
        progress = Math.min(40 + Math.floor((attempt / maxAttempts) * 55), 95)
        const elapsed = Math.floor(attempt * 2)
        
        taskStore.set(taskId, {
          status: 'processing',
          progress: progress,
          message: `Magic Hour processing... (${Math.floor(elapsed / 60)}m ${elapsed % 60}s elapsed)`
        })

        // 检查任务状态
        const taskStatus = statusData.status || statusData.data?.status
        
        if (taskStatus === 'complete' || taskStatus === 'completed' || taskStatus === 'success') {
          // 任务完成 - 获取输出URL
          const outputUrl = statusData.output_url || 
                          statusData.output?.url ||
                          statusData.data?.output_url ||
                          statusData.data?.output?.url ||
                          statusData.video_url ||
                          statusData.url

          console.log('Magic Hour task completed! Status:', taskStatus, 'Output URL:', outputUrl)

          if (!outputUrl) {
            console.error('No video URL found in response:', JSON.stringify(statusData, null, 2))
            throw new Error('No video URL in Magic Hour response. Response: ' + JSON.stringify(statusData))
          }

          taskStore.set(taskId, {
            status: 'completed',
            progress: 100,
            message: `Face swap completed!`,
            result: outputUrl
          })
          return
        } else if (taskStatus === 'failed' || taskStatus === 'error' || taskStatus === 'failure') {
          const errorMsg = statusData.message || statusData.error || 'Magic Hour processing failed'
          console.error('Magic Hour task failed:', errorMsg)
          throw new Error(`Magic Hour processing failed: ${errorMsg}`)
        } else if (taskStatus === 'pending' || taskStatus === 'processing' || taskStatus === 'queued' || taskStatus === 'in_progress') {
          console.log(`Magic Hour task still ${taskStatus}, continuing to poll...`)
        } else {
          console.warn(`Unknown Magic Hour status: "${taskStatus}", continuing to poll...`)
        }

      } catch (fetchError) {
        console.error('Magic Hour status check error:', fetchError)
        if (attempt === maxAttempts) {
          throw new Error(`Failed to check Magic Hour status: ${fetchError.message}`)
        }
      }
    }

    // 超时
    throw new Error('Magic Hour processing timeout (exceeded 10 minutes)')

  } catch (error) {
    console.error('Magic Hour processing error:', error)
    taskStore.set(taskId, {
      status: 'failed',
      progress: 100,
      error: error.message || 'Magic Hour processing failed'
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
      
      // 处理特定错误代码
      if (createResponse.status === 522) {
        throw new Error('PiAPI server timeout (522). The server may be overloaded or temporarily unavailable. Please try again later.')
      } else if (createResponse.status === 503 || createResponse.status === 504) {
        throw new Error('PiAPI service temporarily unavailable. Please try again in a moment.')
      } else if (createResponse.status === 429) {
        throw new Error('PiAPI rate limit exceeded. Please wait a moment and try again.')
      }
      
      // 检查是否是 HTML 响应（通常表示服务器错误）
      if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
        throw new Error(`PiAPI server returned HTML instead of JSON (status ${createResponse.status}). The service may be temporarily unavailable.`)
      }
      
      throw new Error(`PiAPI API error (${createResponse.status}): ${errorText.substring(0, 200)}`)
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
          const errorText = await statusResponse.text()
          
          // 处理特定错误代码
          if (statusResponse.status === 522) {
            console.warn('PiAPI status check timeout (522), will retry...')
            // 不立即失败，继续重试
            continue
          } else if (statusResponse.status === 503 || statusResponse.status === 504) {
            console.warn('PiAPI service unavailable, will retry...')
            continue
          }
          
          throw new Error(`PiAPI status check failed: ${statusResponse.status} - ${errorText.substring(0, 200)}`)
        }

        let statusData
        try {
          const responseText = await statusResponse.text()
          // 检查是否是 HTML 响应
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            console.warn('PiAPI returned HTML instead of JSON, will retry...')
            continue
          }
          statusData = JSON.parse(responseText)
        } catch (parseError) {
          console.error('Failed to parse PiAPI response:', parseError)
          // 如果是最后一次尝试，抛出错误
          if (attempt === maxAttempts) {
            throw new Error('PiAPI returned invalid response format')
          }
          // 否则继续重试
          continue
        }
        
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
        if (statusData.code === 200 || !statusData.code) {
          // 尝试多种方式获取任务数据
          const taskData = statusData.data || statusData
          const taskStatus = taskData.status || statusData.status || taskData.task_status
          
          console.log('Task status:', taskStatus, 'Full response:', JSON.stringify(statusData, null, 2))
          
          // 首先检查完成状态（优先级最高）
          if (taskStatus === 'completed' || taskStatus === 'success' || taskStatus === 'finished' || taskStatus === 'done' || taskStatus === 'succeeded') {
            // 任务完成 - 尝试多种方式获取输出URL
            const outputUrl = taskData.output?.video_url || 
                            taskData.output?.url ||
                            taskData.video_url || 
                            taskData.output ||
                            statusData.data?.output?.video_url ||
                            statusData.data?.video_url ||
                            statusData.output?.video_url ||
                            statusData.video_url

            console.log('Task completed! Status:', taskStatus, 'Output URL:', outputUrl)

            if (!outputUrl) {
              // 如果没有URL，检查是否是字符串格式
              const outputStr = taskData.output || statusData.output
              if (typeof outputStr === 'string' && outputStr.startsWith('http')) {
                console.log('Found output as string:', outputStr)
                taskStore.set(taskId, {
                  status: 'completed',
                  progress: 100,
                  message: `Face swap completed!`,
                  result: outputStr
                })
                return
              }
              
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
          } 
          // 然后检查失败状态
          else if (taskStatus === 'failed' || taskStatus === 'error' || taskStatus === 'failure') {
            const errorMsg = taskData.message || statusData.message || taskData.error || 'PiAPI processing failed'
            console.error('Task failed:', errorMsg, 'Status:', taskStatus)
            throw new Error(`PiAPI processing failed: ${errorMsg}`)
          } 
          // 处理中状态
          else if (taskStatus === 'pending' || taskStatus === 'processing' || taskStatus === 'running' || taskStatus === 'in_progress') {
            // 继续轮询
            console.log(`Task still ${taskStatus}, continuing to poll...`)
          } 
          // 未定义状态但code是200
          else if (statusData.code === 200 && !taskStatus) {
            // 可能是成功但没有明确状态，尝试直接获取output
            const outputUrl = statusData.data?.output?.video_url || 
                            statusData.data?.video_url ||
                            statusData.output?.video_url ||
                            statusData.video_url
            if (outputUrl) {
              console.log('Found output URL without explicit status:', outputUrl)
              taskStore.set(taskId, {
                status: 'completed',
                progress: 100,
                message: `Face swap completed!`,
                result: outputUrl
              })
              return
            }
            console.warn('No status and no output URL, continuing to poll...', JSON.stringify(statusData, null, 2))
          }
          // 未知状态，记录但继续轮询
          else {
            console.warn(`Unknown task status: "${taskStatus}", continuing to poll... Response:`, JSON.stringify(statusData, null, 2))
          }
        } else {
          // API 返回错误代码
          console.error('PiAPI returned error code:', statusData.code, 'Response:', JSON.stringify(statusData, null, 2))
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
    // 对视频 URL 进行编码，确保特殊字符（如空格、括号）被正确处理
    const encodedVideoUrl = encodeURI(targetImage)
    
    console.log('Original video URL:', targetImage)
    console.log('Encoded video URL:', encodedVideoUrl)
    
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
          source: encodedVideoUrl,   // 原始视频（已编码）
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
        console.log('VModel status check response:', JSON.stringify(statusData, null, 2))
        
        // 检查任务是否失败
        if (statusData.status === 'failed' || statusData.error) {
          const errorMsg = statusData.error?.message || 
                          statusData.message?.en || 
                          statusData.message?.zh || 
                          statusData.message ||
                          'Task failed'
          const errorCode = statusData.error?.code || statusData.code
          throw new Error(`VModel task failed (${errorCode || 'unknown'}): ${errorMsg}`)
        }
        
        // 检查响应中的错误代码（402 是支付错误）
        if (statusData.code === 402) {
          const errorMsg = statusData.message?.en || statusData.message?.zh || 'Payment Required'
          throw new Error(`VModel Payment Required: ${errorMsg}. Please check your account balance at https://vmodel.ai`)
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
