import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import LazyVideoCard from '../components/LazyVideoCard'
import { toast } from 'react-toastify'

function TemplateDetailPage() {
  const { categorySlug, templateSlug } = useParams()
  const [template, setTemplate] = useState(null)
  const [relatedTemplates, setRelatedTemplates] = useState([]) // 新增：相关模板
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch('/templates.json')
        const data = await response.json()
        
        const generateSlug = (fileName) => {
          return fileName
            .replace(/\.mp4$/, '')
            .replace(/\s+/g, '-')
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
        }

        // 分类映射
        const categoryMap = {
          'emotional-reactions': 'Emotional Reactions',
          'magic-effects': 'Magic Effects',
          'slapstick-comedy': 'Slapstick Comedy',
          'sci-fi-effects': 'Sci-Fi Effects',
          'style-makeovers': 'Style Makeovers',
          'burlesque-dance': 'Burlesque Dance',
          'duo-interaction': 'Duo Interaction'
        }

        const found = data.find(t => {
          const slug = generateSlug(t.fileName || t.name)
          const categoryMatch = categoryMap[categorySlug] === t.category
          return slug === templateSlug && categoryMatch
        })

        if (found) {
          setTemplate(found)
          
          // 查找相关模板 (同分类下，排除自己，取前6个)
          const related = data
            .filter(t => t.category === found.category && t.id !== found.id)
            .slice(0, 6)
          setRelatedTemplates(related)
        } else {
          console.error('Template not found')
        }
        setLoading(false)
      } catch (error) {
        console.error('Error loading template:', error)
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [categorySlug, templateSlug])

  const seoConfig = useMemo(() => {
    if (!template) return null
    const categoryName = template.category
    const templateName = template.name
    return {
      title: `${templateName} Face Swap Video Template - Create Free AI Meme | FaceAI Hub`,
      description: `Create ${templateName} face swap video online for free. ${categoryName} template. Upload your photo and generate funny AI meme video instantly. No watermark.`,
      keywords: `${templateName} face swap, ${categoryName} face swap, free face swap video, AI meme generator, face replacement template`,
      ogImage: template.gifUrl
    }
  }, [template])

  const structuredData = useMemo(() => {
    if (!template) return null
    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": template.name,
      "description": `Create ${template.name} face swap video instantly with AI.`,
      "thumbnailUrl": template.gifUrl,
      "uploadDate": new Date().toISOString(),
      "contentUrl": template.gifUrl,
      "duration": template.duration ? `PT${Math.floor(template.duration)}S` : "PT5S",
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": { "@type": "WatchAction" },
        "userInteractionCount": 1234
      }
    }
  }, [template])

  const handleUseTemplate = () => {
    if (template) {
      navigate('/', { state: { selectedTemplateId: template.id } })
    }
  }

  if (loading) {
    return <div className="loading-state"><div className="loading-spinner"></div></div>
  }

  if (!template) {
    return (
      <div className="not-found">
        <h2>Template Not Found</h2>
        <Link to="/" className="back-button">Browse All Templates</Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{seoConfig.title}</title>
        <meta name="description" content={seoConfig.description} />
        <meta name="keywords" content={seoConfig.keywords} />
        <link rel="canonical" href={`https://faceaihub.com/templates/${categorySlug}/${templateSlug}`} />
        <meta property="og:title" content={seoConfig.title} />
        <meta property="og:description" content={seoConfig.description} />
        <meta property="og:image" content={seoConfig.ogImage} />
        <meta property="og:type" content="video.other" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="template-detail-page">
        <nav className="breadcrumb-nav">
          <Link to="/">Home</Link>
          <span> / </span>
          <Link to={`/templates/${categorySlug}`}>{template.category}</Link>
          <span> / </span>
          <span className="current">{template.name}</span>
        </nav>

        <div className="detail-container">
          <div className="detail-preview">
            <div className="video-wrapper">
              <video 
                src={template.gifUrl} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="detail-video"
              />
            </div>
            <div className="template-stats">
              <span>⏱️ {template.duration}s</span>
              <span>🔥 Popular</span>
              <span>✨ AI Face Swap</span>
            </div>
          </div>

          <div className="detail-info">
            <h1>{template.name} Face Swap Template</h1>
            <p className="detail-description">
              Make your own <strong>{template.name}</strong> video in seconds! 
              This {template.category} template is perfect for creating hilarious memes 
              to share on TikTok, Instagram, or with friends. 
              Upload your photo now and let our AI do the magic.
            </p>

            <div className="features-list">
              <ul>
                <li>✅ Instant Generation</li>
                <li>✅ No Watermark (Free)</li>
                <li>✅ High Quality Result</li>
              </ul>
            </div>

            <div className="action-area">
              <button onClick={handleUseTemplate} className="cta-button-large">
                🚀 Create This Video Now
              </button>
              <p className="small-note">No sign up required for first trial</p>
            </div>
          </div>
        </div>

        {/* 相关推荐区域 */}
        <div className="related-templates-section">
          <h3>More {template.category} Templates</h3>
          <div className="related-grid">
            {relatedTemplates.map(related => (
              <LazyVideoCard
                key={related.id}
                template={related}
                isSelected={false}
                onSelect={() => {}} // 空函数，因为我们通过showLink处理点击
                isFavorited={false}
                showLink={true} // 重要：这里启用链接模式
              />
            ))}
          </div>
          <div className="view-all-container">
             <Link to={`/templates/${categorySlug}`} className="view-all-link">View All {template.category} Templates →</Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default TemplateDetailPage