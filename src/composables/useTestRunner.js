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
          prompt: 'Hello, please respond with a greeting.',
          maxTokens: config.maxTokens || 1024
        }

        const result = await method(testConfig, payload)

        if (result.status >= 200 && result.status < 300) {
          addLog('success', testType.toUpperCase(),
            `Response received in ${result.duration}ms. ${JSON.stringify(result.data).slice(0, 100)}...`,
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
