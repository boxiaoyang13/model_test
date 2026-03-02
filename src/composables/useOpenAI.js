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
      const { baseUrl, apiKey, model, vendor, nodeGroup } = config
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
          model,
          messages: [{ role: 'user', content: payload.prompt }]
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
          model,
          messages: [{ role: 'user', content: payload.prompt }],
          stream: true
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
      const { baseUrl, apiKey, model, vendor, nodeGroup } = config
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
          model,
          messages: [{
            role: 'user',
            content: payload.prompt || 'Jane, 54 years old'
          }],
          verbosity: payload.verbosity || 'medium',
          reasoning_effort: payload.reasoningEffort || 'medium'
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

  const runFunctionCall = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model, vendor, nodeGroup } = config
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

      // Add nodeGroup header if provided
      if (nodeGroup) {
        headers['X-Zenlayer-Node-Group'] = nodeGroup
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

      // Check if payload is already a complete request body (custom JSON format)
      // or just a prompt object
      let requestBody

      if (payload.model && payload.messages) {
        // Custom JSON format - use directly as request body
        requestBody = payload
      } else {
        // Standard prompt format - build request body
        requestBody = {
          model,
          messages: [{
            role: 'user',
            content: payload.prompt || "What's the weather like in Boston today?"
          }],
          tools: tools,
          tool_choice: 'auto'
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

  const sendImageGen = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model, vendor, nodeGroup } = config
      const url = `${baseUrl}/v1/images/generations`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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

      if (payload.prompt !== undefined && !payload.model) {
        // Standard prompt format - build request body
        requestBody = {
          model: model || 'gpt-image-1',
          prompt: payload.prompt,
          n: 1,
          size: payload.size || '1024x1024'
        }
      } else {
        // Custom JSON format - use directly as request body
        requestBody = payload
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

  const sendVideoGen = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model, vendor, nodeGroup } = config
      const submitUrl = `${baseUrl}/v1/videos`

      // Step 1: Submit video generation request using multipart/form-data
      const formData = new FormData()

      // Add vendor header if provided (for FormData, we can't set Content-Type)
      const headers = {
        'Authorization': `Bearer ${apiKey}`
      }

      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      if (nodeGroup) {
        headers['X-Zenlayer-Node-Group'] = nodeGroup
      }

      // Build form data from payload
      if (payload.model) {
        formData.append('model', payload.model)
      } else {
        formData.append('model', model || 'sora-2')
      }

      if (payload.prompt) {
        formData.append('prompt', payload.prompt)
      }

      if (payload.seconds !== undefined) {
        formData.append('seconds', String(payload.seconds))
      } else {
        formData.append('seconds', '4')
      }

      if (payload.size) {
        formData.append('size', payload.size)
      }

      const submitResponse = await fetch(submitUrl, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!submitResponse.ok) {
        const error = new Error(`HTTP ${submitResponse.status}: ${submitResponse.statusText}`)
        state.error = error
        throw error
      }

      const submitData = await submitResponse.json()
      const videoId = submitData.id

      if (!videoId) {
        throw new Error('Failed to get video ID from response')
      }

      // Step 2: Poll the video status
      let pollingResult = submitData
      let attempts = 0
      const maxAttempts = 120 // Poll for up to 2 minutes (1 second intervals)
      const pollInterval = 1000 // 1 second

      while (pollingResult.status !== 'completed' && pollingResult.status !== 'failed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))

        const pollResponse = await fetch(`${baseUrl}/v1/videos/${videoId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        })

        if (!pollResponse.ok) {
          throw new Error(`HTTP ${pollResponse.status}: ${pollResponse.statusText} while polling`)
        }

        pollingResult = await pollResponse.json()
        attempts++
      }

      const duration = Date.now() - startTime

      if (pollingResult.status !== 'completed') {
        throw new Error(`Video generation ${pollingResult.status || 'timeout'}`)
      }

      // Return success response with video ID for download
      state.response = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: {
          videoId: videoId,
          downloadUrl: `${baseUrl}/v1/videos/${videoId}/content`,
          status: pollingResult.status,
          progress: pollingResult.progress,
          seconds: pollingResult.seconds,
          size: pollingResult.size,
          model: pollingResult.model,
          duration
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

  const downloadVideo = async (videoUrl, apiKey) => {
    state.loading = true
    state.error = null

    try {
      const response = await fetch(videoUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to download video: HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Create download link
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-video-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      return { success: true }
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
    sendImageGen,
    sendVideoGen,
    downloadVideo,
  }
}
