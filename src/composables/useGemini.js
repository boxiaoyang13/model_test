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
      const { baseUrl, apiKey, model, vendor } = config
      const url = `${baseUrl}/v1beta/models/${model}:generateContent`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-goog-api-key': apiKey
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
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
      const { baseUrl, apiKey, model, vendor } = config
      const url = `${baseUrl}/v1beta/models/${model}:streamGenerateContent`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-goog-api-key': apiKey
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
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
      const { baseUrl, apiKey, model, vendor } = config
      const url = `${baseUrl}/v1beta/models/${model}:generateContent`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-goog-api-key': apiKey
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contents: [{
            parts: [{ text: payload.prompt }]
          }],
          generationConfig: {
            temperature: payload.temperature || 0.7,
            maxOutputTokens: payload.maxTokens || 1024,
            thinkingConfig: {
              thinkingLevel: 'high'
            }
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
      const { baseUrl, apiKey, model, vendor } = config
      const url = `${baseUrl}/v1beta/models/${model}:generateContent`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-goog-api-key': apiKey
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      // Define function declarations for scheduling meeting
      const functionDeclarations = [
        {
          name: 'schedule_meeting',
          description: 'Schedules a meeting with specified attendees at a given time and date.',
          parameters: {
            type: 'object',
            properties: {
              attendees: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of people attending the meeting.'
              },
              date: {
                type: 'string',
                description: "Date of the meeting (e.g., '2024-07-29')"
              },
              time: {
                type: 'string',
                description: "Time of the meeting (e.g., '15:00')"
              },
              topic: {
                type: 'string',
                description: 'The subject or topic of the meeting.'
              }
            },
            required: ['attendees', 'date', 'time', 'topic']
          }
        }
      ]

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: payload.prompt }]
          }],
          tools: [{
            functionDeclarations
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

  const sendImageGen = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model, vendor } = config
      const url = `${baseUrl}/v1beta/models/${model}:generateContent`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-goog-api-key': apiKey
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: payload.prompt }]
          }],
          generationConfig: {
            imageConfig: {
              aspectRatio: payload.aspectRatio || '4:3',
              imageSize: payload.imageSize || '1K'
            }
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

  const sendVideoGen = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model, vendor } = config
      const url = `${baseUrl}/v1beta/models/${model}:predictLongRunning`

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-goog-api-key': apiKey
      }

      // Add vendor header if provided
      if (vendor) {
        headers['X-Zenlayer-Vendor'] = vendor
      }

      // Step 1: Submit the video generation request
      const submitResponse = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          instances: [{
            prompt: payload.prompt
          }],
          parameters: {
            durationSeconds: payload.durationSeconds || 4
          }
        })
      })

      if (!submitResponse.ok) {
        const error = new Error(`HTTP ${submitResponse.status}: ${submitResponse.statusText}`)
        state.error = error
        throw error
      }

      const submitData = await submitResponse.json()

      // Extract operation ID from response name
      // Format: models/veo-3.0-fast-generate-001/operations/OPERATION_ID
      const operationName = submitData.name
      const operationId = operationName?.split('/').pop()

      if (!operationId) {
        throw new Error('Failed to extract operation ID from response')
      }

      // Step 2: Poll the operation status
      const pollUrl = `${baseUrl}/v1beta/models/${model}/operations/${operationId}`

      let pollingResult = null
      let attempts = 0
      const maxAttempts = 120 // Poll for up to 2 minutes (1 second intervals)
      const pollInterval = 1000 // 1 second

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))

        const pollResponse = await fetch(pollUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'x-goog-api-key': apiKey
          }
        })

        if (!pollResponse.ok) {
          throw new Error(`HTTP ${pollResponse.status}: ${pollResponse.statusText} while polling`)
        }

        pollingResult = await pollResponse.json()

        if (pollingResult.done) {
          break
        }

        attempts++
      }

      const duration = Date.now() - startTime

      if (!pollingResult || !pollingResult.done) {
        throw new Error('Video generation timeout: operation did not complete within expected time')
      }

      // Check if video generation was successful
      const videoUri = pollingResult.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri

      if (!videoUri) {
        throw new Error('Video generation failed: No video URI in response')
      }

      state.response = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: {
          operationId,
          videoUri,
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

  return {
    state,
    sendChat,
    sendChatStream,
    runReasoning,
    runFunctionCall,
    sendImageGen,
    sendVideoGen,
  }
}
