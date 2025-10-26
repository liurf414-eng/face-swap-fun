import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Replicate from 'replicate'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// API配置
const FACESWAP_API = process.env.FACESWAP_API || 'replicate'  // replicate 或 aifaceswap
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
const API_KEY = process.env.AIFACESWAP_API_KEY
const API_BASE_URL = 'https://aifaceswap.io/api/aifaceswap/v1'
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || 'd2e54d0b8582a97a9f5f8c4e3e7f9c2a'

// 初始化 Replicate 客户端
const replicate = REPLICATE_API_TOKEN ? new Replicate({ auth: REPLICATE_API_TOKEN }) : null

// 进度存储（内存中）
const taskProgress = new Map()

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// 中间件
app.use(cors())
app.use(express.json({ limit: '10mb' }))
// 静态文件服务，提供上传的图片URL
app.use('/uploads', express.static(uploadsDir))

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Face Swap API服务正常运行' })
})

// 进度查询接口
app.get('/api/progress/:taskId', (req, res) => {
  const { taskId } = req.params
  const progress = taskProgress.get(taskId)

  if (!progress) {
    return res.status(404).json({
      success: false,
      error: '任务不存在'
    })
  }

  res.json({
    success: true,
    ...progress
  })
})

// 换脸接口 - 使用 AIFaceSwap.io API + webhook.site（异步处理）
app.post('/api/face-swap', async (req, res) => {
  const clientTaskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    const { targetImage, sourceImage } = req.body

    if (!targetImage || !sourceImage) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：targetImage (GIF/视频) 和 sourceImage (用户照片)'
      })
    }

    console.log('🎬 开始处理换脸请求...', clientTaskId)
    console.log('目标GIF/视频:', targetImage.substring(0, 100))
    console.log('用户照片格式:', sourceImage.substring(0, 50))
    console.log('API密钥状态:', API_KEY ? '✅ 已配置' : '❌ 未配置')

    // 初始化任务进度
    taskProgress.set(clientTaskId, {
      status: 'processing',
      progress: 0,
      message: '正在抓紧处理中，请耐心等候...'
    })

    // 立即返回任务ID给前端
    res.json({
      success: true,
      taskId: clientTaskId,
      message: '任务已创建，正在处理中'
    })

    // 异步处理换脸任务
    if (FACESWAP_API === 'replicate') {
      processFaceSwapReplicate(clientTaskId, targetImage, sourceImage).catch(error => {
        console.error('Replicate处理失败:', error)
        taskProgress.set(clientTaskId, {
          status: 'failed',
          progress: 100,
          message: error.message || '处理失败',
          error: error.message
        })
      })
    } else {
      processFaceSwap(clientTaskId, targetImage, sourceImage).catch(error => {
        console.error('AIFaceSwap处理失败:', error)
        taskProgress.set(clientTaskId, {
          status: 'failed',
          progress: 100,
          message: error.message || '处理失败',
          error: error.message
        })
      })
    }

  } catch (error) {
    console.error('❌ 初始化失败:', error)
    taskProgress.set(clientTaskId, {
      status: 'failed',
      progress: 0,
      message: error.message || '初始化失败',
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: error.message || '换脸处理失败，请稍后重试'
    })
  }
})

