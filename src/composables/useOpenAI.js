import { reactive } from 'vue'

export function useOpenAI() {
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
      const { baseUrl, apiKey, model, vendor } = config
      const url = `${baseUrl}/chat/completions`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
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
      const { baseUrl, apiKey, model, vendor } = config
      const url = `${baseUrl}/chat/completions`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
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
      const decoder = new TextDecoder()
      let buffer = ''
      let hasDeltaContent = false

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
                // Check if delta has content
                if (data.choices?.[0]?.delta?.content && data.choices[0].delta.content.length > 0) {
                  hasDeltaContent = true
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
          hasDeltaContent
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
      const { baseUrl, apiKey, model, vendor } = config
      const url = `${baseUrl}/chat/completions`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [{
            role: 'user',
            content: payload.prompt || 'Jane, 54 years old'
          }],
          verbosity: payload.verbosity || 'medium',
          reasoning_effort: payload.reasoningEffort || 'medium'
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
      const { baseUrl, apiKey, model, vendor } = config
      const url = `${baseUrl}/chat/completions`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      // Define tools for function calling
      const tools = [
        {
          type: 'function',
          function: {
            name: 'get_current_weather',
            description: 'Get the current weather in a given location',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'The city and state, e.g. San Francisco, CA'
                },
                unit: {
                  type: 'string',
                  enum: ['celsius', 'fahrenheit']
                }
              },
              required: ['location']
            }
          }
        }
      ]

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [{
            role: 'user',
            content: payload.prompt || "What's the weather like in Boston today?"
          }],
          tools: tools,
          tool_choice: 'auto'
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

  return {
    state,
    sendChat,
    sendChatStream,
    runReasoning,
    runFunctionCall,
  }
}
