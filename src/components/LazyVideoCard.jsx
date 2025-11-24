import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// 从文件名生成slug
function generateSlug(fileName) {
  return fileName
    .replace(/\.mp4$/, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
}

// 获取分类slug
function getCategorySlug(category) {
  const categoryMap = {
    'Emotional Reactions': 'emotional-reactions',
    'Magic Effects': 'magic-effects',
    'Slapstick Comedy': 'slapstick-comedy',
    'Sci-Fi Effects': 'sci-fi-effects',
    'Style Makeovers': 'style-makeovers',
    'Burlesque Dance': 'burlesque-dance',
    'Duo Interaction': 'duo-interaction'
  }
  return categoryMap[category] || category.toLowerCase().replace(/\s+/g, '-')
}

// 懒加载视频卡片组件
function LazyVideoCard({ template, isSelected, onSelect, isFavorited, onToggleFavorite, showLink = false }) {
  const navigate = useNavigate()
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const videoRef = useRef(null)
  const cardRef = useRef(null)

  // 使用 Intersection Observer 检测是否进入视口
  useEffect(() => {
    const currentCard = cardRef.current
    if (!currentCard) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1
      }
    )

    observer.observe(currentCard)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleFavoriteClick = (e) => {
    e.stopPropagation() // 阻止触发模板选择
    if (onToggleFavorite) {
      onToggleFavorite(template.id)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }

  const handleFavoriteKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      handleFavoriteClick(e)
    }
  }

  const templateSlug = generateSlug(template.fileName || template.name)
  const categorySlug = getCategorySlug(template.category)
  const detailUrl = `/templates/${categorySlug}/${templateSlug}`

  const handleCardClick = (e) => {
    // 如果点击的是收藏按钮，不触发选择
    if (e.target.closest('.favorite-btn')) {
      return
    }
    
    // 如果显示链接，导航到详情页
    if (showLink) {
      navigate(detailUrl)
    } else {
      // 否则使用原有的选择逻辑
      onSelect()
    }
  }

  const cardContent = (
    <>
      {onToggleFavorite && (
        <button
          className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
          onClick={handleFavoriteClick}
          onKeyDown={handleFavoriteKeyDown}
          aria-label={isFavorited ? `Remove ${template.name} from favorites` : `Add ${template.name} to favorites`}
          aria-pressed={isFavorited}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span aria-hidden="true">{isFavorited ? '❤️' : '🤍'}</span>
        </button>
      )}
      {isInView ? (
        <video
          ref={videoRef}
          src={template.gifUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          loading="lazy"
          aria-label={`Preview video of ${template.name} face swap template`}
          title={`${template.name} face swap video template preview`}
          style={{ 
            width: '100%', 
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0.7,
            transition: 'opacity 0.3s ease'
          }}
          onError={(e) => {
            console.warn('Video failed to load:', template.name)
            e.target.style.display = 'none'
          }}
          onLoadStart={() => {
            setIsLoaded(false)
          }}
          onCanPlay={() => {
            setIsLoaded(true)
          }}
        />
      ) : (
        <div 
          style={{ 
            width: '100%', 
            height: '400px', 
            background: 'var(--bg-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}
        >
          <div className="loading-spinner" style={{ width: '24px', height: '24px' }}></div>
        </div>
      )}
      <div className="template-card-name">{template.name}</div>
    </>
  )

  // 如果显示链接，使用Link包装；否则使用div
  if (showLink) {
    return (
      <Link
        to={detailUrl}
        ref={cardRef}
        className={`template-card ${isSelected ? 'selected' : ''} template-card-link`}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View template: ${template.name}`}
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <div
      ref={cardRef}
      className={`template-card ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Select template: ${template.name}`}
      aria-pressed={isSelected}
    >
      {cardContent}
    </div>
  )
}

export default LazyVideoCard

