<template>
  <div class="view-container">
    <div class="view-header">
      <h1 class="view-title">Gemini API Tester</h1>
    </div>
    <div class="view-content">
      <ConfigPanel :config="config" @update="updateConfig" />
      <TestPanel
        :is-loading="isLoading"
        :can-test="canTest"
        @test="runTest"
      />
      <LogPanel :logs="logs" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ConfigPanel from '@/components/ConfigPanel.vue'
import TestPanel from '@/components/TestPanel.vue'
import LogPanel from '@/components/LogPanel.vue'
import { useGemini } from '@/composables/useGemini'
import { useTestRunner } from '@/composables/useTestRunner'

const config = ref({
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: '',
  model: 'gemini-2.0-flash-exp'
})

const updateConfig = (newConfig) => {
  config.value = newConfig
}

const gemini = useGemini(config)
const { isLoading, logs, canTest, runTest } = useTestRunner(gemini, config)
</script>

<style scoped>
.view-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}

.view-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.view-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
</style>
