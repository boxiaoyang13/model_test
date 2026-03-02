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
        <!-- Custom Test Button -->
        <button
          class="test-btn test-btn-custom"
          :class="{ running: currentTest === 'custom' }"
          :disabled="isRunning"
          @click="openCustomDialog"
          title="Custom JSON test"
        >
          <span class="test-icon">📝</span>
          <span class="test-label">Custom</span>
          <span v-if="currentTest === 'custom'" class="test-spinner"></span>
        </button>
      </div>
      <!-- Custom test notification -->
      <transition name="notification">
        <div
          v-if="customNotification"
          class="custom-notification"
          :class="customNotification.success ? 'notification-success' : 'notification-error'"
        >
          <span class="notification-icon">{{ customNotification.success ? '✓' : '✕' }}</span>
          <span>{{ customNotification.message }}</span>
        </div>
      </transition>
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
          <label class="config-label">Vendor</label>
          <input
            :value="vendor"
            type="text"
            class="config-input"
            placeholder="Optional"
            @input="handleVendorUpdate"
          />
        </div>
        <div class="config-item full-width">
          <label class="config-label">Node Group</label>
          <input
            :value="nodeGroup"
            type="text"
            class="config-input"
            placeholder="Optional"
            @input="handleNodeGroupUpdate"
          />
        </div>
      </div>
    </section>

    <!-- Custom JSON Test Dialog -->
    <div v-if="showCustomDialog" class="dialog-overlay" @click.self="closeCustomDialog">
      <div class="dialog dialog-invalid" :class="{ 'dialog-valid': isJsonValid }">
        <div class="dialog-header">
          <h3 class="dialog-title">Custom JSON Body</h3>
          <button class="dialog-close" @click="closeCustomDialog">✕</button>
        </div>
        <div class="dialog-body">
          <p class="dialog-hint">Enter a valid JSON object as the request body</p>
          <textarea
            v-model="customJson"
            class="json-textarea"
            :class="{ 'json-error': !isJsonValid && customJson.trim() }"
            placeholder='{"contents": [{"role": "user", "parts": [{"text": "Hello"}]}]}'
            @input="validateJson"
            rows="10"
          ></textarea>
          <p v-if="!isJsonValid && customJson.trim()" class="json-error-text">
            ❌ Invalid JSON format
          </p>
          <p v-else-if="customJson.trim()" class="json-success-text">
            ✓ Valid JSON
          </p>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn dialog-btn-cancel" @click="closeCustomDialog">
            Cancel
          </button>
          <button
            class="dialog-btn dialog-btn-confirm"
            :disabled="!isJsonValid || !customJson.trim()"
            @click="runCustomTest"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

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
  vendor: {
    type: String,
    default: ''
  },
  nodeGroup: {
    type: String,
    default: ''
  },
  activeTab: {
    type: String,
    default: 'text'
  },
  customNotification: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['runAll', 'runTest', 'update:timeout', 'update:vendor', 'update:nodeGroup', 'runCustom'])

// Custom dialog state
const showCustomDialog = ref(false)
const customJson = ref('')

// Computed: Check if JSON is valid
const isJsonValid = computed(() => {
  if (!customJson.value.trim()) return true
  try {
    JSON.parse(customJson.value)
    return true
  } catch {
    return false
  }
})

// Test types with icons and descriptions - computed based on activeTab
const tests = computed(() => {
  if (props.activeTab === 'text') {
    return [
      { type: 'chat', icon: '💬', label: 'Chat', description: 'Basic chat completion test' },
      { type: 'chat-stream', icon: '⚡', label: 'Chat Stream', description: 'Streaming chat completion test' },
      { type: 'reasoning', icon: '🧠', label: 'Reasoning', description: 'Chain-of-thought reasoning test' },
      { type: 'functioncall', icon: '🔧', label: 'Function Call', description: 'Function calling capability test' },
    ]
  } else if (props.activeTab === 'image') {
    return [
      { type: 'text-to-image', icon: '🖼️', label: 'Text to Image', description: 'Generate image from text' },
    ]
  } else if (props.activeTab === 'video') {
    return [
      { type: 'text-to-video', icon: '🎬', label: 'Text to Video', description: 'Generate video from text' },
    ]
  }
  return []
})

