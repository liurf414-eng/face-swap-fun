import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const VideoMakerPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-page video-maker-page">
      <Helmet>
        <title>Face Swap Video Creator – Turn Yourself into a Meme | FaceAI Hub</title>
        <meta name="description" content="Free AI Face Swap Video Maker. Put your face into meme videos, movie clips, and dance trends. Create deepfake-style videos easily online. No technical skills needed." />
        <meta name="keywords" content="AI face swap video maker, put my face into meme video, deepfake meme video generator, face swap reaction video online, funny face swap video creator, customize video meme with your face" />
        <link rel="canonical" href="https://faceaihub.com/face-swap-video-maker" />
      </Helmet>

      <div className="landing-header">
        <h1>AI Face Swap Video Creator</h1>
        <p className="intro-text">
          Star in your favorite movie scenes or viral videos. The most advanced AI video face swapper on the web.
        </p>
        <Link to="/" className="cta-button-large">Start Swapping</Link>
      </div>

      <div className="landing-content">
        <section className="use-cases-section">
          <h2>What Can You Create?</h2>
          <div className="use-cases-grid">
            <div className="use-case-card">
              <h3>🎬 Movie Clips</h3>
              <p>Put yourself in famous movie scenes like The Matrix, Titanic, or Marvel movies.</p>
            </div>
            <div className="use-case-card">
              <h3>💃 Dance Videos</h3>
              <p>Can't dance? Let AI do it for you. Swap your face onto professional dancers.</p>
            </div>
            <div className="use-case-card">
              <h3>🎤 Music Videos</h3>
              <p>Become a pop star instantly. Lip-sync to trending songs.</p>
            </div>
          </div>
        </section>

        <section className="popular-templates-section">
          <h2>Trending Video Categories</h2>
          <div className="templates-grid">
            <Link to="/templates/burlesque-dance" className="template-link-card">
              <div className="template-icon">💃</div>
              <h3>Dance Trends</h3>
              <p>TikTok viral dances</p>
            </Link>
            <Link to="/templates/duo-interaction" className="template-link-card">
              <div className="template-icon">👫</div>
              <h3>Couple Videos</h3>
              <p>Romantic & Funny</p>
            </Link>
            <Link to="/templates/sci-fi-effects" className="template-link-card">
              <div className="template-icon">🚀</div>
              <h3>Sci-Fi Clips</h3>
              <p>Futuristic movies</p>
            </Link>
          </div>
        </section>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-item">
            <h3>Is this a Deepfake generator?</h3>
            <p>While the technology is similar (face replacement), our tool is designed for entertainment and parody purposes (memes), ensuring safe and ethical use.</p>
          </div>
          <div className="faq-item">
            <h3>Do I need powerful hardware?</h3>
            <p>No! Everything runs in the cloud. You can create face swap videos on your phone or laptop.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VideoMakerPage;
