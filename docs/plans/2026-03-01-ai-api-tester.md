# AI API Tester Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Vue 3 web application for testing AI model APIs (Gemini, Anthropic, OpenAI) with a dark theme matching the existing HTML design.

**Architecture:** Single-page application with Vue Router for independent provider routes. Shared components for ConfigPanel, TestPanel, and LogPanel. Composables for API encapsulation returning full response objects. Component-level state management (no Pinia).

**Tech Stack:** Vue 3 (Composition API), Vite, Tailwind CSS, Element Plus (deeply customized), Vue Router

---

## Phase 1: Project Setup

### Task 1: Initialize Vite + Vue 3 Project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`

**Step 1: Initialize package.json**

```bash
cd /Users/xiaobo.yang/Documents/Project/zenai/model_test
npm create vite@latest . -- --template vue
```

**Step 2: Install dependencies**

```bash
npm install vue-router
npm install element-plus
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 3: Configure Vite**

Create `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

**Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Gateway — API Tester</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**Step 5: Create src/main.js**

```javascript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'
import './styles/main.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
```

**Step 6: Commit**

```bash
git add package.json vite.config.js index.html src/main.js
git commit -m "feat: initialize Vite + Vue 3 project with Element Plus and Tailwind"
```

---

### Task 2: Configure Tailwind CSS

**Files:**
- Create: `tailwind.config.js`
- Create: `src/styles/main.css`

**Step 1: Create Tailwind config**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0b0f',
        surface: '#111318',
        'surface2': '#181c24',
        border: '#1e2433',
        'border2': '#2a3147',
        'accent-gemini': '#8b5cf6',
        'accent-anthropic': '#e8673c',
        'accent-openai': '#10a37f',
        'accent-active': '#60a5fa',
        text: '#e2e8f0',
        'text-muted': '#64748b',
        'text-dim': '#94a3b8',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        syne: ['"Syne"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

**Step 2: Create main.css with CSS variables**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0a0b0f;
  --surface: #111318;
  --surface2: #181c24;
  --border: #1e2433;
  --border2: #2a3147;
  --accent-gemini: #8b5cf6;
  --accent-anthropic: #e8673c;
  --accent-openai: #10a37f;
  --accent-active: #60a5fa;
  --text: #e2e8f0;
  --text-muted: #64748b;
  --text-dim: #94a3b8;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --glow-blue: rgba(96, 165, 250, 0.15);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'JetBrains Mono', monospace;
  background: var(--bg);
  color: var(--text);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border2);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
```

**Step 3: Commit**

```bash
git add tailwind.config.js src/styles/main.css
git commit -m "feat: configure Tailwind CSS with custom theme variables"
```

---

### Task 3: Setup Vue Router

**Files:**
- Create: `src/router/index.js`

**Step 1: Create router configuration**

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/gemini'
  },
  {
    path: '/gemini',
    name: 'Gemini',
    component: () => import('@/views/GeminiView.vue')
  },
  {
    path: '/anthropic',
    name: 'Anthropic',
    component: () => import('@/views/AnthropicView.vue')
  },
  {
    path: '/openai',
    name: 'OpenAI',
    component: () => import('@/views/OpenAIVue.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

**Step 2: Commit**

```bash
git add src/router/index.js
git commit -m "feat: setup Vue Router with provider routes"
```

---

## Phase 2: Configuration Files

### Task 4: Create Provider Configurations

**Files:**
- Create: `src/config/gemini.js`
- Create: `src/config/anthropic.js`
- Create: `src/config/openai.js`

**Step 1: Create Gemini config**

```javascript
// src/config/gemini.js
export default {
  id: 'gemini',
  name: 'Gemini',
  sub: 'Google AI Studio',
  badge: 'gemini-protocol',
  color: '#8b5cf6',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  models: {
    text: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    image: ['imagen-3.0', 'imagen-2.0', 'gemini-vision'],
    video: ['veo-2', 'veo-1']
  },
  testTypes: ['chat', 'chat-stream', 'reasoning', 'functioncall', 'struct', 'embedding', 'multimodal', 'batch']
}
```

**Step 2: Create Anthropic config**

```javascript
// src/config/anthropic.js
export default {
  id: 'anthropic',
  name: 'Anthropic',
  sub: 'Claude API',
  badge: 'anthropic-protocol',
  color: '#e8673c',
  baseUrl: 'https://api.anthropic.com/v1',
  models: {
    text: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5', 'claude-3-5-sonnet', 'claude-3-opus'],
    image: ['claude-3-5-sonnet-vision', 'claude-3-opus-vision'],
    video: []
  },
  testTypes: ['chat', 'chat-stream', 'reasoning', 'functioncall', 'struct', 'embedding', 'multimodal', 'batch']
}
```

**Step 3: Create OpenAI config**

```javascript
// src/config/openai.js
export default {
  id: 'openai',
  name: 'OpenAI',
  sub: 'OpenAI API',
  badge: 'openai-protocol',
  color: '#10a37f',
  baseUrl: 'https://api.openai.com/v1',
  models: {
    text: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1', 'o3-mini'],
    image: ['dall-e-3', 'dall-e-2', 'gpt-4-vision'],
    video: ['sora']
  },
  testTypes: ['chat', 'chat-stream', 'reasoning', 'functioncall', 'struct', 'embedding', 'multimodal', 'batch']
}
```

**Step 4: Commit**

```bash
git add src/config/
git commit -m "feat: add provider configuration files"
```

---

## Phase 3: Composables

### Task 5: Create useGemini Composable

**Files:**
- Create: `src/composables/useGemini.js`

**Step 1: Implement useGemini**

```javascript
import { reactive } from 'vue'

