import { communityRemixMeta } from './communityPosts'

/**
 * Demo comment threads derived from `communityRemixMeta`.
 * In a real backend, these would arrive via an API grouped by postId.
 */
export const buildCommunityComments = () => {
  const result = {}
  Object.entries(communityRemixMeta).forEach(([postId, meta]) => {
    result[postId] = meta.commentThreads?.map(thread => ({
      id: thread.id,
      type: thread.type,
      mediaUrl: thread.mediaUrl,
      templateId: thread.templateId,
      templateName: thread.templateName,
      prompt: thread.prompt,
      createdAt: thread.createdAt,
      status: thread.status,
      author: thread.author,
      text: thread.text,
    })) || []
  })
  return result
}

export const communityComments = buildCommunityComments()
