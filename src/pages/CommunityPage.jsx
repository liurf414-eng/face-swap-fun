import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Masonry from 'react-masonry-css'
import { communityPosts as staticPosts, communityRemixMeta } from '../data/communityPosts'
import RemixDrawer from '../components/RemixDrawer'
import CommentComposer from '../components/comments/CommentComposer'
import CommentList from '../components/comments/CommentList'
import LiveFeed from '../components/community/LiveFeed'

const DEFAULT_BATCH = 8 // 增加每批加载数量

const HERO_STEPS = [
  { title: 'Upload face', description: 'Drop selfies or generate in AI Studio' },
  { title: 'Pick action', description: 'Choose trending template or write prompt' },
  { title: 'Share remix', description: 'Post to community & download instantly' },
]

const buildInitialComments = () => {
  const result = {}
  Object.entries(communityRemixMeta).forEach(([postId, meta]) => {
    result[postId] = meta.commentThreads?.map(thread => ({
      id: thread.id,
      type: thread.type,
      mediaUrl: thread.mediaUrl,
      templateId: thread.templateId,
      templateName: thread.templateName,
      prompt: thread.prompt,
      createdAt: thread.createdAt,
      status: thread.status,
      author: thread.author,
      text: thread.text,
    })) || []
  })
  return result
}