export function useGemini() {
  const state = reactive({
    loading: false,
    error: null,
    response: null
  })

  const sendChat = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: payload.prompt }] }]
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  const sendChatStream = async (config, payload) => {
    // Streaming implementation
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/models/${model}:streamGenerateContent?key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: payload.prompt }] }]
        })
      })

      const duration = Date.now() - startTime
      const chunks = []
      const reader = response.body.getReader()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data: { chunks, chunkCount: chunks.length },
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  // Other test methods
  const runReasoning = async (config, payload) => {
    // Implementation
    return sendChat(config, { ...payload, reasoning: true })
  }

  const runFunctionCall = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: payload.prompt }] }],
          tools: [{ functionDeclarations: payload.functions || [] }]
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data,
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  const runStructured = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: payload.prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: payload.schema
          }
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data,
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  const runEmbedding = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey } = config
      const url = `${baseUrl}/models/embedding-001:embedContent?key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: payload.prompt }] }
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data,
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  const runMultimodal = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: payload.prompt || 'Describe this image' },
              { inline_data: { mime_type: payload.imageType, data: payload.imageData } }
            ]
          }]
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data,
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  const runBatch = async (config, payloads) => {
    state.loading = true
    const startTime = Date.now()
    const results = []

    try {
      for (const payload of payloads) {
        const result = await sendChat(config, payload)
        results.push(result)
      }

      const duration = Date.now() - startTime

      state.response = {
        status: 207,
        statusText: 'Multi-Status',
        data: { results, count: results.length },
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  return {
    state,
    sendChat,
    sendChatStream,
    runReasoning,
    runFunctionCall,
    runStructured,
    runEmbedding,
    runMultimodal,
    runBatch
  }
}
```

**Step 2: Commit**

```bash
git add src/composables/useGemini.js
git commit -m "feat: add useGemini composable with full API methods"
```

---

### Task 6: Create useAnthropic Composable

**Files:**
- Create: `src/composables/useAnthropic.js`

**Step 1: Implement useAnthropic**

```javascript
import { reactive } from 'vue'

export function useAnthropic() {
  const state = reactive({
    loading: false,
    error: null,
    response: null
  })

  const sendChat = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: payload.maxTokens || 1024,
          messages: [{ role: 'user', content: payload.prompt }]
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  const sendChatStream = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: payload.maxTokens || 1024,
          messages: [{ role: 'user', content: payload.prompt }],
          stream: true
        })
      })

      const duration = Date.now() - startTime
      const chunks = []
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        chunks.push(chunk)
      }

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data: { chunks, chunkCount: chunks.length },
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  const runReasoning = async (config, payload) => {
    return sendChat(config, {
      ...payload,
      prompt: `Think step by step: ${payload.prompt}`
    })
  }

  const runFunctionCall = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: payload.maxTokens || 1024,
          messages: [{ role: 'user', content: payload.prompt }],
          tools: payload.functions || []
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data,
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  const runStructured = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: payload.maxTokens || 1024,
          messages: [{
            role: 'user',
            content: `Respond with valid JSON only. Schema: ${JSON.stringify(payload.schema)}\n\n${payload.prompt}`
          }]
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data,
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  const runEmbedding = async (config, payload) => {
    state.error = new Error('Anthropic does not provide embedding API')
    throw state.error
  }

  const runMultimodal = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: payload.maxTokens || 1024,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: payload.prompt || 'Describe this image' },
              { type: 'image', source: { type: 'base64', media_type: payload.imageType, data: payload.imageData } }
            ]
          }]
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data,
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  const runBatch = async (config, payloads) => {
    state.loading = true
    const startTime = Date.now()
    const results = []

    try {
      for (const payload of payloads) {
        const result = await sendChat(config, payload)
        results.push(result)
      }

      const duration = Date.now() - startTime

      state.response = {
        status: 207,
        statusText: 'Multi-Status',
        data: { results, count: results.length },
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  return {
    state,
    sendChat,
    sendChatStream,
    runReasoning,
    runFunctionCall,
    runStructured,
    runEmbedding,
    runMultimodal,
    runBatch
  }
}
```

