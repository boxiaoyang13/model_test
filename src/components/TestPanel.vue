<template>
  <div class="test-panel">
    <!-- One-click test section -->
    <section class="test-section">
      <div class="section-header">
        <h3 class="section-title">Quick Test</h3>
      </div>
      <button
        class="run-all-btn"
        :class="{ running: isRunning }"
        :disabled="isRunning"
        @click="handleRunAll"
      >
        <span v-if="isRunning" class="spinner"></span>
        <span v-else class="play-icon">▶</span>
        {{ isRunning ? 'Running Tests...' : 'Run All Tests' }}
      </button>

      <!-- Progress Bar -->
      <div v-if="isRunning" class="progress-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <div class="progress-info">
          <span class="progress-label">Progress</span>
          <span class="progress-value">{{ Math.round(progress) }}%</span>
        </div>
        <div v-if="currentTest" class="current-test">
          Running: {{ currentTest }}
        </div>
      </div>
    </section>

    <!-- Individual test buttons section -->
    <section class="test-section">
      <div class="section-header">
        <h3 class="section-title">Individual Tests</h3>
      </div>
      <div class="test-buttons-grid">
        <button
          v-for="test in tests"
          :key="test.type"
          class="test-btn"
          :class="{ running: currentTest === test.type }"
          :disabled="isRunning"
          @click="handleRunTest(test.type)"
          :title="test.description"
        >
          <span class="test-icon">{{ test.icon }}</span>
          <span class="test-label">{{ test.label }}</span>
          <span v-if="currentTest === test.type" class="test-spinner"></span>
        </button>
      </div>
    </section>

    <!-- Quick config section -->
    <section class="test-section">
      <div class="section-header">
        <h3 class="section-title">Quick Config</h3>
      </div>
      <div class="config-grid">
        <div class="config-item">
          <label class="config-label">Timeout (ms)</label>
          <input
            :value="timeout"
            type="number"
            class="config-input"
            min="1000"
            max="300000"
            step="1000"
            @input="handleTimeoutUpdate"
          />
        </div>
        <div class="config-item">
          <label class="config-label">Max Tokens</label>
          <input
            :value="maxTokens"
            type="number"
            class="config-input"
            min="1"
            max="32000"
            step="1"
            @input="handleMaxTokensUpdate"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isRunning: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  currentTest: {
    type: String,
    default: ''
  },
  timeout: {
    type: Number,
    default: 30000
  },
  maxTokens: {
    type: Number,
    default: 4096
  }
})

const emit = defineEmits(['runAll', 'runTest', 'update:timeout', 'update:maxTokens'])

// Test types with icons and descriptions
const tests = [
  { type: 'chat', icon: '💬', label: 'Chat', description: 'Basic chat completion test' },
  { type: 'chat-stream', icon: '⚡', label: 'Chat Stream', description: 'Streaming chat completion test' },
  { type: 'reasoning', icon: '🧠', label: 'Reasoning', description: 'Chain-of-thought reasoning test' },
  { type: 'functioncall', icon: '🔧', label: 'Function Call', description: 'Function calling capability test' },
  { type: 'struct', icon: '📐', label: 'Structured', description: 'Structured output test' },
  { type: 'embedding', icon: '🔢', label: 'Embedding', description: 'Text embedding generation test' },
  { type: 'multimodal', icon: '🖼', label: 'Multimodal', description: 'Vision/image analysis test' },
  { type: 'batch', icon: '📦', label: 'Batch', description: 'Batch request test' }
]

// Handle run all tests
const handleRunAll = () => {
  emit('runAll')
}

// Handle run individual test
const handleRunTest = (testType) => {
  emit('runTest', testType)
}

// Handle timeout update
const handleTimeoutUpdate = (event) => {
  const value = parseInt(event.target.value, 10)
  if (!isNaN(value) && value >= 1000 && value <= 300000) {
    emit('update:timeout', value)
  }
}

// Handle max tokens update
const handleMaxTokensUpdate = (event) => {
  const value = parseInt(event.target.value, 10)
  if (!isNaN(value) && value >= 1 && value <= 32000) {
    emit('update:maxTokens', value)
  }
}
</script>

<style scoped>
.test-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0;
}

/* Section Styling */
.test-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* Run All Button */
.run-all-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  background: var(--accent-active);
  border: none;
  border-radius: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--bg);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.run-all-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.run-all-btn:hover:not(:disabled)::before {
  transform: translateX(100%);
}

.run-all-btn:hover:not(:disabled) {
  box-shadow: 0 0 20px var(--glow-blue);
  transform: translateY(-1px);
}

.run-all-btn:active:not(:disabled) {
  transform: translateY(0);
}

.run-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.run-all-btn.running {
  background: var(--text-muted);
}

.play-icon {
  font-size: 12px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top-color: var(--bg);
  border-right-color: var(--bg);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Progress Container */
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-active), var(--accent-gemini));
  border-radius: 10px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-dim);
  letter-spacing: 0.02em;
}

.progress-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-active);
}

.current-test {
  font-size: 11px;
  color: var(--text-dim);
  padding-top: 4px;
  border-top: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace;
}

/* Test Buttons Grid */
.test-buttons-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.test-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.test-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--glow-blue);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.test-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.test-btn:hover:not(:disabled) {
  border-color: var(--accent-active);
  color: var(--text);
  transform: translateY(-1px);
}

.test-btn:active:not(:disabled) {
  transform: translateY(0);
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-btn.running {
  border-color: var(--accent-active);
  background: var(--glow-blue);
  color: var(--text);
}

.test-icon {
  font-size: 16px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.test-label {
  flex: 1;
  text-align: left;
  position: relative;
  z-index: 1;
}

.test-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top-color: var(--accent-active);
  border-right-color: var(--accent-active);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}

/* Quick Config Section */
.config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-dim);
  letter-spacing: 0.02em;
}

.config-input {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--text);
  transition: all 0.2s ease;
  outline: none;
}

.config-input::placeholder {
  color: var(--text-muted);
}

.config-input:focus {
  border-color: var(--accent-active);
  box-shadow: 0 0 0 3px var(--glow-blue);
}

.config-input:hover {
  border-color: var(--border2);
}

/* Remove number input spinners */
.config-input::-webkit-outer-spin-button,
.config-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.config-input[type='number'] {
  -moz-appearance: textfield;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .test-buttons-grid {
    grid-template-columns: 1fr;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
