import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Helmet } from 'react-helmet-async'
import ProgressDisplay from '../components/ProgressDisplay'
import ResultDisplay from '../components/ResultDisplay'

function CreateFromCommunityPage({ user, templates = [] }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get source content from location state
  const sourceContent = location.state?.sourceContent // { type: 'image' | 'video', url: string, postId?: string }
  const sourcePost = location.state?.sourcePost // Original post data
  const returnToPostId = location.state?.returnToPostId || null

  const [prompt, setPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [creationMode, setCreationMode] = useState('prompt') // 'prompt' | 'template'
  const [templateSearch, setTemplateSearch] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState('')
  const [result, setResult] = useState(null)
  const [clientElapsedTime, setClientElapsedTime] = useState(0)
  const [predictedTotalTime, setPredictedTotalTime] = useState(null)
  const [processingStartTime, setProcessingStartTime] = useState(null)
  const [scriptedProgress, setScriptedProgress] = useState(5.0)
  const [publishToCommunity, setPublishToCommunity] = useState(false)
  const [templateCarouselIndex, setTemplateCarouselIndex] = useState(0)
  const [showAllTemplates, setShowAllTemplates] = useState(false)

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
  const canGenerate = hasSource && !isGenerating && (
    (creationMode === 'prompt' && prompt.trim()) ||
    (creationMode === 'template' && selectedTemplate)
  )

  const filteredTemplates = useMemo(() => {
    if (!templates || templates.length === 0) return []
    const query = templateSearch.trim().toLowerCase()
    if (!query) return templates
    return templates.filter((template) => {
      const searchable = [template.name, template.category, template.description, template.tags?.join(' ')]
      return searchable.some((field) => field && field.toLowerCase().includes(query))
    })
  }, [templates, templateSearch])

  const carouselVisibleCount = 5
  const maxCarouselStart = Math.max(0, filteredTemplates.length - carouselVisibleCount)
  const topTemplates = filteredTemplates.slice(
    templateCarouselIndex,
    templateCarouselIndex + carouselVisibleCount
  )
  const canSlideNext = templateCarouselIndex < maxCarouselStart
  const canSlidePrev = templateCarouselIndex > 0
  const createButtonLabel = creationMode === 'prompt'
    ? (prompt.trim() ? 'Create with prompt' : 'Enter a prompt to start')
    : (selectedTemplate ? 'Apply template motion' : 'Select a template to start')

  const handleGenerate = async () => {
    if (!hasSource) return

    if (creationMode === 'prompt' && !prompt.trim()) {
      toast.warning('Please enter a prompt to continue')
      return
    }

    if (creationMode === 'template' && !selectedTemplate) {
      toast.warning('Please select a video template')
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
      const usingPrompt = creationMode === 'prompt'
      let apiEndpoint = '/api/ai-create'
      let requestBody = {
        prompt: usingPrompt ? prompt.trim() : `Apply ${selectedTemplate.name} motion to this ${isImage ? 'image' : 'video'}`,
        media: sourceContent.url,
        mediaType: isImage ? 'image' : 'video',
        generationMode: creationMode,
        templateId: !usingPrompt ? selectedTemplate.id : undefined,
        templateName: !usingPrompt ? selectedTemplate.name : undefined
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
        mode: creationMode,
        prompt: creationMode === 'prompt' ? prompt.trim() : '',
        templateId: creationMode === 'template' ? selectedTemplate?.id : undefined,
        templateName: creationMode === 'template' ? selectedTemplate?.name : undefined
      }
      localStorage.setItem('myVideos', JSON.stringify([newItem, ...myVideos]))
      toast.success('Saved to Me page!')
    } catch (error) {
      console.error('Failed to save to My Videos', error)
    }
  }

  const publishToCommunityFeed = (resultData) => {
    try {
      const communityPosts = JSON.parse(localStorage.getItem('community_posts') || '[]')
      const newPost = {
        id: `local-post-${Date.now()}`,
        templateId: selectedTemplate?.id || sourcePost?.templateId,
        templateName: selectedTemplate?.name || sourcePost?.templateName || 'Community Creation',
        title: creationMode === 'prompt'
          ? `"${prompt.substring(0, 50) || 'Prompt Remix'}"`
          : `Motion remix with ${selectedTemplate?.name || 'template'}`,
        description: creationMode === 'prompt'
          ? `Created from community ${isImage ? 'image' : 'video'} with prompt: ${prompt}`
          : `Applied ${selectedTemplate?.name || 'template'} action to this ${isImage ? 'image' : 'video'}`,
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
        prompt: creationMode === 'prompt' ? prompt.trim() : `Template: ${selectedTemplate?.name}`,
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

  useEffect(() => {
    if (templateCarouselIndex > maxCarouselStart) {
      setTemplateCarouselIndex(maxCarouselStart)
    }
  }, [filteredTemplates, templateCarouselIndex, maxCarouselStart])

  if (!hasSource) {
    return null // Will redirect
  }
  const hasRequiredImages = true

  return (
    <>
      <Helmet>
        <title>Create from Community - AI Content Generator | FaceAI Hub</title>
        <meta name="description" content="Transform community content with AI prompts or video templates." />
      </Helmet>

      <div className="cfc-shell">
        <main className="cfc-main-panel">
          <div className="cfc-top-bar">
            <button
              className="back-btn"
              onClick={() => {
                if (returnToPostId) {
                  navigate('/community', { state: { detailPostId: returnToPostId } })
                } else {
                  navigate('/community')
                }
              }}
            >
              Back
            </button>
            <div className="cfc-mode-tabs">
              <button
                type="button"
                className={creationMode === 'prompt' ? 'active' : ''}
                onClick={() => setCreationMode('prompt')}
              >
                Prompt
              </button>
              <button
                type="button"
                className={creationMode === 'template' ? 'active' : ''}
                onClick={() => setCreationMode('template')}
              >
                Templates
              </button>
            </div>
            <div className="cfc-session-info">
              <span>{isImage ? 'Remixing an image source' : 'Remixing a video clip'}</span>
            </div>
          </div>

          <div className="cfc-editor-grid">
            <section className="cfc-control-panel">
              <div className="cfc-source-card">
                <p className="cfc-step-label">Extend source</p>
                <div className="cfc-source-thumb">
                  {isImage ? (
                    <img src={sourceContent.url} alt="Source" />
                  ) : (
                    <video src={sourceContent.url} autoPlay loop muted playsInline />
                  )}
                </div>
                {sourcePost && (
                  <>
                    <h3>{sourcePost.title}</h3>
                    <span>{sourcePost.author?.name}</span>
                  </>
                )}
              </div>

              <div className="cfc-step-card">
                <div className="cfc-step-header">
                  <span className="cfc-step-number">2</span>
                  <div>
                    <p className="cfc-step-title">
                      {creationMode === 'prompt' ? 'Write prompt' : 'Choose template'}
                    </p>
                    <small>
                      {creationMode === 'prompt'
                        ? 'Describe your animation in detail for best motion results.'
                        : 'Select a template motion to merge with this source clip.'}
                    </small>
                  </div>
                </div>

                {creationMode === 'prompt' ? (
                  <>
                    <textarea
                      className="cfc-prompt-input"
                      value={prompt}
                      maxLength={1000}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={isImage
                        ? 'Describe how this photo should move, light, or transform...'
                        : 'Describe new camera moves, pacing, or stylistic twists...'}
                    />
                    <div className="cfc-prompt-hints">
                      {(isImage
                        ? ['Add neon contours and subtle blink', 'Transform into painted concept art']
                        : ['Slow zoom with dramatic smoke', 'Convert into anime style fight scene']
                      ).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setPrompt(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                      <span className="cfc-char-count">{prompt.length}/1000</span>
                    </div>
                  </>
                ) : (
                  <div className="cfc-template-panel">
                    <div className="cfc-template-panel-top">
                      <input
                        type="text"
                        className="cfc-template-search"
                        placeholder="Search templates by name or vibe"
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                      />
                      <div className="cfc-carousel-controls">
                        <button
                          type="button"
                          onClick={() => setTemplateCarouselIndex((prev) => Math.max(0, prev - 1))}
                          disabled={!canSlidePrev}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateCarouselIndex((prev) => Math.min(maxCarouselStart, prev + 1))}
                          disabled={!canSlideNext}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                    <div className="cfc-template-carousel">
                      {topTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          className={`cfc-carousel-card ${selectedTemplate?.id === template.id ? 'active' : ''}`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <div className="card-media">
                            <video src={template.gifUrl} autoPlay loop muted playsInline />
                          </div>
                          <div className="card-labels">
                            <strong>{template.name}</strong>
                            <span>{template.category}</span>
                          </div>
                        </button>
                      ))}
                      {topTemplates.length === 0 && (
                        <p className="cfc-empty-text">No templates match that search.</p>
                      )}
                    </div>
                    <div className="cfc-carousel-footer">
                      <button
                        type="button"
                        className="cfc-more-btn"
                        onClick={() => setShowAllTemplates(true)}
                      >
                        More ▾
                      </button>
                      <span>{filteredTemplates.length} templates</span>
                    </div>
                    {showAllTemplates && (
                      <div className="cfc-all-templates-panel">
                        <div className="cfc-all-templates-header">
                          <div>
                            <h4>Browse all templates</h4>
                            <p>Select any motion from the grid below.</p>
                          </div>
                          <button type="button" onClick={() => setShowAllTemplates(false)}>Close</button>
                        </div>
                        <div className="cfc-all-template-grid">
                          {filteredTemplates.map((template) => (
                            <button
                              key={`all-${template.id}`}
                              type="button"
                              className={`cfc-grid-card ${selectedTemplate?.id === template.id ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedTemplate(template)
                                setCreationMode('template')
                                setShowAllTemplates(false)
                              }}
                            >
                              <video src={template.gifUrl} autoPlay loop muted playsInline />
                              <div>
                                <strong>{template.name}</strong>
                                <span>{template.category}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="cfc-premium-row">
                  <label>
                    <input type="checkbox" disabled />
                    Premium model
                  </label>
                  <button type="button" className="cfc-upgrade-pill">Upgrade</button>
                </div>
              </div>

              {user && (
                <div className="cfc-publish-card">
                  <label>
                    <input
                      type="checkbox"
                      checked={publishToCommunity}
                      onChange={(e) => setPublishToCommunity(e.target.checked)}
                    />
                    Publish to Community when finished
                  </label>
                  <small>Your video still saves privately under “Me”.</small>
                </div>
              )}

              <div className="cfc-generate-card">
                {isGenerating ? (
                  <ProgressDisplay
                    progress={scriptedProgress}
                    processingStatus={processingStatus}
                    elapsedTime={clientElapsedTime}
                    predictedTotalTime={predictedTotalTime}
                  />
                ) : (
                  <button
                    className="cfc-create-btn"
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                  >
                    {createButtonLabel}
                    <span className="cfc-credit-pill">30</span>
                  </button>
                )}
              </div>
            </section>

            <section className="cfc-preview-panel">
              {result ? (
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
                    setCreationMode('prompt')
                  }}
                  isDuoInteraction={false}
                  hasRequiredImages={hasRequiredImages}
                  isProcessing={isGenerating}
                  limitReached={false}
                />
              ) : (
                <div className="cfc-preview-placeholder">
                  <div className="cfc-preview-ghost">
                    {isImage ? (
                      <img src={sourceContent.url} alt="Source preview" />
                    ) : (
                      <video src={sourceContent.url} autoPlay loop muted playsInline />
                    )}
                  </div>
                  <p>Choose a photo to start</p>
                  <span>Use prompts or template motions from the left panel.</span>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  )
}

export default CreateFromCommunityPage

