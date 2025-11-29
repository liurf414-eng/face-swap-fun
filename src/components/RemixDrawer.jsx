import { useEffect, useMemo, useState } from 'react'
import { communityRemixMeta } from '../data/communityPosts'
import { simulateRemixGeneration } from '../utils/remixSimulator'

function getPostMeta(postId) {
  return communityRemixMeta[postId]
}

const creationModes = {
  TEMPLATE: 'template',
  PROMPT: 'prompt',
}

function TemplatePicker({ templates = [], selectedId, onSelect }) {
  if (!templates.length) {
    return <p className="remix-empty">暂无可用模板</p>
  }

  return (
    <div className="remix-templates">
      {templates.map(template => {
        const isActive = selectedId === template.id
        return (
          <button
            key={template.id}
            type="button"
            className={`template-pill ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(template.id)}
          >
            <span>{template.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function CreationForm({
  meta,
  creationMode,
  setCreationMode,
  templateId,
  setTemplateId,
  prompt,
  setPrompt,
  faceImage,
  setFaceImage,
}) {
  const supportsPromptMode = meta?.type === 'video'

  return (
    <div className="remix-form">
      {supportsPromptMode && (
        <div className="form-row">
          <label>创作模式</label>
          <div className="mode-toggle">
            <button
              type="button"
              className={creationMode === creationModes.TEMPLATE ? 'active' : ''}
              onClick={() => setCreationMode(creationModes.TEMPLATE)}
            >
              视频模板
            </button>
            <button
              type="button"
              className={creationMode === creationModes.PROMPT ? 'active' : ''}
              onClick={() => setCreationMode(creationModes.PROMPT)}
            >
              Prompt 合成
            </button>
          </div>
        </div>
      )}

      {(creationMode === creationModes.TEMPLATE || !supportsPromptMode) && (
        <>
          <div className="form-row">
            <label>选择动作模板</label>
            <TemplatePicker
              templates={meta?.availableActions}
              selectedId={templateId}
              onSelect={setTemplateId}
            />
          </div>
          <div className="form-row">
            <label>描述（可选）</label>
            <textarea
              value={prompt}
              placeholder="例如：neon cyber dance showdown"
              onChange={e => setPrompt(e.target.value)}
            />
          </div>
        </>
      )}

      {(!supportsPromptMode || creationMode === creationModes.TEMPLATE) && (
        <div className="form-row">
          <label>上传/贴入你的脸图</label>
          <input
            type="text"
            placeholder="粘贴图片链接或 base64"
            value={faceImage}
            onChange={e => setFaceImage(e.target.value)}
          />
          <p className="hint">真实环境会提供上传按钮，这里用链接模拟。</p>
        </div>
      )}

      {creationMode === creationModes.PROMPT && (
        <div className="form-row">
          <label>生成描述</label>
          <textarea
            value={prompt}
            placeholder="Describe the video you想生成..."
            onChange={e => setPrompt(e.target.value)}
          />
          <p className="hint">我们会调用 text-to-video / image-to-video 引擎。</p>
        </div>
      )}
    </div>
  )
}

export default function RemixDrawer({ post, open, onClose, onFinish, seed = null }) {
  const meta = useMemo(() => (post ? getPostMeta(post.id) : null), [post])
  const [creationMode, setCreationMode] = useState(creationModes.TEMPLATE)
  const [templateId, setTemplateId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [faceImage, setFaceImage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supportsPromptMode = meta?.type === 'video'

  useEffect(() => {
    if (!seed) return
    if (seed.templateId) setTemplateId(seed.templateId)
    if (seed.prompt) setPrompt(seed.prompt)
  }, [seed])

  const resetForm = () => {
    setCreationMode(creationModes.TEMPLATE)
    setTemplateId('')
    setPrompt('')
    setFaceImage('')
  }

  const handleSubmit = async () => {
    if (!meta) return
    if ((creationMode === creationModes.TEMPLATE || !supportsPromptMode) && !templateId) {
      alert('请选择一个动作模板')
      return
    }
    setIsSubmitting(true)
    const payload = {
      postId: post.id,
      mode: creationMode,
      templateId: creationMode === creationModes.TEMPLATE ? templateId : null,
      prompt: prompt.trim(),
      faceImage: faceImage.trim(),
      mediaUrl: creationMode === creationModes.TEMPLATE
        ? meta.availableActions?.find(t => t.id === templateId)?.preview
        : undefined,
      type: 'video',
      author: seed?.author || {
        name: 'You',
        handle: '@you',
        avatar: 'https://i.pravatar.cc/80?img=65',
      },
    }
    const remix = await simulateRemixGeneration(payload)
    setIsSubmitting(false)
    onFinish?.(remix)
    resetForm()
    onClose?.()
  }

  const rootClass = `remix-drawer ${open ? 'open' : ''}`

  return (
    <div className={rootClass} aria-hidden={!open}>
      <div className="remix-panel">
        <div className="remix-head">
          <div>
            <p className="label">Remix</p>
            <h3>{post?.title}</h3>
          </div>
          <button className="close-btn" onClick={onClose} type="button">╳</button>
        </div>

        {meta ? (
          <>
            <CreationForm
              meta={meta}
              creationMode={creationMode}
              setCreationMode={setCreationMode}
              templateId={templateId}
              setTemplateId={setTemplateId}
              prompt={prompt}
              setPrompt={setPrompt}
              faceImage={faceImage}
              setFaceImage={setFaceImage}
            />

            <button
              type="button"
              className="primary-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '生成中...' : '生成并发布'}
            </button>
          </>
        ) : (
          <p className="remix-empty">选择一条帖子开始二创</p>
        )}
      </div>
      <div className="remix-mask" onClick={onClose} />
    </div>
  )
}
