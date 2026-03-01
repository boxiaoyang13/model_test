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
          <div class="log-entry-content">
            <!-- Check if content contains image data (only for RESPONSE BODY logs) -->
            <template v-if="log.tag === 'RESPONSE BODY' && hasImageData(log.content)">
              <div class="log-image-container">
                <img
                  v-if="getImageData(log.content)"
                  :src="getImageData(log.content)"
                  :alt="log.tag"
                  class="log-image"
                  @click="expandImage(getImageData(log.content))"
                />
                <p class="image-hint">Click to expand image</p>
              </div>
            </template>
            <!-- Check if content contains video URI (for VIDEO URI logs) -->
            <template v-else-if="log.tag === 'VIDEO URI'">
              <div class="log-video-container">
                <div class="video-preview" v-if="!isVideoExpanded">
                  <div class="video-placeholder" @click="expandVideo(log.content)">
                    <span class="video-icon">🎬</span>
                    <p class="video-hint">Click to preview</p>
                    <button
                      v-if="apiKey && downloadVideo"
                      class="download-video-btn"
                      @click.stop="handleDownloadVideo(log.content)"
                    >
                      <span class="download-icon">⬇</span>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              {{ log.content }}
            </template>
          </div>
        </div>
      </div>

      <!-- Image Modal -->
      <div v-if="expandedImage" class="image-modal" @click="closeImageModal">
        <img :src="expandedImage" class="expanded-image" @click.stop />
        <button class="close-modal-btn" @click="closeImageModal">✕</button>
      </div>

      <!-- Video Modal -->
      <div v-if="expandedVideo" class="video-modal" @click="closeVideoModal">
        <div class="video-modal-content" @click.stop>
          <video
            v-if="videoBlobUrl"
            :src="videoBlobUrl"
            class="expanded-video"
            controls
            autoplay
          ></video>
          <div v-else class="video-loading">Loading video...</div>
          <button class="close-modal-btn" @click="closeVideoModal">✕</button>
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
  },
  activeTab: {
    type: String,
    default: 'text'
  },
  apiKey: {
    type: String,
    default: ''
  },
  downloadVideo: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['clear'])

const logBodyRef = ref(null)
const expandedImage = ref(null)
const expandedVideo = ref(null)
const isVideoExpanded = ref(false)
const videoBlobUrl = ref(null)

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

// Helper: find inlineData from candidates
const findInlineData = (candidates) => {
  if (!candidates || candidates.length === 0) return null

  for (const candidate of candidates) {
    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data && part.inlineData?.mimeType) {
          return part.inlineData
        }
      }
    }
  }
  return null
}

// Check if content contains image data (base64 or inlineData)
const hasImageData = (content) => {
  if (!content) return false

  // Handle object (result.data directly)
  if (typeof content === 'object') {
    const inlineData = findInlineData(content.candidates)
    return !!inlineData
  }

  // Handle string (JSON stringified content)
  if (typeof content === 'string') {
    // Quick check: likely JSON if it starts with '{' or '['
    const trimmed = content.trim()
    if (trimmed[0] !== '{' && trimmed[0] !== '[') {
      return false
    }

    try {
      const parsed = JSON.parse(content)
      const inlineData = findInlineData(parsed.candidates) || parsed.inlineData
      return !!inlineData
    } catch (e) {
      return false
    }
  }

  return false
}

// Extract image data URL from content
const getImageData = (content) => {
  if (!content) return null

  // Handle object (result.data directly)
  if (typeof content === 'object') {
    const inlineData = findInlineData(content.candidates)
    if (inlineData?.data && inlineData?.mimeType) {
      return `data:${inlineData.mimeType};base64,${inlineData.data}`
    }
    return null
  }

  // Handle string (JSON stringified content)
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content)
      const inlineData = findInlineData(parsed.candidates) || parsed.inlineData
      if (inlineData?.data && inlineData?.mimeType) {
        return `data:${inlineData.mimeType};base64,${inlineData.data}`
      }
    } catch (e) {
      return null
    }
  }

  return null
}

// Expand image to modal
const expandImage = (imageUrl) => {
  expandedImage.value = imageUrl
}

// Close image modal
const closeImageModal = () => {
  expandedImage.value = null
}

// Expand video to modal
const expandVideo = async (videoUrl) => {
  expandedVideo.value = videoUrl
  isVideoExpanded.value = true
  videoBlobUrl.value = null

  // Download video for preview if API key is available
  if (props.apiKey) {
    try {
      const response = await fetch(videoUrl, {
        method: 'GET',
        headers: {
          'x-goog-api-key': props.apiKey
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        videoBlobUrl.value = window.URL.createObjectURL(blob)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (err) {
      console.error('Failed to load video for preview:', err)
      alert(`Failed to load video for preview: ${err.message}`)
    }
  }
}

// Close video modal
const closeVideoModal = () => {
  // Revoke blob URL to free memory
  if (videoBlobUrl.value) {
    window.URL.revokeObjectURL(videoBlobUrl.value)
    videoBlobUrl.value = null
  }
  expandedVideo.value = null
  isVideoExpanded.value = false
}

// Handle download video
const handleDownloadVideo = async (videoUrl) => {
  if (!props.downloadVideo || !props.apiKey) return

  try {
    await props.downloadVideo(videoUrl, props.apiKey)
  } catch (err) {
    console.error('Failed to download video:', err)
    alert(`Failed to download video: ${err.message}`)
  }
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
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
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

/* Image Display Styles */
.log-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.log-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border);
}

.log-image:hover {
  border-color: var(--accent-active);
  box-shadow: 0 0 10px var(--glow-blue);
}

.image-hint {
  font-size: 10px;
  color: var(--text-muted);
  font-style: italic;
}

/* Image Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.expanded-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

.close-modal-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 50%;
  font-size: 20px;
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-modal-btn:hover {
  background: var(--surface2);
  border-color: var(--accent-active);
  transform: rotate(90deg);
}

/* Video Display Styles */
.log-video-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.video-preview {
  width: 100%;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: var(--surface2);
  border: 2px dashed var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.video-placeholder:hover {
  border-color: var(--accent-active);
  background: var(--glow-blue);
}

.video-icon {
  font-size: 32px;
}

.video-hint {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
}

.download-video-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--accent-active);
  border: none;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--bg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-video-btn:hover {
  background: var(--accent-gemini);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--glow-blue);
}

.download-video-btn:active {
  transform: translateY(0);
}

.download-icon {
  font-size: 14px;
}

/* Video Modal */
.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.video-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.expanded-video {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
}

.video-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  font-size: 14px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
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
