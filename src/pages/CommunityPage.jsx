import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Masonry from 'react-masonry-css'
import { communityPosts } from '../data/communityPosts'

const DEFAULT_BATCH = 8 // 增加每批加载数量

const getFreshnessScore = (label) => {
  if (!label) return Number.MAX_SAFE_INTEGER
  const lower = label.toLowerCase()
  const value = parseInt(lower, 10)
  if (lower.includes('min')) {
    return Number.isNaN(value) ? 90 : value
  }
  if (lower.includes('hour')) {
    return Number.isNaN(value) ? 180 : value * 60
  }
  if (lower.includes('day')) {
    return Number.isNaN(value) ? 1440 : value * 24 * 60
  }
  if (lower.includes('yesterday')) {
    return 24 * 60
  }
  return Number.MAX_SAFE_INTEGER
}

// 详情弹窗组件
function CommunityDetailModal({ post, isOpen, onClose, onUseTemplate, onShare }) {
  if (!isOpen || !post) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        <div className="modal-grid">
          {/* 左侧：大图/视频 */}
          <div className="modal-media-section">
            <video
              src={post.clipUrl}
              autoPlay
              loop
              controls
              playsInline
              className="modal-video"
            />
          </div>
          
          {/* 右侧：详细信息 */}
          <div className="modal-info-section">
            <div className="modal-header">
              <h2>{post.title}</h2>
              <div className="modal-author">
                <img src={post.author.avatar} alt={post.author.name} />
                <div className="author-details">
                  <strong>{post.author.name}</strong>
                  <span>{post.author.handle}</span>
                </div>
                <button className="follow-btn">Follow</button>
              </div>
            </div>
            
            <div className="modal-scroll-area">
              <p className="modal-desc">{post.description}</p>
              
              <div className="modal-prompt-box">
                <div className="prompt-header">
                  <span className="magic-icon">✨</span>
                  <span>Used Prompt</span>
                </div>
                <p className="prompt-content">{post.prompt}</p>
              </div>
              
              <div className="modal-tags">
                {post.tags.map(tag => (
                  <span key={tag} className="tag-pill small">#{tag}</span>
                ))}
              </div>
              
              <div className="modal-stats">
                <div className="stat-item">
                  <span className="stat-value">{post.metrics.likes.toLocaleString()}</span>
                  <span className="stat-label">Likes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{post.metrics.remixes.toLocaleString()}</span>
                  <span className="stat-label">Remixes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{post.metrics.views.toLocaleString()}</span>
                  <span className="stat-label">Views</span>
                </div>
              </div>

              {/* 模拟评论区 */}
              <div className="modal-comments-preview">
                <h4>Comments (3)</h4>
                <div className="comment-item">
                  <div className="comment-avatar">😎</div>
                  <div className="comment-content">
                    <strong>User_882</strong>
                    <p>This is hilarious! 😂</p>
                  </div>
                </div>
                <div className="comment-item">
                  <div className="comment-avatar">🔥</div>
                  <div className="comment-content">
                    <strong>MemeKing</strong>
                    <p>Can I use this template?</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer-actions">
              <button 
                className="remix-btn-large"
                onClick={() => onUseTemplate(post.templateId)}
              >
                ⚡ Remix this
              </button>
              <div className="secondary-actions">
                <button className="icon-action-btn" onClick={() => onShare(post)}>
                  🔗 Share
                </button>
                <button className="icon-action-btn">
                  ❤️ Like
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommunityPostCard({ post, onClick, onRemix }) {
  const handleCardClick = () => onClick(post)
  const handleRemixClick = (event) => {
    event.stopPropagation()
    onRemix(post.templateId)
  }

  return (
    <article className="community-card" onClick={handleCardClick}>
      <div className="community-media-wrapper">
        <video
          src={post.clipUrl}
          autoPlay
          loop
          muted
          playsInline
          className="card-video"
        />
        {/* 悬停遮罩 */}
        <div className="card-hover-overlay">
          <div className="overlay-content">
            <button className="overlay-remix-btn" onClick={handleRemixClick}>
              ⚡ Remix
            </button>
            <div className="overlay-stats">
              <span>❤️ {post.metrics.likes}</span>
              <span>👀 {post.metrics.views}</span>
            </div>
          </div>
        </div>
        
        <div className="card-badges-top">
          {post.isFeatured && (
            <span className="badge-featured">🌟 Featured</span>
          )}
        </div>
      </div>

      <div className="card-mini-info">
        <div className="card-title">{post.title}</div>
        <div className="card-author-row">
          <img src={post.author.avatar} alt="" />
          <span>{post.author.name}</span>
        </div>
      </div>
    </article>
  )
}

function CommunityPage({ user, onLogin }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('forYou')
  const [selectedTag, setSelectedTag] = useState('all')
  const [visibleCount, setVisibleCount] = useState(DEFAULT_BATCH)
  const [selectedPost, setSelectedPost] = useState(null) // 控制弹窗
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('trending')
  const [activityIndex, setActivityIndex] = useState(0)

  const activityMessages = useMemo(() => {
    return communityPosts.map((post, index) => ({
      id: `${post.id}-${index}`,
      text: `${post.author.name} just remixed “${post.templateName}” · +${post.metrics.remixes} remixes`,
    }))
  }, [communityPosts])

  const tags = useMemo(() => {
    const unique = new Set()
    communityPosts.forEach((post) => post.tags.forEach((tag) => unique.add(tag)))
    return ['all', ...unique]
  }, [communityPosts])

  useEffect(() => {
    if (!activityMessages.length) return
    const timer = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % activityMessages.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [activityMessages.length])

  const tabPosts = useMemo(() => {
    const base = activeTab === 'friends'
      ? communityPosts.filter((post) => post.isFriendPost)
      : communityPosts
    if (selectedTag === 'all') {
      return base
    }
    return base.filter((post) => post.tags.includes(selectedTag))
  }, [activeTab, selectedTag])

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return tabPosts
    return tabPosts.filter((post) => {
      const searchable = [
        post.title,
        post.description,
        post.author.name,
        post.author.handle,
        post.prompt,
        post.tags.join(' ')
      ]
      return searchable.some((field) => {
        if (!field) return false
        return field.toLowerCase().includes(query)
      })
    })
  }, [tabPosts, searchQuery])

  const sortedPosts = useMemo(() => {
    const posts = [...filteredPosts]
    if (sortBy === 'latest') {
      return posts.sort(
        (a, b) => getFreshnessScore(a.createdAt) - getFreshnessScore(b.createdAt)
      )
    }
    if (sortBy === 'remixes') {
      return posts.sort((a, b) => b.metrics.remixes - a.metrics.remixes)
    }
    return posts.sort((a, b) => {
      const scoreA = a.metrics.likes * 2 + a.metrics.remixes * 6 + a.metrics.views
      const scoreB = b.metrics.likes * 2 + b.metrics.remixes * 6 + b.metrics.views
      return scoreB - scoreA
    })
  }, [filteredPosts, sortBy])

  const visiblePosts = sortedPosts.slice(0, visibleCount)
  const hasMore = visibleCount < sortedPosts.length
  const showFriendsGate = activeTab === 'friends' && !user

  useEffect(() => {
    setVisibleCount(DEFAULT_BATCH)
  }, [activeTab, selectedTag, searchQuery, sortBy])

  const currentActivity = activityMessages[activityIndex]

  const handleUseTemplate = (templateId) => {
    navigate('/', { state: { fromCommunity: true, templateId } })
  }

  const handleShare = async (post) => {
    const text = `Check out ${post.author.name}'s creation "${post.title}" on FaceAI Hub`
    const url = `${window.location.origin}/community`
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text, url })
      } else {
        await navigator.clipboard.writeText(`${text} - ${url}`)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Share failed', error)
    }
  }

  // Masonry 断点设置
  const breakpointColumnsObj = {
    default: 4,
    1600: 4,
    1200: 3,
    900: 2,
    500: 1
  };

  return (
    <main className="community-page">
      <header className="community-hero">
        <div>
          <p className="section-label">Community Selected</p>
          <h1>FaceAI Hub Community</h1>
          <p>Discover global creations, remix trending memes, and join the fun.</p>
          <div className="community-socials">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.youtube.com" target="_blank" rel="noreferrer">YouTube</a>
            <a href="https://discord.com" target="_blank" rel="noreferrer">Discord</a>
          </div>
        </div>
        <div className="community-stats">
          <div className="stat-card"><strong>2.6K+</strong><span>Creators</span></div>
          <div className="stat-card"><strong>980+</strong><span>Templates</span></div>
          <div className="stat-card"><strong>32K+</strong><span>Remixes</span></div>
        </div>
      </header>

      {currentActivity && (
        <div className="community-activity-bar">
          <span className="activity-dot" />
          <span className="activity-label">Live feed</span>
          <div className="activity-marquee">
            <span key={currentActivity.id} className="activity-item">
              {currentActivity.text}
            </span>
          </div>
        </div>
      )}

      <div className="community-tab-bar">
        <div className="tab-buttons">
          <button
            className={activeTab === 'forYou' ? 'active' : ''}
            onClick={() => setActiveTab('forYou')}
          >
            For You
          </button>
          <button
            className={activeTab === 'friends' ? 'active' : ''}
            onClick={() => setActiveTab('friends')}
          >
            Friends
          </button>
        </div>
      </div>

      <div className="community-tags">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`tag-pill ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag === 'all' ? 'All' : `#${tag}`}
          </button>
        ))}
      </div>

      {showFriendsGate ? (
        <div className="community-gate">
          <h3>Sign in to see friends' activity</h3>
          <p>Connect your account to see what your friends are creating.</p>
          <button className="use-template-btn" onClick={onLogin}>
            Sign In
          </button>
        </div>
      ) : (
        <>
          <div className="community-controls">
            <div className="search-input-modern">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search creations, creators, or #tags"
              />
            </div>
            <div className="community-sort">
              <label htmlFor="community-sort">Sort</label>
              <select
                id="community-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="trending">Trending</option>
                <option value="latest">Latest</option>
                <option value="remixes">Most remixed</option>
              </select>
            </div>
          </div>

          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {visiblePosts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                onClick={setSelectedPost}
                onRemix={handleUseTemplate}
              />
            ))}
          </Masonry>

          {visiblePosts.length === 0 && (
            <div className="community-empty">
              <p>No posts found. Try a different tag.</p>
            </div>
          )}

          {hasMore && (
            <div className="community-load-more">
              <button onClick={() => setVisibleCount((prev) => prev + DEFAULT_BATCH)}>
                Load More
              </button>
            </div>
          )}
        </>
      )}

      {/* 详情弹窗 */}
      <CommunityDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onUseTemplate={handleUseTemplate}
        onShare={handleShare}
      />
    </main>
  )
}

export default CommunityPage