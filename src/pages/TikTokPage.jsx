import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const TikTokPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Face Swap for TikTok - FaceAI Hub",
    "description": "Make viral TikTok face swap videos instantly! Free AI face swap for TikTok trends, dance challenges, and funny memes. No watermark, high quality video export.",
    "url": "https://faceaihub.com/face-swap-for-tiktok",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "320"
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://faceaihub.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Face Swap for TikTok",
        "item": "https://faceaihub.com/face-swap-for-tiktok"
      }
    ]
  };

  return (
    <div className="tiktok-page">
      <Helmet>
        <title>Face Swap for TikTok - Create Viral TikTok Trend Videos | FaceAI Hub</title>
        <meta name="description" content="Make viral TikTok face swap videos instantly! Free AI face swap for TikTok trends, dance challenges, and funny memes. No watermark, high quality video export." />
        <meta name="keywords" content="face swap for tiktok, tiktok face swap trend, tiktok face filter video, ai face swap tiktok, viral tiktok meme maker" />
        <link rel="canonical" href="https://faceaihub.com/face-swap-for-tiktok" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Face Swap for TikTok - Create Viral Trend Videos" />
        <meta property="og:description" content="Make viral TikTok face swap videos instantly! Free AI face swap for TikTok trends. No watermark." />
        <meta property="og:url" content="https://faceaihub.com/face-swap-for-tiktok" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://faceaihub.com/og-image.jpg" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>

      <div className="tiktok-header">
        <h1>Face Swap for TikTok Trends</h1>
        <p className="intro-text">
          Create viral-worthy TikTok videos in seconds. Put your face on trending dances, funny memes, and popular movie scenes without learning complicated editing software.
        </p>
      </div>

      <div className="tiktok-content">
        {/* Benefits Section */}
        <section className="why-tiktok-section">
          <h2>Why Use FaceAI Hub for TikTok?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🚀</div>
              <h3>Viral Ready</h3>
              <p>Templates updated daily with the latest TikTok trends and challenges.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h3>Instant Creation</h3>
              <p>No editing skills needed. Just upload one photo and get your video in seconds.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📱</div>
              <h3>9:16 Optimized</h3>
              <p>All videos are perfectly formatted for TikTok's vertical full-screen experience.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🚫</div>
              <h3>No Watermark</h3>
              <p>Download clean, high-quality videos ready to post directly to TikTok.</p>
            </div>
          </div>
        </section>

        {/* Popular TikTok Templates Preview */}
        <section className="popular-templates-section">
          <h2>Trending TikTok Templates</h2>
          <div className="templates-grid">
            <Link to="/templates/burlesque-dance" className="template-link-card">
              <div className="template-icon">💃</div>
              <h3>Dance Challenges</h3>
              <p>Join the latest dance trends without learning the moves.</p>
            </Link>
            <Link to="/templates/emotional-reactions" className="template-link-card">
              <div className="template-icon">😲</div>
              <h3>Reaction Memes</h3>
              <p>Perfect for duets and reaction videos.</p>
            </Link>
            <Link to="/templates/duo-interaction" className="template-link-card">
              <div className="template-icon">👫</div>
              <h3>Couple Trends</h3>
              <p>Funny couple videos and relationship memes.</p>
            </Link>
          </div>
        </section>

        {/* Tips Section */}
        <section className="tiktok-tips-section">
          <h2>How to Make a Viral TikTok Face Swap</h2>
          <ul className="tips-list">
            <li><strong>Choose a High-Quality Photo:</strong> Ensure your face is clearly visible and well-lit for the best AI results.</li>
            <li><strong>Pick a Trending Template:</strong> browse our "Popular" category to find what's hot right now.</li>
            <li><strong>Add Trending Audio:</strong> When you upload to TikTok, use the current trending sound to boost your reach.</li>
            <li><strong>Use Hashtags:</strong> Tag #faceswap, #ai, #trend, and #funny to get discovered.</li>
          </ul>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <h2>Ready to go viral?</h2>
          <p>Start creating amazing face swap videos for TikTok now.</p>
          <Link to="/" className="cta-button">Create TikTok Video Now</Link>
        </section>
      </div>
    </div>
  );
};

export default TikTokPage;