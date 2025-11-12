import { useRef, useEffect } from 'react'

function ResultDisplay({ result, selectedTemplate, onDownload, onCreateNew, isDuoInteraction, hasRequiredImages, isProcessing, limitReached }) {
  const videoRef = useRef(null)

  const isVideoUrl = (url) => {
    if (!url) return false
    const urlWithoutQuery = url.split('?')[0]
    return urlWithoutQuery.endsWith('.mp4') || 
           urlWithoutQuery.endsWith('.webm') || 
           urlWithoutQuery.endsWith('.mov') ||
           url.includes('video') ||
           url.includes('.mp4') ||
           url.includes('.webm')
  }

  useEffect(() => {
    if (result && videoRef.current && isVideoUrl(result.url)) {
      videoRef.current.play().catch(err => {
        console.warn('视频自动播放被阻止:', err)
      })
    }
  }, [result])

  return (
    <div className="result-card-inline">
      <h3><span className="step-badge">Step 3</span>🎉 Complete!</h3>
      <div className="result-preview-box">
        {isVideoUrl(result.url) ? (
          <video
            ref={videoRef}
            src={result.url}
            autoPlay
            loop
            muted
            playsInline
            controls
            onLoadedData={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(e => console.log('Autoplay prevented:', e))
              }
            }}
            onCanPlay={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(e => console.log('Autoplay prevented:', e))
              }
            }}
          />
        ) : (
          <img src={result.url} alt="Generated result" />
        )}
      </div>
      <div className="result-actions">
        <button className="download-button" onClick={onDownload}>
          📥 Download Video
        </button>
        <button 
          className="create-new-btn"
          onClick={() => {
            // 如果已有选中的模板和上传的照片，直接生成新视频
            const hasRequired = isDuoInteraction 
              ? (selectedTemplate && hasRequiredImages)
              : (selectedTemplate && hasRequiredImages)
            if (hasRequired && !isProcessing && !limitReached) {
              onCreateNew()
            } else {
              // 否则清空状态回到初始页面
              onCreateNew(true)
            }
          }}
        >
          ✨ Create New Video
        </button>
      </div>
    </div>
  )
}

export default ResultDisplay

