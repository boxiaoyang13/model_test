<template>
  <div class="test-panel">
    <!-- Test Function section -->
    <section class="test-section">
      <div class="section-header">
        <h3 class="section-title">Test Function</h3>
        <button class="select-all-btn" @click="toggleSelectAll">
          <span v-if="isAllSelected">✕ 取消全选</span>
          <span v-else>✓ 全选</span>
        </button>
      </div>
      <div class="test-buttons-grid">
        <!-- Standard test buttons -->
        <button
          v-for="test in tests"
          :key="test.type"
          class="test-btn"
          :class="{
            running: currentTest === test.type,
            selected: selectedTests.has(test.type)
          }"
          :disabled="isRunning"
          @click.stop="toggleTestSelection(test.type)"
          :title="test.description"
        >
          <span class="test-icon">{{ test.icon }}</span>
          <span class="test-label">{{ test.label }}</span>
          <span v-if="currentTest === test.type" class="test-spinner"></span>
          <span v-if="selectedTests.has(test.type)" class="test-check">✓</span>
        </button>
        <!-- Favorite test buttons -->
        <button
          v-for="fav in favorites"
          :key="fav.id"
          class="test-btn test-btn-favorite"
          :class="{
            running: currentTest === `favorite-${fav.id}`,
            selected: selectedFavoriteId === fav.id
          }"
          :disabled="isRunning"
          @click.stop="handleFavoriteClick(fav)"
          @dblclick.stop="editFavorite(fav)"
          :title="fav.name"
        >
          <span class="test-icon">⭐</span>
          <span class="test-label">{{ fav.name }}</span>
          <span v-if="currentTest === `favorite-${fav.id}`" class="test-spinner"></span>
          <span v-if="selectedFavoriteId === fav.id" class="test-check">✓</span>
        </button>
        <!-- Custom Test Button (last) -->
        <button
          class="test-btn test-btn-custom"
          :class="{
            running: currentTest === 'custom',
            selected: selectedFavoriteId !== null
          }"
          :disabled="isRunning"
          @click="openCustomDialog"
          title="Custom JSON test"
        >
          <span class="test-icon">📝</span>
          <span class="test-label">Custom</span>
          <span v-if="currentTest === 'custom'" class="test-spinner"></span>
          <span v-if="selectedFavoriteId !== null" class="test-check">✓</span>
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

    <!-- Quick Config section -->
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

    <!-- Quick Test section -->
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
        {{ isRunning ? 'Running...' : 'Run' }}
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

    <!-- Custom JSON Test Dialog -->
    <div v-if="showCustomDialog" class="dialog-overlay" @click.self="closeCustomDialog">
      <div class="dialog dialog-invalid" :class="{ 'dialog-valid': isJsonValid }">
        <div class="dialog-header">
          <h3 class="dialog-title">{{ editingFavoriteId ? '编辑收藏' : 'Custom JSON Body' }}</h3>
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
          <div class="footer-left">
            <button class="dialog-btn dialog-btn-delete" v-if="editingFavoriteId" @click="deleteFavorite(editingFavoriteId)" title="删除收藏">
              🗑️
            </button>
            <button class="dialog-btn dialog-btn-favorite" @click="toggleFavoriteInput" v-if="!editingFavoriteId">
              收藏
            </button>
            <div class="favorite-input-wrapper">
              <input
                v-if="showFavoriteInput"
                v-model="favoriteName"
                class="favorite-input"
                :class="{ 'favorite-input-error': showFavoriteInputError }"
                :placeholder="editingFavoriteId ? '修改收藏名称' : '输入收藏名称'"
                @keyup.enter="saveFavorite"
                @input="showFavoriteInputError = false"
              />
              <p v-if="showFavoriteInputError && showFavoriteInput" class="favorite-error-text">
                请输入收藏名称
              </p>
            </div>
          </div>
          <div class="footer-right">
            <button class="dialog-btn dialog-btn-cancel" @click="closeCustomDialog">
              Cancel
            </button>
            <button
              class="dialog-btn dialog-btn-confirm"
              :disabled="!isJsonValid || !customJson.trim()"
              @click="handleOk"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { favoritesAPI } from '@/services/api'

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
  },
  protocol: {
    type: String,
    default: 'gemini'
  }
})

const emit = defineEmits(['runAll', 'runTest', 'update:timeout', 'update:vendor', 'update:nodeGroup', 'runCustom'])

