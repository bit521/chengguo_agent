<script setup lang="ts">
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <div class="stats">
      <div class="stat-card">
        <h3>Total Agents</h3>
        <p class="number">15</p>
      </div>
      <div class="stat-card">
        <h3>Total Models</h3>
        <p class="number">10</p>
      </div>
      <div class="stat-card">
        <h3>Total Prompts</h3>
        <p class="number">12</p>
      </div>
      <div class="stat-card">
        <h3>Knowledge Bases</h3>
        <p class="number">8</p>
      </div>
    </div>
    <div class="welcome">
      <p>Welcome back, {{ appStore.displayName }}!</p>
    </div>
  </div>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.stat-card { background: #f9fafb; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; }
.stat-card h3 { margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280; }
.stat-card .number { margin: 0; font-size: 2rem; font-weight: 700; color: #111827; }
.welcome { margin-top: 2rem; padding: 1rem; background: #eff6ff; border-radius: 0.5rem; }
</style>
