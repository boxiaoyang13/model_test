import { reactive } from 'vue'

export function useAnthropic() {
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
      const url = `${baseUrl}/v1/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: payload.prompt }]
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
      const url = `${baseUrl}/v1/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: payload.prompt }],
          stream: true
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

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      state.response = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: { chunks, chunkCount: chunks.length },
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
      const url = `${baseUrl}/v1/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: payload.prompt }]
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
      const url = `${baseUrl}/v1/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: payload.prompt }],
          tools: payload.functions || []
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
      const url = `${baseUrl}/v1/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: `${payload.prompt}\n\nPlease respond with valid JSON only.` }]
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
    const error = new Error('Embeddings are not supported by Anthropic API')
    state.error = error
    throw error
  }

  const runMultimodal = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/v1/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: payload.prompt || 'Describe this image' },
              { type: 'image', source: { type: 'base64', media_type: payload.imageType, data: payload.imageData } }
            ]
          }]
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
      for (const payload of payloads) {
        const { baseUrl, apiKey, model } = config
        const url = `${baseUrl}/v1/messages`

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: payload.prompt }]
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
