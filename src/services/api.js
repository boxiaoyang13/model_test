const API_BASE_URL = 'http://127.0.0.1:8080/api'

export const favoritesAPI = {
  // Get favorites by protocol
  async getFavorites(protocol) {
    const response = await fetch(`${API_BASE_URL}/favorites/${protocol}`)
    if (!response.ok) throw new Error('Failed to fetch favorites')
    const data = await response.json()
    return data.data
  },

  // Create favorite
  async createFavorite(protocol, name, bodyContent) {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocol, name, body_content: bodyContent })
    })
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Favorite name already exists')
      }
      throw new Error('Failed to create favorite')
    }
    const data = await response.json()
    return data.data
  },

  // Update favorite
  async updateFavorite(id, name, bodyContent) {
    const response = await fetch(`${API_BASE_URL}/favorites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, body_content: bodyContent })
    })
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Favorite name already exists')
      }
      throw new Error('Failed to update favorite')
    }
    const data = await response.json()
    return data.data
  },

  // Delete favorite
  async deleteFavorite(id) {
    const response = await fetch(`${API_BASE_URL}/favorites/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete favorite')
  }
}

// Helper function for proxy requests
async function proxyRequest(url, headers, body, method = 'POST', isStream = false) {
  const endpoint = isStream ? '/proxy/stream' : '/proxy'
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, method, headers, body })
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  if (isStream) {
    return handleStreamResponse(response)
  }

  return await response.json()
}

