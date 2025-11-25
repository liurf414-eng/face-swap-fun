import { useRef, useEffect, useState, memo } from 'react'
import { toast } from 'react-toastify'

const ResultDisplay = memo(function ResultDisplay({ result, selectedTemplate, onDownload, onCreateNew, isDuoInteraction, hasRequiredImages, isProcessing, limitReached }) {
  const videoRef = useRef(null)
  const [shareLink, setShareLink] = useState('')

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
        console.warn('Video autoplay blocked:', err)
      })
    }
    // 生成分享链接
    if (result && result.url) {
      setShareLink(result.url)
    }
  }, [result])

  const handleShare = async () => {
    if (!shareLink) {
      toast.error('No video URL to share')
      return
    }

    // 尝试使用 Web Share API（如果支持）
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my face swap video!',
          text: 'I created an amazing face swap video!',
          url: shareLink
        })
        toast.success('Shared successfully!')
        return
      } catch (err) {
        // 用户取消分享或出错，继续使用复制功能
        if (err.name !== 'AbortError') {
          console.log('Web Share API failed:', err)
        }
      }
    }

    // 回退到复制链接到剪贴板
    try {
      await navigator.clipboard.writeText(shareLink)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      const textArea = document.createElement('textarea')
      textArea.value = shareLink
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        toast.success('Link copied to clipboard!')
      } catch (err) {
        toast.error('Failed to copy link. Please copy manually.')
      }
      document.body.removeChild(textArea)
    }
  }

  // 社交媒体分享链接生成
  const shareToSocial = (platform) => {
    if (!shareLink) return
    const text = encodeURIComponent('Check out this funny AI face swap video I made! 🤣 #faceswap #meme')
    const url = encodeURIComponent(shareLink)
    
    let shareUrl = ''
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`
        break
      case 'reddit':
        shareUrl = `https://www.reddit.com/submit?url=${url}&title=${text}`
        break
      default:
        return
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

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
            aria-label={`Generated face swap video result${selectedTemplate ? ` using ${selectedTemplate.name} template` : ''}`}
            title={`Face swap video result${selectedTemplate ? ` - ${selectedTemplate.name}` : ''}`}
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
          <img 
            src={result.url} 
            alt={`Generated face swap result${selectedTemplate ? ` using ${selectedTemplate.name} template` : ''}`}
            title={`Face swap result${selectedTemplate ? ` - ${selectedTemplate.name}` : ''}`}
          />
        )}
      </div>
      
      <div className="result-actions">
        <button className="download-button" onClick={onDownload}>
          📥 Download Video
        </button>
        
        <div className="share-buttons-container">
          <p className="share-label">Share to:</p>
          <div className="social-share-buttons">
            <button className="social-btn twitter" onClick={() => shareToSocial('twitter')} title="Share to Twitter">
              🐦
            </button>
            <button className="social-btn facebook" onClick={() => shareToSocial('facebook')} title="Share to Facebook">
              📘
            </button>
            <button className="social-btn whatsapp" onClick={() => shareToSocial('whatsapp')} title="Share to WhatsApp">
              💚
            </button>
            <button className="social-btn reddit" onClick={() => shareToSocial('reddit')} title="Share to Reddit">
              🤖
            </button>
            <button className="social-btn copy-link" onClick={handleShare} title="Copy Link">
              🔗
            </button>
          </div>
        </div>

        <button 
          className="create-new-btn"
          onClick={() => {
            // 如果已有选中的模板和上传的照片，直接生成新视频
            const hasRequired = isDuoInteraction 
              ? (selectedTemplate && hasRequiredImages)
              : (selectedTemplate && hasRequiredImages)
            if (hasRequired && !isProcessing && !limitReached) {
              onCreateNew(false) // 保持当前选择，重新生成
            } else {
              // 否则清空状态回到初始页面
              onCreateNew(true) // 重置所有状态
            }
          }}
        >
          ✨ Create Another
        </button>
      </div>
    </div>
  )
})

export default ResultDisplay