**Step 2: Commit**

```bash
git add src/composables/useAnthropic.js
git commit -m "feat: add useAnthropic composable with full API methods"
```

---

### Task 7: Create useOpenAI Composable

**Files:**
- Create: `src/composables/useOpenAI.js`

**Step 1: Implement useOpenAI**

```javascript
import { reactive } from 'vue'

export function useOpenAI() {
  const state = reactive({
    loading: false,
    error: null,
    response: null
  })

  const sendChat = async (config, payload) => {
    state.loading = true
    state.error = null
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/chat/completions`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: payload.prompt }],
          max_tokens: payload.maxTokens || 1024
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  const sendChatStream = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/chat/completions`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: payload.prompt }],
          max_tokens: payload.maxTokens || 1024,
          stream: true
        })
      })

      const duration = Date.now() - startTime
      const chunks = []
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        chunks.push(chunk)
      }

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data: { chunks, chunkCount: chunks.length },
        duration
      }

      return state.response
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = false
    }
  }

  const runReasoning = async (config, payload) => {
    // Use o1/o3 models for reasoning
    return sendChat(config, payload)
  }

  const runFunctionCall = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/chat/completions`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: payload.prompt }],
          tools: payload.functions || [],
          tool_choice: 'auto'
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data,
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  const runStructured = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/chat/completions`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: payload.prompt }],
          response_format: { type: 'json_object' }
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data,
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  const runEmbedding = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey } = config
      const url = `${baseUrl}/embeddings`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: payload.prompt
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data,
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  const runMultimodal = async (config, payload) => {
    state.loading = true
    const startTime = Date.now()

    try {
      const { baseUrl, apiKey, model } = config
      const url = `${baseUrl}/chat/completions`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: payload.prompt || 'Describe this image' },
              { type: 'image_url', image_url: { url: `data:${payload.imageType};base64,${payload.imageData}` } }
            ]
          }],
          max_tokens: payload.maxTokens || 1024
        })
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      state.response = {
        status: response.status,
        statusText: response.statusText,
        data,
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  const runBatch = async (config, payloads) => {
    state.loading = true
    const startTime = Date.now()
    const results = []

    try {
      for (const payload of payloads) {
        const result = await sendChat(config, payload)
        results.push(result)
      }

      const duration = Date.now() - startTime

      state.response = {
        status: 207,
        statusText: 'Multi-Status',
        data: { results, count: results.length },
        duration
      }

      return state.response
    } finally {
      state.loading = false
    }
  }

  return {
    state,
    sendChat,
    sendChatStream,
    runReasoning,
    runFunctionCall,
    runStructured,
    runEmbedding,
    runMultimodal,
    runBatch
  }
}
```

**Step 2: Commit**

```bash
git add src/composables/useOpenAI.js
git commit -m "feat: add useOpenAI composable with full API methods"
```

---

### Task 8: Create useTestRunner Composable

**Files:**
- Create: `src/composables/useTestRunner.js`

**Step 1: Implement useTestRunner**

