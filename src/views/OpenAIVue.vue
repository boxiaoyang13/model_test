<template>
  <div class="openai-view">
    <!-- Top Bar -->
    <div class="topbar">
      <div class="provider-info">
        <span class="provider-name">{{ openaiConfig.name }}</span>
        <span class="provider-sub">{{ openaiConfig.sub }}</span>
      </div>
      <div class="provider-badge" :style="{ background: openaiConfig.color + '20', color: openaiConfig.color }">
        {{ openaiConfig.badge }}
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Left Panel: Configuration -->
      <div class="panel-section config-section">
        <ConfigPanel
          ref="configPanelRef"
          :config="config"
          @update:config="handleConfigUpdate"
          @update:selectedModels="handleSelectedModelsUpdate"
        />
      </div>

      <!-- Middle Panel: Tests -->
      <div class="panel-section test-section">
        <TestPanel
          ref="testPanelRef"
          :isRunning="testRunner.testState.running"
          :progress="testRunner.testState.progress"
          :currentTest="testRunner.testState.currentTest"
          :timeout="timeout"
          :maxTokens="maxTokens"
          @runAll="handleRunAll"
          @runTest="handleRunTest"
          @update:timeout="handleTimeoutUpdate"
          @update:maxTokens="handleMaxTokensUpdate"
        />
      </div>

      <!-- Right Panel: Logs -->
      <div class="panel-section log-section">
        <LogPanel
          ref="logPanelRef"
          :logs="testRunner.logs.value || []"
          :logCount="testRunner.logCount.value || 0"
          @clear="handleClearLogs"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import ConfigPanel from '@/components/ConfigPanel.vue'
import TestPanel from '@/components/TestPanel.vue'
import LogPanel from '@/components/LogPanel.vue'
import openaiConfig from '@/config/openai.js'
import { useOpenAI } from '@/composables/useOpenAI.js'
import { useTestRunner } from '@/composables/useTestRunner.js'

// Template refs for child components
const configPanelRef = ref(null)
const testPanelRef = ref(null)
const logPanelRef = ref(null)

// Initialize config from openai config
const config = reactive({
  baseUrl: openaiConfig.baseUrl,
  apiKey: '',
  models: {
    text: openaiConfig.models.text,
    image: openaiConfig.models.image,
    video: openaiConfig.models.video
  }
})

// Selected models per tab
const selectedModels = reactive({
  text: [],
  image: [],
  video: []
})

// Quick config refs
const timeout = ref(30000)
const maxTokens = ref(4096)

// Initialize OpenAI API composable
const openai = useOpenAI()

// Initialize test runner with OpenAI API methods
const testRunner = useTestRunner({
  sendChat: openai.sendChat,
  sendChatStream: openai.sendChatStream,
  runReasoning: openai.runReasoning,
  runFunctionCall: openai.runFunctionCall,
  runStructured: openai.runStructured,
  runEmbedding: openai.runEmbedding,
  runMultimodal: openai.runMultimodal,
  runBatch: openai.runBatch
})

// Handle config update from ConfigPanel
const handleConfigUpdate = (newConfig) => {
  config.baseUrl = newConfig.baseUrl
  config.apiKey = newConfig.apiKey
}

// Handle selected models update from ConfigPanel
const handleSelectedModelsUpdate = (newSelectedModels) => {
  selectedModels.text = newSelectedModels.text
  selectedModels.image = newSelectedModels.image
  selectedModels.video = newSelectedModels.video
}

// Handle run all tests
const handleRunAll = async () => {
  const activeTab = configPanelRef.value?.getActiveTab() || 'text'
  const models = selectedModels[activeTab]

  if (!config.apiKey) {
    testRunner.addLog('error', 'CONFIG', 'API Key is required', '')
    return
  }

  if (models.length === 0) {
    testRunner.addLog('warn', 'CONFIG', 'No models selected', '')
    return
  }

  const testConfig = {
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    timeout: timeout.value,
    maxTokens: maxTokens.value
  }

  await testRunner.runAllTests(testConfig, models)
}

// Handle run individual test
const handleRunTest = async (testType) => {
  const activeTab = configPanelRef.value?.getActiveTab() || 'text'
  const models = selectedModels[activeTab]

  if (!config.apiKey) {
    testRunner.addLog('error', 'CONFIG', 'API Key is required', '')
    return
  }

  if (models.length === 0) {
    testRunner.addLog('warn', 'CONFIG', 'No models selected', '')
    return
  }

  const testConfig = {
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    timeout: timeout.value,
    maxTokens: maxTokens.value
  }

  await testRunner.runSingleTest(testType, testConfig, models)
}

// Handle timeout update
const handleTimeoutUpdate = (value) => {
  timeout.value = value
}

// Handle max tokens update
const handleMaxTokensUpdate = (value) => {
  maxTokens.value = value
}

// Handle clear logs
const handleClearLogs = () => {
  testRunner.clearLogs()
}
</script>

<style scoped>
.openai-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

/* Top Bar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.provider-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.provider-name {
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.02em;
}

.provider-sub {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.provider-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 6px;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 320px 320px 1fr;
  gap: 0;
  flex: 1;
  overflow: hidden;
}

.panel-section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.config-section {
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 20px;
  overflow-y: auto;
}

.test-section {
  background: var(--surface2);
  border-right: 1px solid var(--border);
  padding: 20px;
  overflow-y: auto;
}

.log-section {
  background: var(--bg);
  padding: 20px;
  overflow: hidden;
}

/* Scrollbar styling */
.config-section::-webkit-scrollbar,
.test-section::-webkit-scrollbar {
  width: 4px;
}

.config-section::-webkit-scrollbar-track,
.test-section::-webkit-scrollbar-track {
  background: transparent;
}

.config-section::-webkit-scrollbar-thumb,
.test-section::-webkit-scrollbar-thumb {
  background: var(--border2);
  border-radius: 10px;
}

.config-section::-webkit-scrollbar-thumb:hover,
.test-section::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 280px 280px 1fr;
  }

  .config-section,
  .test-section {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
  }

  .config-section,
  .test-section {
    border-right: none;
    border-bottom: 1px solid var(--border);
    max-height: 400px;
  }

  .topbar {
    padding: 12px 16px;
  }

  .provider-name {
    font-size: 16px;
  }
}
</style>
