<template>
  <div class="config-panel">
    <!-- Connection Configuration Section -->
    <section class="config-section">
      <div class="section-header">
        <h3 class="section-title">Connection</h3>
      </div>
      <div class="form-group">
        <label class="form-label">Base URL</label>
        <input
          v-model="localConfig.baseUrl"
          type="text"
          class="form-input"
          placeholder="https://api.example.com"
          @input="emitConfigUpdate"
        />
      </div>
      <div class="form-group">
        <label class="form-label">API Key</label>
        <input
          v-model="localConfig.apiKey"
          type="password"
          class="form-input"
          placeholder="sk-..."
          @input="emitConfigUpdate"
        />
      </div>
    </section>

    <!-- Model Type Tabs Section -->
    <section class="config-section">
      <div class="section-header">
        <h3 class="section-title">Model Type</h3>
      </div>
      <div class="tabs-container">
        <button
          v-for="(label, tab) in modelTypes"
          :key="tab"
          class="tab-button"
          :class="{ active: activeTab === tab }"
          @click="switchTab(tab)"
        >
          {{ label }}
        </button>
      </div>
    </section>

    <!-- Model Selection Section -->
    <section class="config-section">
      <div class="section-header">
        <h3 class="section-title">Models</h3>
        <span class="model-count">{{ selectedModelsCount }} selected</span>
      </div>

      <!-- Selected Models Chips -->
      <div v-if="selectedModelsCount > 0" class="selected-chips">
        <div
          v-for="model in currentTabSelectedModels"
          :key="model"
          class="model-chip"
        >
          <span class="chip-label">{{ model }}</span>
          <button
            class="chip-remove"
            @click="removeModel(model)"
            aria-label="Remove model"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Available Models List -->
      <div class="models-list">
        <div class="list-header">
          <span class="list-title">Available Models</span>
        </div>
        <div class="models-options">
          <label
            v-for="model in availableModels"
            :key="model"
            class="model-option"
            :class="{ selected: isModelSelected(model) }"
          >
            <input
              type="checkbox"
              :checked="isModelSelected(model)"
              @change="toggleModel(model)"
              class="model-checkbox"
            />
            <span class="model-name">{{ model }}</span>
            <span v-if="isModelSelected(model)" class="check-icon">✓</span>
          </label>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true,
    default: () => ({
      baseUrl: '',
      apiKey: '',
      models: {
        text: [],
        image: [],
        video: []
      }
    })
  }
})

const emit = defineEmits(['update:config', 'update:selectedModels'])

// Model type tabs configuration
const modelTypes = {
  text: 'Text',
  image: 'Image',
  video: 'Video'
}

// Active tab - using ref (not reactive) as specified
const activeTab = ref('text')

// Local reactive state for configuration
const localConfig = reactive({
  baseUrl: props.config.baseUrl || '',
  apiKey: props.config.apiKey || '',
  models: {
    text: props.config.models?.text || [],
    image: props.config.models?.image || [],
    video: props.config.models?.video || []
  }
})

// Local reactive state for selected models (per tab)
const localSelectedModels = reactive({
  text: [],
  image: [],
  video: []
})

// Computed: Available models for current tab
const availableModels = computed(() => {
  return localConfig.models[activeTab.value] || []
})

// Computed: Selected models for current tab
const currentTabSelectedModels = computed(() => {
  return localSelectedModels[activeTab.value] || []
})

// Computed: Count of selected models for current tab
const selectedModelsCount = computed(() => {
  return currentTabSelectedModels.value.length
})

// Method: Switch to a different tab
const switchTab = (tab) => {
  activeTab.value = tab
}

// Method: Check if a model is selected
const isModelSelected = (model) => {
  return localSelectedModels[activeTab.value].includes(model)
}

// Method: Toggle model selection
const toggleModel = (model) => {
  const currentList = localSelectedModels[activeTab.value]
  const index = currentList.indexOf(model)

  if (index > -1) {
    currentList.splice(index, 1)
  } else {
    currentList.push(model)
  }

  emitSelectedModelsUpdate()
}

// Method: Remove a model from selection
const removeModel = (model) => {
  const currentList = localSelectedModels[activeTab.value]
  const index = currentList.indexOf(model)

  if (index > -1) {
    currentList.splice(index, 1)
    emitSelectedModelsUpdate()
  }
}

// Method: Emit config update
const emitConfigUpdate = () => {
  emit('update:config', { ...localConfig })
}

// Method: Emit selected models update
const emitSelectedModelsUpdate = () => {
  emit('update:selectedModels', {
    ...localSelectedModels
  })
}

// Expose methods for parent component access
defineExpose({
  getSelectedModels: () => localSelectedModels[activeTab.value],
  getConfig: () => ({ ...localConfig }),
  getActiveTab: () => activeTab.value
})

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    localConfig.baseUrl = newConfig.baseUrl || ''
    localConfig.apiKey = newConfig.apiKey || ''
    if (newConfig.models) {
      localConfig.models = {
        text: newConfig.models.text || [],
        image: newConfig.models.image || [],
        video: newConfig.models.video || []
      }
    }
  }
}, { deep: true })
</script>

<style scoped>
.config-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0;
}

/* Section Styling */
.config-section {
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

.model-count {
  font-size: 11px;
  color: var(--text-dim);
  background: var(--surface2);
  padding: 4px 10px;
  border-radius: 12px;
}

/* Form Styling */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-dim);
  letter-spacing: 0.02em;
}

.form-input {
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

.form-input::placeholder {
  color: var(--text-muted);
}

.form-input:focus {
  border-color: var(--accent-active);
  box-shadow: 0 0 0 3px var(--glow-blue);
}

.form-input:hover {
  border-color: var(--border2);
}

/* Tabs Styling */
.tabs-container {
  display: flex;
  gap: 6px;
  background: var(--surface2);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border);
}

.tab-button {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tab-button:hover {
  color: var(--text);
  background: var(--bg);
}

.tab-button.active {
  background: var(--bg);
  color: var(--text);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Selected Chips Styling */
.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  min-height: 48px;
}

.model-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: var(--text);
  transition: all 0.2s ease;
}

.model-chip:hover {
  border-color: var(--accent-active);
}

.chip-label {
  font-family: 'JetBrains Mono', monospace;
}

.chip-remove {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.chip-remove:hover {
  background: var(--error);
  color: white;
}

/* Models List Styling */
.models-list {
  display: flex;
  flex-direction: column;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.list-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.list-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.models-options {
  display: flex;
  flex-direction: column;
  max-height: 240px;
  overflow-y: auto;
}

.model-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.18s ease;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.model-option:last-child {
  border-bottom: none;
}

.model-option:hover {
  background: var(--bg);
}

.model-option.selected {
  background: var(--glow-blue);
}

.model-checkbox {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid var(--border2);
  border-radius: 4px;
  background: var(--bg);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.model-checkbox:checked {
  background: var(--accent-active);
  border-color: var(--accent-active);
}

.model-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.model-checkbox:hover {
  border-color: var(--accent-active);
}

.model-name {
  flex: 1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--text-dim);
}

.model-option.selected .model-name {
  color: var(--text);
  font-weight: 500;
}

.check-icon {
  color: var(--accent-active);
  font-size: 14px;
  font-weight: bold;
}

/* Scrollbar for models list */
.models-options::-webkit-scrollbar {
  width: 4px;
}

.models-options::-webkit-scrollbar-track {
  background: transparent;
}

.models-options::-webkit-scrollbar-thumb {
  background: var(--border2);
  border-radius: 10px;
}

.models-options::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
