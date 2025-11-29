import { useState } from 'react'
import { simulateRemixGeneration, simulateCommentPublish } from '../../utils/remixSimulator'
import { communityRemixMeta } from '../../data/communityPosts'

const tabs = {
  TEXT: 'text',
  CREATION: 'creation',
}

export default function CommentComposer({ postId, onAddComment }) {
  const meta = communityRemixMeta[postId]
  const [activeTab, setActiveTab] = useState(tabs.TEXT)
  const [text, setText] = useState('')
  const [creationPrompt, setCreationPrompt] = useState('')
  const [creationTemplateId, setCreationTemplateId] = useState(meta?.availableActions?.[0]?.id || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTextSubmit = async () => {
    if (!text.trim()) return
    setIsSubmitting(true)
    const comment = await simulateCommentPublish({
      type: 'text',
      text: text.trim(),
      author: {
        name: 'You',
        handle: '@you',
        avatar: 'https://i.pravatar.cc/80?img=65',
      },
    })
    onAddComment?.(postId, comment)
    setText('')
    setIsSubmitting(false)
  }

  const handleCreationSubmit = async () => {
    if (!creationTemplateId && meta?.type === 'video') {
      alert('Please choose a template action')
      return
    }
    setIsSubmitting(true)
    const remix = await simulateRemixGeneration({
      templateId: creationTemplateId,
      templateName: meta?.availableActions?.find(t => t.id === creationTemplateId)?.label,
      prompt: creationPrompt.trim(),
      mediaUrl: meta?.availableActions?.find(t => t.id === creationTemplateId)?.preview,
      author: {
        name: 'You',
        handle: '@you',
        avatar: 'https://i.pravatar.cc/80?img=65',
      },
      type: 'video',
    })
    onAddComment?.(postId, remix)
    setCreationPrompt('')
    setCreationTemplateId(meta?.availableActions?.[0]?.id || '')
    setIsSubmitting(false)
  }

  return (
    <div className="comment-composer">
      <div className="composer-tabs">
        <button
          type="button"
          className={activeTab === tabs.TEXT ? 'active' : ''}
          onClick={() => setActiveTab(tabs.TEXT)}
        >
          Text comment
        </button>
        <button
          type="button"
          className={activeTab === tabs.CREATION ? 'active' : ''}
          onClick={() => setActiveTab(tabs.CREATION)}
        >
          Remix response
        </button>
      </div>

      {activeTab === tabs.TEXT ? (
        <div className="text-panel">
          <textarea
            placeholder="Share your thoughts..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={handleTextSubmit}
            disabled={isSubmitting}
          >
            Post
          </button>
        </div>
      ) : (
        <div className="creation-panel">
          <label>Action template</label>
          <select
            value={creationTemplateId}
            onChange={e => setCreationTemplateId(e.target.value)}
          >
            {meta?.availableActions?.map(action => (
              <option key={action.id} value={action.id}>
                {action.label}
              </option>
            ))}
          </select>
          <label>Prompt / remix notes</label>
          <textarea
            placeholder="e.g., slow motion punchline reaction"
            value={creationPrompt}
            onChange={e => setCreationPrompt(e.target.value)}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={handleCreationSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Generating...' : 'Generate & comment'}
          </button>
        </div>
      )}
    </div>
  )
}
