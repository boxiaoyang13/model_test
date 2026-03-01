import { reactive } from 'vue'

export function useGemini() {
  const state = reactive({
    loading: false,
    error: null,
    response: null
  })

  const sendChat = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/v1beta/models/${model}:generateContent`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: payload.prompt }]
          }],
          generationConfig: {
            temperature: payload.temperature || 0.7,
            maxOutputTokens: payload.maxTokens || 1024
          }
        })
      })

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        state.error = error
        throw error
      }

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  const sendChatStream = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/v1beta/models/${model}:streamGenerateContent`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: payload.prompt }]
          }],
          generationConfig: {
            temperature: payload.temperature || 0.7,
            maxOutputTokens: payload.maxTokens || 1024
          }
        })
      })

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        state.error = error
        throw error
      }

      const duration = Date.now() - startTime
      const chunks = []
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let hasContent = false
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // Process SSE format (data: {...})
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.slice(5).trim()
            if (jsonStr && jsonStr !== '[DONE]') {
              try {
                const data = JSON.parse(jsonStr)
                chunks.push(data)
                // Check if there's actual content in the response
                if (data.candidates && data.candidates[0]?.content?.parts) {
                  hasContent = true
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      state.response = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: {
          chunks,
          chunkCount: chunks.length,
          hasContent,
          isSSE: true
        },
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  const runReasoning = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/v1beta/models/${model}:generateContent`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: payload.prompt }]
          }],
          generationConfig: {
            temperature: payload.temperature || 0.7,
            maxOutputTokens: payload.maxTokens || 1024
          }
        })
      })

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        state.error = error
        throw error
      }

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  const runFunctionCall = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/v1beta/models/${model}:generateContent`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: payload.prompt }]
          }],
          tools: [{ functionDeclarations: payload.functions || [] }],
          generationConfig: {
            temperature: payload.temperature || 0.7,
            maxOutputTokens: payload.maxTokens || 1024
          }
        })
      })

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        state.error = error
        throw error
      }

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  const runStructured = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/v1beta/models/${model}:generateContent`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: payload.prompt }]
          }],
          generationConfig: {
            temperature: payload.temperature || 0.7,
            maxOutputTokens: payload.maxTokens || 1024,
            responseMimeType: 'application/json',
            responseSchema: payload.schema
          }
        })
      })

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        state.error = error
        throw error
      }

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  const runEmbedding = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey } = config
      const url = `${baseUrl}/v1beta/models/embedding-001:embedContent`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          content: { parts: [{ text: payload.prompt }] }
        })
      })

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        state.error = error
        throw error
      }

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  const runMultimodal = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/v1beta/models/${model}:generateContent`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: payload.prompt || 'Describe this image' },
              { inline_data: { mime_type: payload.imageType, data: payload.imageData } }
            ]
          }],
          generationConfig: {
            temperature: payload.temperature || 0.7,
            maxOutputTokens: payload.maxTokens || 1024
          }
        })
      })

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        state.error = error
        throw error
      }

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  const runBatch = async (config, payloads) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()
    const results = []

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/v1beta/models/${model}:generateContent`

      for (const payload of payloads) {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: payload.prompt }]
            }],
            generationConfig: {
              temperature: payload.temperature || 0.7,
              maxOutputTokens: payload.maxTokens || 1024
            }
          })
        })

        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
          throw error
        }

        const data = await response.json()
        results.push({ status: response.status, statusText: response.statusText, data })
      }

      const duration = Date.now() - startTime

      state.response = {
        status: 207,
        statusText: 'Multi-Status',
        headers: {},
        data: { results, count: results.length },
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  return {
    state,
    sendChat,
    sendChatStream,
    runReasoning,
    runFunctionCall,
    runStructured,
    runEmbedding,
    runMultimodal,
    runBatch
  }
}
