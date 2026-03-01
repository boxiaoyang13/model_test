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
    'struct': apiMethods.runStructured,
    'embedding': apiMethods.runEmbedding,
    'multimodal': apiMethods.runMultimodal,
    'batch': apiMethods.runBatch
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

  const runSingleTest = async (testType, config, models) => {
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
        const payload = {
          prompt: '你好，给我科普一下量子力学吧',
          maxTokens: config.maxTokens || 1024,
          temperature: 0.7
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

        await runSingleTest(testTypes[i], config, models)
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
