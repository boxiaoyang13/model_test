import { reactive } from 'vue'
import { proxyAPI } from '@/services/api'

const API_BASE_URL = 'http://127.0.0.1:8080/api'

export function useGemini() {
  const state = reactive({
    loading: false,
    error: null,
    response: null
  })

  const sendChat = async (config, payload) => {
    state.loading = true
    state.error = null

    try {
      // Build request body based on payload format
      let requestBody = payload

      // If payload contains prompt (not custom JSON format), build standard request
      if (payload.prompt && !payload.contents) {
        requestBody = {
          contents: [{
            role: 'user',
            parts: [{ text: payload.prompt }]
          }],
          generationConfig: {
            temperature: payload.temperature || 0.7,
            maxOutputTokens: payload.maxTokens || 1024
          }
        }
      }

      state.response = await proxyAPI.gemini.chat(config, requestBody)
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

    try {
      // Build request body
      let requestBody = payload

      if (payload.prompt && !payload.contents) {
        requestBody = {
          contents: [{
            role: 'user',
            parts: [{ text: payload.prompt }]
          }],
          generationConfig: {
            temperature: payload.temperature || 0.7,
            maxOutputTokens: payload.maxTokens || 1024
          }
        }
      }

      state.response = await proxyAPI.gemini.stream(config, requestBody)
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

    try {
      let requestBody = payload

      // Build standard reasoning request if needed
      if (payload.prompt && !payload.contents) {
        requestBody = {
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
        }
      }

      state.response = await proxyAPI.gemini.chat(config, requestBody)
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

    try {
      // Define function declarations
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

      let requestBody = payload

      // Build standard function call request if needed
      if (payload.prompt && !payload.contents) {
        requestBody = {
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
        }
      }

      state.response = await proxyAPI.gemini.chat(config, requestBody)
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

    try {
      let requestBody = payload

      // Build standard image generation request if needed
      if (payload.prompt && !payload.contents) {
        requestBody = {
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
        }
      }

      state.response = await proxyAPI.gemini.image(config, requestBody)
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

    try {
      let requestBody = payload

      // Build standard video generation request if needed
      if (!payload.instances || !Array.isArray(payload.instances)) {
        requestBody = {
          instances: [{
            prompt: payload.prompt || 'A lone cowboy rides his horse across an open plain at beautiful sunset, soft light, warm colors'
          }],
          parameters: {
            durationSeconds: payload.durationSeconds || 4
          }
        }
      }

      // Submit video generation request
      const submitResult = await proxyAPI.gemini.video(config, requestBody)

      // Extract operation ID from response
      const operationName = submitResult.data?.name
      const operationId = operationName?.split('/').pop()

      if (!operationId) {
        throw new Error('Failed to extract operation ID from response')
      }

      // Poll for completion
      let pollingResult = null
      let attempts = 0
      const maxAttempts = 120
      const pollInterval = 1000

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))

        pollingResult = await proxyAPI.gemini.videoStatus(config, operationId)

        if (pollingResult.data?.done) {
          break
        }

        attempts++
      }

      if (!pollingResult || !pollingResult.data?.done) {
        throw new Error('Video generation timeout')
      }

      // Extract video URI
      const videoUri = pollingResult.data?.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri

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
          duration: submitResult.duration + (pollingResult.duration || 0)
        },
        duration: submitResult.duration + (pollingResult.duration || 0)
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
      // Use backend proxy for video download
      const response = await fetch(`${API_BASE_URL}/proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoUrl,
          method: 'GET',
          headers: {
            'x-goog-api-key': apiKey
          },
          body: null
        })
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
