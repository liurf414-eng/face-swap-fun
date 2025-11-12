// VModel Face Swap API - Simplified version

const taskStore = new Map()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET' && req.query?.taskId) {
    let task = taskStore.get(req.query.taskId)
    
    // 如果内存中找不到任务（可能是 serverless 实例隔离），尝试从 VModel API 查询
    if (!task && req.query?.vmodelTaskId) {
      console.log(`Task not found in memory, trying VModel API with task ID: ${req.query.vmodelTaskId}`)
      try {
        const VMODEL_API_TOKEN = process.env.VMODEL_API_TOKEN || '3RqdT2vcZj3EB3WWJD-3M6O505kUnd6Q3HtUEoagnbJP96lL_c6AXQp8YdxaL82Q6KKpgm4Y3VBY0fYwL5uZKQ=='
        // 根据 VModel 官方文档：https://vmodel.ai/docs/api/guides/tasks.html
        // 正确的查询端点是：GET https://api.vmodel.ai/api/tasks/v1/get/{task_id}
        const VMODEL_API_URL = 'https://api.vmodel.ai/api/tasks/v1'
        const statusEndpoints = [
          `${VMODEL_API_URL}/get/${req.query.vmodelTaskId}`,  // 官方文档格式
          `${VMODEL_API_URL}/${req.query.vmodelTaskId}`,  // 备选格式
        ]
        
        for (const endpoint of statusEndpoints) {
          try {
            const statusResponse = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${VMODEL_API_TOKEN}`
              }
            })
            
            if (statusResponse.ok) {
              const responseData = await statusResponse.json()
              
              // 根据 VModel 官方文档，检查 code 字段
              if (responseData.code === 200 && responseData.result) {
                const result = responseData.result
                
                // 检查任务是否完成：status 为 "succeeded" 或 completed_at 存在且 error 为 null
                if (result.status === 'succeeded' || (result.completed_at && (result.error === null || result.error === ''))) {
                  task = {
                    status: 'completed',
                    progress: 100,
                    message: 'Face swap completed!',
                    result: result.output?.[0] || result.output,
                    vmodelTaskId: req.query.vmodelTaskId
                  }
                  taskStore.set(req.query.taskId, task)
                  console.log(`✅ Retrieved completed task from VModel API: ${req.query.vmodelTaskId}`)
                  break
                } else if (result.status === 'processing' || result.status === 'starting') {
                  // 任务还在处理中
                  task = {
                    status: 'processing',
                    progress: 50,
                    message: `Processing... (status: ${result.status})`,
                    vmodelTaskId: req.query.vmodelTaskId
                  }
                  taskStore.set(req.query.taskId, task)
                  break
                }
              }
            }
          } catch (fetchError) {
            console.warn(`Failed to fetch from ${endpoint}:`, fetchError.message)
            continue
          }
        }
      } catch (error) {
        console.error('Error querying VModel API:', error)
      }
    }
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found. If you have the VModel task ID, please include it as ?vmodelTaskId=xxx'
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
    const VMODEL_API_TOKEN = process.env.VMODEL_API_TOKEN || '3RqdT2vcZj3EB3WWJD-3M6O505kUnd6Q3HtUEoagnbJP96lL_c6AXQp8YdxaL82Q6KKpgm4Y3VBY0fYwL5uZKQ=='
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY

    if (!IMGBB_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'IMGBB_API_KEY is not configured'
      })
    }

    if (!VMODEL_API_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'VMODEL_API_TOKEN is not configured'
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

    const { targetImage, sourceImage, sourceImage2 } = body || {}

    // 检查是否为Duo Interaction（有sourceImage2）
    const isDuoInteraction = !!sourceImage2

    if (!targetImage || !sourceImage) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: targetImage and sourceImage'
      })
    }

    if (isDuoInteraction && !sourceImage2) {
      return res.status(400).json({
        success: false,
        error: 'Duo Interaction requires sourceImage2'
      })
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    res.json({
      success: true,
      taskId: taskId,
      status: 'processing',
      message: 'Processing video...'
    })

    // 根据是否有sourceImage2选择处理方式
    if (isDuoInteraction) {
      processFaceSwapDuo(taskId, targetImage, sourceImage, sourceImage2, VMODEL_API_TOKEN, IMGBB_API_KEY).catch(error => {
        console.error('VModel Duo processing error:', error)
        taskStore.set(taskId, {
          status: 'failed',
          progress: 100,
          error: error.message || 'Processing failed'
        })
      })
    } else {
      processFaceSwapVModel(taskId, targetImage, sourceImage, VMODEL_API_TOKEN, IMGBB_API_KEY).catch(error => {
        console.error('VModel processing error:', error)
        taskStore.set(taskId, {
          status: 'failed',
          progress: 100,
          error: error.message || 'Processing failed'
        })
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

// VModel 处理（最快，约15秒）
async function processFaceSwapVModel(taskId, targetImage, sourceImage, VMODEL_API_TOKEN, IMGBB_API_KEY) {
  const VMODEL_API_URL = 'https://api.vmodel.ai/api/tasks/v1'
  const MODEL_VERSION = '537e83f7ed84751dc56aa80fb2391b07696c85a49967c72c64f002a0ca2bb224'
  
  // 动态预测时间逻辑
  const INITIAL_ESTIMATE = 20.0  // VModel 初始估计：20秒
  let estimatedTotalTime = INITIAL_ESTIMATE
  let previousEstimate = INITIAL_ESTIMATE
  const startTime = Date.now()

  taskStore.set(taskId, {
    status: 'processing',
    progress: 10.0,
    message: 'Uploading images...',
    elapsedTime: 0.0,
    estimatedTotalTime: INITIAL_ESTIMATE
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

    const elapsedAfterUpload = parseFloat(((Date.now() - startTime) / 1000).toFixed(1))
    taskStore.set(taskId, {
      status: 'processing',
      progress: 30.0,
      message: 'Creating face swap task...',
      elapsedTime: elapsedAfterUpload,
      estimatedTotalTime: estimatedTotalTime
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
    console.log('VModel task creation response:', JSON.stringify(createData, null, 2))
    
    // 检查是否有错误代码（402 是支付错误）
    if (createData.code === 402) {
      const errorMsg = createData.message?.en || createData.message?.zh || createData.message || 'Payment Required'
      throw new Error(`VModel Payment Required: ${errorMsg}. Please check your account balance at https://vmodel.ai`)
    }
    
    // 检查是否有其他错误代码（但不包括成功消息）
    if (createData.code && createData.code !== 200 && createData.code !== '200') {
      const errorMsg = createData.message?.en || createData.message?.zh || createData.message || 'Unknown error'
      throw new Error(`VModel Error (code ${createData.code}): ${errorMsg}`)
    }
    
    // 获取任务 ID（可能有多种格式）
    // 根据实际响应格式：{"code":200,"result":{"task_id":"xxx"},"message":{"en":"Task created successfully"}}
    const vmodelTaskId = createData.result?.task_id ||
                         createData.task_id || 
                         createData.id || 
                         createData.data?.task_id ||
                         createData.data?.id ||
                         createData.result?.id

    if (!vmodelTaskId) {
      // 如果响应中有消息但没有 task_id，记录完整响应以便调试
      console.error('VModel response has no task_id:', JSON.stringify(createData, null, 2))
      throw new Error(`VModel task created but no task_id in response. Response: ${JSON.stringify(createData)}`)
    }

    console.log('VModel task created:', vmodelTaskId)

    const elapsedAfterCreate = ((Date.now() - startTime) / 1000).toFixed(1)
    taskStore.set(taskId, {
      status: 'processing',
      progress: 40.0,
      message: 'Processing video...',
      elapsedTime: parseFloat(elapsedAfterCreate),
      estimatedTotalTime: estimatedTotalTime,
      vmodelTaskId: vmodelTaskId  // 存储 VModel task ID，用于备用查询
    })

    // 轮询任务状态（最多等待5分钟，因为任务创建后可能需要时间才能查询）
    const maxAttempts = 300  // 5分钟 = 300次 * 1秒
    let progress = 40
    let consecutive404Count = 0  // 记录连续 404 的次数

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 每秒检查一次

      let statusResponse
      let statusData = null
      
      try {
        // 根据 VModel 官方文档：https://vmodel.ai/docs/api/guides/tasks.html
        // 正确的查询端点是：GET https://api.vmodel.ai/api/tasks/v1/get/{task_id}
        const statusEndpoints = [
          `${VMODEL_API_URL}/get/${vmodelTaskId}`,  // 官方文档格式：/api/tasks/v1/get/{task_id}
          `${VMODEL_API_URL}/${vmodelTaskId}`,  // 备选：/api/tasks/v1/{task_id}（向后兼容）
          `https://api.vmodel.ai/api/tasks/${vmodelTaskId}`,  // 备选：/api/tasks/{task_id}
        ]
        
        let lastError = null
        for (const statusEndpoint of statusEndpoints) {
          try {
            console.log(`[Attempt ${attempt}] Querying VModel task status: ${statusEndpoint}`)
            
            statusResponse = await fetch(statusEndpoint, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${VMODEL_API_TOKEN}`
              }
            })
            
            // 如果成功（包括 200 和其他非 404 状态），使用这个端点
            if (statusResponse.status !== 404) {
              console.log(`✅ Found working endpoint: ${statusEndpoint} (status: ${statusResponse.status})`)
              break
            }
            
            // 如果是 404，尝试下一个端点
            lastError = new Error(`404 Not Found from ${statusEndpoint}`)
            console.warn(`⚠️ 404 from ${statusEndpoint}, trying next endpoint...`)
            
            // 如果是最后一个端点也返回 404，记录详细信息
            if (statusEndpoint === statusEndpoints[statusEndpoints.length - 1]) {
              console.error(`❌ All endpoints returned 404 for task ID: ${vmodelTaskId}`)
              console.error(`   Task should exist in VModel dashboard. Please verify the task ID is correct.`)
            }
          } catch (endpointError) {
            lastError = endpointError
            console.warn(`⚠️ Error from ${statusEndpoint}:`, endpointError.message)
            continue
          }
        }
        
        // 如果所有端点都失败，使用最后一个响应
        // 注意：如果 statusResponse 未定义，说明所有端点都抛出了异常
        if (!statusResponse) {
          // 如果所有端点都失败，创建一个模拟的 404 响应
          statusResponse = { status: 404, ok: false }
        }
        
        // 处理 404 - 任务可能刚创建，需要等待
        if (statusResponse.status === 404) {
          consecutive404Count++
          console.warn(`Task not found (404) on attempt ${attempt}/${maxAttempts}. Task ID: ${vmodelTaskId}. Consecutive 404s: ${consecutive404Count}. This is normal for newly created tasks, will retry...`)
          
          // 如果连续多次 404（超过 60 次，即 1 分钟），可能是端点不对或任务 ID 有问题
          // 但仍然继续尝试，因为 VModel 可能需要更长时间
          if (consecutive404Count > 60 && attempt % 30 === 0) {
            console.warn(`⚠️ Still getting 404 after ${consecutive404Count} attempts. Task ID: ${vmodelTaskId}. Please verify the task exists in VModel dashboard.`)
          }
          
          // 继续轮询，不抛出错误
          continue
        }
        
        // 如果成功获取到响应，重置 404 计数
        consecutive404Count = 0
        
        // 处理其他错误
        if (!statusResponse.ok) {
          const errorText = await statusResponse.text()
          
          if (statusResponse.status === 402) {
            throw new Error('Payment Required: Your VModel account balance is insufficient. Please check your account at https://vmodel.ai')
          }
          
          // 其他错误也记录但继续重试（可能是临时问题）
          console.warn(`VModel status check failed (${statusResponse.status}):`, errorText.substring(0, 200))
          
          // 如果不是最后一次尝试，继续重试
          if (attempt < maxAttempts) {
            continue
          } else {
            throw new Error(`VModel status check failed: ${statusResponse.status} - ${errorText.substring(0, 200)}`)
          }
        }
        
        // 解析响应
        const responseData = await statusResponse.json()
        console.log(`[Attempt ${attempt}] VModel status response:`, JSON.stringify(responseData, null, 2))

        // 根据 VModel 官方文档：https://vmodel.ai/docs/api/guides/tasks.html
        // 响应格式：{"code": 200, "result": {...}, "message": {}}
        // 需要检查 code 字段，而不是只检查 HTTP 状态码
        if (responseData.code !== 200) {
          const errorMsg = responseData.message?.en || responseData.message?.zh || responseData.message || 'Unknown error'
          
          if (responseData.code === 402) {
            throw new Error(`VModel Payment Required: ${errorMsg}. Please check your account balance at https://vmodel.ai`)
          }
          
          if (responseData.code === 404) {
            // 404 可能是任务还没准备好，继续重试
            console.warn(`VModel API returned code 404: ${errorMsg}. Task may not be ready yet, will retry...`)
            continue
          }
          
          throw new Error(`VModel API error (code ${responseData.code}): ${errorMsg}`)
        }

        // 实际数据在 result 对象中
        statusData = responseData.result
        
        // 检查响应数据是否存在
        if (!statusData) {
          console.warn(`No result data in response on attempt ${attempt}, will retry...`)
          continue
        }
        
        // 根据官方文档，响应格式：
        // {"code": 200, "result": {"task_id": "...", "status": "succeeded", "output": ["url"], "completed_at": 1746497131, "error": null}}
        const taskStatus = statusData.status  // status 在 result 中
        
        // 如果任务有 completed_at 且没有 error，说明已完成
        // error 为 null 或空字符串表示成功，error 存在表示失败
        const isCompleted = statusData.completed_at && (statusData.error === null || statusData.error === '' || !statusData.error)
        
        console.log(`Task status: "${taskStatus}"`)
        console.log(`Completed at: ${statusData.completed_at || 'N/A'}`)
        console.log(`Error: ${statusData.error || 'null'}`)
        console.log(`Is completed: ${isCompleted}`)
        console.log(`Output:`, statusData.output)
        
        // 检查任务是否失败
        if (taskStatus === 'failed' || (statusData.error && statusData.error !== null && statusData.error !== '')) {
          const errorMsg = statusData.error?.message || statusData.error || statusData.message?.en || statusData.message?.zh || 'Task failed'
          const elapsedFailure = parseFloat(((Date.now() - startTime) / 1000).toFixed(1))
          taskStore.set(taskId, {
            status: 'failed',
            progress: 100,
            message: 'Generation failed',
            error: errorMsg,
            elapsedTime: elapsedFailure,
            estimatedTotalTime: parseFloat(estimatedTotalTime.toFixed(1)),
            vmodelTaskId: vmodelTaskId
          })
          console.error(`❌ VModel task failed immediately: ${errorMsg}`)
          return
        }

        // 计算已用时间（精确到0.1秒）
        const elapsed = parseFloat(((Date.now() - startTime) / 1000).toFixed(1))
        
        // 动态调整预测时间
        if (elapsed >= 3.0) {
          // 如果已用时间 >= 3秒，根据进度反推预计总时间
          const currentProgress = Math.min(40 + (attempt / maxAttempts) * 50, 95) / 100
          if (currentProgress > 0.1) {  // 确保进度大于0，避免除以0
            const calculatedEstimate = elapsed / currentProgress
            // 平滑处理：70% 当前估计 + 30% 新计算值
            estimatedTotalTime = parseFloat((0.7 * estimatedTotalTime + 0.3 * calculatedEstimate).toFixed(1))
            // 确保不会变化太剧烈（至少是已用时间的1.2倍，最多不超过初始估计的2倍）
            estimatedTotalTime = Math.max(
              elapsed * 1.2,
              Math.min(estimatedTotalTime, INITIAL_ESTIMATE * 2)
            )
            previousEstimate = estimatedTotalTime
          }
        }
        
        // 计算进度（精确到0.1%）
        const baseProgress = Math.min(40 + (attempt / maxAttempts) * 50, 95)
        // 如果已用时间超过估计时间，进度应该接近100%
        if (elapsed >= estimatedTotalTime * 0.9) {
          progress = Math.min(95, baseProgress + (elapsed / estimatedTotalTime - 0.9) * 10)
        } else {
          progress = baseProgress
        }
        progress = parseFloat(progress.toFixed(1))
        
        taskStore.set(taskId, {
          status: 'processing',
          progress: progress,
          message: 'Processing...',
          elapsedTime: elapsed,
          estimatedTotalTime: parseFloat(estimatedTotalTime.toFixed(1)),
          vmodelTaskId: vmodelTaskId
        })

        // 检查任务是否完成
        // 根据 VModel 官方文档：status 可能的值：starting, processing, succeeded, failed, canceled
        // 根据官方文档响应格式：{"code": 200, "result": {"status": "succeeded", "output": ["url"], "completed_at": 1746497131, "error": null}}
        const isSuccessStatus = taskStatus === 'succeeded' || 
                               (taskStatus && taskStatus.toLowerCase() === 'succeeded')
        
        // 完成判断：status 为 "succeeded" 或者 completed_at 存在且 error 为 null
        const hasCompletedAt = !!statusData.completed_at
        const hasNoError = statusData.error === null || statusData.error === '' || !statusData.error
        const hasOutput = !!statusData.output && (Array.isArray(statusData.output) ? statusData.output.length > 0 : !!statusData.output)
        
        console.log(`Completion check: isSuccessStatus=${isSuccessStatus}, hasCompletedAt=${hasCompletedAt}, hasNoError=${hasNoError}, hasOutput=${hasOutput}`)
        
        if (isSuccessStatus || (hasCompletedAt && hasNoError && hasOutput)) {
          // 任务完成 - 根据官方文档，输出在 result.output 数组中
          const outputUrl = statusData.output?.[0] ||  // 优先：result.output 数组的第一个元素
                          statusData.output ||            // 如果 output 是字符串
                          statusData.result?.output?.[0] ||  // 备用路径
                          statusData.result?.output

          console.log('✅ VModel task succeeded!')
          console.log('Task status:', taskStatus)
          console.log('Completed at:', statusData.completed_at)
          console.log('Output array:', statusData.output)
          console.log('Output URL:', outputUrl)
          console.log('Full status response:', JSON.stringify(statusData, null, 2))

          if (!outputUrl) {
            console.error('❌ No output URL found in VModel response:', JSON.stringify(statusData, null, 2))
            throw new Error('No output URL in VModel response. Response: ' + JSON.stringify(statusData))
          }

          const finalElapsed = parseFloat(((Date.now() - startTime) / 1000).toFixed(1))
          taskStore.set(taskId, {
            status: 'completed',
            progress: 100.0,
            message: 'Complete!',
            result: outputUrl,
            elapsedTime: finalElapsed,
            estimatedTotalTime: parseFloat(estimatedTotalTime.toFixed(1)),
            vmodelTaskId: vmodelTaskId  // 保持存储 VModel task ID
          })
          return
        } else if (taskStatus && (taskStatus.toLowerCase() === 'failed' || taskStatus.toLowerCase() === 'error')) {
          const errorObj = statusData.error || statusData.result?.error || {}
          const errorMsg = errorObj.message || statusData.message || 'VModel processing failed'
          const elapsedFailure = parseFloat(((Date.now() - startTime) / 1000).toFixed(1))
          taskStore.set(taskId, {
            status: 'failed',
            progress: 100,
            message: 'Generation failed',
            error: errorMsg,
            elapsedTime: elapsedFailure,
            estimatedTotalTime: parseFloat(estimatedTotalTime.toFixed(1)),
            vmodelTaskId: vmodelTaskId
          })
          console.error(`❌ VModel task status returned failed/error: ${errorMsg}`)
          return
        }
        
        // 如果状态是 'processing'、'pending'、'running' 或其他处理中状态，继续轮询
        if (!taskStatus || 
            taskStatus.toLowerCase() === 'processing' || 
            taskStatus.toLowerCase() === 'pending' || 
            taskStatus.toLowerCase() === 'running' ||
            taskStatus.toLowerCase() === 'queued') {
          console.log(`Task status is "${taskStatus}", continuing to poll...`)
        } else {
          // 未知状态，记录但继续轮询
          console.warn(`Unknown task status: "${taskStatus}", continuing to poll...`)
        }

      } catch (fetchError) {
        console.error(`VModel status check error on attempt ${attempt}:`, fetchError)
        
        // 如果是网络错误或解析错误，继续重试（可能是临时问题）
        // 只在最后一次尝试时抛出错误
        if (attempt === maxAttempts) {
          // 检查是否是 404 错误（任务可能还没准备好）
          if (fetchError.message && fetchError.message.includes('404')) {
            throw new Error('VModel task not found after multiple attempts. The task may not exist or may have been deleted. Task ID: ' + vmodelTaskId)
          }
          throw new Error(`Failed to check VModel status after ${maxAttempts} attempts: ${fetchError.message}`)
        }
        
        // 不是最后一次尝试，继续重试
        console.log(`Will retry on next attempt (${attempt + 1}/${maxAttempts})...`)
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

// 检测视频中的人脸（用于Duo Interaction）
async function detectFacesInVideo(videoUrl, VMODEL_API_TOKEN) {
  const VMODEL_API_URL = 'https://api.vmodel.ai/api/tasks/v1'
  const DETECT_MODEL_VERSION = 'fa9317a2ad086f7633f4f9b38f35c82495b6c5f38fa2afbe32d9d9df8620b389'
  
  // 对视频 URL 进行编码
  const encodedVideoUrl = encodeURI(videoUrl)
  
  console.log('Detecting faces in video:', encodedVideoUrl)
  
  // 创建人脸检测任务
  const createResponse = await fetch(`${VMODEL_API_URL}/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VMODEL_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: DETECT_MODEL_VERSION,
      input: {
        source: encodedVideoUrl
      }
    })
  })

  if (!createResponse.ok) {
    const errorText = await createResponse.text()
    throw new Error(`Face detection API error: ${createResponse.status} - ${errorText}`)
  }

  const createData = await createResponse.json()
  console.log('Face detection task creation response:', JSON.stringify(createData, null, 2))
  
  // 提取 task_id
  const detectTaskId = createData.result?.task_id || createData.task_id
  if (!detectTaskId) {
    throw new Error('No task_id in face detection response')
  }

  console.log('Face detection task ID:', detectTaskId)

  // 轮询检测任务状态
  const maxAttempts = 60
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒

    try {
      const statusEndpoints = [
        `${VMODEL_API_URL}/get/${detectTaskId}`,
        `${VMODEL_API_URL}/${detectTaskId}`,
      ]

      let statusData = null
      for (const endpoint of statusEndpoints) {
        try {
          const statusResponse = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${VMODEL_API_TOKEN}`
            }
          })

          if (statusResponse.ok) {
            const responseData = await statusResponse.json()
            if (responseData.code === 200 && responseData.result) {
              statusData = responseData.result
              break
            }
          }
        } catch (fetchError) {
          console.warn(`Failed to fetch from ${endpoint}:`, fetchError.message)
          continue
        }
      }

      if (!statusData) {
        throw new Error('Failed to get face detection status')
      }

      // 检查是否完成
      if (statusData.completed_at && !statusData.error) {
        // 提取 detect_id 和 face_map
        const detectId = statusData.output?.detect_id || statusData.detect_id
        const faceMap = statusData.output?.face_map || statusData.face_map

        if (detectId && faceMap) {
          console.log('Face detection completed:', { detectId, faceMap })
          return { detectId, faceMap }
        } else {
          throw new Error('Face detection completed but missing detect_id or face_map')
        }
      } else if (statusData.error) {
        throw new Error(`Face detection failed: ${statusData.error}`)
      }

      // 继续轮询
      console.log(`Face detection in progress... (attempt ${attempt}/${maxAttempts})`)
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
      console.warn(`Face detection polling error (attempt ${attempt}):`, error.message)
    }
  }

  throw new Error('Face detection timeout (exceeded 2 minutes)')
}

