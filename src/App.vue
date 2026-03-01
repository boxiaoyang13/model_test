<template>
  <div class="app-container">
    <Sidebar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

.app-main {
  flex: 1;
  overflow: auto;
}
</style>
