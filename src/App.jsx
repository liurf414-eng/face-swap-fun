import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import LazyVideoCard from './components/LazyVideoCard'
import ProgressDisplay from './components/ProgressDisplay'
import UploadSection from './components/UploadSection'
import ResultDisplay from './components/ResultDisplay'
import TemplateGrid from './components/TemplateGrid'
import AIStudioPage from './pages/AIStudioPage'
import TikTokPage from './pages/TikTokPage'
import InstagramPage from './pages/InstagramPage'
import BirthdayPage from './pages/BirthdayPage'
import GifMakerPage from './pages/GifMakerPage'
import VideoMakerPage from './pages/VideoMakerPage'
import CommunityPage from './pages/CommunityPage'

// Default templates as a fallback
const defaultTemplates = [
  // Fun & meme-worthy expressions
  { id: 1, name: 'Wide-Eyed Surprise', gifUrl: 'https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.mp4', category: 'Humor', type: 'video' },
  { id: 2, name: 'Awkward Smile', gifUrl: 'https://media.giphy.com/media/KupdfnqWuMpNS/giphy.mp4', category: 'Humor', type: 'video' },
  { id: 3, name: 'Nodding Approval', gifUrl: 'https://media.giphy.com/media/KEYEpIngcmXlHetDqz/giphy.mp4', category: 'Humor', type: 'video' },
  { id: 4, name: 'Stifled Giggle', gifUrl: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.mp4', category: 'Humor', type: 'video' },
  { id: 5, name: 'Bursting Laughter', gifUrl: 'https://media.giphy.com/media/3o7btNhMBytxAM6YBa/giphy.mp4', category: 'Humor', type: 'video' },
  { id: 6, name: 'Laughing Tears', gifUrl: 'https://media.giphy.com/media/Q7ozWVYCR0nyW2rvPW/giphy.mp4', category: 'Humor', type: 'video' },
  { id: 7, name: 'Eye Roll', gifUrl: 'https://media.giphy.com/media/Fjr6v88OPk7U4/giphy.mp4', category: 'Humor', type: 'video' },
  { id: 8, name: 'Speechless Face', gifUrl: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.mp4', category: 'Humor', type: 'video' },
  { id: 9, name: 'Wild Laugh', gifUrl: 'https://media.giphy.com/media/O5NyCibf93upy/giphy.mp4', category: 'Humor', type: 'video' },
  { id: 10, name: 'Trying Not To Laugh', gifUrl: 'https://media.giphy.com/media/9MFsKQ8A6HCN2/giphy.mp4', category: 'Humor', type: 'video' },

  // Stylish reactions
  { id: 11, name: 'Sunglasses Pose', gifUrl: 'https://media.giphy.com/media/1jkSrMMRP53fSke11n/giphy.mp4', category: 'Cool', type: 'video' },
  { id: 12, name: 'Confident Wink', gifUrl: 'https://media.giphy.com/media/l0Iy67evoh42GvFiU/giphy.mp4', category: 'Cool', type: 'video' },
  { id: 13, name: 'Nod & Smile', gifUrl: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.mp4', category: 'Cool', type: 'video' },
  { id: 14, name: 'Blowing Kiss', gifUrl: 'https://media.giphy.com/media/xUOrw5LIxb8S9X1LGg/giphy.mp4', category: 'Cool', type: 'video' },
  { id: 15, name: 'Thumbs Up', gifUrl: 'https://media.giphy.com/media/3oEdva9BUHPIs2SkGk/giphy.mp4', category: 'Cool', type: 'video' },
  { id: 16, name: 'Dramatic Head Turn', gifUrl: 'https://media.giphy.com/media/26ybw9bHdgFUUoXAc/giphy.mp4', category: 'Cool', type: 'video' },
  { id: 17, name: 'Raised Brow', gifUrl: 'https://media.giphy.com/media/5XZatgyewAMaQ/giphy.mp4', category: 'Cool', type: 'video' },
  { id: 18, name: 'Smiling Nod', gifUrl: 'https://media.giphy.com/media/S3Ot3hZ5bcy8o/giphy.mp4', category: 'Cool', type: 'video' },
  { id: 19, name: 'Confident Grin', gifUrl: 'https://media.giphy.com/media/l0HlPystfePnYIxWg/giphy.mp4', category: 'Cool', type: 'video' },
  { id: 20, name: 'Winking Smile', gifUrl: 'https://media.giphy.com/media/l0MYMizgnsTpoMuoo/giphy.mp4', category: 'Cool', type: 'video' },

  // Emotional reactions
  { id: 21, name: 'Joyful Laugh', gifUrl: 'https://media.giphy.com/media/l0MYu38R0PPhIXqlO/giphy.mp4', category: 'Emotion', type: 'video' },
  { id: 22, name: 'Surprised Gasp', gifUrl: 'https://media.giphy.com/media/3o72F8t9TDi2xVnxOE/giphy.mp4', category: 'Emotion', type: 'video' },
  { id: 23, name: 'Thinking Face', gifUrl: 'https://media.giphy.com/media/l0HlDHQEiIdY3kxlm/giphy.mp4', category: 'Emotion', type: 'video' },
  { id: 24, name: 'Confused Frown', gifUrl: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.mp4', category: 'Emotion', type: 'video' },
  { id: 25, name: 'Crying Sadness', gifUrl: 'https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.mp4', category: 'Emotion', type: 'video' },
  { id: 26, name: 'Angry Scowl', gifUrl: 'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.mp4', category: 'Emotion', type: 'video' },
  { id: 27, name: 'Blushing Shy', gifUrl: 'https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.mp4', category: 'Emotion', type: 'video' },
  { id: 28, name: 'Excited Cheer', gifUrl: 'https://media.giphy.com/media/l0Iy2MnL9ejDrf73i/giphy.mp4', category: 'Emotion', type: 'video' },
  { id: 29, name: 'Smug Smile', gifUrl: 'https://media.giphy.com/media/l0Ex8CNFvRJ87Mvfy/giphy.mp4', category: 'Emotion', type: 'video' },
  { id: 30, name: 'Sweet Smile', gifUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4', category: 'Emotion', type: 'video' }
]

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [uploadedImage2, setUploadedImage2] = useState(null)  // 第二个人照片（用于Duo Interaction）
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [processingStatus, setProcessingStatus] = useState('')
  const videoRef = useRef(null)
  
  // Refs for scroll preservation
  const mainContentRef = useRef(null)
  const scrollPositionRef = useRef(0)

  // Handle template selection with scroll preservation
  const handleSelectTemplate = (template) => {
    if (mainContentRef.current) {
      scrollPositionRef.current = mainContentRef.current.scrollTop
    }
    setForcePlusOneMode(false)
    setCameFromCommunity(false)  // 从模板列表选择时，清除社区标记
    setSelectedTemplate(template)
  }

  // Restore scroll position when returning to template list
  useEffect(() => {
    if (!selectedTemplate && mainContentRef.current) {
      requestAnimationFrame(() => {
        mainContentRef.current.scrollTop = scrollPositionRef.current
      })
    }
  }, [selectedTemplate])

  const [progress, setProgress] = useState(0)  // 新增：进度百分比
  const [elapsedTime, setElapsedTime] = useState(0)  // 已用时间（秒）
  const [estimatedTotalTime, setEstimatedTotalTime] = useState(20)  // 预计总时间（秒）
  const [predictedTotalTime, setPredictedTotalTime] = useState(null)
  const [processingStartTime, setProcessingStartTime] = useState(null)
  const [clientElapsedTime, setClientElapsedTime] = useState(0)
  const [scriptedProgress, setScriptedProgress] = useState(5.0)
  const predictedCacheRef = useRef({})
  const [searchQuery, setSearchQuery] = useState('')
  const [generationCount, setGenerationCount] = useState(0)  // 新增：用户今日已生成次数
  const [isLoading, setIsLoading] = useState(true)  // 新增：模板加载状态
  const [isOnline, setIsOnline] = useState(navigator.onLine)  // 新增：网络状态
  const [showCelebration, setShowCelebration] = useState(false)  // 新增：庆祝动画
  const [user, setUser] = useState(null)  // 新增：用户信息
  const [showMyVideos, setShowMyVideos] = useState(false)  // 新增：显示我的视频
  const [myVideos, setMyVideos] = useState([])  // 新增：我的视频列表
  const [forcePlusOneMode, setForcePlusOneMode] = useState(false)
  const [cameFromCommunity, setCameFromCommunity] = useState(false)  // 记住是否从社区来的
  const [favoriteTemplates, setFavoriteTemplates] = useState([])  // 新增：收藏的模板ID列表
  const MAX_GENERATIONS = user ? 6 : 3  // 登录用户6次，非登录用户3次
  const TEMPLATES_PER_PAGE = 6
  const [categoryPages, setCategoryPages] = useState({})
  const touchStartRef = useRef({})
  const lastRequestRef = useRef(null) // 请求去重
  const requestDebounceRef = useRef(null) // 防抖
  const remainingGenerations = Math.max(0, MAX_GENERATIONS - generationCount)
  const limitReached = generationCount >= MAX_GENERATIONS
  const isDuoInteraction = forcePlusOneMode || selectedTemplate?.category === 'Duo Interaction'
  const hasRequiredImages = isDuoInteraction 
    ? (uploadedImage && uploadedImage2)
    : uploadedImage
  const canGenerate = Boolean(selectedTemplate && hasRequiredImages && !limitReached && !isProcessing && !result)
  const generateButtonLabel = limitReached
    ? '🚫 Daily limit reached'
    : !hasRequiredImages
      ? isDuoInteraction
        ? '📤 Upload two photos first'
        : '📤 Upload a photo first'
      : '🎨 Create Video'

  // 确定当前页面类型
  const currentPath = location.pathname;
  const isAIStudio = currentPath === '/ai-studio';
  const isMyVideos = currentPath === '/my-videos';
  const isCommunity = currentPath === '/community';
  const isTikTok = currentPath === '/face-swap-for-tiktok';
  const isInstagram = currentPath === '/face-swap-for-instagram';
  const isBirthday = currentPath === '/birthday-face-swap-video';
  const isGifMaker = currentPath === '/face-swap-gif-maker';
  const isVideoMaker = currentPath === '/face-swap-video-maker';
  const isHome = currentPath === '/' || (!isAIStudio && !isMyVideos && !isTikTok && !isInstagram && !isBirthday && !isGifMaker && !isVideoMaker && !isCommunity);

  // 分类名称映射
  const categoryMap = {
    'duo': 'Duo Interaction',
    'Duo Interaction': 'Duo Interaction',
    'funny': 'Funny & Crazy',
    'Humor': 'Funny & Crazy',
    'Emotional Reactions': 'Emotional Reactions',
    'Emotion': 'Emotional Reactions',
    'Magic Effects': 'Magic Effects',
    'Slapstick': 'Slapstick Comedy',
    'Slapstick Comedy': 'Slapstick Comedy',
    'stylemakeovers': 'Style Makeovers',
    'Style Makeovers': 'Style Makeovers',
    'Cool': 'Style Makeovers'
  }

  // Handle data from AI Studio
  useEffect(() => {
    if (location.state && location.state.fromStudio && location.state.imageUrl) {
      setUploadedImage(location.state.imageUrl);
      // 如果是从 AI Studio 回来，确保回到首页
      if (location.pathname !== '/') {
        navigate('/');
      }
      
      // Clear the state to prevent reloading on refresh
      window.history.replaceState({}, document.title);
      
      toast.success('✨ AI Generated Image loaded! Now select a template.', {
        autoClose: 5000,
        icon: '🎨'
      });

      // Scroll to templates section
      setTimeout(() => {
        document.querySelector('.templates-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [location, navigate]);

  useEffect(() => {
    if (
      currentPath === '/' &&
      location.state?.fromCommunity &&
      location.state?.templateId &&
      templates.length > 0
    ) {
      const templateId = Number(location.state.templateId)
      console.log('🔍 Looking for template ID:', templateId)
      console.log('📋 Available template IDs:', templates.map(t => t.id))
      
      const matchedTemplate = templates.find((tpl) => tpl.id === templateId)

      if (matchedTemplate) {
        console.log('✅ Found template:', matchedTemplate.name)
        if (mainContentRef.current) {
          scrollPositionRef.current = mainContentRef.current.scrollTop
        }

        const plusOneRequested = Boolean(location.state.plusOne)
        setForcePlusOneMode(plusOneRequested)
        setCameFromCommunity(true)  // 标记从社区来的
        if (plusOneRequested) {
          toast.info('Plus One enabled: upload two faces to join this remix.')
        }

        setSelectedTemplate(matchedTemplate)
        requestAnimationFrame(() => {
          document.querySelector('.creation-mode-container')?.scrollIntoView({ behavior: 'smooth' })
        })
      } else {
        console.warn('❌ Template not found. ID:', templateId, 'Available IDs:', templates.map(t => t.id))
        setForcePlusOneMode(false)
        setCameFromCommunity(false)
        toast.error(`Template ID ${templateId} not found. Please try again later.`)
      }

      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [currentPath, location, templates, navigate])

  // Auto-scroll removed based on user feedback
  useEffect(() => {
    // Keep empty or remove entirely
  }, [selectedTemplate]);

  // 加载模板数据（带缓存和错误重试）
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        // 尝试从缓存读取
        const cachedTemplates = localStorage.getItem('templates_cache')
        const cacheTimestamp = localStorage.getItem('templates_cache_timestamp')
        const cacheExpiry = 24 * 60 * 60 * 1000 // 24小时
        
        if (cachedTemplates && cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < cacheExpiry) {
          try {
            const cachedData = JSON.parse(cachedTemplates)
            const mappedData = cachedData.map(template => ({
              ...template,
              category: categoryMap[template.category] || template.category
            }))
            setTemplates(mappedData)
            setIsLoading(false)
            console.log('✅ Loaded templates from cache:', mappedData.length)
            
            // 后台更新缓存
            fetch('/templates.json')
              .then(res => res.json())
              .then(data => {
                localStorage.setItem('templates_cache', JSON.stringify(data))
                localStorage.setItem('templates_cache_timestamp', Date.now().toString())
              })
              .catch(() => {
                // 静默失败，使用缓存数据
              })
            return
          } catch (e) {
            // 缓存数据损坏，清除缓存
            localStorage.removeItem('templates_cache')
            localStorage.removeItem('templates_cache_timestamp')
          }
        }
        
        // 从服务器加载
        const res = await fetch('/templates.json', {
          cache: 'default',
          headers: {
            'Cache-Control': 'max-age=86400' // 24小时缓存
          }
        })
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const data = await res.json()
        
        // 保存到缓存
        localStorage.setItem('templates_cache', JSON.stringify(data))
        localStorage.setItem('templates_cache_timestamp', Date.now().toString())
        
        // 映射分类名称
        const mappedData = data.map(template => ({
          ...template,
          category: categoryMap[template.category] || template.category
        }))
        setTemplates(mappedData)
        setIsLoading(false)
        console.log('✅ Loaded templates from API:', mappedData.length)
      } catch (err) {
        console.error('Failed to load templates:', err)
        
        // 尝试使用缓存（即使过期）
        const cachedTemplates = localStorage.getItem('templates_cache')
        if (cachedTemplates) {
          try {
            const cachedData = JSON.parse(cachedTemplates)
            const mappedData = cachedData.map(template => ({
              ...template,
              category: categoryMap[template.category] || template.category
            }))
            setTemplates(mappedData)
            setIsLoading(false)
            console.log('⚠️ Using expired cache data')
            return
          } catch (e) {
            // 缓存数据损坏
          }
        }
        
        // 使用默认模板
        setTemplates(defaultTemplates)
        setIsLoading(false)
      }
    }
    
    loadTemplates()
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
      console.log('Google login response:', response)
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
      
      console.log('✅ Login success:', userInfo)
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Login failed. Please try again.')
    }
  }

  // 点击登录按钮时的处理
  const handleGoogleSignInClick = async () => {
    console.log('Login button clicked')
    
    // 使用 Google Identity Services (GIS)
    if (window.google && window.google.accounts) {
      try {
        // 使用 signIn 方法获取用户信息
        window.google.accounts.oauth2.initTokenClient({
          client_id: '457199816989-e16gt3va81kalp0nphhqf0rj0v39ij0b.apps.googleusercontent.com',
          scope: 'openid email profile',
          callback: async (response) => {
            console.log('Token response:', response)
            
            if (response.access_token) {
              // 使用 token 获取用户信息
              try {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                  headers: {
                    'Authorization': `Bearer ${response.access_token}`
                  }
                })
                const userInfo = await userInfoResponse.json()
                console.log('User info:', userInfo)
                
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
                console.log('✅ Login successful! Welcome ' + userInfo.name + '!')
              } catch (error) {
                console.error('Failed to fetch user info:', error)
                toast.warning('Login succeeded but we could not load your profile.')
              }
            }
          }
        }).requestAccessToken({ prompt: 'consent' })
      } catch (error) {
        console.error('OAuth2 error:', error)
        toast.error('Login is temporarily unavailable. Please try again later.')
      }
    } else {
      console.error('Google API not loaded')
      toast.error('Google login is temporarily unavailable. Please refresh and try again.')
    }
  }

  const handleSignOut = () => {
    setUser(null)
    localStorage.removeItem('user')
    setMyVideos([])
    navigate('/') // 回到首页
    // 关闭下拉菜单
    const menu = document.querySelector('.user-dropdown')
    if (menu) {
      menu.classList.remove('show')
    }
  }

  // Save generated videos to the "My Videos" list
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
    // 加载收藏的模板
    const savedFavorites = localStorage.getItem('favoriteTemplates') || '[]'
    setFavoriteTemplates(JSON.parse(savedFavorites))
  }, [])

  // 切换模板收藏状态
  const handleToggleFavorite = useCallback((templateId) => {
    setFavoriteTemplates(prev => {
      const isFavorited = prev.includes(templateId)
      const updated = isFavorited
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
      localStorage.setItem('favoriteTemplates', JSON.stringify(updated))
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites')
      return updated
    })
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
          console.log('One Tap prompt status:', notification)
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
      console.log('New day detected, reset generation count')
      localStorage.setItem('faceSwapLastDate', todayDate)
      localStorage.setItem('faceSwapGenerationCount', '0')
      setGenerationCount(0)
    } else {
      // 日期是今天，使用存储的计数
      setGenerationCount(storedCount)
      console.log(`今日已生成: ${storedCount}/${MAX_GENERATIONS}`)
    }
  }, [])

  // 过滤模板（使用useMemo优化性能）- 支持SEO关键词搜索
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return templates
    const query = searchQuery.toLowerCase().trim()
    
    // 基础搜索：名称和分类
    const basicMatch = templates.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    )
    
    // 如果基础匹配有结果，优先返回
    if (basicMatch.length > 0) return basicMatch
    
    // 扩展搜索：SEO关键词匹配（需要动态导入）
    const queryWords = query.split(/\s+/).filter(word => word.length > 0)
    return templates.filter(template => {
      // 尝试从文件名提取关键词
      const fileName = template.fileName || ''
      const fileNameLower = fileName.replace(/\.mp4$/, '').replace(/[-_]/g, ' ').toLowerCase()
      
      // 检查文件名关键词
      const fileNameMatch = queryWords.some(word => fileNameLower.includes(word))
      
      // 检查分类相关的常见关键词
      const categoryKeywords = {
        'Emotional Reactions': ['emotional', 'reaction', 'reactions', 'emotion', 'feelings', 'surprised', 'laughing', 'crying', 'shocked'],
        'Burlesque Dance': ['dance', 'dancing', 'tiktok', 'hip', 'hop', 'trending', 'choreography'],
        'Duo Interaction': ['couple', 'two', 'person', 'duo', 'pair', 'friend', 'friends', 'relationship'],
        'Magic Effects': ['magic', 'magical', 'fantasy', 'supernatural', 'wizard', 'spell', 'transformation'],
        'Sci-Fi Effects': ['sci-fi', 'scifi', 'futuristic', 'cyberpunk', 'future', 'tech', 'space', 'sci'],
        'Slapstick Comedy': ['comedy', 'funny', 'hilarious', 'goofy', 'silly', 'prank', 'humor'],
        'Style Makeovers': ['style', 'makeover', 'fashion', 'outfit', 'transform', 'transformation', 'look']
      }
      
      const categoryKeyList = categoryKeywords[template.category] || []
      const categoryKeywordMatch = queryWords.some(word => 
        categoryKeyList.some(keyword => keyword.includes(word))
      )
      
      return fileNameMatch || categoryKeywordMatch
    })
  }, [templates, searchQuery])

  const groupedTemplates = useMemo(() => {
    return filteredTemplates.reduce((groups, template) => {
      const category = template.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(template)
      return groups
    }, {})
  }, [filteredTemplates])

  const CATEGORY_ORDER = [
    'Emotional Reactions',
    'Magic Effects',
    'Slapstick Comedy',
    'Sci-Fi Effects',
    'Style Makeovers',
    'Burlesque Dance',
    'Duo Interaction'
  ]

  const sortedCategories = useMemo(() => {
    const entries = Object.entries(groupedTemplates)
    return entries.sort(([a], [b]) => {
      const indexA = CATEGORY_ORDER.indexOf(a)
      const indexB = CATEGORY_ORDER.indexOf(b)
      if (indexA === -1 && indexB === -1) {
        return a.localeCompare(b)
      }
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })
  }, [groupedTemplates])

  useEffect(() => {
    setCategoryPages(prev => {
      const updated = { ...prev }
      Object.entries(groupedTemplates).forEach(([category, items]) => {
        const totalPages = Math.max(1, Math.ceil(items.length / TEMPLATES_PER_PAGE))
        if (!(category in updated)) {
          updated[category] = 0
        } else if (updated[category] >= totalPages) {
          updated[category] = totalPages - 1
        }
      })
      Object.keys(updated).forEach(category => {
        if (!groupedTemplates[category]) {
          delete updated[category]
        }
      })
      return updated
    })
  }, [groupedTemplates])

  useEffect(() => {
    if (!selectedTemplate) return
    const category = selectedTemplate.category
    const categoryList = groupedTemplates[category]
    if (!categoryList) return
    const index = categoryList.findIndex(t => t.id === selectedTemplate.id)
    if (index === -1) return
    const targetPage = Math.floor(index / TEMPLATES_PER_PAGE)
    setCategoryPages(prev => {
      const current = prev[category] || 0
      if (current === targetPage) return prev
      return { ...prev, [category]: targetPage }
    })
  }, [selectedTemplate, groupedTemplates])

  const handleCategoryPageChange = useCallback((category, delta) => {
    setCategoryPages(prev => {
      const categoryList = groupedTemplates[category] || []
      const totalPages = Math.max(1, Math.ceil(categoryList.length / TEMPLATES_PER_PAGE))
      const current = prev[category] || 0
      const next = Math.max(0, Math.min(totalPages - 1, current + delta))
      if (next === current) return prev
      return { ...prev, [category]: next }
    })
  }, [groupedTemplates])

  const handleTouchStart = (category, event) => {
    touchStartRef.current[category] = event.touches[0].clientX
  }

  const handleTouchEnd = (category, event) => {
    const startX = touchStartRef.current[category]
    if (startX == null) return
    const endX = event.changedTouches[0].clientX
    const delta = endX - startX
    const threshold = 50
    if (Math.abs(delta) > threshold) {
      handleCategoryPageChange(category, delta < 0 ? 1 : -1)
    }
    delete touchStartRef.current[category]
  }

  // 处理图片上传（由UploadSection组件调用）
  const handleImageUpload = useCallback((imageData, isSecond = false) => {
    if (isSecond) {
      setUploadedImage2(imageData)
    } else {
      setUploadedImage(imageData)
    }
  }, [])

  // 拖拽上传处理
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    // 拖拽上传由UploadSection组件内部处理
  }, [])

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

  // 当切换模板时，如果不是Duo Interaction类型，清空第二个照片
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.category !== 'Duo Interaction') {
      setUploadedImage2(null)
    }
  }, [selectedTemplate])

  useEffect(() => {
    if (!selectedTemplate) return

    // 优先从模板数据中获取duration
    if (selectedTemplate.duration && typeof selectedTemplate.duration === 'number') {
      const predicted = parseFloat((selectedTemplate.duration * 15.4).toFixed(2))
      setPredictedTotalTime(predicted)
      setEstimatedTotalTime(predicted)
      predictedCacheRef.current[selectedTemplate.id] = predicted
      return
    }

    // 如果模板数据中没有duration，尝试从缓存获取
    const cached = predictedCacheRef.current[selectedTemplate.id]
    if (cached) {
      setPredictedTotalTime(cached)
      setEstimatedTotalTime(cached)
      return
    }

    // 最后尝试从video元素获取（可能因CORS失败）
    setPredictedTotalTime(null)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.crossOrigin = 'anonymous'
    video.src = selectedTemplate.gifUrl

    const onLoadedMetadata = () => {
      if (!isNaN(video.duration) && video.duration > 0) {
        const duration = video.duration
        const predicted = parseFloat((duration * 15.4).toFixed(2))
        predictedCacheRef.current[selectedTemplate.id] = predicted
        setPredictedTotalTime(predicted)
        setEstimatedTotalTime(predicted)
      }
    }

    const onError = () => {
      if (!predictedCacheRef.current[selectedTemplate.id]) {
        const fallback = 30
        predictedCacheRef.current[selectedTemplate.id] = fallback
        setPredictedTotalTime(fallback)
        setEstimatedTotalTime(fallback)
      }
    }
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('error', onError)

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('error', onError)
    }
  }, [selectedTemplate])

  useEffect(() => {
    let timer
    if (isProcessing && processingStartTime) {
      timer = setInterval(() => {
        setClientElapsedTime((Date.now() - processingStartTime) / 1000)
      }, 100)
    } else {
      setClientElapsedTime(0)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isProcessing, processingStartTime])

  const effectiveElapsedTime = useMemo(() => {
    const backendElapsed = typeof elapsedTime === 'number' ? elapsedTime : 0
    const clientElapsed = typeof clientElapsedTime === 'number' ? clientElapsedTime : 0
    return Math.max(backendElapsed, clientElapsed)
  }, [elapsedTime, clientElapsedTime])

  const activeEstimatedTotalTime = predictedTotalTime || estimatedTotalTime || 0

  const displayProgress = useMemo(() => {
    return parseFloat(scriptedProgress.toFixed(1))
  }, [scriptedProgress])

  const remainingTimeDisplay = useMemo(() => {
    if (activeEstimatedTotalTime > 0) {
      return `${Math.max(0, activeEstimatedTotalTime - effectiveElapsedTime).toFixed(1)}s`
    }
    return '...'
  }, [activeEstimatedTotalTime, effectiveElapsedTime])

  useEffect(() => {
    let scriptedTimer
    if (isProcessing && predictedTotalTime && predictedTotalTime > 0) {
      // 基于预测时间计算进度增量
      // 如果预测时间为10s，每0.4秒+4% = 40% / 10
      // 如果预测时间为20s，每0.4秒+2% = 40% / 20
      // 公式：每0.4秒增加 = 40% / 预测时间
      const incrementPerInterval = 40 / predictedTotalTime
      
      scriptedTimer = setInterval(() => {
        setScriptedProgress(prev => {
          if (result) return 100
          if (prev >= 98.9) return 99
          const next = prev + incrementPerInterval
          if (next >= 98.9) return 98.9
          return parseFloat(next.toFixed(1))
        })
      }, 400)
    } else if (isProcessing) {
      // 如果没有预测时间，使用默认增量
      scriptedTimer = setInterval(() => {
        setScriptedProgress(prev => {
          if (result) return 100
          if (prev >= 98.9) return 99
          const next = prev + 1.5
          if (next >= 98.9) return 98.9
          return parseFloat(next.toFixed(1))
        })
      }, 400)
    } else {
      setScriptedProgress(result ? 100 : 5.0)
    }

    return () => {
      if (scriptedTimer) clearInterval(scriptedTimer)
    }
  }, [isProcessing, result, predictedTotalTime])

  useEffect(() => {
    if (result) {
      setScriptedProgress(100)
    }
  }, [result])

  const timeDisplay = useMemo(() => {
    if (activeEstimatedTotalTime > 0) {
      return `${effectiveElapsedTime.toFixed(1)}s / ${activeEstimatedTotalTime.toFixed(1)}s`
    }
    return `${effectiveElapsedTime.toFixed(1)}s / ...`
  }, [effectiveElapsedTime, activeEstimatedTotalTime])

  const handleGenerate = useCallback(async () => {
    // 防止重复提交
    if (isProcessing) {
      toast.warning('Please wait for the current request to complete')
      return
    }
    
    const isDuo = selectedTemplate?.category === 'Duo Interaction'
    if (!selectedTemplate || !uploadedImage || (isDuo && !uploadedImage2)) {
      toast.warning(isDuo ? 'Please choose a template and upload two photos first!' : 'Please choose a template and upload a photo first!')
      return
    }

    // 检查生成次数限制
    const maxGenerations = user ? 6 : 3
    if (generationCount >= maxGenerations) {
      if (!user) {
        toast.warning(`Free quota used up (${maxGenerations} runs). Sign in to unlock more!`, { autoClose: 5000 })
      } else {
        toast.info(`Your free quota (${maxGenerations} runs) is finished. Thanks for creating!`, { autoClose: 5000 })
      }
      return
    }
    
    // 请求去重：生成请求唯一标识
    const requestHash = `${selectedTemplate.id}_${uploadedImage.substring(0, 50)}_${isDuo ? uploadedImage2?.substring(0, 50) : ''}`
    const now = Date.now()
    
    // 检查是否为重复请求（5秒内相同请求）
    if (lastRequestRef.current && 
        lastRequestRef.current.hash === requestHash && 
        now - lastRequestRef.current.timestamp < 5000) {
      toast.warning('Please wait before submitting the same request again')
      return
    }
    
    // 更新最后请求记录
    lastRequestRef.current = {
      hash: requestHash,
      timestamp: now
    }

    setIsProcessing(true)
    setProcessingStartTime(Date.now())
    setClientElapsedTime(0)
    setScriptedProgress(5.0)
    setResult(null) // 清除之前的结果
    setProcessingStatus('Processing your video...')

    try {
      // 检查网络状态
      if (!navigator.onLine) {
        throw new Error('Network connection lost. Please check your internet.')
      }

      // 提交换脸任务（添加超时控制）
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

      let response
      try {
        response = await fetch('/api/face-swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetImage: selectedTemplate.gifUrl,  // 使用GIF URL
          sourceImage: uploadedImage,            // 用户照片
          sourceImage2: isDuoInteraction ? uploadedImage2 : null,  // 第二个人照片（仅Duo Interaction）
        }),
          signal: controller.signal
        })
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please check your connection or try again later.')
        } else if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('fetch failed')) {
          throw new Error('Unable to reach the server. Please check your connection or try again later.')
        } else {
          throw new Error(`网络错误: ${fetchError.message}`)
        }
      }
      
      clearTimeout(timeoutId)

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
        let pollAttempts = 0
        const MAX_POLL_ATTEMPTS = 300 // 最多轮询5分钟（300次 * 1秒）
        let consecutiveErrors = 0
        const MAX_CONSECUTIVE_ERRORS = 5 // 连续5次错误后停止

        // 轮询任务状态
        const pollTask = async () => {
          try {
            pollAttempts++
            
            // 检查最大轮询次数
            if (pollAttempts > MAX_POLL_ATTEMPTS) {
              throw new Error('Processing timeout. Please try again later.')
            }

            // 检查网络状态
            if (!navigator.onLine) {
              consecutiveErrors++
              if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                throw new Error('Network connection lost. Please check your internet.')
              }
              // 网络断开时，延长重试间隔
              setTimeout(pollTask, 5000)
              return
            }

            const statusController = new AbortController()
            const statusTimeoutId = setTimeout(() => statusController.abort(), 10000) // 10秒超时

            let statusResponse
            try {
              statusResponse = await fetch(`/api/face-swap?taskId=${taskId}`, {
                signal: statusController.signal
              })
            } catch (fetchError) {
              clearTimeout(statusTimeoutId)
              consecutiveErrors++
              
              // 如果是网络错误，允许重试
              if (fetchError.name === 'AbortError' || 
                  fetchError.message.includes('Failed to fetch') || 
                  fetchError.message.includes('fetch failed')) {
                if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                  throw new Error('Unable to reach the server. Please check your connection or try again later.')
                }
                // 网络错误时，延长重试间隔
                console.warn(`轮询错误 (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`, fetchError.message)
                setTimeout(pollTask, 3000)
                return
              } else {
                throw fetchError
              }
            }
            
            clearTimeout(statusTimeoutId)
            
            // 成功请求后重置连续错误计数
            consecutiveErrors = 0
            
            // 检查响应状态
            if (!statusResponse.ok) {
              const errorText = await statusResponse.text()
              throw new Error(`服务器错误 (${statusResponse.status}): ${errorText.substring(0, 100)}`)
            }
            
            const statusData = await statusResponse.json()

            if (!statusData.success) {
              throw new Error(statusData.error || 'Task failed')
            }

            // 更新进度
            setProcessingStatus(statusData.message || 'Processing...')
            setProgress(statusData.progress || 0)
            setElapsedTime(statusData.elapsedTime || 0)
            if (!predictedTotalTime) {
              setEstimatedTotalTime(statusData.estimatedTotalTime || 20)
            }

            if (statusData.status === 'completed') {
            // 任务完成
              setProcessingStatus('Complete!')
            setProgress(100)
              const result = {
                url: statusData.result,
              template: selectedTemplate
              }
              setResult(result)
              
              // Save to "My Videos" if the user is logged in
              if (user) {
                saveVideoToMyList(result)
              }

              // Auto-post to Community Feed (Simulated)
              try {
                const newPost = {
                  id: `post-local-${Date.now()}`,
                  templateId: selectedTemplate.id,
                  templateName: selectedTemplate.name,
                  title: `${user ? user.name.split(' ')[0] : 'Guest'}'s ${selectedTemplate.name} Remix`,
                  description: `Just created this amazing face swap video using the ${selectedTemplate.name} template!`,
                  author: user ? {
                    name: user.name,
                    avatar: user.picture,
                    handle: `@${user.name.replace(/\s+/g, '').toLowerCase()}`
                  } : {
                    name: 'Anonymous Creator',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now(),
                    handle: '@anonymous'
                  },
                  metrics: {
                    likes: 0,
                    remixes: 0,
                    views: 0
                  },
                  createdAt: 'Just now',
                  tags: ['remix', selectedTemplate.category.toLowerCase().split(' ')[0], 'new'],
                  isFeatured: false,
                  isFriendPost: false,
                  clipUrl: result.url,
                  prompt: `Face swap using ${selectedTemplate.name} template`,
                  soundtrack: 'Original Audio',
                  supportsPlusOne: isDuoInteraction
                }
                
                const existingPosts = JSON.parse(localStorage.getItem('community_posts') || '[]')
                localStorage.setItem('community_posts', JSON.stringify([newPost, ...existingPosts]))
                toast.success('🎉 Published to Community Feed!')
              } catch (err) {
                console.error('Failed to auto-post to community', err)
              }
              
            setIsProcessing(false)
            setProcessingStartTime(null)
            setClientElapsedTime(0)
            setScriptedProgress(100)
              
              // 触发庆祝动画
              setShowCelebration(true)
              setTimeout(() => setShowCelebration(false), 3000)

              // 确保视频在加载后自动播放
              setTimeout(() => {
                if (videoRef.current && isVideoUrl(result.url)) {
                  videoRef.current.play().catch(err => {
                    console.warn('Video autoplay blocked:', err)
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
          setProcessingStartTime(null)
          setClientElapsedTime(0)
          setScriptedProgress(5.0)
          
          // 提供更友好的错误提示
          let errorMessage = error.message || 'Unknown error'
          if (errorMessage.includes('fetch failed') || errorMessage.includes('Failed to fetch')) {
            errorMessage = 'Unable to reach the server. Please check your connection or try again later.'
          }
          
            toast.error(`生成失败: ${errorMessage}`, { autoClose: 5000 })
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

        // Auto-post to Community Feed (Simulated)
        try {
          const newPost = {
            id: `post-local-${Date.now()}`,
            templateId: selectedTemplate.id,
            templateName: selectedTemplate.name,
            title: `${user ? user.name.split(' ')[0] : 'Guest'}'s ${selectedTemplate.name} Remix`,
            description: `Just created this amazing face swap video using the ${selectedTemplate.name} template!`,
            author: user ? {
              name: user.name,
              avatar: user.picture,
              handle: `@${user.name.replace(/\s+/g, '').toLowerCase()}`
            } : {
              name: 'Anonymous Creator',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now(),
              handle: '@anonymous'
            },
            metrics: {
              likes: 0,
              remixes: 0,
              views: 0
            },
            createdAt: 'Just now',
            tags: ['remix', selectedTemplate.category.toLowerCase().split(' ')[0], 'new'],
            isFeatured: false,
            isFriendPost: false,
            clipUrl: result.url,
            prompt: `Face swap using ${selectedTemplate.name} template`,
            soundtrack: 'Original Audio',
            supportsPlusOne: isDuoInteraction
          }
          
          const existingPosts = JSON.parse(localStorage.getItem('community_posts') || '[]')
          localStorage.setItem('community_posts', JSON.stringify([newPost, ...existingPosts]))
          toast.success('🎉 Published to Community Feed!')
        } catch (err) {
          console.error('Failed to auto-post to community', err)
        }
        
        setIsProcessing(false)
        setProcessingStartTime(null)
        setClientElapsedTime(0)
        setScriptedProgress(100)
        
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)

        // 确保视频在加载后自动播放
        setTimeout(() => {
          if (videoRef.current && isVideoUrl(result.url)) {
            videoRef.current.play().catch(err => {
              console.warn('Video autoplay blocked:', err)
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
      console.error('Face swap error:', error)
      setProcessingStatus('')
      setIsProcessing(false)
      setProcessingStartTime(null)
      setClientElapsedTime(0)
      setScriptedProgress(5.0)
      
      // 提供更友好的错误提示
      let errorMessage = error.message || 'Unknown error'
      if (errorMessage.includes('fetch failed') || errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Unable to reach the server. Please check your connection or try again later.'
      }
      
      toast.error(`生成失败: ${errorMessage}`, { autoClose: 5000 })
    }
  }, [
    isProcessing,
    selectedTemplate,
    uploadedImage,
    uploadedImage2,
    user,
    generationCount,
    MAX_GENERATIONS,
    isDuoInteraction,
    isVideoUrl,
    saveVideoToMyList,
    getTodayDateString
  ])

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
      console.error('Download failed:', error)
      toast.error('Download failed. Please try again later.')
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
      console.error('Download failed:', error)
      toast.error('Download failed. Please try again later.')
    }
  }

  return (
    <div className="app">
      {/* 粒子背景已移除 - 深色主题不需要 */}

      {/* 左侧导航栏 - MindVideo Style */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🎭</span>
            <span className="logo-text">FaceAI Hub</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <div className="nav-group-title">Creation Center</div>
            <Link to="/" className={`nav-item ${isHome ? 'active' : ''}`}>
              <span className="nav-icon">🎭</span> Face Swap
            </Link>
            <Link to="/ai-studio" className={`nav-item ${isAIStudio ? 'active' : ''}`}>
              <span className="nav-icon">✨</span> AI Studio
            </Link>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Video AI</div>
            <Link to="/face-swap-video-maker" className={`nav-item ${isVideoMaker ? 'active' : ''}`}>
              <span className="nav-icon">🎬</span> Video Maker
            </Link>
            <Link to="/face-swap-for-tiktok" className={`nav-item ${isTikTok ? 'active' : ''}`}>
              <span className="nav-icon">📱</span> TikTok Trends
            </Link>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Image AI</div>
            <Link to="/face-swap-gif-maker" className={`nav-item ${isGifMaker ? 'active' : ''}`}>
              <span className="nav-icon">🎞️</span> GIF Maker
            </Link>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Community</div>
            <Link to="/community" className={`nav-item ${isCommunity ? 'active' : ''}`}>
              <span className="nav-icon">🌐</span> Community
            </Link>
          </div>

          {user && (
            <div className="nav-group">
              <div className="nav-group-title">Assets</div>
              <Link to="/my-videos" className={`nav-item ${isMyVideos ? 'active' : ''}`}>
                <span className="nav-icon">📂</span> My Gallery
              </Link>
            </div>
          )}
        </nav>
        
        <div className="sidebar-footer">
          {!user ? (
            <button className="btn-upgrade" onClick={handleGoogleSignInClick}>
              Sign In to Save
            </button>
          ) : (
            <div className="upgrade-card">
              <div className="upgrade-title">Pro Plan</div>
              <div className="upgrade-desc">Unlock 4K Export</div>
              <button className="btn-upgrade">Upgrade Now</button>
            </div>
          )}
        </div>
      </div>

      <div className="app-body">
        {/* Top Navbar moved here */}
        <div className="top-navbar">
          <div className="credits-pill">
            <span className="credits-icon">⚡</span>
            <span className="credits-text">Credits:</span>
            <span className="credits-count">{user ? Math.max(0, (user ? 6 : 3) - generationCount) : 3}</span>
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

      {/* 主内容区域 - 移除巨大的Hero，改为紧凑横幅 */}
      <div className="main-content">
        
        {/* === AI Studio Page === */}
        {isAIStudio && (
          <AIStudioPage />
        )}

        {/* === TikTok Page === */}
        {isTikTok && (
          <TikTokPage />
        )}

        {/* === Instagram Page === */}
        {isInstagram && (
          <InstagramPage />
        )}

        {/* === Birthday Page === */}
        {isBirthday && (
          <BirthdayPage />
        )}

        {/* === Gif Maker Page === */}
        {isGifMaker && (
          <GifMakerPage />
        )}

        {/* === Video Maker Page === */}
        {isVideoMaker && (
          <VideoMakerPage />
        )}

        {/* === Community Page === */}
        {isCommunity && (
          <CommunityPage
            user={user}
            onLogin={handleGoogleSignInClick}
          />
        )}
        
        {/* === Home Page (Face Swap) === */}
        {isHome && (
          <>
            {/* Main Content - MindVideo Style Hero */}
            {!selectedTemplate && (
              <>
                <div className="hero-banner" style={{ justifyContent: 'center' }}>
                  <div className="hero-bg-glow"></div>
                  <div className="hero-content" style={{ maxWidth: '100%', textAlign: 'center', margin: '0 auto' }}>
                    <h1 className="hero-title" style={{ whiteSpace: 'nowrap', fontSize: '2.8rem', marginBottom: '12px' }}>AI Face Swap Meme Generator</h1>
                    <p className="hero-desc" style={{ margin: '0 auto', maxWidth: '800px' }}>Create hilarious memes, swap faces in videos, and generate AI photos with our free, powerful face swap tools. No watermark, high quality, and easy to use.</p>
                  </div>
                </div>

              </>
            )}
    
            {!isOnline && (
              <div className="offline-notice">
                ⚠️ You're offline. Some features may not work properly.
              </div>
            )}
    
            <main className="main-content" ref={mainContentRef}>
              <div className={`content-wrapper ${selectedTemplate ? 'template-selected' : ''}`}>
                {/* 模板列表模式 - 使用 display:none 代替条件渲染以保持滚动位置 */}
                <section 
                  className="templates-section" 
                  aria-label="Short video template selection"
                  style={{ display: selectedTemplate ? 'none' : 'block' }}
                >
                  <div className="section-header">
                    <h2 id="templates-heading">Choose AI Face Swap Video Templates</h2>
                    {selectedTemplate && (
                      <button 
                        className="clear-selection-btn"
                        onClick={() => {
                          setSelectedTemplate(null)
                          setUploadedImage(null)
                        setUploadedImage2(null)
                          setResult(null)
                        setForcePlusOneMode(false)
                        }}
                        aria-label="Clear selected template"
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
                        aria-label="Search templates"
                      />
                      {searchQuery && (
                        <button
                          className="clear-search"
                          aria-label="Clear search"
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
                  <TemplateGrid
                    sortedCategories={sortedCategories}
                    selectedTemplate={selectedTemplate}
                    onSelectTemplate={handleSelectTemplate}
                    categoryPages={categoryPages}
                    onCategoryPageChange={handleCategoryPageChange}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    templatesPerPage={TEMPLATES_PER_PAGE}
                    favoriteTemplates={favoriteTemplates}
                    onToggleFavorite={handleToggleFavorite}
                  />
                  </section>
      
                {/* 全屏制作模式 */}
                {selectedTemplate && (
                  <div className="creation-mode-container">
                    <div className="creation-header">
                      <button 
                        className="back-btn"
                        onClick={() => {
                          if (cameFromCommunity) {
                            // 如果是从社区来的，返回社区页面
                            navigate('/community')
                            setCameFromCommunity(false)
                          } else {
                            // 否则返回模板列表
                            setSelectedTemplate(null)
                          }
                          setUploadedImage(null);
                          setUploadedImage2(null);
                          setResult(null);
                          setForcePlusOneMode(false);
                        }}
                      >
                        ← {cameFromCommunity ? 'Back to Community' : 'Back to Templates'}
                      </button>
                      <h2>Create Your Video</h2>
                    </div>

                    <div className="action-panel-content">
                      {result ? (
                        <ResultDisplay 
                          result={result}
                          selectedTemplate={selectedTemplate}
                          onDownload={handleDownload}
                          onCreateNew={(resetAll) => {
                            setResult(null);
                            if (resetAll) {
                              if (cameFromCommunity) {
                                navigate('/community')
                                setCameFromCommunity(false)
                              } else {
                                setSelectedTemplate(null)
                              }
                              setUploadedImage(null);
                              setUploadedImage2(null);
                              setForcePlusOneMode(false);
                            }
                          }}
                          isDuoInteraction={isDuoInteraction}
                          hasRequiredImages={hasRequiredImages}
                          isProcessing={isProcessing}
                          limitReached={limitReached}
                        />
                      ) : (
                        <>
                          {/* 布局修复：左右分栏结构 */}
                          <div className="action-grid-layout">
                            {/* 左列：模板预览 */}
                            <div className="preview-column">
                              <div className="preview-card">
                                <h3><span className="step-badge">Step 1</span>Template</h3>
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
                            </div>
          
                            {/* 右列：上传区域 (包含所有上传框) */}
                            <div className="upload-column">
                              <UploadSection
                                isDuoInteraction={isDuoInteraction}
                                uploadedImage={uploadedImage}
                                uploadedImage2={uploadedImage2}
                                onImageUpload={handleImageUpload}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                              />
                            </div>
                          </div>
          
                          {/* 底部：生成区域 (全宽) */}
                          <div className="generate-section-full">
                            <div className="action-card-inline">
                              <h3><span className="step-badge">Step 3</span>Generate</h3>
                              
                              {isProcessing ? (
                                <ProgressDisplay 
                                  progress={scriptedProgress} 
                                  processingStatus={processingStatus} 
                                  elapsedTime={clientElapsedTime} 
                                  predictedTotalTime={predictedTotalTime}
                                />
                              ) : (
                                <>
                                  <div className="usage-info">
                                    <span className="usage-text">
                                      Remaining: <strong>{remainingGenerations}</strong> / {MAX_GENERATIONS}
                                    </span>
                                    {limitReached && (
                                      <span className="usage-warning">⚠️ Limit Reached</span>
                                    )}
                                  </div>
                                  
                                  <button
                                    className="generate-button"
                                    onClick={handleGenerate}
                                    disabled={!canGenerate}
                                  >
                                    {generateButtonLabel}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
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
          </>
        )}

        {/* === Me Page === */}
        {isMyVideos && user && (
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

        {!user && isMyVideos && (
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

      </div>
    </div>
      
    {/* Toast 通知容器 */}
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
  </div>
  )
}

export default App