// VModel 双人脸替换处理（Duo Interaction）
async function processFaceSwapDuo(taskId, targetImage, sourceImage, sourceImage2, VMODEL_API_TOKEN, IMGBB_API_KEY) {
  const VMODEL_API_URL = 'https://api.vmodel.ai/api/tasks/v1'
  const DUO_MODEL_VERSION = '8e960283784c5b58e5f67236757c40bb6796c85e3c733d060342bdf62f9f0c64'
  
  const INITIAL_ESTIMATE = 30.0
  let estimatedTotalTime = INITIAL_ESTIMATE
  const startTime = Date.now()

  taskStore.set(taskId, {
    status: 'processing',
    progress: 5.0,
    message: 'Uploading images...',
    elapsedTime: 0.0,
    estimatedTotalTime: INITIAL_ESTIMATE
  })

  try {
    // 上传两张照片到 ImgBB
    let faceImageUrl1 = sourceImage
    let faceImageUrl2 = sourceImage2

    // 上传第一张照片
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
        throw new Error(`Failed to upload image 1: ${uploadData.error?.message || 'Unknown error'}`)
      }
      faceImageUrl1 = uploadData.data.url
      console.log('Image 1 uploaded to ImgBB:', faceImageUrl1)
    }

    // 上传第二张照片
    if (sourceImage2.startsWith('data:image')) {
      const base64Data = sourceImage2.replace(/^data:image\/\w+;base64,/, '')
      const formData = new URLSearchParams()
      formData.append('image', base64Data)

      const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      const uploadData = await uploadResponse.json()
      if (!uploadData.success || !uploadData.data?.url) {
        throw new Error(`Failed to upload image 2: ${uploadData.error?.message || 'Unknown error'}`)
      }
      faceImageUrl2 = uploadData.data.url
      console.log('Image 2 uploaded to ImgBB:', faceImageUrl2)
    }

    const elapsedAfterUpload = parseFloat(((Date.now() - startTime) / 1000).toFixed(1))
    taskStore.set(taskId, {
      status: 'processing',
      progress: 15.0,
      message: 'Detecting faces in video...',
      elapsedTime: elapsedAfterUpload,
      estimatedTotalTime: estimatedTotalTime
    })

    // 步骤1: 检测视频中的人脸
    const { detectId, faceMap: detectedFaceMap } = await detectFacesInVideo(targetImage, VMODEL_API_TOKEN)

    const elapsedAfterDetect = parseFloat(((Date.now() - startTime) / 1000).toFixed(1))
    taskStore.set(taskId, {
      status: 'processing',
      progress: 30.0,
      message: 'Creating face swap task...',
      elapsedTime: elapsedAfterDetect,
      estimatedTotalTime: estimatedTotalTime
    })

    // 步骤2: 构建 face_map
    // 解析检测到的 face_map（如果返回的是字符串，需要解析）
    let parsedFaceMap = []
    try {
      if (typeof detectedFaceMap === 'string') {
        parsedFaceMap = JSON.parse(detectedFaceMap)
      } else {
        parsedFaceMap = detectedFaceMap
      }
    } catch (e) {
      // 如果解析失败，假设检测到的人脸按顺序映射
      parsedFaceMap = [
        { face_id: 0 },
        { face_id: 1 }
      ]
    }

    // 构建新的 face_map，将用户上传的照片映射到检测到的人脸
    // 简单映射：face_id 0 -> 照片1, face_id 1 -> 照片2
    const newFaceMap = [
      { face_id: 0, target: faceImageUrl1 },
      { face_id: 1, target: faceImageUrl2 }
    ]

    // 如果检测到的人脸数量不是2个，使用前两个或随机映射
    if (parsedFaceMap.length !== 2) {
      console.warn(`Detected ${parsedFaceMap.length} faces, expected 2. Using first 2 faces.`)
      // 只使用前两个检测到的人脸
      const faceIds = parsedFaceMap.slice(0, 2).map(f => f.face_id || f.id || 0)
      newFaceMap[0].face_id = faceIds[0] || 0
      newFaceMap[1].face_id = faceIds[1] || 1
    } else {
      // 使用检测到的人脸ID
      newFaceMap[0].face_id = parsedFaceMap[0].face_id || parsedFaceMap[0].id || 0
      newFaceMap[1].face_id = parsedFaceMap[1].face_id || parsedFaceMap[1].id || 1
    }

    const faceMapString = JSON.stringify(newFaceMap)
    console.log('Face map:', faceMapString)

    // 步骤3: 创建双人脸替换任务
    const encodedVideoUrl = encodeURI(targetImage)
    const createResponse = await fetch(`${VMODEL_API_URL}/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VMODEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: DUO_MODEL_VERSION,
        input: {
          detect_id: detectId,
          face_map: faceMapString,
          disable_safety_checker: false
        }
      })
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      let errorMessage = `VModel Duo API error: ${createResponse.status} - ${errorText}`
      
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
    console.log('VModel Duo task creation response:', JSON.stringify(createData, null, 2))
    
    if (createData.code === 402) {
      const errorMsg = createData.message?.en || createData.message?.zh || createData.message || 'Payment Required'
      throw new Error(`VModel Payment Required: ${errorMsg}. Please check your account balance at https://vmodel.ai`)
    }

    const vmodelTaskId = createData.result?.task_id || createData.task_id
    if (!vmodelTaskId) {
      throw new Error('No task_id in VModel Duo response')
    }

    console.log('VModel Duo task ID:', vmodelTaskId)

    // 存储 task_id 到 taskStore
    taskStore.set(taskId, {
      status: 'processing',
      progress: 40.0,
      message: 'Processing video...',
      elapsedTime: parseFloat(((Date.now() - startTime) / 1000).toFixed(1)),
      estimatedTotalTime: estimatedTotalTime,
      vmodelTaskId: vmodelTaskId
    })

    // 轮询任务状态（与单人脸替换相同的逻辑）
    const maxAttempts = 120
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      try {
        const statusEndpoints = [
          `${VMODEL_API_URL}/get/${vmodelTaskId}`,
          `${VMODEL_API_URL}/${vmodelTaskId}`,
        ]

        let statusData = null
        for (const endpoint of statusEndpoints) {
          try {
            const statusResponse = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${VMODEL_API_TOKEN}`
              }
            })

            if (statusResponse.ok) {
              const responseData = await statusResponse.json()
              if (responseData.code === 200 && responseData.result) {
                statusData = responseData.result
                break
              }
            }
          } catch (fetchError) {
            console.warn(`Failed to fetch from ${endpoint}:`, fetchError.message)
            continue
          }
        }

        if (!statusData) {
          throw new Error('Failed to get VModel Duo status')
        }

        const elapsed = parseFloat(((Date.now() - startTime) / 1000).toFixed(1))
        const progress = Math.min(40 + (attempt / maxAttempts) * 55, 95)

        taskStore.set(taskId, {
          status: 'processing',
          progress: progress,
          message: 'Processing video...',
          elapsedTime: elapsed,
          estimatedTotalTime: estimatedTotalTime,
          vmodelTaskId: vmodelTaskId
        })

        // 检查是否完成
        if (statusData.completed_at && !statusData.error) {
          const outputUrl = statusData.output?.[0] || statusData.output || statusData.result
          if (outputUrl) {
            taskStore.set(taskId, {
              status: 'completed',
              progress: 100,
              message: 'Face swap completed!',
              result: outputUrl,
              elapsedTime: elapsed,
              estimatedTotalTime: estimatedTotalTime,
              vmodelTaskId: vmodelTaskId
            })
            console.log('✅ VModel Duo face swap completed:', outputUrl)
            return
          }
        } else if (statusData.error) {
          throw new Error(`VModel Duo processing failed: ${statusData.error}`)
        }

        console.log(`VModel Duo processing... (attempt ${attempt}/${maxAttempts})`)
      } catch (error) {
        if (attempt === maxAttempts) {
          if (error.message && error.message.includes('404')) {
            throw new Error('VModel Duo task not found after multiple attempts. Task ID: ' + vmodelTaskId)
          }
          throw error
        }
        console.warn(`VModel Duo polling error (attempt ${attempt}):`, error.message)
      }
    }

    throw new Error('VModel Duo processing timeout (exceeded 4 minutes)')

  } catch (error) {
    console.error('VModel Duo processing error:', error)
    taskStore.set(taskId, {
      status: 'failed',
      progress: 100,
      error: error.message || 'VModel Duo processing failed'
    })
  }
}
