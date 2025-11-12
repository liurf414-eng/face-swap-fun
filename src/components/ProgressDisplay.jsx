import { memo } from 'react'

const ProgressDisplay = memo(function ProgressDisplay({ 
  progress, 
  processingStatus, 
  elapsedTime, 
  predictedTotalTime 
}) {
  // 计算进度圆的stroke-dashoffset
  const circumference = 2 * Math.PI * 50
  const displayProgress = parseFloat(progress.toFixed(1))
  const offset = circumference * (1 - displayProgress / 100)

  const timeDisplay = predictedTotalTime > 0
    ? `${elapsedTime.toFixed(1)}s / ${predictedTotalTime.toFixed(1)}s`
    : `${elapsedTime.toFixed(1)}s / ...`

  return (
    <div className="processing-status-inline">
      <h3><span className="step-badge">Step 3</span>Generating Your Video...</h3>
      <div className="circular-progress-container">
        <svg className="circular-progress" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="rgba(102, 126, 234, 0.1)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{
              transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'progressPulse 2s ease-in-out infinite'
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="circular-progress-content">
          <div className="progress-percentage">{displayProgress.toFixed(1)}%</div>
        </div>
      </div>
      <p className="processing-text">{processingStatus || 'Processing your video...'}</p>
      <div className="prediction-info">{timeDisplay}</div>
    </div>
  )
})

export default ProgressDisplay