// 使用 Replicate 进行换脸处理
async function processFaceSwapReplicate(clientTaskId, targetImage, sourceImage) {
  try {
    if (!replicate) {
      throw new Error('Replicate API Token 未配置')
    }

    taskProgress.set(clientTaskId, { status: 'processing', progress: 10, message: '正在抓紧处理中，请耐心等候...' })
    console.log('📤 上传用户照片到图床...')
    const base64Data = sourceImage.replace(/^data:image\/\w+;base64,/, '')

    const formData = new URLSearchParams()
    formData.append('image', base64Data)

    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    })

    const imgbbData = await imgbbResponse.json()

    if (!imgbbData.success || !imgbbData.data?.url) {
      throw new Error('图片上传失败: ' + (imgbbData.error?.message || '未知错误'))
    }

    const faceImageUrl = imgbbData.data.url
    console.log('✅ 照片已上传到图床，URL:', faceImageUrl)

    // 调用 Replicate API
    taskProgress.set(clientTaskId, { status: 'processing', progress: 20, message: '正在抓紧处理中，请耐心等候...' })
    console.log('📤 提交换脸任务到 Replicate...')

    // 限制视频时长为3秒（添加URL片段）
    const videoUrl = targetImage.includes('#') ? targetImage : `${targetImage}#t=0,3`
    console.log('使用视频URL（限制3秒）:', videoUrl)

    // 使用 for await 循环监听进度
    let currentProgress = 20
    const progressInterval = setInterval(() => {
      // 缓慢增加进度，但不超过95%
      if (currentProgress < 95) {
        currentProgress += 2
        taskProgress.set(clientTaskId, {
          status: 'processing',
          progress: currentProgress,
          message: '正在抓紧处理中，请耐心等候...'
        })
      }
    }, 1000)

    const output = await replicate.run(
      "wan-video/wan-2.2-animate-replace:b55667691c9d39b12fb9bf46d1dc20d7bf8a93c7bc0455449cbd4ef18c39eb0e",
      {
        input: {
          video: videoUrl,                 // GIF/视频 URL（限制3秒）
          character_image: faceImageUrl,   // 用户照片 URL
          go_fast: true,                   // 加速处理
          resolution: "480",               // 降低分辨率以提高速度
          frames_per_second: 15            // 降低帧率以提高速度
        },
        wait: { interval: 500 }            // 每500ms轮询一次
      }
    )

    // 停止进度更新
    clearInterval(progressInterval)

    console.log('✅ Replicate处理完成!')
    console.log('结果类型:', typeof output)
    console.log('结果内容:', output)

    // 处理返回结果（可能是URL字符串或包含URL的对象）
    let resultUrl = output
    if (typeof output === 'object' && output !== null) {
      // 如果是对象，尝试提取URL
      resultUrl = output.url || output.output || output.result || output[0] || JSON.stringify(output)
    }

    console.log('最终结果URL:', resultUrl)

    // 更新任务状态为完成
    taskProgress.set(clientTaskId, {
      status: 'completed',
      progress: 100,
      message: '✅ 换脸完成！',
      result: resultUrl
    })

  } catch (error) {
    console.error('❌ Replicate换脸失败:', error.message)

    // 更新任务状态为失败
    taskProgress.set(clientTaskId, {
      status: 'failed',
      progress: 100,
      message: error.message || '处理失败',
      error: error.message
    })
  }
}