```javascript
import { reactive, computed } from 'vue'

export function useTestRunner(apiMethods) {
  const testState = reactive({
    running: false,
    currentTest: null,
    progress: 0,
    logs: []
  })

  const testMethods = {
    'chat': apiMethods.sendChat,
    'chat-stream': apiMethods.sendChatStream,
    'reasoning': apiMethods.runReasoning,
    'functioncall': apiMethods.runFunctionCall,
    'struct': apiMethods.runStructured,
    'embedding': apiMethods.runEmbedding,
    'multimodal': apiMethods.runMultimodal,
    'batch': apiMethods.runBatch
  }

  const addLog = (type, tag, content, model = '') => {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString('en', { hour12: false }),
      type,
      tag,
      content,
      model
    }
    testState.logs.push(entry)
    return entry
  }

  const clearLogs = () => {
    testState.logs = []
  }

  const runSingleTest = async (testType, config, models) => {
    const targets = models.length ? models : ['(no model selected)']
    const method = testMethods[testType]

    if (!method) {
      addLog('error', testType.toUpperCase(), `Test method not found: ${testType}`, '')
      return
    }

    addLog('info', 'START', `Running test: ${testType}`, '')

    for (const model of targets) {
      try {
        const testConfig = { ...config, model }
        const payload = {
          prompt: 'Hello, please respond with a greeting.',
          maxTokens: config.maxTokens || 1024
        }

        const result = await method(testConfig, payload)

        if (result.status >= 200 && result.status < 300) {
          addLog('success', testType.toUpperCase(),
            `Response received in ${result.duration}ms. ${JSON.stringify(result.data).slice(0, 100)}...`,
            model
          )
        } else {
          addLog('error', testType.toUpperCase(),
            `Status ${result.status}: ${result.statusText || 'Error'}`,
            model
          )
        }
      } catch (err) {
        addLog('error', testType.toUpperCase(), err.message, model)
      }
    }
  }

  const runAllTests = async (config, models) => {
    if (testState.running) return

    testState.running = true
    testState.progress = 0

    const testTypes = Object.keys(testMethods)

    try {
      for (let i = 0; i < testTypes.length; i++) {
        testState.currentTest = testTypes[i]
        testState.progress = (i / testTypes.length) * 100

        await runSingleTest(testTypes[i], config, models)
        await new Promise(resolve => setTimeout(resolve, 150))
      }

      testState.progress = 100
      addLog('success', 'DONE', `All tests completed. ${testTypes.length} test suites run.`, '')
    } finally {
      testState.running = false
      testState.currentTest = null
    }
  }

  return {
    testState,
    logs: computed(() => testState.logs),
    logCount: computed(() => testState.logs.length),
    runSingleTest,
    runAllTests,
    addLog,
    clearLogs
  }
}
```

**Step 2: Commit**

```bash
git add src/composables/useTestRunner.js
git commit -m "feat: add useTestRunner composable for test execution"
```

---

## Phase 4: Shared Components

### Task 9: Create Sidebar Component

**Files:**
- Create: `src/components/Sidebar.vue`

**Step 1: Implement Sidebar component**

```vue
<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">AI Gateway</div>
      <div class="sidebar-title">API<br>Tester</div>
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
  width: 220px;
  min-width: 220px;
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
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
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
```

**Step 2: Commit**

```bash
git add src/components/Sidebar.vue
git commit -m "feat: add Sidebar component with provider navigation"
```

---

### Task 10: Create ConfigPanel Component

**Files:**
- Create: `src/components/ConfigPanel.vue`

**Step 1: Implement ConfigPanel component**

