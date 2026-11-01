<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'

const router = useRouter()
const appStore = useAppStore()

onMounted(() => {
  if (!appStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <div class="logo">Vue App</div>
        <nav class="nav">
          <router-link to="/dashboard">Dashboard</router-link>
          <router-link to="/agents">Agents</router-link>
          <router-link to="/models">Models</router-link>
          <router-link to="/prompts">Prompts</router-link>
          <router-link to="/knowledge">Knowledge</router-link>
          <router-link to="/settings">Settings</router-link>
        </nav>
        <div class="user" v-if="appStore.isLoggedIn">
          {{ appStore.displayName }}
        </div>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.header {
  background: #111827;
  color: white;
  padding: 0 1rem;
}
.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
  height: 3.5rem;
}
.logo {
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}
.nav {
  display: flex;
  gap: 1rem;
  flex: 1;
}
.nav a {
  color: #d1d5db;
  text-decoration: none;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
.nav a:hover, .nav a.router-link-active {
  color: white;
  background: rgba(255,255,255,0.1);
}
.user {
  color: #9ca3af;
  font-size: 0.875rem;
}
.main {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
  box-sizing: border-box;
}
</style>
