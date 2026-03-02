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
      const { baseUrl, apiKey, model, vendor, nodeGroup } = config
      const url = `${baseUrl}/messages`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      // Add nodeGroup header if provided
      if (nodeGroup) {
        headers['X-Zenlayer-Node-Group'] = nodeGroup
      }

      // Check if payload is already a complete request body (custom JSON format)
      // or just a prompt object
      let requestBody

      if (payload.model && payload.messages) {
        // Custom JSON format - use directly as request body
        requestBody = payload
      } else {
        // Standard prompt format - build request body
        requestBody = {
          model: model,
          max_tokens: payload.maxTokens || 4096,
          system: [{
            type: 'text',
            text: '你是一个友善的人工智能助手'
          }],
          messages: [{
            role: 'user',
            content: [{
              type: 'text',
              text: payload.prompt || '你好，给我科普一下量子力学吧'
            }]
          }]
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
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
      const { baseUrl, apiKey, model, vendor, nodeGroup } = config
      const url = `${baseUrl}/messages`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      // Add nodeGroup header if provided
      if (nodeGroup) {
        headers['X-Zenlayer-Node-Group'] = nodeGroup
      }

      // Check if payload is already a complete request body (custom JSON format)
      // or just a prompt object
      let requestBody

      if (payload.model && payload.messages) {
        // Custom JSON format - use directly as request body, ensure stream is true
        requestBody = { ...payload, stream: true }
      } else {
        // Standard prompt format - build request body
        requestBody = {
          model: model,
          max_tokens: payload.maxTokens || 4096,
          system: [{
            type: 'text',
            text: '你是一个友善的人工智能助手'
          }],
          stream: true,
          messages: [{
            role: 'user',
            content: [{
              type: 'text',
              text: payload.prompt || '你好，给我科普一下量子力学吧'
            }]
          }]
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
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
      let hasDeltaText = false

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
                // Check if delta has text content
                if (data.delta?.type === 'text_delta' && data.delta.text && data.delta.text.length > 0) {
                  hasDeltaText = true
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
          hasDeltaText
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
      const { baseUrl, apiKey, model, vendor, nodeGroup } = config
      const url = `${baseUrl}/messages`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      // Add nodeGroup header if provided
      if (nodeGroup) {
        headers['X-Zenlayer-Node-Group'] = nodeGroup
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model,
          max_tokens: payload.maxTokens || 64000,
          thinking: {
            type: 'enabled',
            budget_tokens: payload.budgetTokens || 32000
          },
          messages: [{
            role: 'user',
            content: payload.prompt || '解释下量子力学'
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

  const runFunctionCall = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model, vendor, nodeGroup } = config
      const url = `${baseUrl}/messages`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      // Add nodeGroup header if provided
      if (nodeGroup) {
        headers['X-Zenlayer-Node-Group'] = nodeGroup
      }

      // Define tool for function calling
      const tools = [
        {
          name: 'get_weather',
          description: 'Get the weather at a specific location',
          input_schema: {
            type: 'object',
            properties: {
              location: {
                type: 'string'
              },
              unit: {
                type: 'string',
                enum: ['celsius', 'fahrenheit']
              }
            },
            required: ['location']
          }
        }
      ]

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model,
          max_tokens: payload.maxTokens || 2048,
          messages: [{
            role: 'user',
            content: payload.prompt || 'What is the weather in San Francisco?'
          }],
          tools: tools
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
    runFunctionCall
  }
}
