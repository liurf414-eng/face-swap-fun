import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | FaceAI Hub</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to FaceAI Hub homepage to create amazing face swap videos." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://faceaihub.com/404" />
      </Helmet>

      <div className="not-found-page">
        <div className="not-found-content">
          <div className="not-found-icon">🔍</div>
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p className="not-found-description">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="not-found-suggestion">
            Don't worry, you can still create amazing face swap videos!
          </p>
          
          <div className="not-found-actions">
            <Link to="/" className="not-found-button primary">
              🏠 Go to Homepage
            </Link>
            <Link to="/templates/emotional-reactions" className="not-found-button secondary">
              🎬 Browse Templates
            </Link>
          </div>

          <div className="not-found-links">
            <h3>Popular Pages:</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/templates/emotional-reactions">Emotional Reactions</Link></li>
              <li><Link to="/templates/burlesque-dance">Dance Templates</Link></li>
              <li><Link to="/templates/duo-interaction">Couple Templates</Link></li>
              <li><Link to="/how-to-create-face-swap-video">How to Create Face Swap</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="not-found-search">
            <p>Or try searching for what you need:</p>
            <Link to="/" className="search-link">
              🔍 Search Templates
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default NotFoundPage