// Custom dialog state
const showCustomDialog = ref(false)
const customJson = ref('')

// Favorites state
const showFavoriteInput = ref(false)
const favoriteName = ref('')
const favorites = ref([])
const showFavoriteInputError = ref(false)

// Selected tests state
const selectedTests = ref(new Set())
const selectedFavoriteId = ref(null)
const editingFavoriteId = ref(null)

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

// Computed: Check if all tests are selected
const isAllSelected = computed(() => {
  const allTestTypes = tests.value.map(t => t.type)
  return allTestTypes.length > 0 && allTestTypes.every(type => selectedTests.value.has(type))
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
  // 获取所有选中的测试类型
  const selectedTestTypes = Array.from(selectedTests.value)
  const customJsonContent = customJson.value.trim()
  const customJsonParsed = isJsonValid.value && customJsonContent ? JSON.parse(customJsonContent) : null

  // 如果有选中的收藏，使用收藏的 body
  let finalCustomJson = customJsonParsed
  if (selectedFavoriteId.value !== null && customJsonParsed) {
    finalCustomJson = customJsonParsed
  }

  // 如果没有选中任何测试，提示用户
  if (selectedTestTypes.length === 0 && selectedFavoriteId.value === null) {
    alert('请先选择要测试的项目')
    return
  }

  // 运行选中的测试
  emit('runAll', {
    selectedTests: selectedTestTypes,
    selectedFavoriteId: selectedFavoriteId.value,
    customJson: finalCustomJson
  })
}

// Toggle test selection
const toggleTestSelection = (testType) => {
  if (selectedTests.value.has(testType)) {
    selectedTests.value.delete(testType)
  } else {
    selectedTests.value.add(testType)
  }
}

// Toggle select all
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全选
    selectedTests.value.clear()
    selectedFavoriteId.value = null
  } else {
    // 全选所有测试
    tests.value.forEach(test => selectedTests.value.add(test.type))
  }
}

// Handle favorite click - select and run
const handleFavoriteClick = (fav) => {
  // 如果已选中，取消选中
  if (selectedFavoriteId.value === fav.id) {
    selectedFavoriteId.value = null
  } else {
    selectedFavoriteId.value = fav.id
  }
}

// Edit favorite - open dialog
const editFavorite = (fav) => {
  editingFavoriteId.value = fav.id
  favoriteName.value = fav.name
  customJson.value = fav.body_content
  showFavoriteInput.value = true
  showFavoriteInputError.value = false
  showCustomDialog.value = true
}

// Handle run individual test
const handleRunTest = (testType) => {
  emit('runTest', testType)
}

// Open custom dialog
const openCustomDialog = () => {
  editingFavoriteId.value = null
  favoriteName.value = ''
  customJson.value = ''
  showFavoriteInput.value = false
  showFavoriteInputError.value = false
  showCustomDialog.value = true
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
  showFavoriteInput.value = false
  favoriteName.value = ''
  editingFavoriteId.value = null
  showFavoriteInputError.value = false
}

// Load favorites on mount
onMounted(async () => {
  try {
    favorites.value = await favoritesAPI.getFavorites(props.protocol)
  } catch (error) {
    console.error('Failed to load favorites:', error)
  }
})

// Watch for protocol changes
watch(() => props.protocol, async (newProtocol) => {
  try {
    favorites.value = await favoritesAPI.getFavorites(newProtocol)
  } catch (error) {
    console.error('Failed to load favorites:', error)
  }
})

// Watch for tab changes - clear selections when tab changes
watch(() => props.activeTab, () => {
  selectedTests.value.clear()
})

// Toggle favorite input
const toggleFavoriteInput = () => {
  showFavoriteInput.value = !showFavoriteInput.value
  if (showFavoriteInput.value) {
    setTimeout(() => {
      const input = document.querySelector('.favorite-input')
      if (input) input.focus()
    }, 100)
  }
}

