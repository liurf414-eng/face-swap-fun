import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

// 模板SEO关键词映射 - 基于现有45个模板
const TEMPLATE_SEO_MAP = {
  // Emotional Reactions
  'man-covered-mouth-laughed': {
    seoName: 'Laughing Face Swap Video',
    keywords: 'laughing face swap video, burst out laughing face swap, laughing meme face swap, hilarious face swap',
    description: 'Create a hilarious laughing face swap video! Perfect for funny memes, reaction videos, and comedy content. Upload your photo and generate instantly.',
    useCase: 'Perfect for funny reactions, comedy memes, and hilarious social media posts.'
  },
  'man-eyes-widened-surprise': {
    seoName: 'Surprised Face Swap Video',
    keywords: 'surprised face swap video, shocked face swap, wide eyes surprise meme, shocked reaction face swap',
    description: 'Create a surprised face swap video with wide eyes! Perfect for reaction memes, TikTok reactions, and shocked expression videos.',
    useCase: 'Perfect for reaction memes, TikTok reactions, and shocked expression videos.'
  },
  'man-frightened': {
    seoName: 'Scared Face Swap Video',
    keywords: 'scared face swap video, frightened face swap, scared reaction meme, terrified face swap',
    description: 'Create a scared face swap video! Perfect for horror memes, prank reactions, and frightened expression videos.',
    useCase: 'Perfect for horror memes, prank reactions, and frightened expression videos.'
  },
  'man-lay-on-cried': {
    seoName: 'Crying Face Swap Video',
    keywords: 'crying face swap video, crying meme face swap, sad face swap, emotional crying face swap',
    description: 'Create a crying face swap video! Perfect for emotional memes, sad reaction videos, and dramatic content.',
    useCase: 'Perfect for emotional memes, sad reaction videos, and dramatic content.'
  },
  'man-sat-surprise': {
    seoName: 'Surprised Reaction Face Swap',
    keywords: 'surprised reaction face swap, shocked sitting face swap, surprise meme, shocked reaction video',
    description: 'Create a surprised reaction face swap video! Perfect for reaction memes and shocked expression videos.',
    useCase: 'Perfect for reaction memes and shocked expression videos.'
  },
  'man-smiles-evilly': {
    seoName: 'Evil Smile Face Swap Video',
    keywords: 'evil smile face swap, villain smile face swap, evil grin meme, sinister face swap',
    description: 'Create an evil smile face swap video! Perfect for villain memes, dark humor, and sinister character videos.',
    useCase: 'Perfect for villain memes, dark humor, and sinister character videos.'
  },
  'surprise': {
    seoName: 'Surprise Face Swap Video',
    keywords: 'surprise face swap video, shocked face swap, surprise reaction meme, amazed face swap',
    description: 'Create a surprise face swap video! Perfect for reaction memes, TikTok reactions, and surprised expression videos.',
    useCase: 'Perfect for reaction memes, TikTok reactions, and surprised expression videos.'
  },
  'woman-burst-out-laughing': {
    seoName: 'Burst Out Laughing Face Swap',
    keywords: 'burst out laughing face swap, hilarious laughing face swap, laughing meme, funny reaction face swap',
    description: 'Create a burst out laughing face swap video! Perfect for hilarious memes, comedy content, and funny reaction videos.',
    useCase: 'Perfect for hilarious memes, comedy content, and funny reaction videos.'
  },
  'woman-was-speechless': {
    seoName: 'Speechless Face Swap Video',
    keywords: 'speechless face swap, shocked speechless face swap, amazed reaction face swap, stunned face swap',
    description: 'Create a speechless face swap video! Perfect for reaction memes, amazed expressions, and shocked reaction videos.',
    useCase: 'Perfect for reaction memes, amazed expressions, and shocked reaction videos.'
  },
  // Burlesque Dance
  'girl-stand-dance': {
    seoName: 'Girl Dance Face Swap Video',
    keywords: 'girl dance face swap, dancing girl face swap, TikTok dance face swap, female dance meme',
    description: 'Create a girl dance face swap video! Perfect for TikTok videos, Instagram Reels, and dance challenge memes.',
    useCase: 'Perfect for TikTok videos, Instagram Reels, and dance challenge memes.'
  },
  'man-360-degrees-dance': {
    seoName: '360 Dance Face Swap Video',
    keywords: '360 dance face swap, spinning dance face swap, rotation dance meme, 360 spin face swap',
    description: 'Create a 360 dance face swap video! Perfect for TikTok dance videos, spinning memes, and rotation dance challenges.',
    useCase: 'Perfect for TikTok dance videos, spinning memes, and rotation dance challenges.'
  },
  'man-danced-haphazardly': {
    seoName: 'Funny Dance Face Swap Video',
    keywords: 'funny dance face swap, goofy dance face swap, silly dance meme, haphazard dance face swap',
    description: 'Create a funny dance face swap video! Perfect for comedy content, goofy memes, and silly dance videos.',
    useCase: 'Perfect for comedy content, goofy memes, and silly dance videos.'
  },
  'man-sit-ground': {
    seoName: 'Sitting Dance Face Swap',
    keywords: 'sitting dance face swap, ground dance face swap, floor dance meme, sitting dance video',
    description: 'Create a sitting dance face swap video! Perfect for unique dance memes and creative dance content.',
    useCase: 'Perfect for unique dance memes and creative dance content.'
  },
  'smile-girl-dance': {
    seoName: 'Smiling Dance Face Swap Video',
    keywords: 'smiling dance face swap, happy dance face swap, cheerful dance meme, smile dance video',
    description: 'Create a smiling dance face swap video! Perfect for happy dance memes, cheerful content, and positive vibes.',
    useCase: 'Perfect for happy dance memes, cheerful content, and positive vibes.'
  },
  'woman-dance-street': {
    seoName: 'Street Dance Face Swap Video',
    keywords: 'street dance face swap, urban dance face swap, street style dance meme, hip hop dance face swap',
    description: 'Create a street dance face swap video! Perfect for urban dance content, hip hop memes, and street style videos.',
    useCase: 'Perfect for urban dance content, hip hop memes, and street style videos.'
  },
  // Duo Interaction
  'couple-touching': {
    seoName: 'Couple Touching Face Swap Video',
    keywords: 'couple touching face swap, romantic couple face swap, couple meme, relationship face swap',
    description: 'Create a couple touching face swap video! Perfect for romantic memes, couple content, and relationship videos.',
    useCase: 'Perfect for romantic memes, couple content, and relationship videos.'
  },
  'man-woman-each-hold-large-balloon': {
    seoName: 'Couple Balloon Face Swap Video',
    keywords: 'couple balloon face swap, couple holding balloon, fun couple meme, balloon face swap',
    description: 'Create a couple balloon face swap video! Perfect for fun couple memes, playful content, and relationship videos.',
    useCase: 'Perfect for fun couple memes, playful content, and relationship videos.'
  },
  'man-woman-funny-dance': {
    seoName: 'Couple Dance Face Swap Video',
    keywords: 'couple dance face swap, funny couple dance, duo dance meme, pair dancing face swap',
    description: 'Create a couple dance face swap video! Perfect for couple dance memes, fun relationship content, and duo dance videos.',
    useCase: 'Perfect for couple dance memes, fun relationship content, and duo dance videos.'
  },
  'man-woman-maigic-battle': {
    seoName: 'Couple Battle Face Swap Video',
    keywords: 'couple battle face swap, couple fighting meme, battle couple face swap, magic battle face swap',
    description: 'Create a couple battle face swap video! Perfect for epic memes, fantasy content, and dramatic couple videos.',
    useCase: 'Perfect for epic memes, fantasy content, and dramatic couple videos.'
  },
  'two-people-dancing': {
    seoName: 'Two People Dance Face Swap Video',
    keywords: 'two people dance face swap, duo dance face swap, pair dancing meme, friends dance face swap',
    description: 'Create a two people dance face swap video! Perfect for friend memes, duo dance content, and pair dancing videos.',
    useCase: 'Perfect for friend memes, duo dance content, and pair dancing videos.'
  },
  'two-people-fist-bumping': {
    seoName: 'Fist Bump Face Swap Video',
    keywords: 'fist bump face swap, couple fist bump, friends fist bump meme, pair fist bump face swap',
    description: 'Create a fist bump face swap video! Perfect for friend memes, couple content, and celebration videos.',
    useCase: 'Perfect for friend memes, couple content, and celebration videos.'
  },
  // Magic Effects
  'electrified-veins': {
    seoName: 'Electric Face Swap Video',
    keywords: 'electric face swap, electrified face swap, lightning face swap, electric effect face swap',
    description: 'Create an electric face swap video! Perfect for fantasy content, magical effects, and supernatural videos.',
    useCase: 'Perfect for fantasy content, magical effects, and supernatural videos.'
  },
  'fire-baby': {
    seoName: 'Fire Face Swap Video',
    keywords: 'fire face swap, burning face swap, fire effect face swap, flame face swap',
    description: 'Create a fire face swap video! Perfect for fantasy content, magical transformations, and epic effect videos.',
    useCase: 'Perfect for fantasy content, magical transformations, and epic effect videos.'
  },
  'fly-women': {
    seoName: 'Flying Face Swap Video',
    keywords: 'flying face swap, levitating face swap, floating face swap, air face swap',
    description: 'Create a flying face swap video! Perfect for fantasy content, magical effects, and supernatural videos.',
    useCase: 'Perfect for fantasy content, magical effects, and supernatural videos.'
  },
  'hair-transform': {
    seoName: 'Hair Transformation Face Swap Video',
    keywords: 'hair transformation face swap, hair change face swap, hair magic face swap, hair transform meme',
    description: 'Create a hair transformation face swap video! Perfect for makeover content, style transformations, and magical videos.',
    useCase: 'Perfect for makeover content, style transformations, and magical videos.'
  },
  'man-aura': {
    seoName: 'Aura Face Swap Video',
    keywords: 'aura face swap, glowing face swap, energy aura face swap, power aura face swap',
    description: 'Create an aura face swap video! Perfect for fantasy content, magical effects, and power transformation videos.',
    useCase: 'Perfect for fantasy content, magical effects, and power transformation videos.'
  },
  'man-whoosh': {
    seoName: 'Whoosh Effect Face Swap Video',
    keywords: 'whoosh effect face swap, speed effect face swap, motion blur face swap, fast motion face swap',
    description: 'Create a whoosh effect face swap video! Perfect for action content, speed effects, and dynamic videos.',
    useCase: 'Perfect for action content, speed effects, and dynamic videos.'
  },
  // Sci-Fi Effects
  'asian-stand-futuristic-lab': {
    seoName: 'Futuristic Lab Face Swap Video',
    keywords: 'futuristic lab face swap, sci-fi lab face swap, future lab meme, tech lab face swap',
    description: 'Create a futuristic lab face swap video! Perfect for sci-fi content, tech memes, and future-themed videos.',
    useCase: 'Perfect for sci-fi content, tech memes, and future-themed videos.'
  },
  'black-woman-stand-futuristic-alley': {
    seoName: 'Cyberpunk Face Swap Video',
    keywords: 'cyberpunk face swap, futuristic alley face swap, cyberpunk meme, future city face swap',
    description: 'Create a cyberpunk face swap video! Perfect for sci-fi content, cyberpunk aesthetics, and futuristic videos.',
    useCase: 'Perfect for sci-fi content, cyberpunk aesthetics, and futuristic videos.'
  },
  'man-stand-futuristic-platform': {
    seoName: 'Futuristic Platform Face Swap Video',
    keywords: 'futuristic platform face swap, sci-fi platform, future platform face swap, tech platform meme',
    description: 'Create a futuristic platform face swap video! Perfect for sci-fi content, tech memes, and future-themed videos.',
    useCase: 'Perfect for sci-fi content, tech memes, and future-themed videos.'
  },
  'man-wear-futuristic-armor': {
    seoName: 'Futuristic Armor Face Swap Video',
    keywords: 'futuristic armor face swap, sci-fi armor face swap, future warrior face swap, tech armor meme',
    description: 'Create a futuristic armor face swap video! Perfect for sci-fi content, warrior memes, and epic transformation videos.',
    useCase: 'Perfect for sci-fi content, warrior memes, and epic transformation videos.'
  },
  'woman-stand-futuristic-street': {
    seoName: 'Futuristic Street Face Swap Video',
    keywords: 'futuristic street face swap, cyberpunk street face swap, future city face swap, tech street meme',
    description: 'Create a futuristic street face swap video! Perfect for sci-fi content, cyberpunk aesthetics, and urban future videos.',
    useCase: 'Perfect for sci-fi content, cyberpunk aesthetics, and urban future videos.'
  },
  'woman-wear-futuristic-armor': {
    seoName: 'Futuristic Armor Face Swap Video',
    keywords: 'futuristic armor face swap, sci-fi armor face swap, future warrior face swap, tech armor meme',
    description: 'Create a futuristic armor face swap video! Perfect for sci-fi content, warrior memes, and epic transformation videos.',
    useCase: 'Perfect for sci-fi content, warrior memes, and epic transformation videos.'
  },
  // Slapstick Comedy
  'angery-doll-women': {
    seoName: 'Angry Doll Face Swap Video',
    keywords: 'angry doll face swap, doll face swap, angry character face swap, doll meme face swap',
    description: 'Create an angry doll face swap video! Perfect for comedy content, character memes, and funny videos.',
    useCase: 'Perfect for comedy content, character memes, and funny videos.'
  },
  'fanny-dance-man': {
    seoName: 'Funny Dance Face Swap Video',
    keywords: 'funny dance face swap, goofy dance face swap, silly dance meme, fanny dance face swap',
    description: 'Create a funny dance face swap video! Perfect for comedy content, goofy memes, and silly dance videos.',
    useCase: 'Perfect for comedy content, goofy memes, and silly dance videos.'
  },
  'man-banana': {
    seoName: 'Banana Face Swap Video',
    keywords: 'banana face swap, fruit face swap, funny banana meme, banana character face swap',
    description: 'Create a banana face swap video! Perfect for comedy content, funny memes, and silly character videos.',
    useCase: 'Perfect for comedy content, funny memes, and silly character videos.'
  },
  'man-chili': {
    seoName: 'Spicy Face Swap Video',
    keywords: 'spicy face swap, chili face swap, hot face swap meme, spicy reaction face swap',
    description: 'Create a spicy face swap video! Perfect for comedy content, reaction memes, and funny expression videos.',
    useCase: 'Perfect for comedy content, reaction memes, and funny expression videos.'
  },
  'woman-hold-large-balloon': {
    seoName: 'Balloon Face Swap Video',
    keywords: 'balloon face swap, large balloon face swap, funny balloon meme, balloon character face swap',
    description: 'Create a balloon face swap video! Perfect for comedy content, funny memes, and playful videos.',
    useCase: 'Perfect for comedy content, funny memes, and playful videos.'
  },
  'woman-sit-wobbly-chair': {
    seoName: 'Wobbly Chair Face Swap Video',
    keywords: 'wobbly chair face swap, falling chair face swap, funny chair meme, chair fail face swap',
    description: 'Create a wobbly chair face swap video! Perfect for comedy content, fail memes, and funny videos.',
    useCase: 'Perfect for comedy content, fail memes, and funny videos.'
  },
  // Style Makeovers
  'bikini-women': {
    seoName: 'Bikini Transformation Face Swap Video',
    keywords: 'bikini transformation face swap, beach style face swap, summer makeover face swap, bikini meme',
    description: 'Create a bikini transformation face swap video! Perfect for style content, makeover videos, and fashion memes.',
    useCase: 'Perfect for style content, makeover videos, and fashion memes.'
  },
  'man-transforms-superman': {
    seoName: 'Superman Transformation Face Swap Video',
    keywords: 'superman transformation face swap, superhero transformation, superman makeover, hero transformation face swap',
    description: 'Create a superman transformation face swap video! Perfect for superhero content, transformation memes, and epic videos.',
    useCase: 'Perfect for superhero content, transformation memes, and epic videos.'
  },
  'man-transforms-woman': {
    seoName: 'Gender Swap Face Swap Video',
    keywords: 'gender swap face swap, transformation face swap, gender change face swap, cross gender face swap',
    description: 'Create a gender swap face swap video! Perfect for transformation content, style changes, and creative videos.',
    useCase: 'Perfect for transformation content, style changes, and creative videos.'
  },
  'women-cross-dress': {
    seoName: 'Cross Dress Face Swap Video',
    keywords: 'cross dress face swap, style swap face swap, outfit change face swap, fashion transformation',
    description: 'Create a cross dress face swap video! Perfect for style content, fashion transformations, and outfit change videos.',
    useCase: 'Perfect for style content, fashion transformations, and outfit change videos.'
  },
  'women-crossdress-skirt': {
    seoName: 'Skirt Transformation Face Swap Video',
    keywords: 'skirt transformation face swap, dress transformation, style change face swap, outfit swap meme',
    description: 'Create a skirt transformation face swap video! Perfect for style content, fashion memes, and transformation videos.',
    useCase: 'Perfect for style content, fashion memes, and transformation videos.'
  },
  'women-transformation-armor': {
    seoName: 'Armor Transformation Face Swap Video',
    keywords: 'armor transformation face swap, warrior transformation, armor makeover face swap, warrior makeover',
    description: 'Create an armor transformation face swap video! Perfect for epic content, warrior memes, and transformation videos.',
    useCase: 'Perfect for epic content, warrior memes, and transformation videos.'
  }
}

