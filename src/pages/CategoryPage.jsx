import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import LazyVideoCard from '../components/LazyVideoCard'

// 分类SEO配置 - 基于用户搜索意图优化
const CATEGORY_SEO_CONFIG = {
  'emotional-reactions': {
    title: 'Emotional Reactions Face Swap Video - Surprised, Laughing Memes | FaceAI Hub',
    description: 'Create hilarious emotional reactions face swap videos! Surprised, laughing, crying, shocked reaction memes. 9 free templates. Upload photo and generate instantly!',
    keywords: 'emotional reactions face swap, emotional face swap video, surprised face swap meme, laughing face swap video, crying face swap template, reaction meme generator',
    h1: 'Emotional Reactions Face Swap Videos',
    categoryName: 'Emotional Reactions',
    useCases: 'Perfect for reaction memes, TikTok reactions, Instagram story reactions, and funny response videos.',
    templatesCount: 9
  },
  'magic-effects': {
    title: 'Magic Effects Face Swap Video - Fantasy Transformation | FaceAI Hub',
    description: 'Create magical effects face swap videos with fantasy elements! Electric, fire, flying, transformation templates. 6 free magic effect templates. AI-powered face swap!',
    keywords: 'magic effects face swap, magic face swap video, fantasy face swap template, supernatural face swap, magical transformation face swap, electric face swap',
    h1: 'Magic Effects Face Swap Videos',
    categoryName: 'Magic Effects',
    useCases: 'Perfect for fantasy content, magical transformations, supernatural effects, and creative video edits.',
    templatesCount: 6
  },
  'slapstick-comedy': {
    title: 'Slapstick Comedy Face Swap Video - Hilarious Meme Templates | FaceAI Hub',
    description: 'Generate hilarious slapstick comedy face swap videos! Funny, goofy, silly meme templates. 6 free slapstick comedy templates. Create viral comedy content!',
    keywords: 'slapstick comedy face swap, funny comedy face swap, hilarious face swap video, comedy meme generator, goofy face swap, silly face swap meme',
    h1: 'Slapstick Comedy Face Swap Videos',
    categoryName: 'Slapstick Comedy',
    useCases: 'Perfect for comedy content, funny memes, prank videos, and hilarious social media posts.',
    templatesCount: 6
  },
  'sci-fi-effects': {
    title: 'Sci-Fi Effects Face Swap Video - Futuristic & Cyberpunk Templates | FaceAI Hub',
    description: 'Create futuristic sci-fi effects face swap videos! Cyberpunk, space, futuristic transformation templates. 6 free sci-fi effect templates. Future-tech face swap!',
    keywords: 'sci-fi effects face swap, futuristic face swap template, cyberpunk face swap, sci-fi transformation video, future face swap, space face swap',
    h1: 'Sci-Fi Effects Face Swap Videos',
    categoryName: 'Sci-Fi Effects',
    useCases: 'Perfect for sci-fi content, cyberpunk aesthetics, futuristic transformations, and tech-themed videos.',
    templatesCount: 6
  },
  'style-makeovers': {
    title: 'Style Makeovers Face Swap Video - Fashion Transformation | FaceAI Hub',
    description: 'Transform your style with style makeovers face swap videos! Fashion, outfit change, transformation templates. 6 free style makeover templates. Create style memes!',
    keywords: 'style makeovers face swap, fashion face swap video, makeover meme generator, style transformation video, outfit change face swap, fashion transformation',
    h1: 'Style Makeovers Face Swap Videos',
    categoryName: 'Style Makeovers',
    useCases: 'Perfect for fashion content, style transformations, outfit changes, and makeover videos.',
    templatesCount: 6
  },
  'burlesque-dance': {
    title: 'Burlesque Dance Face Swap Video - TikTok Dance Memes | FaceAI Hub',
    description: 'Create fun burlesque dance face swap videos! TikTok dance, hip hop, trending dance templates. 6 free dance templates. Perfect for TikTok and Instagram Reels!',
    keywords: 'burlesque dance face swap, dance face swap video, TikTok dance face swap, dancing meme generator, dance face swap template, trending dance meme',
    h1: 'Burlesque Dance Face Swap Videos',
    categoryName: 'Burlesque Dance',
    useCases: 'Perfect for TikTok videos, Instagram Reels, dance challenges, and trending dance memes.',
    templatesCount: 6
  },
  'duo-interaction': {
    title: 'Duo Interaction Face Swap Video - Couple & Friend Memes | FaceAI Hub',
    description: 'Create amazing duo interaction face swap videos! Two-person, couple, friend pair face swap templates. 6 free duo interaction templates. Perfect for couple memes!',
    keywords: 'duo interaction face swap, couple face swap video, two-person face swap AI, friend meme face generator, pair face replacement video, duo face swap',
    h1: 'Duo Interaction Face Swap Videos',
    categoryName: 'Duo Interaction',
    useCases: 'Perfect for couple content, friend memes, relationship videos, and two-person interactions.',
    templatesCount: 6
  }
}