// 异步处理换脸的函数（AIFaceSwap）
async function processFaceSwap(clientTaskId, targetImage, sourceImage) {
  try {
    // 步骤1: 上传用户照片到ImgBB图床
    taskProgress.set(clientTaskId, { status: 'processing', progress: 5, message: '正在抓紧处理中，请耐心等候...' })
    console.log('📤 上传用户照片到图床...')
    const base64Data = sourceImage.replace(/^data:image\/\w+;base64,/, '')

    const formData = new URLSearchParams()
    formData.append('image', base64Data)

    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    })

    const imgbbData = await imgbbResponse.json()

    if (!imgbbData.success || !imgbbData.data?.url) {
      throw new Error('图片上传失败: ' + (imgbbData.error?.message || '未知错误'))
    }

    const faceImageUrl = imgbbData.data.url
    console.log('✅ 照片已上传到图床，URL:', faceImageUrl)

    // 步骤2: 创建 webhook.site token
    taskProgress.set(clientTaskId, { status: 'processing', progress: 10, message: '正在抓紧处理中，请耐心等候...' })
    console.log('🌐 创建 webhook.site token...')
    const webhookTokenResponse = await fetch('https://webhook.site/token', {
      method: 'POST'
    })

    const webhookTokenData = await webhookTokenResponse.json()
    const webhookToken = webhookTokenData.uuid
    const webhookUrl = `https://webhook.site/${webhookToken}`
    console.log('✅ Webhook URL:', webhookUrl)

    // 步骤3: 提交换脸任务（使用 webhook.site URL）
    taskProgress.set(clientTaskId, { status: 'processing', progress: 15, message: '正在抓紧处理中，请耐心等候...' })
    console.log('📤 提交换脸任务到AIFaceSwap...')
    const submitResponse = await fetch(`${API_BASE_URL}/video_faceswap`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_video: targetImage,
        face_image: faceImageUrl,
        duration: 2,  // 降低到2秒以加快处理速度
        enhance: 0,
        webhook: webhookUrl
      })
    })

    const submitData = await submitResponse.json()
    console.log('提交响应:', JSON.stringify(submitData, null, 2))

    if (submitData.code !== 200 || !submitData.data?.task_id) {
      throw new Error(submitData.message || `API错误: ${submitData.code || submitResponse.status}`)
    }

    const taskId = submitData.data.task_id
    console.log(`✅ 任务已提交，ID: ${taskId}`)
    taskProgress.set(clientTaskId, { status: 'processing', progress: 20, message: '正在抓紧处理中，请耐心等候...' })

    // 步骤4: 优化的轮询策略
    console.log('⏳ 等待 AIFaceSwap 回调...')
    const maxAttempts = 120  // 增加到120次
    let pollInterval = 1000  // 开始1秒，更快响应

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // 第一次立即查询，不等待
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }

      // 动态调整轮询间隔：前10次1秒，10-30次2秒，30-60次3秒，之后4秒
      if (attempt === 10) pollInterval = 2000
      if (attempt === 30) pollInterval = 3000
      if (attempt === 60) pollInterval = 4000

      const progress = 20 + Math.round((attempt / maxAttempts) * 75)  // 20-95%

      // 统一的状态信息
      const statusMessage = '正在抓紧处理中，请耐心等候...'

      // 更新进度到内存
      taskProgress.set(clientTaskId, { status: 'processing', progress, message: statusMessage })

      console.log(`🔄 查询回调 [${attempt}/${maxAttempts}] 进度: ${progress}% - ${statusMessage}`)

      // 查询 webhook.site 的请求记录（带重试逻辑）
      let webhookRequests = null
      let retryCount = 0
      const maxRetries = 2  // 减少重试次数到2次

      while (retryCount < maxRetries && !webhookRequests) {
        try {
          const webhookRequestsResponse = await fetch(
            `https://webhook.site/token/${webhookToken}/requests?sorting=newest`,
            {
              method: 'GET',
              timeout: 3000  // 减少超时到3秒
            }
          )

          webhookRequests = await webhookRequestsResponse.json()
          break  // 成功获取，跳出重试循环
        } catch (fetchError) {
          retryCount++
          console.log(`⚠️ webhook.site 连接失败 (${retryCount}/${maxRetries}):`, fetchError.message)

          if (retryCount < maxRetries) {
            console.log(`🔄 等待1秒后重试...`)
            await new Promise(resolve => setTimeout(resolve, 1000))
          } else {
            console.log(`⚠️ 跳过此次查询，继续下一次轮询`)
            continue  // 跳过本次循环，继续下一次轮询
          }
        }
      }

      // 如果重试后仍然失败，跳过本次查询
      if (!webhookRequests) {
        continue
      }

      if (webhookRequests.data && webhookRequests.data.length > 0) {
        console.log(`📨 收到 ${webhookRequests.data.length} 个 webhook 请求`)

        // 查找包含我们任务ID的回调
        for (const request of webhookRequests.data) {
          try {
            const callbackData = typeof request.content === 'string'
              ? JSON.parse(request.content)
              : request.content

            // AIFaceSwap 回调格式：{ success: 1, task_id: "...", result_image: "..." }
            if (callbackData.task_id === taskId && callbackData.success === 1 && callbackData.result_image) {
              console.log('🎉 换脸成功!')
              console.log('结果URL:', callbackData.result_image)

              // 更新任务状态为完成
              taskProgress.set(clientTaskId, {
                status: 'completed',
                progress: 100,
                message: '✅ 换脸完成！',
                result: callbackData.result_image
              })

              return
            }

            // 检查是否失败
            if (callbackData.task_id === taskId && callbackData.success === 0) {
              throw new Error(callbackData.message || '任务处理失败')
            }

          } catch (parseError) {
            console.log('⚠️ 解析webhook数据失败:', parseError.message)
            continue
          }
        }
      } else {
        console.log(`⏳ 暂无回调数据，继续等待... (${progress}%)`)
      }
    }

    // 超时
    throw new Error('任务处理超时，请稍后重试。建议：1) 尝试更小的图片 2) 选择更短的GIF模板')

  } catch (error) {
    console.error('❌ 换脸失败:', error.message)

    // 更新任务状态为失败
    taskProgress.set(clientTaskId, {
      status: 'failed',
      progress: 100,
      message: error.message || '处理失败',
      error: error.message
    })
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Face Swap API服务已启动: http://localhost:${PORT}`)
  console.log(`📝 当前使用API: ${FACESWAP_API === 'replicate' ? 'Replicate' : 'AIFaceSwap'}`)

  if (FACESWAP_API === 'replicate') {
    console.log(`🔑 Replicate API密钥状态: ${REPLICATE_API_TOKEN ? '✅ 已配置' : '❌ 未配置'}`)
  } else {
    console.log(`🔑 AIFaceSwap API密钥状态: ${API_KEY ? '✅ 已配置' : '❌ 未配置'}`)
  }
})