```vue
<template>
  <div class="panel panel-config">
    <div class="panel-title">Connection</div>

    <div class="form-row">
      <label class="form-label">Base URL</label>
      <input
        class="form-input"
        type="text"
        :placeholder="config.baseUrl"
        v-model="localConfig.baseUrl"
      >
    </div>

    <div class="form-row">
      <label class="form-label">API Key</label>
      <input
        class="form-input"
        type="password"
        placeholder="••••••••••••••••••••••••••"
        v-model="localConfig.apiKey"
      >
    </div>

    <div class="panel-title" style="margin-top:20px">Model Type</div>

    <div class="tab-bar">
      <button
        v-for="tab in ['text', 'image', 'video']"
        :key="tab"
        class="tab-btn"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tabLabels[tab] }}
      </button>
    </div>

    <!-- Model Selection -->
    <div class="form-row">
      <label class="form-label">
        Models
        <span style="color: var(--text-muted); font-size:10px; letter-spacing:0">(multi-select)</span>
      </label>

      <div class="multi-select-wrapper">
        <div class="model-chips">
          <template v-if="selectedModels.length === 0">
            <span style="font-size:11px; color: var(--text-muted); align-self: center; padding: 0 2px">
              Select models...
            </span>
          </template>
          <div v-for="model in selectedModels" :key="model" class="model-chip">
            {{ model }}
            <span class="chip-remove" @click="removeModel(model)">×</span>
          </div>
        </div>

        <div class="model-options">
          <div
            v-for="model in availableModels"
            :key="model"
            class="model-option"
            :class="{ selected: isModelSelected(model) }"
            @click="toggleModel(model)"
          >
            <div class="option-check">{{ isModelSelected(model) ? '✓' : '' }}</div>
            {{ model }}
          </div>
          <div v-if="availableModels.length === 0" style="padding:12px 14px; font-size:11px; color: var(--text-muted)">
            No models available
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:config', 'update:selectedModels'])

const tabLabels = {
  text: '文本',
  image: '图像',
  video: '视频'
}

const localConfig = reactive({
  baseUrl: props.config.baseUrl,
  apiKey: props.config.apiKey
})

const activeTab = reactive('text')
const localSelectedModels = reactive({ text: [], image: [], video: [] })

const availableModels = computed(() => {
  return props.config.models[activeTab.value] || []
})

const selectedModels = computed(() => {
  return localSelectedModels[activeTab.value]
})

const isModelSelected = (model) => {
  return localSelectedModels[activeTab.value].includes(model)
}

const toggleModel = (model) => {
  const list = localSelectedModels[activeTab.value]
  const idx = list.indexOf(model)

  if (idx === -1) {
    list.push(model)
  } else {
    list.splice(idx, 1)
  }

  emit('update:selectedModels', localSelectedModels)
}

const removeModel = (model) => {
  const list = localSelectedModels[activeTab.value]
  const idx = list.indexOf(model)
  if (idx !== -1) {
    list.splice(idx, 1)
  }
  emit('update:selectedModels', localSelectedModels)
}

watch(() => localConfig, () => {
  emit('update:config', localConfig)
}, { deep: true })

// Expose method to get selected models for current tab
defineExpose({
  getSelectedModels: () => localSelectedModels[activeTab.value],
  getConfig: () => localConfig,
  getActiveTab: () => activeTab
})
</script>

<style scoped>
.panel {
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 24px 28px;
  overflow-y: auto;
}

.panel-config {
  grid-row: 1;
  grid-column: 1;
}

.panel-title {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.form-row {
  margin-bottom: 16px;
}

.form-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 6px;
  display: block;
}

.form-input {
  width: 100%;
  background: var(--surface2);
  border: 1px solid var(--border2);
  border-radius: 6px;
  padding: 10px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-input:focus {
  border-color: var(--accent-active);
  box-shadow: 0 0 0 3px var(--glow-blue);
}

.form-input::placeholder { color: var(--text-muted); }

.tab-bar {
  display: flex;
  gap: 2px;
  background: var(--surface2);
  border: 1px solid var(--border2);
  border-radius: 8px;
  padding: 3px;
  margin-bottom: 20px;
}

.tab-btn {
  flex: 1;
  padding: 7px 0;
  border: none;
  background: none;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.03em;
}

.tab-btn:hover { color: var(--text-dim); }

.tab-btn.active {
  background: var(--surface);
  color: var(--accent-active);
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.multi-select-wrapper {
  background: var(--surface2);
  border: 1px solid var(--border2);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.multi-select-wrapper:focus-within {
  border-color: var(--accent-active);
  box-shadow: 0 0 0 3px var(--glow-blue);
}

.model-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px;
  min-height: 44px;
  border-bottom: 1px solid var(--border);
}

.model-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 4px;
  padding: 3px 8px 3px 10px;
  font-size: 11px;
  color: var(--accent-active);
  cursor: default;
  animation: chipIn 0.15s ease;
}

@keyframes chipIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.chip-remove {
  cursor: pointer;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1;
  transition: color 0.1s;
}

.chip-remove:hover { color: var(--error); }

.model-options {
  max-height: 160px;
  overflow-y: auto;
}

.model-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-dim);
  transition: background 0.1s;
  border-bottom: 1px solid var(--border);
}

.model-option:last-child { border-bottom: none; }
.model-option:hover { background: rgba(255,255,255,0.04); }
.model-option.selected { color: var(--accent-active); }

.option-check {
  width: 14px; height: 14px;
  border: 1px solid var(--border2);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  flex-shrink: 0;
  transition: all 0.1s;
}

.model-option.selected .option-check {
  background: var(--accent-active);
  border-color: var(--accent-active);
  color: var(--bg);
}
</style>
```

**Step 2: Commit**

```bash
git add src/components/ConfigPanel.vue
git commit -m "feat: add ConfigPanel component with model selection"
```

---

### Task 11: Create TestPanel Component

**Files:**
- Create: `src/components/TestPanel.vue`

**Step 1: Implement TestPanel component**