function CategoryPage() {
  const { categorySlug } = useParams()
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  const seoConfig = CATEGORY_SEO_CONFIG[categorySlug] || {
    title: 'Face Swap Templates - FaceAI Hub',
    description: 'Browse our collection of face swap video templates',
    keywords: 'face swap templates',
    h1: 'Face Swap Templates',
    categoryName: 'Templates'
  }

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/templates.json')
        const data = await response.json()
        
        // 过滤当前分类的模板
        const categoryMap = {
          'emotional-reactions': 'Emotional Reactions',
          'magic-effects': 'Magic Effects',
          'slapstick-comedy': 'Slapstick Comedy',
          'sci-fi-effects': 'Sci-Fi Effects',
          'style-makeovers': 'Style Makeovers',
          'burlesque-dance': 'Burlesque Dance',
          'duo-interaction': 'Duo Interaction'
        }
        
        const categoryName = categoryMap[categorySlug] || categorySlug
        const filtered = data.filter(t => t.category === categoryName)
        setTemplates(filtered)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load templates:', error)
        setIsLoading(false)
      }
    }
    
    loadTemplates()
  }, [categorySlug])

  // 结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": seoConfig.h1,
    "description": seoConfig.description,
    "url": `https://faceaihub.com/templates/${categorySlug}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": templates.length,
      "itemListElement": templates.map((template, index) => ({
        "@type": "VideoObject",
        "position": index + 1,
        "name": template.name,
        "description": `${template.name} face swap template`,
        "contentUrl": template.gifUrl,
        "thumbnailUrl": template.gifUrl
      }))
    }
  }

  // 面包屑结构化数据
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://faceaihub.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": seoConfig.categoryName,
        "item": `https://faceaihub.com/templates/${categorySlug}`
      }
    ]
  }

  return (
    <>
      <Helmet>
        <title>{seoConfig.title}</title>
        <meta name="description" content={seoConfig.description} />
        <meta name="keywords" content={seoConfig.keywords} />
        <link rel="canonical" href={`https://faceaihub.com/templates/${categorySlug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoConfig.h1} />
        <meta property="og:description" content={seoConfig.description} />
        <meta property="og:url" content={`https://faceaihub.com/templates/${categorySlug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://faceaihub.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoConfig.h1} />
        <meta name="twitter:description" content={seoConfig.description} />
        <meta name="twitter:image" content="https://faceaihub.com/og-image.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      </Helmet>

      <div className="category-page">
        <div className="category-header">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span> / </span>
            <span aria-current="page">{seoConfig.categoryName}</span>
          </nav>
          
          <h1>{seoConfig.h1}</h1>
          <p className="category-description">
            {seoConfig.description}
          </p>
        </div>

        {/* 内容区域 */}
        <div className="category-content">
          <section className="intro-section">
            <h2>About {seoConfig.categoryName} Face Swap</h2>
            <p>
              {seoConfig.categoryName} face swap videos are perfect for creating engaging and entertaining content. 
              Our AI-powered face swap technology allows you to seamlessly replace faces in video templates, 
              creating hilarious and shareable memes in seconds.
            </p>
            {seoConfig.useCases && (
              <p className="use-cases">
                <strong>Perfect for:</strong> {seoConfig.useCases}
              </p>
            )}
            <p>
              All {seoConfig.templatesCount || templates.length} templates are free to use and require no signup. Simply choose a template, upload your photo, 
              and generate your face swap video instantly.
            </p>
          </section>

          {isLoading ? (
            <div className="loading-state">
              <p>Loading templates...</p>
            </div>
          ) : (
            <>
              <section className="templates-section">
                <h2>Available Templates ({templates.length})</h2>
                <div className="templates-grid">
                  {templates.map(template => {
                    // 生成模板详情页URL
                    const generateSlug = (fileName) => {
                      return fileName
                        .replace(/\.mp4$/, '')
                        .replace(/\s+/g, '-')
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, '')
                    }
                    const templateSlug = generateSlug(template.fileName || template.name)
                    
                    return (
                      <LazyVideoCard
                        key={template.id}
                        template={template}
                        isSelected={false}
                        onSelect={() => {}}
                        isFavorited={false}
                        onToggleFavorite={() => {}}
                        showLink={true}
                      />
                    )
                  })}
                </div>
              </section>

              {templates.length === 0 && (
                <div className="no-templates">
                  <p>No templates found in this category.</p>
                  <Link to="/" className="back-button">Back to Home</Link>
                </div>
              )}
            </>
          )}

          <section className="how-to-section">
            <h2>How to Create {seoConfig.categoryName} Face Swap Videos</h2>
            <ol>
              <li>Browse the templates above and select one you like</li>
              <li>Upload your photo (or two photos for duo templates)</li>
              <li>Click "Create Video" and wait for processing</li>
              <li>Download your face swap video and share it!</li>
            </ol>
            <Link to="/how-to-create-face-swap-video" className="learn-more-link">
              Learn more in our detailed tutorial →
            </Link>
          </section>

          <section className="related-categories">
            <h2>Related Categories</h2>
            <div className="category-links">
              {Object.entries(CATEGORY_SEO_CONFIG)
                .filter(([slug]) => slug !== categorySlug)
                .slice(0, 3)
                .map(([slug, config]) => (
                  <Link 
                    key={slug} 
                    to={`/templates/${slug}`}
                    className="category-link"
                  >
                    {config.categoryName}
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default CategoryPage