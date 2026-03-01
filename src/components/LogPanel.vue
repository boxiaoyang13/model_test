<template>
  <div class="log-panel">
    <!-- Log Header -->
    <div class="log-header">
      <div class="header-left">
        <h3 class="log-title">Logs</h3>
        <span class="log-count">{{ logCount }} entries</span>
      </div>
      <button
        class="clear-btn"
        :disabled="logs.length === 0"
        @click="handleClear"
        aria-label="Clear logs"
      >
        <span class="clear-icon">🗑</span>
        Clear
      </button>
    </div>

    <!-- Log Body -->
    <div class="log-body" ref="logBodyRef">
      <!-- Empty State -->
      <div v-if="logs.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p class="empty-text">No logs yet</p>
        <p class="empty-hint">Run a test to see logs here</p>
      </div>

      <!-- Log Entries -->
      <div v-else class="log-entries">
        <div
          v-for="log in logs"
          :key="log.id"
          class="log-entry"
          :class="`log-entry--${log.type}`"
        >
          <div class="log-entry-header">
            <span class="log-tag">{{ log.tag }}</span>
            <span class="log-timestamp">{{ formatTimestamp(log.timestamp) }}</span>
            <span v-if="log.model" class="log-model">{{ log.model }}</span>
          </div>
          <div class="log-entry-content">{{ log.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  logs: {
    type: Array,
    required: true,
    default: () => []
  },
  logCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['clear'])

const logBodyRef = ref(null)

// Handle clear button click
const handleClear = () => {
  emit('clear')
}

// Format timestamp for display
const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// Auto-scroll to bottom when new logs are added
const scrollToBottom = () => {
  nextTick(() => {
    if (logBodyRef.value) {
      logBodyRef.value.scrollTop = logBodyRef.value.scrollHeight
    }
  })
}

// Watch for changes in logs and auto-scroll
watch(() => props.logs, () => {
  scrollToBottom()
}, { deep: true })
</script>

<style scoped>
.log-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 400px;
  max-height: 60vh;
}

/* Log Header */
.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.log-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.log-count {
  font-size: 11px;
  color: var(--text-dim);
  background: var(--surface2);
  padding: 4px 10px;
  border-radius: 12px;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover:not(:disabled) {
  background: var(--surface);
  border-color: var(--border2);
  color: var(--text);
}

.clear-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.clear-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.clear-icon {
  font-size: 12px;
}

/* Log Body - with proper scrolling */
.log-body {
  display: flex;
  flex-direction: column;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  flex: 1;
  min-height: 0; /* Important for flex scrolling */
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  flex: 1;
  padding: 8px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  height: 100%;
  min-height: 300px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.3;
}

.empty-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
}

.empty-hint {
  font-size: 12px;
  color: var(--text-dim);
}

/* Log Entry */
.log-entry {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  border-left: 3px solid var(--border2);
  transition: all 0.2s ease;
}

.log-entry:hover {
  border-color: var(--border2);
  background: var(--surface);
}

/* Log Entry Types */
.log-entry--info {
  border-left-color: var(--accent-active);
}

.log-entry--success {
  border-left-color: var(--success);
}

.log-entry--error {
  border-left-color: var(--error);
}

.log-entry--warn {
  border-left-color: var(--warning);
}

.log-entry-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.log-tag {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--surface2);
  color: var(--text-dim);
}

.log-entry--info .log-tag {
  background: var(--glow-blue);
  color: var(--accent-active);
}

.log-entry--success .log-tag {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success);
}

.log-entry--error .log-tag {
  background: rgba(239, 68, 68, 0.15);
  color: var(--error);
}

.log-entry--warn .log-tag {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
}

.log-timestamp {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
}

.log-model {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent-gemini);
  background: var(--surface2);
  padding: 2px 6px;
  border-radius: 4px;
}

.log-entry-content {
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.log-entry--error .log-entry-content {
  color: var(--error);
}

.log-entry--warn .log-entry-content {
  color: var(--warning);
}

/* Scrollbar for log entries */
.log-entries::-webkit-scrollbar {
  width: 4px;
}

.log-entries::-webkit-scrollbar-track {
  background: transparent;
}

.log-entries::-webkit-scrollbar-thumb {
  background: var(--border2);
  border-radius: 10px;
}

.log-entries::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .log-panel {
    min-height: 300px;
  }

  .log-entry-header {
    gap: 6px;
  }

  .log-entry {
    padding: 10px;
  }

  .empty-state {
    padding: 32px 16px;
  }
}
</style>