```vue
<template>
  <div class="panel panel-models">
    <div class="panel-title">Test Suite</div>

    <!-- One-click test -->
    <div class="oneclick-wrapper">
      <div class="oneclick-info">
        <div class="oneclick-title">一键全测</div>
        <div class="oneclick-sub">Run all test cases at once</div>
      </div>
      <button class="btn btn-primary" :disabled="isRunning" @click="$emit('runAll')">
        <span v-if="isRunning" class="spinner"></span>
        <span v-else>▶</span>
        {{ isRunning ? 'Running...' : 'Run All' }}
      </button>
    </div>

    <div class="progress-bar" :class="{ show: isRunning }">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <div class="panel-title" style="margin-top:20px">Individual Tests</div>
    <div class="test-actions">
      <button
        v-for="test in testTypes"
        :key="test.id"
        class="btn-test"
        :class="{ running: currentTest === test.id }"
        :disabled="isRunning"
        @click="$emit('runTest', test.id)"
      >
        {{ test.icon }} {{ test.label }}
      </button>
    </div>

    <div class="panel-title" style="margin-top:24px">Quick Config</div>
    <div class="form-row">
      <label class="form-label">Timeout (ms)</label>
      <input class="form-input" type="number" v-model="localTimeout" @input="$emit('update:timeout', localTimeout)">
    </div>
    <div class="form-row">
      <label class="form-label">Max Tokens</label>
      <input class="form-input" type="number" v-model="localMaxTokens" @input="$emit('update:maxTokens', localMaxTokens)">
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isRunning: Boolean,
  progress: Number,
  currentTest: String,
  timeout: Number,
  maxTokens: Number
})

defineEmits(['runAll', 'runTest', 'update:timeout', 'update:maxTokens'])

const localTimeout = ref(props.timeout || 10000)
const localMaxTokens = ref(props.maxTokens || 1024)

watch(() => props.timeout, (v) => localTimeout.value = v)
watch(() => props.maxTokens, (v) => localMaxTokens.value = v)

const testTypes = [
  { id: 'chat', label: 'chat', icon: '💬' },
  { id: 'chat-stream', label: 'chat-stream', icon: '⚡' },
  { id: 'reasoning', label: 'reasoning', icon: '🧠' },
  { id: 'functioncall', label: 'functioncall', icon: '🔧' },
  { id: 'struct', label: 'struct', icon: '📐' },
  { id: 'embedding', label: 'embedding', icon: '🔢' },
  { id: 'multimodal', label: 'multimodal', icon: '🖼' },
  { id: 'batch', label: 'batch', icon: '📦' }
]
</script>

<style scoped>
.panel {
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 24px 28px;
  overflow-y: auto;
}

.panel-models {
  grid-row: 1;
  grid-column: 2;
  border-right: none;
}

.panel-title {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.oneclick-wrapper {
  background: linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(96,165,250,0.03) 100%);
  border: 1px solid rgba(96,165,250,0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.oneclick-info { flex: 1; }

.oneclick-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  font-family: 'Syne', sans-serif;
  margin-bottom: 2px;
}

.oneclick-sub { font-size: 11px; color: var(--text-muted); }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.04em;
}

.btn-primary {
  background: var(--accent-active);
  color: #0a0b0f;
  box-shadow: 0 0 20px rgba(96, 165, 250, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: #93c5fd;
  box-shadow: 0 0 28px rgba(96, 165, 250, 0.4);
  transform: translateY(-1px);
}

.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.progress-bar {
  width: 100%;
  height: 2px;
  background: var(--border2);
  border-radius: 2px;
  margin-top: 12px;
  overflow: hidden;
  display: none;
}

.progress-fill {
  height: 100%;
  background: var(--accent-active);
  border-radius: 2px;
  width: 0%;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px var(--accent-active);
}

.progress-bar.show { display: block; }

.test-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.btn-test {
  padding: 8px 16px;
  font-size: 11px;
  background: var(--surface2);
  color: var(--text-dim);
  border: 1px solid var(--border2);
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.04em;
}

.btn-test:hover:not(:disabled) {
  border-color: var(--accent-active);
  color: var(--accent-active);
  background: rgba(96, 165, 250, 0.06);
}

.btn-test:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-test.running {
  border-color: var(--warning);
  color: var(--warning);
  background: rgba(245, 158, 11, 0.06);
}

.form-row {
  margin-bottom: 16px;
}

.form-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 6px;
  display: block;
}

.form-input {
  width: 100%;
  background: var(--surface2);
  border: 1px solid var(--border2);
  border-radius: 6px;
  padding: 10px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-input:focus {
  border-color: var(--accent-active);
  box-shadow: 0 0 0 3px var(--glow-blue);
}

.spinner {
  width: 12px; height: 12px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
```

**Step 2: Commit**

```bash
git add src/components/TestPanel.vue
git commit -m "feat: add TestPanel component with test suite"
```

---

### Task 12: Create LogPanel Component

**Files:**
- Create: `src/components/LogPanel.vue`

**Step 1: Implement LogPanel component with improved height**

