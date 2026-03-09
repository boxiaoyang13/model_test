import { reactive } from 'vue'
import { proxyAPI } from '@/services/api'

export function useOpenAI() {
  const state = reactive({
    loading: false,
    error: null,
    response: null
  })

  const sendChat = async (config, payload) => {
    state.loading = true
    state.error = null

    try {
      let requestBody = payload

      // Build standard request if needed
      if (!payload.model || !payload.messages) {
        requestBody = {
          model: config.model,
          messages: [{ role: 'user', content: payload.prompt }]
        }
      }

      state.response = await proxyAPI.openai.chat(config, requestBody)
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
      let requestBody = payload

      // Build standard request if needed, ensure stream is true
      if (!payload.model || !payload.messages) {
        requestBody = {
          model: config.model,
          messages: [{ role: 'user', content: payload.prompt }],
          stream: true
        }
      } else {
        requestBody = { ...payload, stream: true }
      }

      state.response = await proxyAPI.openai.stream(config, requestBody)
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
      if (!payload.model || !payload.messages) {
        requestBody = {
          model: config.model,
          messages: [{
            role: 'user',
            content: payload.prompt || 'Jane, 54 years old'
          }],
          verbosity: payload.verbosity || 'medium',
          reasoning_effort: payload.reasoningEffort || 'medium'
        }
      }

      state.response = await proxyAPI.openai.chat(config, requestBody)
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

      let requestBody = payload

      // Build standard function call request if needed
      if (!payload.model || !payload.messages) {
        requestBody = {
          model: config.model,
          messages: [{
            role: 'user',
            content: payload.prompt || "What's the weather like in Boston today?"
          }],
          tools: tools,
          tool_choice: 'auto'
        }
      }

      state.response = await proxyAPI.openai.chat(config, requestBody)
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
      if (payload.prompt !== undefined && !payload.model) {
        requestBody = {
          model: config.model || 'gpt-image-1',
          prompt: payload.prompt,
          n: 1,
          size: payload.size || '1024x1024'
        }
      }

      state.response = await proxyAPI.openai.image(config, requestBody)
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
      // Build request body for video generation
      let requestBody = payload

      if (!payload.model) {
        requestBody = {
          model: config.model || 'sora-2',
          prompt: payload.prompt,
          seconds: payload.seconds || 4,
          size: payload.size
        }
      }

      // Submit video generation request
      const submitResult = await proxyAPI.openai.video(config, requestBody)
      const videoId = submitResult.data?.id

      if (!videoId) {
        throw new Error('Failed to get video ID from response')
      }

      // Poll for completion
      let pollingResult = submitResult.data
      let attempts = 0
      const maxAttempts = 120
      const pollInterval = 1000

      while (pollingResult?.status !== 'completed' && pollingResult?.status !== 'failed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))

        pollingResult = await proxyAPI.openai.videoStatus(config, videoId)
        pollingResult = pollingResult.data

        attempts++
      }

      if (pollingResult?.status !== 'completed') {
        throw new Error(`Video generation ${pollingResult?.status || 'timeout'}`)
      }

      state.response = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: {
          videoId: videoId,
          downloadUrl: `${config.baseUrl}/v1/videos/${videoId}/content`,
          status: pollingResult.status,
          progress: pollingResult.progress,
          seconds: pollingResult.seconds,
          size: pollingResult.size,
          model: pollingResult.model,
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

  const downloadVideo = async (config, videoId) => {
    state.loading = true
    state.error = null

    try {
      const result = await proxyAPI.openai.videoDownload(config, videoId)
      const blob = result.data
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
