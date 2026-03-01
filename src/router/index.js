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
