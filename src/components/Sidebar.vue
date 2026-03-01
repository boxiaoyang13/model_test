<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">Model Tester</div>
    </div>

    <div class="sidebar-label">Protocol</div>

    <div class="provider-list">
      <router-link
        v-for="provider in providers"
        :key="provider.id"
        :to="'/' + provider.id"
        class="provider-item"
        :class="{ active: isActive(provider.id) }"
        :data-provider="provider.id"
      >
        <div class="provider-dot"></div>
        <span class="provider-name">{{ provider.id }}</span>
      </router-link>
    </div>

    <div class="sidebar-footer">
      <div class="status-badge">
        <div class="status-dot"></div>
        Ready
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const providers = [
  { id: 'gemini', name: 'Gemini' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'openai', name: 'OpenAI' }
]

const isActive = (id) => {
  return route.path === '/' + id
}
</script>

<style scoped>
.sidebar {
  width: 150px;
  min-width: 150px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-active), transparent);
}

.sidebar-header {
  padding: 24px 20px 20px;
  border-bottom: 1px solid var(--border);
}

.sidebar-logo {
  /* font-family: 'Syne', sans-serif; */
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.15em;
  /* text-transform: uppercase; */
  color: var(--text-muted);
  margin-bottom: 4px;
}

.sidebar-title {
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.sidebar-label {
  padding: 20px 20px 10px;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.provider-list {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.provider-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s ease;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
  text-decoration: none;
}

.provider-item::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transition: opacity 0.18s;
}

.provider-item:hover {
  background: var(--surface2);
  border-color: var(--border2);
}

.provider-item.active {
  background: var(--surface2);
  border-color: var(--border2);
}

.provider-item.active::before { opacity: 1; }

.provider-item[data-provider="gemini"]::before { background: var(--accent-gemini); }
.provider-item[data-provider="anthropic"]::before { background: var(--accent-anthropic); }
.provider-item[data-provider="openai"]::before { background: var(--accent-openai); }

.provider-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.provider-item[data-provider="gemini"] .provider-dot { background: var(--accent-gemini); box-shadow: 0 0 6px var(--accent-gemini); }
.provider-item[data-provider="anthropic"] .provider-dot { background: var(--accent-anthropic); box-shadow: 0 0 6px var(--accent-anthropic); }
.provider-item[data-provider="openai"] .provider-dot { background: var(--accent-openai); box-shadow: 0 0 6px var(--accent-openai); }

.provider-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-dim);
  letter-spacing: 0.02em;
}

.provider-item.active .provider-name { color: var(--text); }

.sidebar-footer {
  margin-top: auto;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 6px var(--success);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
