<template>
  <div class="main">
    <div class="topbar">
      <span class="topbar-provider">Anthropic</span>
      <span class="topbar-sep">/</span>
      <span class="topbar-sub">Claude API</span>
      <div class="topbar-actions">
        <div class="info-row">
          <div class="info-badge">
            <div class="info-badge-dot" :style="{ background: config.color }"></div>
            {{ config.badge }}
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <ConfigPanel
        ref="configPanelRef"
        :config="config"
        @update:config="updateConfig"
        @update:selectedModels="updateSelectedModels"
      />

      <TestPanel
        :is-running="testState.running"
        :progress="testState.progress"
        :current-test="testState.currentTest"
        :timeout="timeout"
        :max-tokens="maxTokens"
        @runAll="handleRunAll"
        @runTest="handleRunTest"
        @update:timeout="timeout = $event"
        @update:maxTokens="maxTokens = $event"
      />

      <LogPanel
        :logs="logs"
        :log-count="logCount"
        @clear="clearLogs"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAnthropic } from '@/composables/useAnthropic'
import { useTestRunner } from '@/composables/useTestRunner'
import ConfigPanel from '@/components/ConfigPanel.vue'
import TestPanel from '@/components/TestPanel.vue'
import LogPanel from '@/components/LogPanel.vue'
import anthropicConfig from '@/config/anthropic.js'

const config = reactive({ ...anthropicConfig, apiKey: '' })
const selectedModelsMap = reactive({ text: [], image: [], video: [] })
const timeout = ref(10000)
const maxTokens = ref(1024)

const configPanelRef = ref(null)

const api = useAnthropic()
const { testState, logs, logCount, runSingleTest, runAllTests, clearLogs } = useTestRunner(api)

const updateConfig = (newConfig) => {
  Object.assign(config, newConfig)
}

const updateSelectedModels = (models) => {
  Object.assign(selectedModelsMap, models)
}

const handleRunAll = async () => {
  const currentModels = configPanelRef.value?.getSelectedModels() || []
  const testConfig = configPanelRef.value?.getConfig() || config

  await runAllTests({
    ...testConfig,
    timeout: timeout.value,
    maxTokens: maxTokens.value
  }, currentModels)
}

const handleRunTest = async (testType) => {
  const currentModels = configPanelRef.value?.getSelectedModels() || []
  const testConfig = configPanelRef.value?.getConfig() || config

  await runSingleTest(testType, {
    ...testConfig,
    timeout: timeout.value,
    maxTokens: maxTokens.value
  }, currentModels)
}
</script>

<style scoped>
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 40px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
}

.topbar-provider {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
}

.topbar-sep {
  color: #666;
}

.topbar-sub {
  font-size: 12px;
  color: #999;
}

.topbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #999;
}

.info-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.content {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
