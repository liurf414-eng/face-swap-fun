import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const InstagramPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="instagram-page">
      <Helmet>
        <title>Instagram Reels Face Swap - Create Funny Reels & Stories | FaceAI Hub</title>
        <meta name="description" content="Create engaging Instagram Reels and Stories with AI face swap. Funny reaction videos, style makeovers, and trending memes for your Instagram followers." />
        <meta name="keywords" content="instagram reels face swap, face swap for instagram, instagram story face filter, funny reels maker, ai face swap for instagram" />
        <link rel="canonical" href="https://faceaihub.com/face-swap-for-instagram" />
      </Helmet>

      <div className="instagram-header">
        <h1>Face Swap for Instagram Reels & Stories</h1>
        <p className="intro-text">
          Level up your Instagram game with AI-powered face swap videos. Create content that stops the scroll and gets more engagement.
        </p>
      </div>

      <div className="instagram-content">
        {/* Use Cases Section */}
        <section className="why-instagram-section">
          <h2>Best Ways to Use Face Swap on Instagram</h2>
          <div className="use-cases">
            <div className="use-case-card">
              <h3>📸 Engaging Stories</h3>
              <p>Post a quick "Good Morning" or reaction video using a funny movie clip with your face. It's a great conversation starter.</p>
            </div>
            <div className="use-case-card">
              <h3>🎥 Viral Reels</h3>
              <p>Recreate trending movie scenes or music videos. AI face swap adds a unique twist that encourages sharing.</p>
            </div>
            <div className="use-case-card">
              <h3>👗 Style Makeovers</h3>
              <p>Use our "Style Makeover" templates to show yourself in different outfits, hairstyles, or eras.</p>
            </div>
          </div>
        </section>

        {/* How To Section */}
        <section className="how-to-section">
          <h2>How to Create Instagram Content</h2>
          <ol className="steps-list">
            <li>
              <strong>Select a Template:</strong> Choose "Vertical (9:16)" templates for Reels/Stories or "Square (1:1)" for regular posts.
            </li>
            <li>
              <strong>Upload Your Photo:</strong> A clear selfie works best.
            </li>
            <li>
              <strong>Generate & Download:</strong> Get your video in seconds.
            </li>
            <li>
              <strong>Post to Instagram:</strong> Open Instagram, create a new Reel or Story, and upload your video. Add music and stickers!
            </li>
          </ol>
        </section>

        {/* Popular Templates */}
        <section className="popular-templates-section">
          <h2>Templates Your Followers Will Love</h2>
          <div className="templates-grid">
            <Link to="/templates/style-makeovers" className="template-link-card">
              <div className="template-icon">👗</div>
              <h3>Fashion & Style</h3>
              <p>Try on new looks instantly.</p>
            </Link>
            <Link to="/templates/slapstick-comedy" className="template-link-card">
              <div className="template-icon">😂</div>
              <h3>Comedy Clips</h3>
              <p>Make your friends laugh out loud.</p>
            </Link>
            <Link to="/templates/sci-fi-effects" className="template-link-card">
              <div className="template-icon">🔮</div>
              <h3>Cool Effects</h3>
              <p>Futuristic and magical transformations.</p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <h2>Boost Your Engagement Today</h2>
          <p>Create your first AI face swap video for Instagram now.</p>
          <Link to="/" className="cta-button">Create Reel Now</Link>
        </section>
      </div>
    </div>
  );
};

export default InstagramPage;