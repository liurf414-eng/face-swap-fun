import { useState, useEffect, useRef } from 'react'

// 懒加载视频卡片组件
function LazyVideoCard({ template, isSelected, onSelect, isFavorited, onToggleFavorite }) {
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

  return (
    <div
      ref={cardRef}
      className={`template-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Select template: ${template.name}`}
      aria-pressed={isSelected}
    >
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
          preload="none"
          aria-label={`Preview of ${template.name} template`}
          style={{ 
            width: '100%', 
            height: '200px', 
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
            height: '200px', 
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
    </div>
  )
}

export default LazyVideoCard

