import { reactive, computed } from 'vue'

export function useTestRunner(apiMethods) {
  const testState = reactive({
    running: false,
    currentTest: null,
    progress: 0,
    logs: []
  })

  const testMethods = {
    'chat': apiMethods.sendChat,
    'chat-stream': apiMethods.sendChatStream,
    'reasoning': apiMethods.runReasoning,
    'functioncall': apiMethods.runFunctionCall,
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
    const targets = models.length ? models : ['(no model selected)']
    const method = testMethods[testType]

    if (!method) {
      addLog('error', testType.toUpperCase(), `Test method not found: ${testType}`, '')
      return
    }

    addLog('info', 'START', `Running test: ${testType}`, '')

    for (const model of targets) {
      try {
        const testConfig = { ...config, model }

        // For custom test, use the provided JSON body directly
        let payload
        if (testType === 'custom' && customJsonBody) {
          payload = customJsonBody
        } else if (testType === 'functioncall') {
          payload = {
            prompt: 'Schedule a meeting with Bob and Alice for 03/27/2025 at 10:00 AM about the Q3 planning.',
            maxTokens: config.maxTokens || 1024,
            temperature: 0.7
          }
        } else {
          payload = {
            prompt: '你好，给我科普一下量子力学吧',
            maxTokens: config.maxTokens || 1024,
            temperature: 0.7
          }
        }

        const result = await method(testConfig, payload)

        // Check if streaming test passed (SSE + hasContent)
        if (testType === 'chat-stream') {
          if (result.data?.isSSE && result.data?.hasContent) {
            addLog('success', testType.toUpperCase(),
              `SSE stream successful. ${result.data.chunkCount} chunks received with content in ${result.duration}ms`,
              model
            )
          } else {
            addLog('error', testType.toUpperCase(),
              `SSE stream failed: ${result.data?.isSSE ? 'SSE' : 'Not SSE'}, ${result.data?.hasContent ? 'Has content' : 'No content'}`,
              model
            )
          }
        } else if (testType === 'reasoning') {
          // Check if reasoning test passed (thoughtsTokenCount > 0)
          const thoughtsTokenCount = result.data?.usageMetadata?.thoughtsTokenCount || 0
          if (result.status >= 200 && result.status < 300 && thoughtsTokenCount > 0) {
            addLog('success', testType.toUpperCase(),
              `Reasoning successful. ${thoughtsTokenCount} thought tokens used in ${result.duration}ms`,
              model
            )
          } else {
            addLog('error', testType.toUpperCase(),
              `Reasoning failed: thoughtsTokenCount=${thoughtsTokenCount} (expected > 0)`,
              model
            )
          }
        } else if (testType === 'functioncall') {
          // Check if function call test passed (has functionCall in response)
          const hasFunctionCall = result.data?.candidates?.[0]?.content?.parts?.some(
            part => part.functionCall !== undefined
          )
          if (result.status >= 200 && result.status < 300 && hasFunctionCall) {
            const functionCallName = result.data?.candidates?.[0]?.content?.parts?.find(
              part => part.functionCall
            )?.functionCall?.name
            addLog('success', testType.toUpperCase(),
              `Function call successful. Called: ${functionCallName || 'unknown'} in ${result.duration}ms`,
              model
            )
          } else {
            addLog('error', testType.toUpperCase(),
              `Function call failed: No functionCall found in response`,
              model
            )
          }
        } else if (result.status >= 200 && result.status < 300) {
          // Parse response data for better logging
          let dataSummary = ''
          if (result.data) {
            if (result.data.candidates) {
              const content = result.data.candidates[0]?.content?.parts[0]?.text
              if (content) {
                dataSummary = `Content: "${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"`
              } else {
                dataSummary = JSON.stringify(result.data).slice(0, 100)
              }
            } else {
              dataSummary = JSON.stringify(result.data).slice(0, 100)
            }
          }

          addLog('success', testType.toUpperCase(),
            `Response received in ${result.duration}ms. ${dataSummary}`,
            model
          )
        } else {
          addLog('error', testType.toUpperCase(),
            `Status ${result.status}: ${result.statusText || 'Error'}`,
            model
          )
        }
      } catch (err) {
        addLog('error', testType.toUpperCase(), err.message, model)
      }
    }
  }

  const runAllTests = async (config, models) => {
    if (testState.running) return

    testState.running = true
    testState.progress = 0

    const testTypes = Object.keys(testMethods)

    try {
      for (let i = 0; i < testTypes.length; i++) {
        testState.currentTest = testTypes[i]
        testState.progress = (i / testTypes.length) * 100

        await runSingleTest(testTypes[i], config, models, null)
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
