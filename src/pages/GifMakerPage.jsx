import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const GifMakerPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-page gif-maker-page">
      <Helmet>
        <title>Online Face Swap GIF Maker – Create Hilarious GIF Memes | FaceAI Hub</title>
        <meta name="description" content="Use our free online Face Swap GIF Maker to replace faces in GIFs instantly. Create funny reaction GIFs, meme GIFs, and animated stickers with your face. No watermark." />
        <meta name="keywords" content="face swap GIF generator, replace face in GIF online, make a GIF with my face, upload selfie to face swap GIF, AI face swap GIF maker, custom reaction GIF face swap" />
        <link rel="canonical" href="https://faceaihub.com/face-swap-gif-maker" />
      </Helmet>

      <div className="landing-header">
        <h1>Online Face Swap GIF Maker</h1>
        <p className="intro-text">
          Turn your selfies into viral GIFs. The easiest way to replace faces in animated GIFs online for free.
        </p>
        <Link to="/" className="cta-button-large">Create GIF Now</Link>
      </div>

      <div className="landing-content">
        <section className="features-grid">
          <div className="feature-card">
            <h3>🎭 Instant Face Replacement</h3>
            <p>Upload a photo and swap faces in any GIF instantly using advanced AI.</p>
          </div>
          <div className="feature-card">
            <h3>🤣 Create Reaction GIFs</h3>
            <p>Make custom reaction GIFs for Discord, Slack, and WhatsApp.</p>
          </div>
          <div className="feature-card">
            <h3>✨ No Watermark</h3>
            <p>Download clean, high-quality GIFs without any branding.</p>
          </div>
        </section>

        <section className="popular-templates-section">
          <h2>Popular GIF Templates</h2>
          <div className="templates-grid">
            <Link to="/templates/emotional-reactions" className="template-link-card">
              <div className="template-icon">😲</div>
              <h3>Reaction GIFs</h3>
              <p>Surprised, Crying, Laughing</p>
            </Link>
            <Link to="/templates/slapstick-comedy" className="template-link-card">
              <div className="template-icon">😂</div>
              <h3>Funny Memes</h3>
              <p>Classic internet humor</p>
            </Link>
            <Link to="/templates/magic-effects" className="template-link-card">
              <div className="template-icon">✨</div>
              <h3>Magic GIFs</h3>
              <p>Fantasy transformations</p>
            </Link>
          </div>
        </section>

        <section className="how-to-section">
          <h2>How to Replace Face in GIF Online</h2>
          <ol className="steps-list">
            <li><strong>Select a GIF Template:</strong> Choose from our library of funny GIFs.</li>
            <li><strong>Upload Your Photo:</strong> A clear front-facing selfie works best.</li>
            <li><strong>Generate & Download:</strong> Our AI swaps the face in seconds. Download and share!</li>
          </ol>
        </section>
      </div>
    </div>
  );
};

export default GifMakerPage;