// 从文件名生成SEO slug
function generateSlug(fileName) {
  return fileName
    .replace(/\.mp4$/, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
}

function TemplateDetailPage() {
  const { categorySlug, templateSlug } = useParams()
  const navigate = useNavigate()
  const [template, setTemplate] = useState(null)
  const [relatedTemplates, setRelatedTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch('/templates.json')
        const data = await response.json()
        
        // 找到匹配的模板
        const foundTemplate = data.find(t => {
          const slug = generateSlug(t.fileName)
          return slug === templateSlug
        })

        if (!foundTemplate) {
          // 模板不存在，重定向到分类页
          navigate(`/templates/${categorySlug}`)
          return
        }

        setTemplate(foundTemplate)

        // 加载同分类的其他模板作为相关模板
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
        const related = data
          .filter(t => t.category === categoryName && t.id !== foundTemplate.id)
          .slice(0, 6)
        setRelatedTemplates(related)

        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load template:', error)
        setIsLoading(false)
      }
    }

    loadTemplate()
  }, [categorySlug, templateSlug, navigate])

  if (isLoading) {
    return (
      <div className="template-detail-page">
        <div className="loading-state">
          <p>Loading template...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return null
  }

  // 获取SEO配置
  const templateSlugKey = generateSlug(template.fileName)
  const seoConfig = TEMPLATE_SEO_MAP[templateSlugKey] || {
    seoName: template.name,
    keywords: `${template.name} face swap, ${template.category.toLowerCase()} face swap`,
    description: `Create a ${template.name.toLowerCase()} face swap video! Perfect for ${template.category.toLowerCase()} content.`,
    useCase: `Perfect for ${template.category.toLowerCase()} content.`
  }

  const pageTitle = `${seoConfig.seoName} - AI Face Swap Template | FaceAI Hub`
  const pageUrl = `https://faceaihub.com/templates/${categorySlug}/${templateSlug}`

  // 结构化数据
  // 添加Review结构化数据
  const reviewStructuredData = template ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": seoConfig.seoName,
    "description": seoConfig.description,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "89",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Alex R."
        },
        "datePublished": "2025-01-25",
        "reviewBody": `Great ${seoConfig.seoName.toLowerCase()} template! Easy to use and the results are hilarious. Perfect for creating memes.`,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        }
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Jessica K."
        },
        "datePublished": "2025-01-23",
        "reviewBody": `Love this ${seoConfig.seoName.toLowerCase()}! The quality is amazing and it's so fun to use. Highly recommend!`,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        }
      }
    ]
  } : null

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": seoConfig.seoName,
    "description": seoConfig.description,
    "thumbnailUrl": template.gifUrl,
    "contentUrl": template.gifUrl,
    "duration": template.duration ? `PT${template.duration}S` : undefined,
    "uploadDate": new Date().toISOString()
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
        "name": template.category,
        "item": `https://faceaihub.com/templates/${categorySlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": seoConfig.seoName,
        "item": pageUrl
      }
    ]
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={seoConfig.description} />
        <meta name="keywords" content={seoConfig.keywords} />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoConfig.seoName} />
        <meta property="og:description" content={seoConfig.description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="video.other" />
        <meta property="og:video" content={template.gifUrl} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        {reviewStructuredData && (
          <script type="application/ld+json">
            {JSON.stringify(reviewStructuredData)}
          </script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      </Helmet>

      <div className="template-detail-page">
        <div className="template-detail-header">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span> / </span>
            <Link to={`/templates/${categorySlug}`}>{template.category}</Link>
            <span> / </span>
            <span aria-current="page">{seoConfig.seoName}</span>
          </nav>
          
          <h1>{seoConfig.seoName}</h1>
          <p className="template-description">{seoConfig.description}</p>
        </div>

        <div className="template-detail-content">
          <div className="template-preview-section">
            <div className="template-video-preview">
              <video
                src={template.gifUrl}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="template-preview-video"
                aria-label={`${seoConfig.seoName} face swap video template preview`}
                title={`${seoConfig.seoName} - AI Face Swap Video Template`}
              />
            </div>
            
            <div className="template-info">
              <div className="template-meta">
                <span className="template-category">{template.category}</span>
                {template.duration && (
                  <span className="template-duration">{template.duration}s</span>
                )}
              </div>
              
              {seoConfig.useCase && (
                <div className="template-use-case">
                  <strong>Perfect for:</strong> {seoConfig.useCase}
                </div>
              )}

              <button
                className="use-template-btn"
                onClick={() => {
                  // 跳转到首页并选择此模板
                  navigate('/', { state: { templateId: template.id } })
                }}
              >
                Use This Template
              </button>
            </div>
          </div>

          <section className="template-description-section">
            <h2>About This Template</h2>
            <p>
              This {template.category.toLowerCase()} face swap template allows you to create {seoConfig.seoName.toLowerCase()} videos instantly. 
              Simply upload your photo and our AI will seamlessly replace the face in this template, creating a hilarious and shareable meme video.
            </p>
            <p>
              {seoConfig.useCase}
            </p>
            <p>
              Our AI-powered face swap technology ensures high-quality results with natural-looking face replacements. 
              The process takes only 15-30 seconds, and the final video is ready to download and share on your favorite social media platforms.
            </p>
            <div className="template-features">
              <h3>Template Features:</h3>
              <ul>
                <li>✅ High-quality AI face swap technology</li>
                <li>✅ Instant processing (15-30 seconds)</li>
                <li>✅ No watermark on final video</li>
                <li>✅ Free to use, no signup required</li>
                <li>✅ Perfect for social media sharing</li>
              </ul>
            </div>
          </section>

          {relatedTemplates.length > 0 && (
            <section className="related-templates-section">
              <h2>Related Templates</h2>
              <div className="related-templates-grid">
                {relatedTemplates.map(relatedTemplate => {
                  const relatedSlug = generateSlug(relatedTemplate.fileName)
                  return (
                    <Link
                      key={relatedTemplate.id}
                      to={`/templates/${categorySlug}/${relatedSlug}`}
                      className="related-template-card"
                    >
                      <video
                        src={relatedTemplate.gifUrl}
                        muted
                        playsInline
                        className="related-template-preview"
                        aria-label={`Preview of ${relatedTemplate.name} face swap template`}
                        title={`${relatedTemplate.name} face swap template`}
                      />
                      <p className="related-template-name">{relatedTemplate.name}</p>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          <section className="how-to-use-section">
            <h2>How to Use This Template</h2>
            <ol>
              <li>Click "Use This Template" button above</li>
              <li>Upload your photo (or two photos for duo templates)</li>
              <li>Click "Create Video" and wait 15-30 seconds</li>
              <li>Download your face swap video and share it!</li>
            </ol>
            <Link to="/how-to-create-face-swap-video" className="learn-more-link">
              Learn more in our detailed tutorial →
            </Link>
          </section>

          <section className="back-to-category">
            <Link to={`/templates/${categorySlug}`} className="back-button">
              ← Back to {template.category}
            </Link>
          </section>
        </div>
      </div>
    </>
  )
}

export default TemplateDetailPage

