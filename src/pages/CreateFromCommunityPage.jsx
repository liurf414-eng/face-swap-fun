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

  const topTemplates = filteredTemplates.slice(0, 12)

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
            ← Back to Community
          </button>
          <h1>Create from Community</h1>
          <p>Transform this {isImage ? 'image' : 'video'} with AI</p>
        </div>

        <div className="create-grid">
          <div className="create-left-column">
            <section className="create-card source-card">
              <div className="source-header">
                <div>
                  <p className="section-label">Step 1 · Source</p>
                  <h2>{isImage ? 'Remixing an Image' : 'Remixing a Video'}</h2>
                </div>
                {sourcePost && (
                  <div className="source-author">
                    <img src={sourcePost.author.avatar} alt={sourcePost.author.name} />
                    <div>
                      <strong>{sourcePost.author.name}</strong>
                      <span>{sourcePost.author.handle}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="source-preview">
                {isImage ? (
                  <img src={sourceContent.url} alt="Source" />
                ) : (
                  <video src={sourceContent.url} autoPlay loop muted controls />
                )}
              </div>
              {sourcePost && (
                <div className="source-meta">
                  <p className="source-title">{sourcePost.title}</p>
                  <div className="source-tags">
                    {sourcePost.tags?.slice(0, 3).map(tag => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="create-card mode-card">
              <p className="section-label">Step 2 · Choose Method</p>
              <div className="mode-toggle">
                <button
                  className={`mode-option ${creationMode === 'prompt' ? 'active' : ''}`}
                  onClick={() => setCreationMode('prompt')}
                >
                  ✍️ Prompt Remix
                </button>
                <button
                  className={`mode-option ${creationMode === 'template' ? 'active' : ''}`}
                  onClick={() => setCreationMode('template')}
                >
                  🎬 Template Motion
                </button>
              </div>
              <p className="mode-hint">
                {creationMode === 'prompt'
                  ? 'Describe how this content should change.'
                  : 'Pick a motion template to apply to this content.'}
              </p>
            </section>

            {creationMode === 'prompt' ? (
              <section className="create-card prompt-card">
                <div className="prompt-header">
                  <h3>Describe your twist</h3>
                  <span>{prompt.length}/500</span>
                </div>
                <textarea
                  className="prompt-input-large"
                  value={prompt}
                  maxLength={500}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={isImage 
                    ? 'e.g., Make him blink and smile with neon cyberpunk lighting'
                    : 'e.g., Slow motion hero entrance with smoke and dramatic lighting'}
                  rows={6}
                />
                <div className="prompt-suggestions">
                  {(isImage
                    ? ['Animate this photo', 'Add cinematic lighting', 'Turn into a 3D render']
                    : ['Add camera shake + zoom', 'Convert to anime fight scene', 'Add slow motion reveal']
                  ).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setCreationMode('prompt')
                        setPrompt(suggestion)
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <section className="create-card template-card">
                <div className="template-toolbar">
                  <input
                    type="text"
                    className="template-search"
                    placeholder="Search templates by name or category"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                  />
                  <span>{filteredTemplates.length} templates</span>
                </div>
                <div className="template-grid-mini">
                  {topTemplates.map((template) => (
                    <LazyVideoCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate?.id === template.id}
                      onSelect={() => {
                        setCreationMode('template')
                        setSelectedTemplate(template)
                      }}
                      showLink={false}
                    />
                  ))}
                </div>
                {filteredTemplates.length === 0 && (
                  <p className="empty-text">No templates found. Try a different keyword.</p>
                )}
                {templates.length > topTemplates.length && (
                  <button
                    className="view-all-templates-btn"
                    onClick={() => navigate('/')}
                  >
                    Browse full template library →
                  </button>
                )}
              </section>
            )}

            {user && (
              <section className="create-card publish-card">
                <label className="publish-checkbox">
                  <input
                    type="checkbox"
                    checked={publishToCommunity}
                    onChange={(e) => setPublishToCommunity(e.target.checked)}
                  />
                  <span>Publish to Community when finished</span>
                </label>
                <p className="publish-hint">Your result always saves to “Me”. Publishing is optional.</p>
              </section>
            )}

            <section className="create-card generate-card">
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
                  {creationMode === 'prompt'
                    ? (prompt.trim() ? '✨ Generate with Prompt' : '✍️ Enter a prompt to start')
                    : (selectedTemplate ? '✨ Apply Template Motion' : '🎬 Select a template to start')}
                </button>
              )}
            </section>
          </div>

          <div className="create-right-column">
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
                hasRequiredImages
                isProcessing={isGenerating}
                limitReached={false}
              />
            ) : (
              <div className="preview-card">
                <div className="preview-media">
                  {isImage ? (
                    <img src={sourceContent.url} alt="Preview" />
                  ) : (
                    <video src={sourceContent.url} autoPlay loop muted controls />
                  )}
                </div>
                <div className="preview-info">
                  <h3>Ready to create?</h3>
                  <p>Use a prompt or pick a motion template to twist this community creation.</p>
                  <ul>
                    <li>Prompt Remix: describe style, actions, or mood</li>
                    <li>Template Motion: apply trending meme motions instantly</li>
                    <li>Results auto-save to “Me” and can be published</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default CreateFromCommunityPage

