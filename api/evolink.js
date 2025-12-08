// Evolink proxy for AI Studio (text-to-image, text-to-video, image-to-video, video-to-video)
// Uses environment variable EVOLINK_API_KEY. Do NOT hardcode the key.

export default async function handler(req, res) {
  const API_KEY = process.env.EVOLINK_API_KEY

  // Basic CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '86400')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (!API_KEY) {
    return res.status(500).json({ success: false, error: 'EVOLINK_API_KEY is not configured' })
  }

  const ENDPOINTS = {
    'text-to-image': 'https://api.evolink.ai/v1/images/generations',
    'text-to-video': 'https://api.evolink.ai/v1/videos/generations',
    'image-to-video': 'https://api.evolink.ai/v1/videos/generations',
    'video-to-video': 'https://api.evolink.ai/v1/videos/generations',
    status: 'https://api.evolink.ai/v1/tasks'
  }

  try {
    if (req.method === 'POST') {
      const { action, payload = {}, endpointOverride } = req.body || {}
      let target = endpointOverride || ENDPOINTS[action]
      // Normalize relative targets to full Evolink host (safety for relative status endpoints)
      if (target && !target.startsWith('http')) {
        target = `https://api.evolink.ai${target.startsWith('/') ? '' : '/'}${target}`
      }
      if (!action || !target) {
        return res.status(400).json({ success: false, error: 'Invalid action or endpoint' })
      }

      // status query: GET /v1/tasks/{task_id} (per Evolink task detail docs)
      if (action === 'status') {
        let statusUrl = target
        if (statusUrl.endsWith('/tasks')) {
          statusUrl = `${statusUrl}/${encodeURIComponent(payload.task_id || '')}`
        } else if (!statusUrl.includes(payload.task_id || '')) {
          statusUrl = `${statusUrl}${statusUrl.endsWith('/') ? '' : '/'}${encodeURIComponent(payload.task_id || '')}`
        }
        const url = statusUrl
        const evoRes = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await evoRes.json().catch(() => ({}))
        if (!evoRes.ok) {
          return res.status(evoRes.status).json({ success: false, error: data?.error || data?.message || 'Evolink status error', detail: data })
        }
        return res.status(200).json({ success: true, data })
      }

      const evoRes = await fetch(target, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await evoRes.json().catch(() => ({}))
      if (!evoRes.ok) {
        return res.status(evoRes.status).json({ success: false, error: data?.error || data?.message || 'Evolink API error', detail: data })
      }

      return res.status(200).json({ success: true, data })
    }

    if (req.method === 'GET') {
      const { taskId, task, task_id, endpoint } = req.query || {}
      const resolvedTaskId = taskId || task || task_id
      let target = endpoint || ENDPOINTS.status
      // Normalize relative targets to full Evolink host (safety for older cached clients using GET polling)
      if (target && !target.startsWith('http')) {
        target = `https://api.evolink.ai${target.startsWith('/') ? '' : '/'}${target}`
      }
      if (!resolvedTaskId || !target) {
        return res.status(400).json({ success: false, error: 'Missing taskId or endpoint' })
      }

      let statusUrl = target
      if (statusUrl.endsWith('/tasks')) {
        statusUrl = `${statusUrl}/${encodeURIComponent(resolvedTaskId)}`
      } else if (!statusUrl.includes(resolvedTaskId)) {
        statusUrl = `${statusUrl}${statusUrl.endsWith('/') ? '' : '/'}${encodeURIComponent(resolvedTaskId)}`
      }
      const url = statusUrl
      const evoRes = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await evoRes.json().catch(() => ({}))
      if (!evoRes.ok) {
        return res.status(evoRes.status).json({ success: false, error: data?.error || data?.message || 'Evolink status error', detail: data })
      }

      return res.status(200).json({ success: true, data })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Evolink proxy error:', error)
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' })
  }
}