// Save favorite
const saveFavorite = async () => {
  if (!favoriteName.value.trim() || !isJsonValid.value || !customJson.value.trim()) {
    if (!favoriteName.value.trim()) {
      showFavoriteInputError.value = true
    }
    return
  }

  // Check for duplicate name (excluding current favorite when editing)
  const duplicate = favorites.value.find(f =>
    f.name === favoriteName.value.trim() && f.id !== editingFavoriteId.value
  )
  if (duplicate) {
    alert(`收藏名称 "${favoriteName.value}" 已存在，请使用其他名称`)
    showFavoriteInputError.value = true
    return
  }

  try {
    if (editingFavoriteId.value) {
      // 更新现有收藏
      const updatedFavorite = await favoritesAPI.updateFavorite(
        editingFavoriteId.value,
        favoriteName.value,
        customJson.value
      )
      const index = favorites.value.findIndex(f => f.id === editingFavoriteId.value)
      if (index !== -1) {
        favorites.value[index] = updatedFavorite
      }
    } else {
      // 创建新收藏
      const newFavorite = await favoritesAPI.createFavorite(
        props.protocol,
        favoriteName.value,
        customJson.value
      )
      favorites.value.push(newFavorite)
    }
    showFavoriteInput.value = false
    favoriteName.value = ''
    editingFavoriteId.value = null
    showFavoriteInputError.value = false
  } catch (error) {
    console.error('Failed to save favorite:', error)
    const errorMsg = error.message || ''
    if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
      alert('收藏名称已存在，请使用其他名称')
    } else {
      alert(editingFavoriteId.value ? '更新失败，请重试' : '保存失败，请重试')
    }
  }
}

// Handle OK button click (save only, don't send)
const handleOk = async () => {
  // If favorite input is shown, validate that name is provided
  if (showFavoriteInput.value) {
    if (!favoriteName.value.trim()) {
      showFavoriteInputError.value = true
      return
    }
    if (editingFavoriteId.value) {
      await saveFavorite()
    } else {
      await saveFavorite()
    }
  }
  // Just close dialog, don't run test
  showCustomDialog.value = false
}

// Delete favorite
const deleteFavorite = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个收藏吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--primary',
        cancelButtonClass: 'el-button--default'
      }
    )

    await favoritesAPI.deleteFavorite(id)
    favorites.value = favorites.value.filter(f => f.id !== id)
    // Clear selection if deleted favorite was selected
    if (selectedFavoriteId.value === id) {
      selectedFavoriteId.value = null
    }
    // Close the edit dialog after deletion
    closeCustomDialog()
  } catch (error) {
    // User cancelled or error occurred
    if (error !== 'cancel') {
      console.error('Failed to delete favorite:', error)
    }
  }
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

/* Select All Button */
.select-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-all-btn:hover {
  background: var(--glow-blue);
  border-color: var(--accent-active);
  color: var(--text);
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
  font-weight:  500;
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

.test-btn.selected {
  border-color: var(--accent-gemini);
  background: rgba(255, 167, 38, 0.15);
  color: var(--accent-gemini);
  box-shadow: 0 0 0 3px rgba(255, 167, 38, 0.3);
}

.test-check {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
  font-weight:  700;
  color: var(--accent-gemini);
  z-index: 2;
}

/* Custom Button */
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

.test-btn-custom.selected {
  border-color: var(--accent-gemini);
  background: rgba(255, 167, 38, 0.15);
  color: var(--accent-gemini);
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

/* Favorite Button Style */
.test-btn-favorite {
  border: 1px solid var(--accent-active);
  color: var(--accent-active);
  background: rgba(99, 102, 241, 0.05);
}

.test-btn-favorite:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--accent-active);
}

.test-btn-favorite.selected {
  background: rgba(99, 102, 241, 0.2);
  border-color: var(--accent-active);
  color: var(--accent-active);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
}

.test-btn-favorite.running {
  border-color: var(--accent-active);
  background: var(--glow-blue);
  color: var(--text);
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
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid var(--border);
}

.footer-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.footer-right {
  display: flex;
  gap: 12px;
  align-items: center;
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

/* Favorite Button */
.dialog-btn-favorite {
  background: var(--accent-gemini);
  border: none;
  color: var(--bg);
  margin-right: auto;
}

.dialog-btn-delete {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text-dim);
}

.dialog-btn-delete:hover {
  background: var(--bg);
  color: var(--text);
}

.favorite-input {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text);
  outline: none;
  margin-right: 12px;
  min-width: 150px;
  max-width: 200px;
  height: 38px;
}

.favorite-input:focus {
  border-color: var(--accent-active);
  box-shadow: 0 0 0 3px var(--glow-blue);
}

.favorite-input-error {
  border-color: var(--error) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
}

.favorite-input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3) !important;
}

.favorite-input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.favorite-error-text {
  color: var(--error);
  font-size: 10px;
  margin-top: 2px;
  margin-bottom: 0;
  white-space: nowrap;
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
