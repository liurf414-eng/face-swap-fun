import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Helmet } from 'react-helmet-async'
import ProgressDisplay from '../components/ProgressDisplay'
import ResultDisplay from '../components/ResultDisplay'
import LazyVideoCard from '../components/LazyVideoCard'

function CreateFromCommunityPage({ user, templates = [] }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get source content from location state
  const sourceContent = location.state?.sourceContent // { type: 'image' | 'video', url: string, postId?: string }
  const sourcePost = location.state?.sourcePost // Original post data
  
  const [prompt, setPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState('')
  const [result, setResult] = useState(null)
  const [clientElapsedTime, setClientElapsedTime] = useState(0)
  const [predictedTotalTime, setPredictedTotalTime] = useState(null)
  const [processingStartTime, setProcessingStartTime] = useState(null)
  const [scriptedProgress, setScriptedProgress] = useState(5.0)
  const [publishToCommunity, setPublishToCommunity] = useState(false)

  // Redirect if no source content
  useEffect(() => {
    if (!sourceContent) {
      toast.warning('No content selected. Redirecting to community...')
      navigate('/community')
    }
  }, [sourceContent, navigate])

  const isImage = sourceContent?.type === 'image'
  const isVideo = sourceContent?.type === 'video'
  const hasSource = !!sourceContent

  // Check if user has provided either prompt or template
  const canGenerate = hasSource && !isGenerating && (prompt.trim() || selectedTemplate)

  const handleGenerate = async () => {
    if (!canGenerate) {
      if (!prompt.trim() && !selectedTemplate) {
        toast.warning('Please enter a prompt or select a video template')
      }
      return
    }

    setIsGenerating(true)
    setProcessingStartTime(Date.now())
    setClientElapsedTime(0)
    setScriptedProgress(5.0)
    setResult(null)
    setProcessingStatus('Processing your creation...')

    try {
      // Determine generation type
      let apiEndpoint = '/api/ai-create'
      let requestBody = {
        prompt: prompt.trim() || (selectedTemplate ? `Apply ${selectedTemplate.name} template action` : 'Transform this content'),
        media: sourceContent.url,
        mediaType: isImage ? 'image' : 'video',
      }

      // If template is selected, we might need to use face-swap API instead
      // For now, we'll use ai-create with template info in prompt
      if (selectedTemplate && !prompt.trim()) {
        // Use template-based generation (face swap style)
        // This would need to be adapted based on your actual API
        requestBody.prompt = `Apply ${selectedTemplate.name} template action to this ${isImage ? 'image' : 'video'}`
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Generation failed')
      }

      // Handle async task
      if (data.taskId) {
        let pollAttempts = 0
        const MAX_POLL_ATTEMPTS = 300

        const pollTask = async () => {
          try {
            pollAttempts++
            if (pollAttempts > MAX_POLL_ATTEMPTS) {
              throw new Error('Processing timeout. Please try again later.')
            }

            const statusResponse = await fetch(`/api/ai-create?taskId=${data.taskId}`)
            if (!statusResponse.ok) {
              throw new Error(`Status check failed: ${statusResponse.status}`)
            }

            const statusData = await statusResponse.json()

            if (!statusData.success) {
              throw new Error(statusData.error || 'Task failed')
            }

            setProcessingStatus(statusData.message || 'Processing...')
            setProgress(statusData.progress || 0)
            setScriptedProgress(Math.min(99, (statusData.progress || 0) * 0.99))

            if (statusData.status === 'completed') {
              setProcessingStatus('Complete!')
              setProgress(100)
              setScriptedProgress(100)
              
              const resultData = {
                url: statusData.result,
                type: isImage && selectedTemplate ? 'video' : (isVideo ? 'video' : 'image')
              }
              setResult(resultData)
              
              // Save to Me page
              if (user) {
                saveToMyList(resultData)
                
                // Optionally publish to community
                if (publishToCommunity) {
                  publishToCommunityFeed(resultData)
                }
              }
              
              setIsGenerating(false)
              setProcessingStartTime(null)
              setClientElapsedTime(0)
              toast.success('✨ Creation complete!')
            } else if (statusData.status === 'failed') {
              throw new Error(statusData.error || 'Generation failed')
            } else {
              setTimeout(pollTask, 1000)
            }
          } catch (error) {
            console.error('Polling error:', error)
            setIsGenerating(false)
            setProcessingStartTime(null)
            setClientElapsedTime(0)
            setScriptedProgress(5.0)
            toast.error(`Generation failed: ${error.message}`)
          }
        }

        setTimeout(pollTask, 1000)
      } else {
        // Sync response
        const resultData = {
          url: data.result,
          type: isImage && selectedTemplate ? 'video' : (isVideo ? 'video' : 'image')
        }
        setResult(resultData)
        
        if (user) {
          saveToMyList(resultData)
          if (publishToCommunity) {
            publishToCommunityFeed(resultData)
          }
        }
        
        setIsGenerating(false)
        setProcessingStartTime(null)
        setClientElapsedTime(0)
        setScriptedProgress(100)
        toast.success('✨ Creation complete!')
      }
    } catch (error) {
      console.error('Generation error:', error)
      setIsGenerating(false)
      setProcessingStartTime(null)
      setClientElapsedTime(0)
      setScriptedProgress(5.0)
      toast.error(`Generation failed: ${error.message}`)
    }
  }

  const saveToMyList = (resultData) => {
    try {
      const myVideos = JSON.parse(localStorage.getItem('myVideos') || '[]')
      const newItem = {
        id: Date.now(),
        url: resultData.url,
        type: resultData.type,
        timestamp: new Date().toISOString(),
        userId: user.sub,
        source: 'community_creation',
        prompt: prompt.trim() || (selectedTemplate ? `Template: ${selectedTemplate.name}` : ''),
        templateId: selectedTemplate?.id
      }
      localStorage.setItem('myVideos', JSON.stringify([newItem, ...myVideos]))
      toast.success('Saved to Me page!')
    } catch (error) {
      console.error('Failed to save to My Videos', error)
    }
  }

  const publishToCommunityFeed = (resultData) => {
    try {
      const communityPosts = JSON.parse(localStorage.getItem('community_local_posts') || '[]')
      const newPost = {
        id: `local-post-${Date.now()}`,
        templateId: selectedTemplate?.id || sourcePost?.templateId,
        templateName: selectedTemplate?.name || sourcePost?.templateName || 'Community Creation',
        title: prompt.trim() ? `"${prompt.substring(0, 50)}"` : `Remix of ${sourcePost?.title || 'Community Content'}`,
        description: `Created from community ${isImage ? 'image' : 'video'}${prompt.trim() ? ` with prompt: ${prompt}` : selectedTemplate ? ` using ${selectedTemplate.name} template` : ''}`,
        author: {
          name: user.name,
          avatar: user.picture,
          handle: `@${user.name.replace(/\s/g, '').toLowerCase()}`
        },
        metrics: {
          likes: 0,
          remixes: 0,
          views: 0,
          shares: 0
        },
        createdAt: 'Just now',
        tags: ['remix', 'community', 'new'],
        isFeatured: false,
        isFriendPost: true,
        clipUrl: resultData.url,
        prompt: prompt.trim() || (selectedTemplate ? `Template: ${selectedTemplate.name}` : ''),
        soundtrack: 'Original Audio',
        supportsPlusOne: selectedTemplate?.category === 'Duo Interaction'
      }
      localStorage.setItem('community_posts', JSON.stringify([newPost, ...communityPosts]))
      toast.success('🎉 Published to Community Feed!')
    } catch (error) {
      console.error('Failed to publish to community', error)
    }
  }

  useEffect(() => {
    let timer
    if (isGenerating && processingStartTime) {
      timer = setInterval(() => {
        setClientElapsedTime((Date.now() - processingStartTime) / 1000)
      }, 100)
    } else {
      setClientElapsedTime(0)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isGenerating, processingStartTime])

  useEffect(() => {
    let scriptedTimer
    if (isGenerating && predictedTotalTime && predictedTotalTime > 0) {
      const incrementPerInterval = 40 / predictedTotalTime
      scriptedTimer = setInterval(() => {
        setScriptedProgress(prev => {
          if (result) return 100
          if (prev >= 98.9) return 99
          const next = prev + incrementPerInterval
          if (next >= 98.9) return 98.9
          return parseFloat(next.toFixed(1))
        })
      }, 400)
    } else if (isGenerating) {
      scriptedTimer = setInterval(() => {
        setScriptedProgress(prev => {
          if (result) return 100
          if (prev >= 98.9) return 99
          const next = prev + 1.5
          if (next >= 98.9) return 98.9
          return parseFloat(next.toFixed(1))
        })
      }, 400)
    } else {
      setScriptedProgress(result ? 100 : 5.0)
    }
    return () => {
      if (scriptedTimer) clearInterval(scriptedTimer)
    }
  }, [isGenerating, result, predictedTotalTime])

  if (!hasSource) {
    return null // Will redirect
  }

  return (
    <>
      <Helmet>
        <title>Create from Community - AI Content Generator | FaceAI Hub</title>
        <meta name="description" content="Transform community content with AI prompts or video templates." />
      </Helmet>

      <main className="create-from-community-page">
        <div className="create-header">
          <button className="back-btn" onClick={() => navigate('/community')}>
            ← Back to Community
          </button>
          <h1>Create from Community</h1>
          <p>Transform this {isImage ? 'image' : 'video'} with AI</p>
        </div>

        {result ? (
          <div className="result-section">
            <ResultDisplay
              result={result}
              selectedTemplate={selectedTemplate}
              onDownload={async () => {
                try {
                  const response = await fetch(result.url)
                  const blob = await response.blob()
                  const url = window.URL.createObjectURL(blob)
                  const fileExtension = result.url.split('.').pop().split('?')[0]
                  const fileName = `community-creation-${Date.now()}.${fileExtension}`
                  const link = document.createElement('a')
                  link.href = url
                  link.download = fileName
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  window.URL.revokeObjectURL(url)
                } catch (error) {
                  toast.error('Download failed')
                }
              }}
              onCreateNew={() => {
                setResult(null)
                setPrompt('')
                setSelectedTemplate(null)
              }}
              isDuoInteraction={false}
              hasRequiredImages={true}
              isProcessing={false}
              limitReached={false}
            />
          </div>
        ) : (
          <div className="create-content">
            {/* Source Preview */}
            <div className="source-preview-section">
              <h2>Source {isImage ? 'Image' : 'Video'}</h2>
              <div className="source-preview">
                {isImage ? (
                  <img src={sourceContent.url} alt="Source" />
                ) : (
                  <video src={sourceContent.url} controls />
                )}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="prompt-section">
              <h2>Option 1: Enter Prompt (Optional)</h2>
              <p className="section-hint">
                {isImage 
                  ? 'Describe how to transform this image (e.g., "Make the person dance", "Add magical effects", "Change to cyberpunk style")'
                  : 'Describe how to modify this video (e.g., "Add slow motion", "Change to black and white", "Add explosion effects")'}
              </p>
              <textarea
                className="prompt-input-large"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={isImage 
                  ? "Describe how to transform this image... (e.g., Make the person dance smoothly, add flowing effects)"
                  : "Describe how to modify this video... (e.g., Add slow motion, change style, add effects)"}
                rows={6}
              />
            </div>

            {/* Template Selector */}
            <div className="template-section">
              <h2>Option 2: Choose Video Template (Optional)</h2>
              <p className="section-hint">
                {isImage 
                  ? 'Select a video template to apply its action to this image'
                  : 'Select a video template to combine with this video'}
              </p>
              <div className="template-grid-mini">
                {templates.slice(0, 12).map((template) => (
                  <LazyVideoCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onSelect={() => setSelectedTemplate(template)}
                    showLink={false}
                  />
                ))}
              </div>
              {templates.length > 12 && (
                <button
                  className="view-all-templates-btn"
                  onClick={() => navigate('/')}
                >
                  View All Templates →
                </button>
              )}
            </div>

            {/* Publish Option */}
            {user && (
              <div className="publish-section">
                <label className="publish-checkbox">
                  <input
                    type="checkbox"
                    checked={publishToCommunity}
                    onChange={(e) => setPublishToCommunity(e.target.checked)}
                  />
                  <span>Publish to Community after generation</span>
                </label>
              </div>
            )}

            {/* Generate Button */}
            <div className="generate-section">
              {isGenerating ? (
                <ProgressDisplay
                  progress={scriptedProgress}
                  processingStatus={processingStatus}
                  elapsedTime={clientElapsedTime}
                  predictedTotalTime={predictedTotalTime}
                />
              ) : (
                <button
                  className="generate-btn-large"
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                >
                  {!prompt.trim() && !selectedTemplate 
                    ? '✍️ Enter prompt or select template' 
                    : '✨ Generate'}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  )
}

export default CreateFromCommunityPage

