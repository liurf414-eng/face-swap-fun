import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { communityPosts } from '../data/communityPosts'

const DEFAULT_BATCH = 6

function CommunityPostCard({ post, onUseTemplate, onShare }) {
  return (
    <article className="community-card">
      <div className="community-media">
        <video
          src={post.clipUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
        <div className="community-media-top">
          {post.isFeatured && (
            <span className="pill pill-featured">Community Selected</span>
          )}
          <span className="pill">{post.templateName}</span>
        </div>
        <div className="community-media-bottom">
          <span className="pill pill-dark">{post.soundtrack}</span>
        </div>
      </div>

      <div className="community-body">
        <div className="community-title-row">
          <div>
            <h3>{post.title}</h3>
            <p className="community-desc">{post.description}</p>
          </div>
          <span className="post-time">{post.createdAt}</span>
        </div>

        <div className="community-author">
          <div className="author-info">
            <img src={post.author.avatar} alt={post.author.name} />
            <div>
              <strong>{post.author.name}</strong>
              <span>{post.author.handle}</span>
            </div>
          </div>
          <div className="prompt-chip">
            <span className="chip-label">Prompt</span>
            <span className="chip-text">{post.prompt}</span>
          </div>
        </div>

        <div className="community-tags-row">
          {post.tags.map((tag) => (
            <span key={tag} className="tag-pill small">{`#${tag}`}</span>
          ))}
        </div>

        <div className="community-metrics">
          <span>❤️ {post.metrics.likes.toLocaleString()}</span>
          <span>🔁 {post.metrics.remixes.toLocaleString()}</span>
          <span>👀 {post.metrics.views.toLocaleString()}</span>
        </div>

        <div className="community-actions">
          <button
            className="use-template-btn"
            onClick={() => onUseTemplate(post.templateId)}
          >
            使用此模板
          </button>
          <button
            className="ghost-btn"
            onClick={() => onShare(post)}
          >
            分享
          </button>
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

  const tags = useMemo(() => {
    const unique = new Set()
    communityPosts.forEach((post) => post.tags.forEach((tag) => unique.add(tag)))
    return ['all', ...unique]
  }, [])

  const tabPosts = useMemo(() => {
    const base = activeTab === 'friends'
      ? communityPosts.filter((post) => post.isFriendPost)
      : communityPosts
    if (selectedTag === 'all') {
      return base
    }
    return base.filter((post) => post.tags.includes(selectedTag))
  }, [activeTab, selectedTag])

  const visiblePosts = tabPosts.slice(0, visibleCount)
  const hasMore = visibleCount < tabPosts.length
  const showFriendsGate = activeTab === 'friends' && !user

  useEffect(() => {
    setVisibleCount(DEFAULT_BATCH)
  }, [activeTab, selectedTag])

  const handleUseTemplate = (templateId) => {
    navigate('/', { state: { fromCommunity: true, templateId } })
  }

  const handleShare = async (post) => {
    const text = `快看 ${post.author.name} 在 FaceAI Hub 里的创作《${post.title}》`
    const url = `${window.location.origin}/community`
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text,
          url
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text} - ${url}`)
        toast.success('链接已复制')
      } else {
        toast.info('当前浏览器不支持分享，请手动复制链接')
      }
    } catch (error) {
      console.error('分享失败', error)
      toast.error('分享失败，请稍后重试')
    }
  }

  const communityStats = [
    { label: '创作者', value: '2.6K+' },
    { label: '社区模板', value: '980+' },
    { label: '近7日二创', value: '32K+' }
  ]

  return (
    <main className="community-page">
      <header className="community-hero">
        <div>
          <p className="section-label">Community Selected</p>
          <h1>FaceAI Hub 社区</h1>
          <p>查看全球创作者的最新换脸作品，随手复刻或加入挑战，灵感永不停机。</p>
          <div className="community-socials">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.youtube.com" target="_blank" rel="noreferrer">YouTube</a>
            <a href="https://discord.com" target="_blank" rel="noreferrer">Discord</a>
          </div>
        </div>
        <div className="community-stats">
          {communityStats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </header>

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
        <div className="tab-status">
          {activeTab === 'friends' ? '好友实时动态' : '社区精选内容'}
        </div>
      </div>

      <div className="community-tags">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`tag-pill ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag === 'all' ? '全部' : `#${tag}`}
          </button>
        ))}
      </div>

      {showFriendsGate ? (
        <div className="community-gate">
          <h3>登录即可查看好友流</h3>
          <p>连接 Google 账号即可同步点赞、收藏与合拍记录。</p>
          <button className="use-template-btn" onClick={onLogin}>
            立即登录
          </button>
        </div>
      ) : (
        <>
          <div className="community-grid">
            {visiblePosts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                onUseTemplate={handleUseTemplate}
                onShare={handleShare}
              />
            ))}
          </div>

          {visiblePosts.length === 0 && (
            <div className="community-empty">
              <p>暂无匹配的作品，换个标签看看？</p>
            </div>
          )}

          {hasMore && (
            <div className="community-load-more">
              <button onClick={() => setVisibleCount((prev) => prev + DEFAULT_BATCH)}>
                加载更多
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}

export default CommunityPage

