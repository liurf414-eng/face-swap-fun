/**
 * Lightweight helpers that mimic remix/comment persistence.
 * They simply generate IDs and resolve after a delay so the UI can show optimistic flows.
 */

const wait = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms))

let remixCounter = 0

export async function simulateRemixGeneration(payload) {
  await wait()
  remixCounter += 1
  const id = `remix-${Date.now()}-${remixCounter}`
  return {
    id,
    status: 'ready',
    createdAt: 'Just now',
    ...payload,
  }
}

export async function simulateCommentPublish(comment) {
  await wait(400)
  const id = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  return {
    id,
    createdAt: 'Just now',
    status: 'ready',
    ...comment,
  }
}
