import { reactive } from 'vue'
import { proxyAPI } from '@/services/api'

export function useAnthropic() {
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

      state.response = await proxyAPI.anthropic.chat(config, requestBody)
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
      } else {
        requestBody = { ...payload, stream: true }
      }

      state.response = await proxyAPI.anthropic.stream(config, requestBody)
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
          max_tokens: payload.maxTokens || 64000,
          thinking: {
            type: 'enabled',
            budget_tokens: payload.budgetTokens || 32000
          },
          messages: [{
            role: 'user',
            content: payload.prompt || '解释下量子力学'
          }]
        }
      }

      state.response = await proxyAPI.anthropic.chat(config, requestBody)
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

      let requestBody = payload

      // Build standard function call request if needed
      if (!payload.model || !payload.messages) {
        requestBody = {
          model: config.model,
          max_tokens: payload.maxTokens || 2048,
          messages: [{
            role: 'user',
            content: payload.prompt || 'What is the weather in San Francisco?'
          }],
          tools: tools
        }
      }

      state.response = await proxyAPI.anthropic.chat(config, requestBody)
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
