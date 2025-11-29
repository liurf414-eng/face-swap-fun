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
      alert('请选择一个模板动作')
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
          文字评论
        </button>
        <button
          type="button"
          className={activeTab === tabs.CREATION ? 'active' : ''}
          onClick={() => setActiveTab(tabs.CREATION)}
        >
          创作回应
        </button>
      </div>

      {activeTab === tabs.TEXT ? (
        <div className="text-panel">
          <textarea
            placeholder="分享你的想法..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={handleTextSubmit}
            disabled={isSubmitting}
          >
            发布
          </button>
        </div>
      ) : (
        <div className="creation-panel">
          <label>动作模板</label>
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
          <label>提示词 / 二创说明</label>
          <textarea
            placeholder="例如：slow motion punchline reaction"
            value={creationPrompt}
            onChange={e => setCreationPrompt(e.target.value)}
          />
          <button
            type="button"
            className="primary-btn"
            onClick={handleCreationSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '生成中...' : '生成并评论'}
          </button>
        </div>
      )}
    </div>
  )
}
