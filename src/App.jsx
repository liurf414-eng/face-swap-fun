import { useState, useEffect, useMemo, useRef } from 'react'
import './App.css'

// 默认模板（回退方案）
const defaultTemplates = [
  // 搞笑魔性类 - 真人表情
  { id: 1, name: '惊讶瞪眼', gifUrl: 'https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.mp4', category: '搞笑', type: 'video' },
  { id: 2, name: '尴尬微笑', gifUrl: 'https://media.giphy.com/media/KupdfnqWuMpNS/giphy.mp4', category: '搞笑', type: 'video' },
  { id: 3, name: '点头认同', gifUrl: 'https://media.giphy.com/media/KEYEpIngcmXlHetDqz/giphy.mp4', category: '搞笑', type: 'video' },
  { id: 4, name: '捂嘴偷笑', gifUrl: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.mp4', category: '搞笑', type: 'video' },
  { id: 5, name: '大笑不止', gifUrl: 'https://media.giphy.com/media/3o7btNhMBytxAM6YBa/giphy.mp4', category: '搞笑', type: 'video' },
  { id: 6, name: '笑到流泪', gifUrl: 'https://media.giphy.com/media/Q7ozWVYCR0nyW2rvPW/giphy.mp4', category: '搞笑', type: 'video' },
  { id: 7, name: '翻白眼', gifUrl: 'https://media.giphy.com/media/Fjr6v88OPk7U4/giphy.mp4', category: '搞笑', type: 'video' },
  { id: 8, name: '无语表情', gifUrl: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.mp4', category: '搞笑', type: 'video' },
  { id: 9, name: '疯狂大笑', gifUrl: 'https://media.giphy.com/media/O5NyCibf93upy/giphy.mp4', category: '搞笑', type: 'video' },
  { id: 10, name: '憋笑脸', gifUrl: 'https://media.giphy.com/media/9MFsKQ8A6HCN2/giphy.mp4', category: '搞笑', type: 'video' },

  // 酷炫表情类 - 真人表情
  { id: 11, name: '戴墨镜', gifUrl: 'https://media.giphy.com/media/1jkSrMMRP53fSke11n/giphy.mp4', category: '酷炫', type: 'video' },
  { id: 12, name: '自信眨眼', gifUrl: 'https://media.giphy.com/media/l0Iy67evoh42GvFiU/giphy.mp4', category: '酷炫', type: 'video' },
  { id: 13, name: '点头微笑', gifUrl: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.mp4', category: '酷炫', type: 'video' },
  { id: 14, name: '飞吻', gifUrl: 'https://media.giphy.com/media/xUOrw5LIxb8S9X1LGg/giphy.mp4', category: '酷炫', type: 'video' },
  { id: 15, name: '竖大拇指', gifUrl: 'https://media.giphy.com/media/3oEdva9BUHPIs2SkGk/giphy.mp4', category: '酷炫', type: 'video' },
  { id: 16, name: '酷炫转头', gifUrl: 'https://media.giphy.com/media/26ybw9bHdgFUUoXAc/giphy.mp4', category: '酷炫', type: 'video' },
  { id: 17, name: '挑眉', gifUrl: 'https://media.giphy.com/media/5XZatgyewAMaQ/giphy.mp4', category: '酷炫', type: 'video' },
  { id: 18, name: '微笑点头', gifUrl: 'https://media.giphy.com/media/S3Ot3hZ5bcy8o/giphy.mp4', category: '酷炫', type: 'video' },
  { id: 19, name: '自信笑容', gifUrl: 'https://media.giphy.com/media/l0HlPystfePnYIxWg/giphy.mp4', category: '酷炫', type: 'video' },
  { id: 20, name: '眨眼微笑', gifUrl: 'https://media.giphy.com/media/l0MYMizgnsTpoMuoo/giphy.mp4', category: '酷炫', type: 'video' },

  // 情绪表达类 - 真人表情
  { id: 21, name: '开心大笑', gifUrl: 'https://media.giphy.com/media/l0MYu38R0PPhIXqlO/giphy.mp4', category: '情绪', type: 'video' },
  { id: 22, name: '惊讶张嘴', gifUrl: 'https://media.giphy.com/media/3o72F8t9TDi2xVnxOE/giphy.mp4', category: '情绪', type: 'video' },
  { id: 23, name: '思考表情', gifUrl: 'https://media.giphy.com/media/l0HlDHQEiIdY3kxlm/giphy.mp4', category: '情绪', type: 'video' },
  { id: 24, name: '疑惑皱眉', gifUrl: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.mp4', category: '情绪', type: 'video' },
  { id: 25, name: '伤心哭泣', gifUrl: 'https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.mp4', category: '情绪', type: 'video' },
  { id: 26, name: '生气皱眉', gifUrl: 'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.mp4', category: '情绪', type: 'video' },
  { id: 27, name: '害羞脸红', gifUrl: 'https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.mp4', category: '情绪', type: 'video' },
  { id: 28, name: '兴奋欢呼', gifUrl: 'https://media.giphy.com/media/l0Iy2MnL9ejDrf73i/giphy.mp4', category: '情绪', type: 'video' },
  { id: 29, name: '得意笑容', gifUrl: 'https://media.giphy.com/media/l0Ex8CNFvRJ87Mvfy/giphy.mp4', category: '情绪', type: 'video' },
  { id: 30, name: '甜美微笑', gifUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4', category: '情绪', type: 'video' }
]

function App() {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [processingStatus, setProcessingStatus] = useState('')
  const videoRef = useRef(null)
  const [progress, setProgress] = useState(0)  // 新增：进度百分比
  const [elapsedTime, setElapsedTime] = useState(0)  // 已用时间（秒）
  const [estimatedTotalTime, setEstimatedTotalTime] = useState(20)  // 预计总时间（秒）
  const [searchQuery, setSearchQuery] = useState('')
  const [generationCount, setGenerationCount] = useState(0)  // 新增：用户今日已生成次数
  const [isLoading, setIsLoading] = useState(true)  // 新增：模板加载状态
  const [isOnline, setIsOnline] = useState(navigator.onLine)  // 新增：网络状态
  const [showCelebration, setShowCelebration] = useState(false)  // 新增：庆祝动画
  const [user, setUser] = useState(null)  // 新增：用户信息
  const [showMyVideos, setShowMyVideos] = useState(false)  // 新增：显示我的视频
  const [myVideos, setMyVideos] = useState([])  // 新增：我的视频列表
  const [currentPage, setCurrentPage] = useState('home')  // 新增：当前页面
  const MAX_GENERATIONS = user ? 6 : 3  // 登录用户6次，非登录用户3次
  const remainingGenerations = Math.max(0, MAX_GENERATIONS - generationCount)
  const limitReached = generationCount >= MAX_GENERATIONS
  const canGenerate = Boolean(selectedTemplate && uploadedImage && !limitReached && !isProcessing && !result)
  const generateButtonLabel = limitReached
    ? '🚫 Daily limit reached'
    : !uploadedImage
      ? '📤 Upload a photo first'
      : '🎨 Create Video'

  // 分类名称映射
  const categoryMap = {
    'duo': 'Duo Interaction',
    'Duo Interaction': 'Duo Interaction',
    'funny': 'Funny & Crazy',
    'Emotional Reactions': 'Emotional Reactions',
    'Magic Effects': 'Magic Effects',
    'Slapstick': 'Slapstick Comedy',
    'Slapstick Comedy': 'Slapstick Comedy',
    'stylemakeovers': 'Style Makeovers',
    'Style Makeovers': 'Style Makeovers'
  }

  // 加载模板数据
  useEffect(() => {
    fetch('/templates.json')
      .then(res => res.json())
      .then(data => {
        // 映射分类名称
        const mappedData = data.map(template => ({
          ...template,
          category: categoryMap[template.category] || template.category
        }))
        setTemplates(mappedData)
        setIsLoading(false)
        console.log('✅ 成功加载模板:', mappedData.length, '个')
      })
      .catch(err => {
        console.error('Failed to load templates:', err)
        setTemplates(defaultTemplates)
        setIsLoading(false)
      })
  }, [])

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Google 登录
  const handleGoogleSignIn = async (response) => {
    try {
      console.log('Google登录响应:', response)
      const userInfo = {
        email: response.email,
        name: response.name,
        picture: response.picture,
        sub: response.sub
      }
      setUser(userInfo)
      // 保存用户信息到本地存储
      localStorage.setItem('user', JSON.stringify(userInfo))
      
      // 从本地存储加载用户的视频
      const savedVideos = localStorage.getItem('myVideos') || '[]'
      setMyVideos(JSON.parse(savedVideos))
      
      console.log('✅ 登录成功:', userInfo)
    } catch (error) {
      console.error('登录失败:', error)
      alert('Login failed. Please try again.')
    }
  }

  // 点击登录按钮时的处理
  const handleGoogleSignInClick = async () => {
    console.log('点击登录按钮')
    
    // 使用 Google Identity Services (GIS)
    if (window.google && window.google.accounts) {
      try {
        // 使用 signIn 方法获取用户信息
        window.google.accounts.oauth2.initTokenClient({
          client_id: '457199816989-e16gt3va81kalp0nphhqf0rj0v39ij0b.apps.googleusercontent.com',
          scope: 'openid email profile',
          callback: async (response) => {
            console.log('Token 响应:', response)
            
            if (response.access_token) {
              // 使用 token 获取用户信息
              try {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                  headers: {
                    'Authorization': `Bearer ${response.access_token}`
                  }
                })
                const userInfo = await userInfoResponse.json()
                console.log('用户信息:', userInfo)
                
                // 设置用户信息
                const userData = {
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture,
                  sub: userInfo.id
                }
                
                setUser(userData)
                localStorage.setItem('user', JSON.stringify(userData))
                
                const savedVideos = localStorage.getItem('myVideos') || '[]'
                setMyVideos(JSON.parse(savedVideos))
                
                // 显示欢迎信息（可选）
                console.log('✅ 登录成功！欢迎 ' + userInfo.name + '!')
              } catch (error) {
                console.error('获取用户信息失败:', error)
                alert('登录成功，但无法获取用户信息')
              }
            }
          }
        }).requestAccessToken({ prompt: 'consent' })
      } catch (error) {
        console.error('OAuth2 错误:', error)
        alert('登录功能暂时不可用，请稍后重试')
      }
    } else {
      console.error('Google API 未加载')
      alert('Google 登录功能暂时不可用，请刷新页面重试')
    }
  }

  const handleSignOut = () => {
    setUser(null)
    localStorage.removeItem('user')
    setMyVideos([])
    setCurrentPage('home')
    // 关闭下拉菜单
    const menu = document.querySelector('.user-dropdown')
    if (menu) {
      menu.classList.remove('show')
    }
  }

  // 保存生成的视频到"我的"列表
  const saveVideoToMyList = (videoData) => {
    if (!user) return
    
    const video = {
      id: Date.now(),
      url: videoData.url,
      template: videoData.template,
      timestamp: new Date().toISOString(),
      userId: user.sub
    }
    
    const updatedVideos = [...myVideos, video]
    setMyVideos(updatedVideos)
    localStorage.setItem('myVideos', JSON.stringify(updatedVideos))
  }

  // 页面加载时检查登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      const savedVideos = localStorage.getItem('myVideos') || '[]'
      setMyVideos(JSON.parse(savedVideos))
    }
  }, [])

  // 初始化 Google 登录
  useEffect(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      // 使用 One Tap 登录
      window.google.accounts.id.initialize({
        client_id: '457199816989-e16gt3va81kalp0nphhqf0rj0v39ij0b.apps.googleusercontent.com',
        callback: handleGoogleSignIn,
        auto_select: false,
        cancel_on_tap_outside: true
      })
      
      // 自动显示 One Tap 提示（可选）
      if (!user) {
        window.google.accounts.id.prompt((notification) => {
          console.log('One Tap提示状态:', notification)
        })
      }
    }
  }, [user])

  // 获取今天的日期字符串（格式：YYYY-MM-DD）
  const getTodayDateString = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // 初始化时从 localStorage 读取今日生成次数
  useEffect(() => {
    const todayDate = getTodayDateString()
    const storedDate = localStorage.getItem('faceSwapLastDate')
    const storedCount = parseInt(localStorage.getItem('faceSwapGenerationCount') || '0')

    // 如果日期不是今天，重置计数
    if (storedDate !== todayDate) {
      console.log('新的一天，重置生成次数')
      localStorage.setItem('faceSwapLastDate', todayDate)
      localStorage.setItem('faceSwapGenerationCount', '0')
      setGenerationCount(0)
    } else {
      // 日期是今天，使用存储的计数
      setGenerationCount(storedCount)
      console.log(`今日已生成: ${storedCount}/${MAX_GENERATIONS}`)
    }
  }, [])

  // 过滤模板（使用useMemo优化性能）
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return templates
    const query = searchQuery.toLowerCase()
    return templates.filter(template => 
      template.name.toLowerCase().includes(query) ||
           template.category.toLowerCase().includes(query)
    )
  }, [templates, searchQuery])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 文件类型验证
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, or WebP)')
        return
      }
      
      // 文件大小验证 (5MB限制)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        alert('File size must be less than 5MB')
        return
      }
      
      // 文件名安全检查
      const fileName = file.name.toLowerCase()
      const dangerousPatterns = /[<>:"/\\|?*]/
      if (dangerousPatterns.test(fileName)) {
        alert('Invalid file name. Please rename your file.')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // 拖拽上传处理
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedImage(e.target.result)
        }
        reader.readAsDataURL(file)
      } else {
        alert('Please upload an image file')
      }
    }
  }

  // 检查 URL 是否为视频（去除查询参数后检查扩展名）
  const isVideoUrl = (url) => {
    if (!url) return false
    const urlWithoutQuery = url.split('?')[0]
    return urlWithoutQuery.endsWith('.mp4') || 
           urlWithoutQuery.endsWith('.webm') || 
           urlWithoutQuery.endsWith('.mov') ||
           url.includes('video') ||
           url.includes('.mp4') ||
           url.includes('.webm')
  }

  const handleGenerate = async () => {
    if (!selectedTemplate || !uploadedImage) {
      alert('请先选择模板并上传照片！')
      return
    }

    // 检查生成次数限制
    const maxGenerations = user ? 6 : 3
    if (generationCount >= maxGenerations) {
      if (!user) {
        alert(`⚠️ 免费额度已用完（${maxGenerations}次）\n\n如需继续使用，请登录账号获得更多额度！`)
      } else {
        alert(`⚠️ 您的免费额度已用完（${maxGenerations}次）\n\n感谢您的使用！`)
      }
      return
    }

    setIsProcessing(true)
    setResult(null) // 清除之前的结果
    setProcessingStatus('Processing your video...')

    try {
      // 提交换脸任务
      const response = await fetch('/api/face-swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetImage: selectedTemplate.gifUrl,  // 使用GIF URL
          sourceImage: uploadedImage,            // 用户照片
        }),
      })

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}`)
      }

      // 检查 Content-Type 是否为 JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        throw new Error(`Invalid response format: ${text.substring(0, 100)}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Face swap failed')
      }

      // 如果是异步任务，开始轮询
      if (data.taskId) {
        console.log('Task created:', data.taskId)
      const taskId = data.taskId

        // 轮询任务状态
        const pollTask = async () => {
          try {
            const statusResponse = await fetch(`/api/face-swap?taskId=${taskId}`)
            const statusData = await statusResponse.json()

            if (!statusData.success) {
              throw new Error(statusData.error || 'Task failed')
            }

            // 更新进度
            setProcessingStatus(statusData.message || 'Processing...')
            setProgress(statusData.progress || 0)
            setElapsedTime(statusData.elapsedTime || 0)
            setEstimatedTotalTime(statusData.estimatedTotalTime || 20)

            if (statusData.status === 'completed') {
            // 任务完成
              setProcessingStatus('Complete!')
            setProgress(100)
              const result = {
                url: statusData.result,
              template: selectedTemplate
              }
              setResult(result)
              
              // 保存到"我的"列表（如果已登录）
              if (user) {
                saveVideoToMyList(result)
              }
              
            setIsProcessing(false)
              
              // 触发庆祝动画
              setShowCelebration(true)
              setTimeout(() => setShowCelebration(false), 3000)

              // 确保视频在加载后自动播放
              setTimeout(() => {
                if (videoRef.current && isVideoUrl(result.url)) {
                  videoRef.current.play().catch(err => {
                    console.warn('视频自动播放被阻止:', err)
                  })
                }
              }, 100)

            // 成功完成后增加生成次数
            const newCount = generationCount + 1
            setGenerationCount(newCount)
            localStorage.setItem('faceSwapGenerationCount', newCount.toString())
              localStorage.setItem('faceSwapLastDate', getTodayDateString())
            console.log(`✅ 生成成功！今日已使用次数: ${newCount}/${MAX_GENERATIONS}`)
            } else if (statusData.status === 'failed') {
            // 任务失败
              throw new Error(statusData.error || 'Face swap failed')
          } else {
            // 继续轮询
              setTimeout(pollTask, 1000)
          }
        } catch (error) {
            console.error('Polling error:', error)
          setProcessingStatus('')
          setProgress(0)
          setIsProcessing(false)
            alert(`❌ Face swap failed: ${error.message}`)
          }
        }

        // 开始第一次轮询
        setTimeout(pollTask, 1000)
      } else {
        // 同步返回结果（兼容旧代码）
        console.log('✅ Face swap completed:', data)

        setProcessingStatus('Complete!')
        setProgress(100)
        const result = {
          url: data.result,
          template: selectedTemplate
        }
        setResult(result)
        
        if (user) {
          saveVideoToMyList(result)
        }
        
        setIsProcessing(false)
        
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)

        // 确保视频在加载后自动播放
        setTimeout(() => {
          if (videoRef.current && isVideoUrl(result.url)) {
            videoRef.current.play().catch(err => {
              console.warn('视频自动播放被阻止:', err)
            })
          }
        }, 100)

        const newCount = generationCount + 1
        setGenerationCount(newCount)
        localStorage.setItem('faceSwapGenerationCount', newCount.toString())
        localStorage.setItem('faceSwapLastDate', getTodayDateString())
        console.log(`✅ 生成成功！今日已使用次数: ${newCount}/${MAX_GENERATIONS}`)
      }

    } catch (error) {
      console.error('换脸错误:', error)
      setProcessingStatus('')
      setIsProcessing(false)
      alert(`❌ Face swap failed: ${error.message}`)
    }
  }

  const handleDownload = async () => {
    if (!result) return

    try {
      // 通过 fetch 获取文件数据，然后创建本地下载链接
      const response = await fetch(result.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // 根据结果URL的扩展名确定文件类型
      const fileExtension = result.url.split('.').pop().split('?')[0] // 去除查询参数
      const fileName = `face-swap-${Date.now()}.${fileExtension}`

      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 释放 blob URL
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请稍后重试')
    }
  }

  // 处理"My Created Videos"中的视频下载
  const handleVideoDownload = async (videoUrl) => {
    try {
      // 通过 fetch 获取文件数据，然后创建本地下载链接
      const response = await fetch(videoUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch video')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // 根据结果URL的扩展名确定文件类型
      const fileExtension = videoUrl.split('.').pop().split('?')[0] // 去除查询参数
      const fileName = `face-swap-${Date.now()}.${fileExtension}`

      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 释放 blob URL
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请稍后重试')
    }
  }

  return (
    <div className="app">
      {/* 粒子背景已移除 - 深色主题不需要 */}

      {/* 顶部导航栏 */}
      <div className="top-navbar">
        <div className="top-navbar-logo">
          🎭 FaceAI Meme
        </div>
        <div className="top-navbar-actions">
          {user ? (
            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => {
                  const menu = document.querySelector('.user-dropdown')
                  menu.classList.toggle('show')
                }}
              >
                <img src={user.picture} alt={user.name} className="user-avatar" />
                <span className="user-name">{user.name}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              <div className="user-dropdown">
                <button className="dropdown-item" onClick={handleSignOut}>
                  🚪 Logout
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="login-btn"
              onClick={handleGoogleSignInClick}
            >
              Log In
            </button>
          )}
        </div>
      </div>

      <div className="app-body">
      {/* 左侧导航栏 */}
      <div className="sidebar">
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            🏠 Home
          </button>
          {user && (
            <button 
              className={`nav-item ${currentPage === 'me' ? 'active' : ''}`}
              onClick={() => setCurrentPage('me')}
            >
              👤 Me
            </button>
          )}
        </nav>
        <div className="sidebar-footer">
          {!user && (
            <button className="sidebar-login" onClick={handleGoogleSignInClick}>
              Log In
            </button>
          )}
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="main-content">
        <h1 className="main-title">Create Funny Memes with AI Face Swap</h1>
        {!isOnline && (
          <div className="offline-notice">
            ⚠️ You're offline. Some features may not work properly.
          </div>
        )}

        {currentPage === 'home' && (
      <main className="main">
        <div className={`content-wrapper ${selectedTemplate ? 'template-selected' : ''}`}>
          {/* 左侧：模板选择区 */}
          <section className="templates-section">
            <div className="section-header">
              <h2>Choose Your Favorite Template</h2>
              {selectedTemplate && (
                <button 
                  className="clear-selection-btn"
                  onClick={() => {
                    setSelectedTemplate(null)
                    setUploadedImage(null)
                    setResult(null)
                  }}
                  title="Clear selection"
                >
                  ✕ Clear Selection
                </button>
              )}

              {/* 搜索框 */}
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Search templates"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 搜索结果提示 */}
            {searchQuery && (
              <div className="search-result-info">
                Found {filteredTemplates.length} templates
              </div>
            )}

            {/* 无结果提示 */}
            {filteredTemplates.length === 0 && (
              <div className="no-results">
                <p>😕 No matching templates found</p>
                <p>Try searching: smile, laugh, surprise, funny, cool</p>
              </div>
            )}

            {/* 加载状态 */}
            {isLoading && (
              <div className="loading-state">
                <div className="skeleton-grid">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="skeleton-card">
                      <div className="skeleton-video"></div>
                    </div>
                  ))}
                </div>
                <div className="loading-spinner"></div>
                <p>Loading amazing templates...</p>
              </div>
            )}

            {/* 按分类分组显示模板 */}
            {Object.entries(
              filteredTemplates.reduce((groups, template) => {
                const category = template.category
                if (!groups[category]) {
                  groups[category] = []
                }
                groups[category].push(template)
                return groups
              }, {})
            )
            .sort(([a], [b]) => {
              // 将 "Duo Interaction" 排在最后
              if (a === 'Duo Interaction') return 1
              if (b === 'Duo Interaction') return -1
              return 0
            })
            .map(([category, templates]) => (
              <div key={category} className="category-section">
                <h3 className="category-title">{category}</h3>
            <div className="templates-grid">
                  {templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <video
                    src={template.gifUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                        preload="none"
                        loading="lazy"
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          console.warn('Video failed to load:', template.name);
                          e.target.style.display = 'none';
                        }}
                        onLoadStart={() => {
                          // 视频开始加载时显示占位符
                          e.target.style.opacity = '0.7';
                        }}
                        onCanPlay={() => {
                          // 视频可以播放时恢复正常透明度
                          e.target.style.opacity = '1';
                        }}
                      />
                    </div>
                  ))}
                  </div>
                </div>
              ))}
          </section>

          {/* 右侧：操作区 */}
          <aside className="action-panel">
            {!selectedTemplate ? (
              /* 初始状态：欢迎提示 */
              <div className="welcome-panel">
                <div className="welcome-content">
                  <h2>🎬 Start Creating</h2>
                  <p>Select a template from the left to begin creating your face swap video</p>
                  <div className="welcome-icon">✨</div>
                </div>
              </div>
            ) : (
              <div className="action-panel-content">
                <div className="preview-row">
                  <div className="preview-card">
                    <h3><span className="step-badge">Step 1</span>Selected Template</h3>
                    <div className="preview-box">
                      <video
                        src={selectedTemplate.gifUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    </div>
                  </div>

                  <div className="preview-card">
                    <h3><span className="step-badge">Step 2</span>{uploadedImage ? 'Your Photo' : 'Upload Your Photo'}</h3>
                    <div
                      className={`preview-box ${uploadedImage ? '' : 'upload-preview-box'}`}
                      onDragOver={uploadedImage ? undefined : handleDragOver}
                      onDrop={uploadedImage ? undefined : handleDrop}
                    >
                      <input
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      {uploadedImage ? (
                        <>
                          <img src={uploadedImage} alt="Uploaded photo" />
                          <button 
                            className="change-photo-btn-small"
                            onClick={() => document.getElementById('file-upload').click()}
                          >
                            Change Photo
                          </button>
                        </>
                      ) : (
                        <label htmlFor="file-upload" className="upload-button-inline">
                          📤 Click to Upload<br/>or Drag & Drop
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="result-section">
                  {isProcessing ? (
                    <div className="processing-status-inline">
                      <h3><span className="step-badge">Step 3</span>Generating Your Video...</h3>
                      <div className="circular-progress-container">
                        <svg className="circular-progress" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="rgba(102, 126, 234, 0.1)"
                            strokeWidth="8"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 50}`}
                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                            transform="rotate(-90 60 60)"
                            style={{
                              transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                              animation: 'progressPulse 2s ease-in-out infinite'
                            }}
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="circular-progress-content">
                          <div className="progress-percentage">{progress.toFixed(1)}%</div>
                          <div className="progress-time">
                            {estimatedTotalTime > 0 && elapsedTime >= 0
                              ? `${Math.max(0, (estimatedTotalTime - elapsedTime)).toFixed(1)}s`
                              : '...'}
                          </div>
                        </div>
                      </div>
                      <p className="processing-text">{processingStatus || 'Processing your video...'}</p>
                    </div>
                  ) : result ? (
                    <div className="result-card-inline">
                      <h3><span className="step-badge">Step 3</span>🎉 Complete!</h3>
                      <div className="result-preview-box">
                        {isVideoUrl(result.url) ? (
                          <video
                            ref={videoRef}
                            src={result.url}
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls
                            onLoadedData={() => {
                              if (videoRef.current) {
                                videoRef.current.play().catch(e => console.log('Autoplay prevented:', e))
                              }
                            }}
                            onCanPlay={() => {
                              if (videoRef.current) {
                                videoRef.current.play().catch(e => console.log('Autoplay prevented:', e))
                              }
                            }}
                          />
                        ) : (
                          <img src={result.url} alt="Generated result" />
                        )}
                      </div>
                      <div className="result-actions">
                        <button className="download-button" onClick={handleDownload}>
                          📥 Download Video
                        </button>
                        <button 
                          className="create-new-btn"
                          onClick={() => {
                            setSelectedTemplate(null)
                            setUploadedImage(null)
                            setResult(null)
                          }}
                        >
                          ✨ Create New Video
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="action-card-inline">
                      <h3><span className="step-badge">Step 3</span>Generate Your Video</h3>
                      <div className="usage-info">
                        <span className="usage-text">
                          Remaining today: <strong>{remainingGenerations}</strong> / {MAX_GENERATIONS}
                        </span>
                        {limitReached && (
                          <span className="usage-warning">⚠️ {user ? 'Daily limit reached' : 'Free quota used up. Please log in for more.'}</span>
                        )}
                      </div>
                      <button
                        className="generate-button"
                        onClick={handleGenerate}
                        disabled={!canGenerate}
                      >
                        {generateButtonLabel}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* 庆祝动画 */}
        {showCelebration && (
          <div className="celebration-overlay">
            <div className="confetti">
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
            </div>
            <div className="success-message">
              <h2>🎉 Amazing!</h2>
              <p>Your meme is ready!</p>
            </div>
          </div>
        )}
      </main>
      )}

      {currentPage === 'me' && user && (
        <main className="main">
          <div className="content-wrapper">
            <div className="me-section">
              <div className="me-header">
                <img src={user.picture} alt={user.name} className="me-avatar" />
                <div className="me-info">
                  <h2>{user.name}</h2>
                  <p>{user.email}</p>
                  <div className="me-stats">
                    <div className="stat-item">
                      <span className="stat-label">Videos</span>
                      <span className="stat-value">{myVideos.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Level</span>
                      <span className="stat-value">{Math.floor(myVideos.length / 10) + 1}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="me-content">
                <h3>📁 My Created Videos</h3>
                <div className="my-videos-grid">
                  {myVideos.length === 0 ? (
                    <div className="empty-message">
                      <p>No videos yet. Start creating!</p>
                    </div>
                  ) : (
                    myVideos.map((video) => (
                      <div key={video.id} className="my-video-card">
                        <video
                          src={video.url}
                          muted
                          playsInline
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                        <div className="my-video-info">
                          <p className="video-date">{new Date(video.timestamp).toLocaleDateString()}</p>
                          <button 
                            className="download-btn-small"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleVideoDownload(video.url)
                            }}
                          >
                            📥 Download
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {!user && currentPage !== 'home' && (
        <main className="main">
          <div className="content-wrapper">
            <div className="login-prompt">
              <h2>Please log in to view your profile</h2>
              <button className="generate-button" onClick={handleGoogleSignInClick}>
                Log In
              </button>
            </div>
        </div>
      </main>
      )}

      <footer className="footer">
          <p>© 2025 FaceAI Meme - AI-Powered Face Swap Application</p>
      </footer>
      </div>
      </div>
    </div>
  )
}

export default App
