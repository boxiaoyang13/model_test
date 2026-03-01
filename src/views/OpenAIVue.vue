<template>
  <div class="view-container">
    <div class="view-header">
      <h1 class="view-title">OpenAI API Tester</h1>
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
import { useOpenAI } from '@/composables/useOpenAI'
import { useTestRunner } from '@/composables/useTestRunner'

const config = ref({
  baseUrl: 'https://api.openai.com',
  apiKey: '',
  model: 'gpt-4o'
})

const updateConfig = (newConfig) => {
  config.value = newConfig
}

const openai = useOpenAI(config)
const { isLoading, logs, canTest, runTest } = useTestRunner(openai, config)
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