const getFreshnessScore = (label) => {
  if (!label) return Number.MAX_SAFE_INTEGER
  if (label === 'Just now') return 0 // Newest
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
function CommunityDetailPanel({
  post,
  isOpen,
  onClose,
  onShare,
  onLike,
  isLiked,
  extraViews = 0,
  extraShares = 0,
  onCreateFromCommunity,
  comments = [],
  onAddComment,
  onOpenRemix,
}) {
  if (!post) return null
  const postMeta = communityRemixMeta[post.id] || {}
  const templateGroups = postMeta.availableActions || []
  const [activeGroupId, setActiveGroupId] = useState(templateGroups[0]?.groupId || null)
  const activeGroup = templateGroups.find(group => group.groupId === activeGroupId) || templateGroups[0] || null

  const displayLikes = post.metrics.likes + (isLiked ? 1 : 0)
  const displayViews = post.metrics.views + extraViews
  const displayShares = post.metrics.remixes + extraShares

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(post.prompt)
      toast.success('Prompt copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy prompt', error)
      toast.error('Failed to copy prompt. Please try again.')
    }
  }

  return (
    <>
      <aside className={`community-detail-panel ${isOpen ? 'open' : ''}`}>
        <button className="panel-close" onClick={onClose}>Close</button>
        <div className="detail-scroll">
          <div className="detail-media">
            <video
              src={post.clipUrl}
              autoPlay
              loop
              controls
              playsInline
            />
          </div>
          <div className="detail-header">
            <div>
              <p className="label">Now remixing</p>
              <h2>{post.title}</h2>
            </div>
            <button className="follow-btn">Follow</button>
          </div>
          <div className="detail-author">
            <img src={post.author.avatar} alt={post.author.name} />
            <div>
              <strong>{post.author.name}</strong>
              <span>{post.author.handle}</span>
            </div>
            {post.supportsPlusOne && <span className="pill">Plus One</span>}
          </div>
          <div className="detail-stats-row">
            <div>
              <span className="stat-value">{displayLikes.toLocaleString()}</span>
              <span className="stat-label">Likes</span>
            </div>
            <div>
              <span className="stat-value">{displayShares.toLocaleString()}</span>
              <span className="stat-label">Remixes</span>
            </div>
            <div>
              <span className="stat-value">{displayViews.toLocaleString()}</span>
              <span className="stat-label">Views</span>
            </div>
          </div>

          <div className="remix-steps-inline">
            <div className="step-card">
              <span>01</span>
              <p>Upload face or use AI Studio</p>
            </div>
            <div className="step-card">
              <span>02</span>
              <p>Select template or prompt</p>
            </div>
            <div className="step-card">
              <span>03</span>
              <p>Share back to community</p>
            </div>
          </div>

          <div className="detail-info-grid">
            <div>
              <p className="label">Template</p>
              <p>{post.templateName}</p>
            </div>
            <div>
              <p className="label">Soundtrack</p>
              <p>{post.soundtrack}</p>
            </div>
            <div>
              <p className="label">Prompt</p>
              <button className="text-link" onClick={handleCopyPrompt}>Copy</button>
            </div>
          </div>
          <p className="detail-description">{post.description}</p>
          <div className="detail-tags">
            {post.tags.map(tag => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>

          <div className="detail-actions">
            <button className="remix-btn-large" onClick={() => onOpenRemix?.(post)}>
              Remix this
            </button>
            <button className="ghost-btn" onClick={() => onShare(post)}>Share</button>
            <button
              className={`ghost-btn ${isLiked ? 'active-like' : ''}`}
              onClick={onLike}
            >
              {isLiked ? 'Liked' : 'Like'}
            </button>
          </div>

          {onCreateFromCommunity && (
            <button className="create-btn-large" onClick={() => onCreateFromCommunity(post)}>
              Create from this
            </button>
          )}

          <div className="modal-comments-section">
            <div className="comment-header-row">
              <h4>Remix actions</h4>
              <div className="action-tabs">
                {templateGroups.map(group => (
                  <button
                    key={group.groupId}
                    type="button"
                    className={`icon-tab ${activeGroupId === group.groupId ? 'active' : ''}`}
                    onClick={() => setActiveGroupId(group.groupId)}
                    title={group.label}
                  >
                    <span className="icon">{group.icon || '🎬'}</span>
                    <span className="tab-label">{group.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {activeGroup && (
              <div className="action-list">
                {activeGroup.templates?.map(action => (
                  <button
                    key={action.id}
                    className="action-pill"
                    onClick={() => onOpenRemix?.(post, {
                      templateId: action.id,
                      prompt: action.prompt,
                      author: action.author,
                    })}
                  >
                    <span className="action-icon">{activeGroup.icon || '🎬'}</span>
                    <div className="action-text">
                      <strong>{action.label}</strong>
                      {action.prompt && <span>{action.prompt}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <h4>Remix comments</h4>
            <CommentList
              comments={comments}
              onRemix={(comment) => onOpenRemix?.(post, comment)}
            />
          </div>
        </div>
      </aside>
      {isOpen && <div className="detail-panel-mask" onClick={onClose} />}
    </>
  )
}

function CommunityPostCard({ post, onClick, onLike, isLiked, extraViews = 0, extraShares = 0, isNew = false, onCreateFromCommunity }) {
  const handleCardClick = () => onClick(post)
  const handleLikeClick = (event) => {
    event.stopPropagation()
    onLike && onLike()
  }

  const displayLikes = post.metrics.likes + (isLiked ? 1 : 0)
  const displayViews = post.metrics.views + extraViews

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
        {onCreateFromCommunity && (
          <div className="card-hover-overlay">
            <div className="overlay-content">
              <button 
                className="overlay-create-btn" 
                onClick={(event) => {
                  event.stopPropagation()
                  onCreateFromCommunity(post)
                }}
              >
                🎨 Create
              </button>
              <div className="overlay-stats">
                <span onClick={handleLikeClick} style={{ cursor: 'pointer' }}>
                  {isLiked ? '❤️' : '🤍'} {displayLikes}
                </span>
                <span>👀 {displayViews}</span>
              </div>
              {post.supportsPlusOne && (
                <span className="overlay-pill">Plus One ready</span>
              )}
            </div>
          </div>
        )}
        
        <div className="card-badges-top">
          {isNew && (
            <span className="badge-new">✨ New</span>
          )}
          {post.isFeatured && (
            <span className="badge-featured">🌟 Featured</span>
          )}
          {post.supportsPlusOne && (
            <span className="badge-plusone">Plus One</span>
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
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('trending')
  const [allPosts, setAllPosts] = useState(staticPosts)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [viewCounts, setViewCounts] = useState({})
  const [shareCounts, setShareCounts] = useState({})
  const [lastCheckTime, setLastCheckTime] = useState(Date.now())
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [commentsByPost, setCommentsByPost] = useState(buildInitialComments)
  const [activeRemixPostId, setActiveRemixPostId] = useState(null)
  const [remixSeed, setRemixSeed] = useState(null)

  const selectedPost = useMemo(() => {
    if (!selectedPostId) return null
    return allPosts.find((post) => post.id === selectedPostId) || null
  }, [selectedPostId, allPosts])

  const activeRemixPost = useMemo(() => {
    if (!activeRemixPostId) return null
    return allPosts.find(post => post.id === activeRemixPostId) || null
  }, [activeRemixPostId, allPosts])

  // Load local posts and interactions
  useEffect(() => {
    const loadData = () => {
      // Posts
      const savedPosts = localStorage.getItem('community_posts')
      if (savedPosts) {
        try {
          const parsed = JSON.parse(savedPosts)
          if (Array.isArray(parsed)) {
            setAllPosts([...parsed, ...staticPosts])
          }
        } catch (e) {
          console.error('Failed to parse local community posts', e)
        }
      }

      // Likes
      const savedLikes = localStorage.getItem('user_likes')
      if (savedLikes) {
        try {
          setLikedPosts(new Set(JSON.parse(savedLikes)))
        } catch (e) {
          console.error('Failed to parse likes', e)
        }
      }

      // Views
      const savedViews = localStorage.getItem('post_views')
      if (savedViews) {
        try {
          setViewCounts(JSON.parse(savedViews))
        } catch (e) {
          console.error('Failed to parse views', e)
        }
      }

      // Shares
      const savedShares = localStorage.getItem('post_shares')
      if (savedShares) {
        try {
          setShareCounts(JSON.parse(savedShares))
        } catch (e) {
          console.error('Failed to parse shares', e)
        }
      }
    }

    loadData()

    // Check for new posts every 5 seconds
    const interval = setInterval(() => {
      const savedPosts = localStorage.getItem('community_posts')
      if (savedPosts) {
        try {
          const parsed = JSON.parse(savedPosts)
          if (Array.isArray(parsed)) {
            const newPosts = [...parsed, ...staticPosts]
            setAllPosts(prev => {
              // Only update if there are actually new posts
              if (newPosts.length !== prev.length) {
                return newPosts
              }
              return prev
            })
          }
        } catch (e) {
          // Silent fail
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleToggleLike = (postId) => {
    setLikedPosts(prev => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      localStorage.setItem('user_likes', JSON.stringify([...next]))
      return next
    })
  }

  const handleViewPost = (post) => {
    setSelectedPostId(post.id)
    setViewCounts(prev => {
      const next = { ...prev, [post.id]: (prev[post.id] || 0) + 1 }
      localStorage.setItem('post_views', JSON.stringify(next))
      return next
    })
  }

  const handleAddComment = useCallback((postId, comment) => {
    if (!postId) return
    setCommentsByPost(prev => {
      const existing = prev[postId] || []
      return {
        ...prev,
        [postId]: [comment, ...existing],
      }
    })
  }, [])

  const liveFeedEvents = useMemo(() => {
    const events = []
    allPosts.forEach((post) => {
      const meta = communityRemixMeta[post.id]
      if (!meta) return
      const chains = meta.remixChains || []
      chains.forEach((chain) => {
        events.push({
          id: chain.id,
          templateName: chain.templateName,
          previewUrl: chain.previewUrl || post.clipUrl,
          author: chain.author?.name || post.author.name,
          prompt: chain.prompt,
          timeAgo: chain.createdAt,
          templateId: chain.templateId,
          post,
        })
      })
    })
    return events.slice(0, 8)
  }, [allPosts])

  const tags = useMemo(() => {
    const unique = new Set()
    allPosts.forEach((post) => post.tags.forEach((tag) => unique.add(tag)))
    return ['all', ...unique]
  }, [allPosts])

  const tabPosts = useMemo(() => {
    const base = activeTab === 'friends'
      ? allPosts.filter((post) => post.isFriendPost)
      : allPosts
    if (selectedTag === 'all') {
      return base
    }
    return base.filter((post) => post.tags.includes(selectedTag))
  }, [activeTab, selectedTag, allPosts])

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
    // Trending: boost new posts (createdAt === 'Just now' gets extra boost)
    return posts.sort((a, b) => {
      const freshnessA = a.createdAt === 'Just now' ? 1000 : getFreshnessScore(a.createdAt)
      const freshnessB = b.createdAt === 'Just now' ? 1000 : getFreshnessScore(b.createdAt)
      const freshnessBoostA = freshnessA < 60 ? 50 : 0 // Boost posts less than 1 hour old
      const freshnessBoostB = freshnessB < 60 ? 50 : 0
      
      const scoreA = (a.metrics.likes * 2 + a.metrics.remixes * 6 + a.metrics.views) + freshnessBoostA
      const scoreB = (b.metrics.likes * 2 + b.metrics.remixes * 6 + b.metrics.views) + freshnessBoostB
      return scoreB - scoreA
    })
  }, [filteredPosts, sortBy])

  const visiblePosts = sortedPosts.slice(0, visibleCount)
  const hasMore = visibleCount < sortedPosts.length
  const showFriendsGate = activeTab === 'friends' && !user

  useEffect(() => {
    setVisibleCount(DEFAULT_BATCH)
  }, [activeTab, selectedTag, searchQuery, sortBy])

  const handleCreateFromCommunity = (post) => {
    // Determine if post is image or video
    const isVideo = post.clipUrl.includes('.mp4') || 
                    post.clipUrl.includes('.webm') || 
                    post.clipUrl.includes('.mov') ||
                    post.clipUrl.includes('video')
    
    navigate('/create-from-community', {
      state: {
        sourceContent: {
          type: isVideo ? 'video' : 'image',
          url: post.clipUrl
        },
        sourcePost: post
      }
    })
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
      // Track share
      setShareCounts(prev => {
        const next = { ...prev, [post.id]: (prev[post.id] || 0) + 1 }
        localStorage.setItem('post_shares', JSON.stringify(next))
        return next
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed', error)
      }
    }
  }

  const openRemixDrawer = (post, seed = null) => {
    setActiveRemixPostId(post.id)
    setRemixSeed(seed)
  }

  const closeRemixDrawer = () => {
    setActiveRemixPostId(null)
    setRemixSeed(null)
  }

  const handleRemixFinished = (remix) => {
    if (!remix?.postId) return
    handleAddComment(remix.postId, {
      ...remix,
      type: 'video',
    })
    closeRemixDrawer()
  }

  // Masonry 断点设置
  const breakpointColumnsObj = {
    default: 4,
    1600: 4,
    1200: 3,
    900: 2,
    500: 1
  };
  const primaryPost = visiblePosts[0] || sortedPosts[0] || allPosts[0] || null

  return (
    <main className="community-page">
      <header className="community-hero">
        <div className="hero-left">
          <p className="section-label">Live Remix Studio</p>
          <h1>Twist any video with one face</h1>
          <p>Upload or auto-generate faces, drop them into trending templates, and post remixes in seconds.</p>
          <div className="hero-actions">
            <button
              className="primary-btn"
              onClick={() => primaryPost && openRemixDrawer(primaryPost)}
              disabled={!primaryPost}
            >
              Start remixing
            </button>
            <button
              className="ghost-btn"
              onClick={() => navigate('/ai-studio/text-to-image')}
            >
              Launch AI Studio
            </button>
          </div>
        </div>
        <div className="hero-steps-grid">
          {HERO_STEPS.map((step, index) => (
            <div className="hero-step-card" key={step.title}>
              <span>{index + 1}</span>
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="community-layout">
        <section className="community-feed">
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
            <div className="tab-secondary">
              <div className="search-input-modern">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search creators or #tags"
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
          </div>

          <div className="community-tags">
            {tags.map((tag) => (
              <button
                key={tag}
                className={`tag-pill ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag === 'all' ? 'All topics' : `#${tag}`}
              </button>
            ))}
          </div>

          {showFriendsGate ? (
            <div className="community-gate">
              <h3>Sign in to see friends' activity</h3>
              <p>Connect your account to see what your friends are remixing.</p>
              <button className="primary-btn" onClick={onLogin}>
                Sign In
              </button>
            </div>
          ) : (
            <>
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
              >
                {visiblePosts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    onClick={handleViewPost}
                    onLike={() => handleToggleLike(post.id)}
                    isLiked={likedPosts.has(post.id)}
                    extraViews={viewCounts[post.id] || 0}
                    extraShares={shareCounts[post.id] || 0}
                    isNew={post.createdAt === 'Just now'}
                    onCreateFromCommunity={handleCreateFromCommunity}
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
        </section>

        <LiveFeed
          events={liveFeedEvents}
          onRemix={(event) => openRemixDrawer(event.post, {
            templateId: event.templateId,
            prompt: event.prompt,
          })}
        />
      </div>

      <CommunityDetailPanel
        post={selectedPost}
        isOpen={Boolean(selectedPost)}
        onClose={() => setSelectedPostId(null)}
        onShare={handleShare}
        onLike={() => selectedPost && handleToggleLike(selectedPost.id)}
        isLiked={selectedPost ? likedPosts.has(selectedPost.id) : false}
        extraViews={selectedPost ? viewCounts[selectedPost.id] || 0 : 0}
        extraShares={selectedPost ? shareCounts[selectedPost.id] || 0 : 0}
        onCreateFromCommunity={handleCreateFromCommunity}
        comments={selectedPost ? commentsByPost[selectedPost.id] || [] : []}
        onAddComment={handleAddComment}
        onOpenRemix={openRemixDrawer}
      />
      <RemixDrawer
        post={activeRemixPost}
        open={Boolean(activeRemixPost)}
        onClose={closeRemixDrawer}
        onFinish={handleRemixFinished}
        seed={remixSeed}
      />
    </main>
  )
}

export default CommunityPage