```vue
<template>
  <div class="panel panel-log">
    <div class="log-container">
      <div class="log-header">
        <div class="log-title">Output Log</div>
        <div class="log-count">{{ logCount }} {{ logCount === 1 ? 'entry' : 'entries' }}</div>
        <div class="log-actions">
          <button class="btn btn-danger-ghost" @click="$emit('clear')">Clear</button>
        </div>
      </div>

      <div class="log-body" ref="logBody">
        <div v-if="logs.length === 0" class="log-empty">
          <div class="log-empty-icon">◉</div>
          <div>No tests run yet</div>
          <div style="font-size:10px; color: var(--text-muted); margin-top:2px">
            Configure your API and click a test button
          </div>
        </div>

        <div
          v-for="entry in logs"
          :key="entry.id"
          class="log-entry"
          :class="entry.type"
        >
          <div class="log-meta">
            <span class="log-time">{{ entry.timestamp }}</span>
            <span class="log-tag">{{ entry.tag }}</span>
            <span v-if="entry.model" class="log-model">{{ entry.model }}</span>
          </div>
          <div class="log-content">{{ entry.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

defineProps({
  logs: {
    type: Array,
    default: () => []
  },
  logCount: Number
})

defineEmits(['clear'])

const logBody = ref(null)

watch(() => props.logs, async () => {
  await nextTick()
  if (logBody.value) {
    logBody.value.scrollTop = logBody.value.scrollHeight
  }
}, { deep: true })
</script>

<style scoped>
.panel {
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 24px 28px;
  overflow-y: auto;
}

.panel-log {
  grid-row: 2;
  grid-column: 1 / -1;
  border-right: none;
  border-bottom: none;
  padding: 24px 28px;
  min-height: 400px;
  max-height: 60vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.log-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 300px;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.log-title {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.log-count {
  background: var(--surface2);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 1px 8px;
  font-size: 10px;
  color: var(--text-muted);
}

.log-actions { margin-left: auto; }

.btn-danger-ghost {
  background: transparent;
  color: var(--error);
  border: 1px solid rgba(239,68,68,0.3);
  font-size: 11px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.15s;
}

.btn-danger-ghost:hover {
  background: rgba(239,68,68,0.08);
}

.log-body {
  flex: 1;
  background: var(--surface2);
  border: 1px solid var(--border2);
  border-radius: 8px;
  overflow-y: auto;
  font-size: 11.5px;
  line-height: 1.6;
  padding: 16px;
  min-height: 0;
  max-height: calc(60vh - 80px);
}

.log-entry {
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 3px solid transparent;
  animation: entryIn 0.2s ease;
}

@keyframes entryIn {
  from { transform: translateX(-8px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.log-entry.info {
  background: rgba(96, 165, 250, 0.06);
  border-color: var(--accent-active);
}

.log-entry.success {
  background: rgba(34, 197, 94, 0.06);
  border-color: var(--success);
}

.log-entry.error {
  background: rgba(239, 68, 68, 0.06);
  border-color: var(--error);
}

.log-entry.warn {
  background: rgba(245, 158, 11, 0.06);
  border-color: var(--warning);
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.log-time { color: var(--text-muted); font-size: 10px; }

.log-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.log-entry.info .log-tag { background: rgba(96, 165, 250, 0.2); color: var(--accent-active); }
.log-entry.success .log-tag { background: rgba(34, 197, 94, 0.2); color: var(--success); }
.log-entry.error .log-tag { background: rgba(239, 68, 68, 0.2); color: var(--error); }
.log-entry.warn .log-tag { background: rgba(245, 158, 11, 0.2); color: var(--warning); }

.log-model { color: var(--text-muted); font-size: 10px; font-style: italic; }

.log-content { color: var(--text-dim); word-break: break-all; }

.log-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-size: 12px;
  gap: 8px;
}

.log-empty-icon { font-size: 28px; opacity: 0.3; }
</style>
```

**Step 2: Commit**

```bash
git add src/components/LogPanel.vue
git commit -m "feat: add LogPanel component with improved height and scroll"
```

---

## Phase 5: View Components

### Task 13: Create GeminiView

**Files:**
- Create: `src/views/GeminiView.vue`

**Step 1: Implement GeminiView**

```vue
<template>
  <div class="main">
    <div class="topbar">
      <span class="topbar-provider">Gemini</span>
      <span class="topbar-sep">/</span>
      <span class="topbar-sub">Google AI Studio</span>
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
import { ref, reactive, computed } from 'vue'
import { useGemini } from '@/composables/useGemini'
import { useTestRunner } from '@/composables/useTestRunner'
import ConfigPanel from '@/components/ConfigPanel.vue'
import TestPanel from '@/components/TestPanel.vue'
import LogPanel from '@/components/LogPanel.vue'
import geminiConfig from '@/config/gemini.js'

const config = reactive({ ...geminiConfig, apiKey: '' })
const selectedModelsMap = reactive({ text: [], image: [], video: [] })
const timeout = ref(10000)
const maxTokens = ref(1024)

const configPanelRef = ref(null)

const api = useGemini()
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
  height: 56px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 28px;
  gap: 16px;
  background: var(--surface);
  flex-shrink: 0;
}

.topbar-provider {
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.topbar-sep { color: var(--border2); }

.topbar-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.topbar-actions { margin-left: auto; display: flex; gap: 8px; }

.info-row {
  display: flex;
  gap: 8px;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 10px;
  color: var(--text-muted);
}

.info-badge-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
}

.content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 0;
  overflow: hidden;
}
</style>
```

