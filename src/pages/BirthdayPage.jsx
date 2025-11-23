import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const BirthdayPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="birthday-page">
      <Helmet>
        <title>Happy Birthday Face Swap Video Maker - Funny Birthday Wishes | FaceAI Hub</title>
        <meta name="description" content="Create hilarious Happy Birthday face swap videos! Put your friend's face on a dancing birthday card, funny movie scene, or singing character. The best free birthday video maker." />
        <meta name="keywords" content="birthday face swap video, funny birthday video maker, happy birthday face meme, birthday card with face, dance your birthday video" />
        <link rel="canonical" href="https://faceaihub.com/birthday-face-swap-video" />
      </Helmet>

      <div className="birthday-header">
        <h1>Create Funny Birthday Face Swap Videos</h1>
        <p className="intro-text">
          Forget boring greeting cards. Send a hilarious AI face swap video that they'll never forget. It's the perfect virtual birthday gift!
        </p>
      </div>

      <div className="birthday-content">
        {/* Ideas Section */}
        <section className="birthday-ideas-section">
          <h2>Birthday Video Ideas</h2>
          <div className="ideas-grid">
            <div className="idea-card">
              <h3>🕺 The Birthday Dance</h3>
              <p>Put the birthday boy/girl's face on a crazy dancer. It's guaranteed to make them laugh.</p>
            </div>
            <div className="idea-card">
              <h3>🎬 Movie Star Greeting</h3>
              <p>Swap their face into an iconic movie scene where the character is being celebrated or doing something epic.</p>
            </div>
            <div className="idea-card">
              <h3>🎤 Singing Telegram</h3>
              <p>Make them sing a funny song using our lip-sync templates.</p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="how-to-section">
          <h2>3 Steps to a Perfect Birthday Surprise</h2>
          <ol className="steps-list">
            <li>
              <strong>Steal a Photo:</strong> Grab a clear photo of your friend from Facebook or Instagram (shh, don't tell them!).
            </li>
            <li>
              <strong>Choose a Template:</strong> Pick something funny like "Burlesque Dance" or "Slapstick Comedy".
            </li>
            <li>
              <strong>Share the Laughter:</strong> Download the video and send it via WhatsApp, Messenger, or post on their timeline.
            </li>
          </ol>
        </section>

        {/* Recommended Templates */}
        <section className="popular-templates-section">
          <h2>Best Templates for Birthdays</h2>
          <div className="templates-grid">
            <Link to="/templates/burlesque-dance" className="template-link-card">
              <div className="template-icon">👯‍♂️</div>
              <h3>Group Dance</h3>
              <p>Great for group chats!</p>
            </Link>
            <Link to="/templates/magic-effects" className="template-link-card">
              <div className="template-icon">✨</div>
              <h3>Magical Wishes</h3>
              <p>Add some sparkle to their day.</p>
            </Link>
            <Link to="/templates/funny" className="template-link-card">
              <div className="template-icon">🤣</div>
              <h3>Pure Comedy</h3>
              <p>The funnier, the better.</p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <h2>Make Their Day Special</h2>
          <p>Create a custom birthday video in less than a minute.</p>
          <Link to="/" className="cta-button">Create Birthday Video</Link>
        </section>
      </div>
    </div>
  );
};

export default BirthdayPage;