// Validate JSON
const validateJson = () => {
  // isJsonValid computed handles this
}

// Handle run all tests
const handleRunAll = () => {
  const customJsonContent = customJson.value.trim()
  const customJsonParsed = isJsonValid.value && customJsonContent ? JSON.parse(customJsonContent) : null
  emit('runAll', customJsonParsed)
}

// Handle run individual test
const handleRunTest = (testType) => {
  emit('runTest', testType)
}

// Open custom dialog
const openCustomDialog = () => {
  showCustomDialog.value = true
}

// Handle custom test
const runCustomTest = () => {
  emit('runCustom', JSON.parse(customJson.value))
  // Close dialog but keep the content for future use
  showCustomDialog.value = false
}

// Handle timeout update
const handleTimeoutUpdate = (event) => {
  const value = parseInt(event.target.value, 10)
  if (!isNaN(value) && value >= 1000 && value <= 300000) {
    emit('update:timeout', value)
  }
}

// Handle vendor update
const handleVendorUpdate = (event) => {
  emit('update:vendor', event.target.value)
}

// Handle node group update
const handleNodeGroupUpdate = (event) => {
  emit('update:nodeGroup', event.target.value)
}

// Close custom dialog
const closeCustomDialog = () => {
  showCustomDialog.value = false
  customJson.value = ''
}

// Watch for custom dialog opening
watch(showCustomDialog, (isOpen) => {
  if (isOpen) {
    // Focus textarea when dialog opens
    setTimeout(() => {
      const textarea = document.querySelector('.json-textarea')
      if (textarea) textarea.focus()
    }, 100)
  }
})
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

.test-btn-custom {
  border-style: dashed;
  border-color: var(--accent-active);
  color: var(--accent-active);
  position: relative;
  overflow: hidden;
}

.test-btn-custom:hover {
  background: var(--glow-blue);
}

.test-btn-custom.running {
  background: var(--glow-blue);
  color: var(--text);
  border-color: var(--accent-active);
  border-style: dashed;
  animation: spinDashed 1s linear infinite;
}

@keyframes spinDashed {
  0% {
    border-color: var(--accent-active);
    box-shadow: 0 0 5px var(--glow-blue);
  }
  25% {
    border-color: var(--accent-gemini);
  }
  50% {
    border-color: var(--accent-active);
    box-shadow: 0 0 15px var(--glow-blue);
  }
  75% {
    border-color: var(--accent-gemini);
  }
  100% {
    border-color: var(--accent-active);
    box-shadow: 0 0 5px var(--glow-blue);
  }
}

/* Add a pulsing glow effect */
.test-btn-custom.running::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 2px dashed var(--accent-active);
  transform: translate(-50%, -50%);
  animation: spinBorder 2s linear infinite;
  pointer-events: none;
}

@keyframes spinBorder {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
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

.config-item.full-width {
  grid-column: 1 / -1;
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

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.dialog {
  background: var(--surface);
  border: 2px solid var(--error);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  transition: border-color 0.3s ease;
}

.dialog-valid {
  border-color: var(--border);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.dialog-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s;
}

.dialog-close:hover {
  color: var(--text);
}

.dialog-body {
  padding: 20px;
}

.dialog-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.json-textarea {
  width: 100%;
  min-height: 200px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text);
  resize: vertical;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1.5;
}

.json-textarea:focus {
  outline: none;
  border-color: var(--accent-active);
  box-shadow: 0 0 0 3px var(--glow-blue);
}

.json-error {
  border-color: var(--error) !important;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

.json-error-text {
  color: var(--error);
  font-size: 12px;
  margin-top: 8px;
}

.json-success-text {
  color: var(--success);
  font-size: 12px;
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.dialog-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dialog-btn-cancel {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text-dim);
}

.dialog-btn-cancel:hover {
  background: var(--bg);
  color: var(--text);
}

.dialog-btn-confirm {
  background: var(--accent-active);
  border: none;
  color: var(--bg);
}

.dialog-btn-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Custom test notification */
.custom-notification {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
}

.notification-success {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid var(--success);
  color: var(--success);
}

.notification-error {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid var(--error);
  color: var(--error);
}

.notification-icon {
  font-size: 12px;
  font-weight: 700;
}

.notification-enter-active,
.notification-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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
