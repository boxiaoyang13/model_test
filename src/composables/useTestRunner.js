import { reactive, computed } from 'vue'

export function useTestRunner(apiMethods) {
  const testState = reactive({
    running: false,
    currentTest: null,
    progress: 0,
    logs: [],
    customNotification: null // { success: bool, message: string }
  })

  const testMethods = {
    'chat': apiMethods.sendChat,
    'chat-stream': apiMethods.sendChatStream,
    'reasoning': apiMethods.runReasoning,
    'functioncall': apiMethods.runFunctionCall,
    'text-to-image': apiMethods.sendImageGen || apiMethods.sendChat,
    'text-to-video': apiMethods.sendVideoGen || apiMethods.sendChat,
    'custom': apiMethods.sendChat, // Custom test uses sendChat but with custom JSON body
  }

  const addLog = (type, tag, content, model = '') => {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString('en', { hour12: false }),
      type,
      tag,
      content,
      model
    }
    testState.logs.push(entry)
    return entry
  }

  const clearLogs = () => {
    testState.logs = []
  }

  const runSingleTest = async (testType, config, models, customJsonBody = null) => {
    const wasAlreadyRunning = testState.running
    if (!wasAlreadyRunning) {
      testState.running = true
      testState.currentTest = testType
    }

    const targets = models.length ? models : ['(no model selected)']
    const method = testMethods[testType]

    if (!method) {
      addLog('error', testType.toUpperCase(), `Test method not found: ${testType}`, '')
      if (!wasAlreadyRunning) {
        testState.running = false
        testState.currentTest = null
      }
      return
    }

    addLog('info', 'START', `Running test: ${testType}`, '')

    let customHadError = false

    for (const model of targets) {
      try {
        const testConfig = { ...config, model }

        // For custom test, use the provided JSON body directly
        let payload
        if (testType === 'custom' && customJsonBody) {
          payload = customJsonBody
        } else if (testType === 'functioncall') {
          payload = {
            prompt: 'What is the weather in San Francisco?',
            maxTokens: config.maxTokens || 2048,
            temperature: 0.7
          }
        } else if (testType === 'reasoning') {
          payload = {
            prompt: '解释下量子力学',
            maxTokens: 64000,
            budgetTokens: 32000
          }
        } else if (testType === 'text-to-image') {
          payload = {
            prompt: 'A cute baby sea otter',
            aspectRatio: '4:3',
            imageSize: '1K'
          }
        } else if (testType === 'text-to-video') {
          payload = {
            prompt: 'A lone cowboy rides his horse across an open plain at beautiful sunset, soft light, warm colors',
            durationSeconds: 4
          }
        } else {
          payload = {
            prompt: '你好，给我科普一下量子力学吧',
            maxTokens: config.maxTokens || 1024,
            temperature: 0.7
          }
        }

        const result = await method(testConfig, payload)

        // Check if streaming test passed
        if (testType === 'chat-stream') {
          // Check for Gemini format (isSSE + hasContent)
          if (result.data?.isSSE && result.data?.hasContent) {
            addLog('success', testType.toUpperCase(),
              `SSE stream successful. ${result.data.chunkCount} chunks received with content in ${result.duration}ms`,
              model
            )
          }
          // Check for Anthropic format (hasDeltaText)
          else if (result.data?.hasDeltaText) {
            addLog('success', testType.toUpperCase(),
              `Stream successful. ${result.data.chunkCount} chunks received with delta text in ${result.duration}ms`,
              model
            )
          }
          // Check for Anthropic fallback format (chunkCount + any chunks received)
          else if (result.data?.chunkCount && result.data.chunkCount > 0) {
            addLog('success', testType.toUpperCase(),
              `Stream successful. ${result.data.chunkCount} chunks received in ${result.duration}ms`,
              model
            )
          } else {
            addLog('error', testType.toUpperCase(),
              `Stream failed: No valid response received`,
              model
            )
          }
        } else if (testType === 'reasoning') {
          // Check for Gemini format (thoughtsTokenCount > 0)
          const thoughtsTokenCount = result.data?.usageMetadata?.thoughtsTokenCount || 0
          if (result.status >= 200 && result.status < 300 && thoughtsTokenCount > 0) {
            addLog('success', testType.toUpperCase(),
              `Reasoning successful. ${thoughtsTokenCount} thought tokens used in ${result.duration}ms`,
              model
            )
          }
          // Check for Anthropic format (content has thinking type)
          else if (result.data?.content && Array.isArray(result.data.content)) {
            const hasThinking = result.data.content.some(c => c.type === 'thinking')
            if (result.status >= 200 && result.status < 300 && hasThinking) {
              addLog('success', testType.toUpperCase(),
                `Reasoning successful. Thinking content found in response in ${result.duration}ms`,
                model
              )
            } else {
              addLog('error', testType.toUpperCase(),
                `Reasoning failed: No thinking content found in response`,
                model
              )
            }
          } else {
            addLog('error', testType.toUpperCase(),
              `Reasoning failed: No reasoning content found`,
              model
            )
          }
        } else if (testType === 'functioncall') {
          // Check if function call test passed
          let hasFunctionCall = false
          let functionCallName = null

          // Check for Gemini format (candidates with functionCall)
          if (result.data?.candidates?.[0]?.content?.parts) {
            hasFunctionCall = result.data.candidates[0].content.parts.some(
              part => part.functionCall !== undefined
            )
            if (hasFunctionCall) {
              functionCallName = result.data.candidates[0].content.parts.find(
                part => part.functionCall
              )?.functionCall?.name
            }
          }
          // Check for Anthropic format (content with tool_use)
          else if (result.data?.content && Array.isArray(result.data.content)) {
            const toolUse = result.data.content.find(c => c.type === 'tool_use')
            hasFunctionCall = !!toolUse
            functionCallName = toolUse?.name || null
          }

          if (result.status >= 200 && result.status < 300 && hasFunctionCall) {
            addLog('success', testType.toUpperCase(),
              `Function call successful. Called: ${functionCallName || 'unknown'} in ${result.duration}ms`,
              model
            )
          } else {
            addLog('error', testType.toUpperCase(),
              `Function call failed: No functionCall/tool_use found in response`,
              model
            )
          }
        } else if (testType === 'text-to-video') {
          // Check if video generation was successful (has videoUri)
          if (result.status >= 200 && result.status < 300 && result.data?.videoUri) {
            const videoUri = result.data.videoUri
            addLog('success', testType.toUpperCase(),
              `Video generated successfully in ${result.duration}ms. Duration: ${result.data.durationSeconds || 4}s`,
              model
            )
            addLog('info', 'VIDEO URI', videoUri, model)
          } else {
            addLog('error', testType.toUpperCase(),
              `Video generation failed: ${result.data?.videoUri ? 'Error' : 'No video URI in response'}`,
              model
            )
          }
        } else if (result.status >= 200 && result.status < 300) {
          // For custom and text-to-image tests, log the full response body
          if (testType === 'custom' || testType === 'text-to-image') {
            const responseBody = JSON.stringify(result.data, null, 2)
            addLog('success', testType.toUpperCase(),
              `Response received in ${result.duration}ms. Status: ${result.status}`,
              model
            )
            addLog('info', 'RESPONSE BODY', responseBody, model)
          } else {
            // Parse response data for better logging
            let dataSummary = ''
            let hasContent = false

            if (result.data) {
              // Check for Gemini format (candidates)
              if (result.data.candidates) {
                const content = result.data.candidates[0]?.content?.parts[0]?.text
                if (content) {
                  hasContent = true
                  dataSummary = `Content: "${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"`
                } else {
                  dataSummary = JSON.stringify(result.data).slice(0, 100)
                }
              }
              // Check for Anthropic format (content array)
              else if (result.data.content && Array.isArray(result.data.content)) {
                const textContent = result.data.content.find(c => c.type === 'text')?.text
                if (textContent && textContent.length > 0) {
                  hasContent = true
                  dataSummary = `Content: "${textContent.slice(0, 80)}${textContent.length > 80 ? '...' : ''}"`
                } else {
                  dataSummary = 'No text content in response'
                }
              } else {
                dataSummary = JSON.stringify(result.data).slice(0, 100)
              }
            }

            if (hasContent) {
              addLog('success', testType.toUpperCase(),
                `Response received in ${result.duration}ms. ${dataSummary}`,
                model
              )
            } else {
              addLog('error', testType.toUpperCase(),
                `Response failed: ${dataSummary}`,
                model
              )
            }
          }
        } else {
          // For custom, text-to-image, and text-to-video tests, show more detailed error
          if (testType === 'custom' || testType === 'text-to-image' || testType === 'text-to-video') {
            if (testType === 'custom') customHadError = true
            const responseBody = result.data ? JSON.stringify(result.data, null, 2) : 'No response body'
            addLog('error', testType.toUpperCase(),
              `Status ${result.status}: ${result.statusText || 'Error'} - ${testType === 'custom' ? 'Custom' : testType} test failed`,
              model
            )
            addLog('info', 'RESPONSE BODY', responseBody, model)
          } else {
            addLog('error', testType.toUpperCase(),
              `Status ${result.status}: ${result.statusText || 'Error'}`,
              model
            )
          }
        }
      } catch (err) {
        if (testType === 'custom') customHadError = true
        // For custom, text-to-image, and text-to-video tests, show detailed error
        if (testType === 'custom' || testType === 'text-to-image' || testType === 'text-to-video') {
          addLog('error', testType.toUpperCase(),
            `${testType === 'custom' ? 'Custom' : testType} test failed: ${err.message}`,
            model
          )
        } else {
          addLog('error', testType.toUpperCase(), err.message, model)
        }
      }
    }

    if (!wasAlreadyRunning) {
      testState.running = false
      testState.currentTest = null
    }

    if (testType === 'custom') {
      testState.customNotification = {
        success: !customHadError,
        message: customHadError ? 'Custom test failed' : 'Custom test completed'
      }
      setTimeout(() => {
        testState.customNotification = null
      }, 4000)
    }
  }

  const runAllTests = async (config, models, activeTab = 'text', customJson = null) => {
    if (testState.running) return

    testState.running = true
    testState.progress = 0

    // Filter test types based on active tab
    let testTypes
    if (activeTab === 'text') {
      testTypes = ['chat', 'chat-stream', 'reasoning', 'functioncall']
    } else if (activeTab === 'image') {
      testTypes = ['text-to-image']
    } else if (activeTab === 'video') {
      testTypes = ['text-to-video']
    } else {
      testTypes = Object.keys(testMethods)
    }

    // Add custom test if JSON content is provided
    if (customJson) {
      testTypes.push('custom')
    }

    try {
      for (let i = 0; i < testTypes.length; i++) {
        testState.currentTest = testTypes[i]
        testState.progress = (i / testTypes.length) * 100

        const jsonBody = testTypes[i] === 'custom' ? customJson : null
        await runSingleTest(testTypes[i], config, models, jsonBody)
        await new Promise(resolve => setTimeout(resolve, 150))
      }

      testState.progress = 100
      addLog('success', 'DONE', `All tests completed. ${testTypes.length} test suites run.`, '')
    } finally {
      testState.running = false
      testState.currentTest = null
    }
  }

  return {
    testState,
    logs: computed(() => testState.logs),
    logCount: computed(() => testState.logs.length),
    runSingleTest,
    runAllTests,
    addLog,
    clearLogs
  }
}
