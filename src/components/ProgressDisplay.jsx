import { memo, useState, useEffect } from 'react'

const TIPS = [
  "Did you know? AI analyzes thousands of facial points.",
  "Creating magic... this usually takes about 30-60 seconds.",
  "Almost there! We are rendering your masterpiece.",
  "Fun fact: The first face swap technology appeared in the 90s.",
  "Refining details for the best quality...",
  "Synthesizing expressions...",
  "Matching lighting conditions..."
]

const ProgressDisplay = memo(function ProgressDisplay({ 
  progress, 
  processingStatus, 
  elapsedTime, 
  predictedTotalTime 
}) {
  const [tipIndex, setTipIndex] = useState(0)
  
  // Rotate tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const displayProgress = Math.min(Math.max(0, parseFloat(progress)), 99.5)
  const remainingTime = Math.max(0, predictedTotalTime - elapsedTime)
  
  return (
    <div className="processing-container">
      <div className="processing-header">
        <h3 className="processing-title">
          <span className="spinner-icon">⚡</span>
          Creating Your Video...
        </h3>
        <span className="processing-percent">{displayProgress.toFixed(0)}%</span>
      </div>
      
      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill"
          style={{ width: `${displayProgress}%` }}
        >
          <div className="progress-bar-glow"></div>
        </div>
      </div>
      
      <div className="processing-info">
        <p className="processing-status">{processingStatus || 'Processing...'}</p>
        <p className="processing-time">
          Estimated remaining: ~{remainingTime.toFixed(0)}s
        </p>
      </div>
      
      <div className="processing-tip">
        💡 {TIPS[tipIndex]}
      </div>
    </div>
  )
})

export default ProgressDisplay
