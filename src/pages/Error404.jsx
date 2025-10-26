import React from 'react'
import { Link } from 'react-router-dom'
import './ErrorPage.css'

const Error404 = () => {
  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-animation">
          <div className="face-swap-icon">🎭</div>
          <div className="error-number">404</div>
        </div>
        <h1>Oops! Page Not Found</h1>
        <p>The page you're looking for seems to have vanished into the digital void.</p>
        <p>Don't worry, let's get you back to creating amazing memes!</p>
        <div className="error-actions">
          <Link to="/" className="error-button primary">
            🏠 Go Home
          </Link>
          <Link to="/#templates" className="error-button secondary">
            🎨 Browse Templates
          </Link>
        </div>
        <div className="error-suggestions">
          <h3>Popular Pages:</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/#templates">Templates</Link></li>
            <li><Link to="/#generate">Generate</Link></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Error404
