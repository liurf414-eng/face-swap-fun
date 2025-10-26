import { useState, useEffect, useMemo } from 'react'
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
  const [progress, setProgress] = useState(0)  // 新增：进度百分比
  const [searchQuery, setSearchQuery] = useState('')
  const [generationCount, setGenerationCount] = useState(0)  // 新增：用户今日已生成次数
  const [isLoading, setIsLoading] = useState(true)  // 新增：模板加载状态
  const [isOnline, setIsOnline] = useState(navigator.onLine)  // 新增：网络状态
  const [showCelebration, setShowCelebration] = useState(false)  // 新增：庆祝动画
  const [user, setUser] = useState(null)  // 新增：用户信息
  const [showMyVideos, setShowMyVideos] = useState(false)  // 新增：显示我的视频
  const [myVideos, setMyVideos] = useState([])  // 新增：我的视频列表
  const [currentPage, setCurrentPage] = useState('home')  // 新增：当前页面
  const MAX_GENERATIONS = 4  // 每日最大生成次数

  // 分类名称映射
  const categoryMap = {
    'duo': 'Duo Interaction',
    'funny': 'Funny & Crazy',
    'magic': 'Magic Effects',
    'reactions': 'Emotional Reactions',
    'slapstick': 'Slapstick Comedy',
    'stylemakeovers': 'Style Makeovers'
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

  const handleGenerate = async () => {
    if (!selectedTemplate || !uploadedImage) {
      alert('请先选择模板并上传照片！')
      return
    }

    // 检查生成次数限制
    if (generationCount >= MAX_GENERATIONS) {
      alert(`⚠️ 您今日的生成次数已用完（${MAX_GENERATIONS}次）\n\n感谢您的理解！`)
      return
    }

    setIsProcessing(true)
    setResult(null) // 清除之前的结果
    setProcessingStatus('正在抓紧处理中，请耐心等候...')

    try {
      // 提交换脸任务
      const response = await fetch('http://localhost:3001/api/face-swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetImage: selectedTemplate.gifUrl,  // 使用GIF URL
          sourceImage: uploadedImage,            // 用户照片
        }),
      })

      const data = await response.json()

      if (!data.success || !data.taskId) {
        throw new Error(data.error || '任务创建失败')
      }

      const taskId = data.taskId
      console.log('任务已创建:', taskId)

      // 开始轮询查询进度
      const pollProgress = async () => {
        try {
          const progressResponse = await fetch(`http://localhost:3001/api/progress/${taskId}`)
          const progressData = await progressResponse.json()

          if (!progressData.success) {
            throw new Error(progressData.error || '查询进度失败')
          }

          // 更新进度信息和百分比
          setProcessingStatus(progressData.message || '处理中...')
          setProgress(progressData.progress || 0)  // 更新进度条

          if (progressData.status === 'completed') {
            // 任务完成
            setProcessingStatus('✅ 换脸完成！')
            setProgress(100)
            const result = {
              url: progressData.result,
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

            // 成功完成后增加生成次数
            const newCount = generationCount + 1
            setGenerationCount(newCount)
            localStorage.setItem('faceSwapGenerationCount', newCount.toString())
            localStorage.setItem('faceSwapLastDate', getTodayDateString())  // 更新日期
            console.log(`✅ 生成成功！今日已使用次数: ${newCount}/${MAX_GENERATIONS}`)

          } else if (progressData.status === 'failed') {
            // 任务失败
            throw new Error(progressData.error || '换脸处理失败')
          } else {
            // 继续轮询
            setTimeout(pollProgress, 1000)  // 每秒查询一次
          }
        } catch (error) {
          console.error('轮询错误:', error)
          setProcessingStatus('')
          setProgress(0)
          setIsProcessing(false)
          alert(`❌ 换脸失败: ${error.message}`)
        }
      }

      // 开始第一次查询
      pollProgress()

    } catch (error) {
      console.error('换脸错误:', error)
      setProcessingStatus('')
      setIsProcessing(false)
      alert(`❌ 换脸失败: ${error.message}\n\n请确保：\n1. 后端服务已启动 (npm run server)\n2. API密钥已配置\n3. 网络连接正常`)
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

  return (
    <div className="app">
      {/* 动态背景粒子 */}
      <div className="particles-background">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

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
        <div className="content-wrapper">
          {/* 左侧：模板选择区 */}
          <section className="templates-section">
            <div className="section-header">
              <h2><span className="step-badge">Step 1</span>Choose Your Favorite Template</h2>

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
            ).map(([category, templates]) => (
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
            {/* 上传照片 */}
            <div className="action-card">
              <h3><span className="step-badge">Step 2</span>Upload Your Photo</h3>
                <div 
                  className="upload-container"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                  <label htmlFor="file-upload" className="upload-button">
                    {uploadedImage ? '✅ Change Photo' : '📤 Click to Upload or Drag & Drop'}
                  </label>
                {uploadedImage && (
                  <div className="preview">
                    <img src={uploadedImage} alt="Uploaded photo" />
                  </div>
                )}
              </div>
            </div>

            {/* 生成区域 */}
            <div className="action-card">
              <h3><span className="step-badge">Step 3</span>Generate Your Meme</h3>

              {/* 剩余次数提示 */}
              <div className="usage-info">
                <span className="usage-text">
                  Remaining today: <strong>{MAX_GENERATIONS - generationCount}</strong> / {MAX_GENERATIONS}
                </span>
                {generationCount >= MAX_GENERATIONS && (
                  <span className="usage-warning">⚠️ Daily limit reached</span>
                )}
              </div>

                <button
                  className="generate-button"
                  onClick={handleGenerate}
                  disabled={isProcessing || !selectedTemplate || !uploadedImage || generationCount >= MAX_GENERATIONS}
                >
                  {isProcessing ? '🔄 Processing...' :
                   generationCount >= MAX_GENERATIONS ? '🚫 Daily limit reached' :
                   !selectedTemplate ? '📝 Please select a template' :
                   !uploadedImage ? '📤 Please upload a photo' :
                   '🎨 Start Generating'}
                </button>
            </div>

            {/* 进度提示 */}
            {isProcessing && processingStatus && (
              <div className="processing-status">
                <div className="status-text">{processingStatus}</div>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${progress}%` }}>
                    <span className="progress-text">{progress}%</span>
                  </div>
                </div>
                <div className="progress-spinner"></div>
              </div>
            )}

            {/* 我的视频面板 */}
            {showMyVideos && user && (
              <div className="my-videos-panel">
                <div className="my-videos-header">
                  <h3>📁 My Videos</h3>
                  <button className="close-btn" onClick={() => setShowMyVideos(false)}>✕</button>
                </div>
                <div className="my-videos-grid">
                  {myVideos.length === 0 ? (
                    <p className="empty-message">No videos yet. Start creating!</p>
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
                            onClick={() => window.open(video.url, '_blank')}
                          >
                            📥 Download
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 结果展示 */}
            {result && (
              <div className="result-container">
                <h3>🎉 Complete!</h3>
                <div className="result-preview">
                  {result.url.endsWith('.mp4') || result.url.endsWith('.webm') ? (
                    <video
                      src={result.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      style={{ width: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        console.error('视频加载失败:', result.url)
                      }}
                    >
                      您的浏览器不支持视频播放
                    </video>
                  ) : (
                    <img
                      src={result.url}
                      alt="换脸结果"
                      style={{ width: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        console.error('图片加载失败:', result.url)
                      }}
                    />
                  )}
                </div>
                <button className="download-button" onClick={handleDownload}>
                  💾 下载{result.url.endsWith('.mp4') || result.url.endsWith('.webm') ? '视频' : 'GIF'}
                </button>
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
                            onClick={() => window.open(video.url, '_blank')}
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