**Step 2: Commit**

```bash
git add src/views/GeminiView.vue
git commit -m "feat: add GeminiView with full integration"
```

---

### Task 14: Create AnthropicView

**Files:**
- Create: `src/views/AnthropicView.vue`

**Step 1: Implement AnthropicView**

```vue
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
  height: 56px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 28px;
  gap: 16px;
  background: var(--surface);
  flex-shrink: 0;
}

.topbar-provider {
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.topbar-sep { color: var(--border2); }

.topbar-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.topbar-actions { margin-left: auto; display: flex; gap: 8px; }

.info-row {
  display: flex;
  gap: 8px;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 10px;
  color: var(--text-muted);
}

.info-badge-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
}

.content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 0;
  overflow: hidden;
}
</style>
```

**Step 2: Commit**

```bash
git add src/views/AnthropicView.vue
git commit -m "feat: add AnthropicView with full integration"
```

---

### Task 15: Create OpenAIVue

**Files:**
- Create: `src/views/OpenAIVue.vue`

**Step 1: Implement OpenAIVue**

```vue
<template>
  <div class="main">
    <div class="topbar">
      <span class="topbar-provider">OpenAI</span>
      <span class="topbar-sep">/</span>
      <span class="topbar-sub">OpenAI API</span>
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
import { useOpenAI } from '@/composables/useOpenAI'
import { useTestRunner } from '@/composables/useTestRunner'
import ConfigPanel from '@/components/ConfigPanel.vue'
import TestPanel from '@/components/TestPanel.vue'
import LogPanel from '@/components/LogPanel.vue'
import openaiConfig from '@/config/openai.js'

const config = reactive({ ...openaiConfig, apiKey: '' })
const selectedModelsMap = reactive({ text: [], image: [], video: [] })
const timeout = ref(10000)
const maxTokens = ref(1024)

const configPanelRef = ref(null)

const api = useOpenAI()
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
  height: 56px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 28px;
  gap: 16px;
  background: var(--surface);
  flex-shrink: 0;
}

.topbar-provider {
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.topbar-sep { color: var(--border2); }

.topbar-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.topbar-actions { margin-left: auto; display: flex; gap: 8px; }

.info-row {
  display: flex;
  gap: 8px;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 10px;
  color: var(--text-muted);
}

.info-badge-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
}

.content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 0;
  overflow: hidden;
}
</style>
```

**Step 2: Commit**

```bash
git add src/views/OpenAIVue.vue
git commit -m "feat: add OpenAIVue with full integration"
```

---

## Phase 6: App Component

### Task 16: Create App.vue

**Files:**
- Create: `src/App.vue`

**Step 1: Implement App.vue**

```vue
<template>
  <div class="app">
    <Sidebar />
    <router-view />
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
</script>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
</style>
```

**Step 2: Commit**

```bash
git add src/App.vue
git commit -m "feat: add App.vue with layout structure"
```

---

## Phase 7: Final Setup

### Task 17: Remove default Vite files and run dev server

**Files:**
- Delete: `src/style.css` (if exists)
- Delete: `src/components/HelloWorld.vue` (if exists)

**Step 1: Clean up default files**

```bash
cd /Users/xiaobo.yang/Documents/Project/zenai/model_test
rm -f src/style.css
rm -f src/components/HelloWorld.vue
```

**Step 2: Install dependencies**

```bash
npm install
```

**Step 3: Run dev server**

```bash
npm run dev
```

Expected output: Server running at http://localhost:5173

**Step 4: Verify in browser**

Open http://localhost:5173 and verify:
- Sidebar shows three provider options
- Default route redirects to /gemini
- Clicking provider switches routes
- All panels display correctly
- Log panel has proper height and scroll

**Step 5: Commit**

```bash
git add .
git commit -m "chore: cleanup default files and verify project setup"
```

---

## Implementation Complete

Verify all features work:
1. Navigation between providers (gemini, anthropic, openai)
2. Configuration panel updates
3. Model selection multi-select
4. Individual test buttons
5. Run all tests with progress bar
6. Log panel displays entries and scrolls properly
7. Clear log button works