// Helper for binary requests (like video download)
async function proxyBinaryRequest(url, headers) {
  const response = await fetch(`${API_BASE_URL}/proxy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, method: 'GET', headers, body: null })
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const blob = await response.blob()
  const duration = response.headers.get('X-Duration')

  return {
    status: response.status,
    statusText: response.statusText,
    data: blob,
    duration: duration ? parseInt(duration) : 0
  }
}

// Handle streaming response
async function handleStreamResponse(response) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const chunks = []
  let chunkCount = 0
  let hasContent = false
  let hasDeltaContent = false
  let hasDeltaText = false
  let isSSE = false
  let duration = 0

  const text = await response.text()
  const lines = text.split('\n')

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6))
        if (data.chunkCount !== undefined) {
          chunkCount = data.chunkCount
          hasContent = data.hasContent ?? hasContent
          hasDeltaContent = data.hasDeltaContent ?? hasDeltaContent
          hasDeltaText = data.hasDeltaText ?? hasDeltaText
          isSSE = data.isSSE ?? isSSE
          duration = data.duration ?? duration
        }
      } catch (e) {
        // SSE data chunks - collect them
        if (line !== 'data: [DONE]') {
          chunks.push(line.slice(6))
          chunkCount++

          if (line.includes('"content"') || line.includes('"text"')) {
            hasContent = true
          }
          if (line.includes('"delta"')) {
            hasDeltaContent = true
          }
          if (line.includes('delta_text') || line.includes('text_delta')) {
            hasDeltaText = true
          }
          if (line.includes('data: ') || line.includes('event:')) {
            isSSE = true
          }
        }
      }
    }
  }

  return {
    status: 200,
    statusText: 'OK',
    data: {
      chunks,
      chunkCount,
      hasContent,
      hasDeltaContent,
      hasDeltaText,
      isSSE
    },
    duration
  }
}

// Build headers for different protocols
function buildHeaders(apiKey, vendor, nodeGroup, protocol) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  switch (protocol) {
    case 'anthropic':
      headers['x-api-key'] = apiKey
      break
    case 'gemini':
      headers['x-goog-api-key'] = apiKey
      break
    case 'openai':
      headers['Authorization'] = `Bearer ${apiKey}`
      break
  }

  if (vendor) {
    headers['X-Zenlayer-Vendor'] = vendor
  }
  if (nodeGroup) {
    headers['X-Zenlayer-Node-Group'] = nodeGroup
  }

  return headers
}

// Unified proxy API
export const proxyAPI = {
  // Generic request
  request: async (config, payload, options = {}) => {
    const { baseUrl, apiKey, model, vendor, nodeGroup } = config
    const { protocol = 'gemini', operation = 'chat', method = 'POST' } = options

    // Build URL based on protocol and operation
    let url
    switch (protocol) {
      case 'anthropic':
        url = `${baseUrl}/messages`
        break
      case 'gemini':
        if (operation === 'stream') {
          url = `${baseUrl}/v1beta/models/${model}:streamGenerateContent?alt=sse`
        } else if (operation === 'video') {
          url = `${baseUrl}/v1beta/models/${model}:predictLongRunning`
        } else {
          url = `${baseUrl}/v1beta/models/${model}:generateContent`
        }
        break
      case 'openai':
        if (operation === 'image') {
          url = `${baseUrl}/v1/images/generations`
        } else if (operation === 'video') {
          url = `${baseUrl}/v1/videos`
        } else {
          url = `${baseUrl}/chat/completions`
        }
        break
    }

    const headers = buildHeaders(apiKey, vendor, nodeGroup, protocol)
    const isStream = operation === 'stream'

    return await proxyRequest(url, headers, payload, method, isStream)
  },

  // GET request for status polling
  get: async (config, url) => {
    const { apiKey, vendor, nodeGroup } = config
    const headers = buildHeaders(apiKey, vendor, nodeGroup, 'gemini') // Default to gemini, will be overridden
    return await proxyRequest(url, headers, null, 'GET')
  },

  // Binary request for video download
  binary: async (config, url) => {
    const { apiKey, vendor, nodeGroup } = config
    const headers = buildHeaders(apiKey, vendor, nodeGroup, 'openai')
    return await proxyBinaryRequest(url, headers)
  },

  // Anthropic
  anthropic: {
    chat: (config, payload) => proxyAPI.request(config, payload, { protocol: 'anthropic', operation: 'chat' }),
    stream: (config, payload) => proxyAPI.request(config, payload, { protocol: 'anthropic', operation: 'stream' }),
  },

  // Gemini
  gemini: {
    chat: (config, payload) => proxyAPI.request(config, payload, { protocol: 'gemini', operation: 'chat' }),
    stream: (config, payload) => proxyAPI.request(config, payload, { protocol: 'gemini', operation: 'stream' }),
    image: (config, payload) => proxyAPI.request(config, payload, { protocol: 'gemini', operation: 'chat' }),
    video: (config, payload) => proxyAPI.request(config, payload, { protocol: 'gemini', operation: 'video' }),
    videoStatus: async (config, operationId) => {
      const { baseUrl, model } = config
      const url = `${baseUrl}/v1beta/models/${model}/operations/${operationId}`
      const { apiKey, vendor, nodeGroup } = config
      const headers = buildHeaders(apiKey, vendor, nodeGroup, 'gemini')
      return await proxyRequest(url, headers, null, 'GET')
    }
  },

  // OpenAI
  openai: {
    chat: (config, payload) => proxyAPI.request(config, payload, { protocol: 'openai', operation: 'chat' }),
    stream: (config, payload) => proxyAPI.request(config, payload, { protocol: 'openai', operation: 'stream' }),
    image: (config, payload) => proxyAPI.request(config, payload, { protocol: 'openai', operation: 'image' }),
    video: (config, payload) => proxyAPI.request(config, payload, { protocol: 'openai', operation: 'video' }),
    videoStatus: async (config, videoId) => {
      const { baseUrl } = config
      const url = `${baseUrl}/v1/videos/${videoId}`
      const { apiKey, vendor, nodeGroup } = config
      const headers = buildHeaders(apiKey, vendor, nodeGroup, 'openai')
      return await proxyRequest(url, headers, null, 'GET')
    },
    videoDownload: async (config, videoId) => {
      const { baseUrl } = config
      const url = `${baseUrl}/v1/videos/${videoId}/content`
      return await proxyAPI.binary(config, url)
    }
  }
}
