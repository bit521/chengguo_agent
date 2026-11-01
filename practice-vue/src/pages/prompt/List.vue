<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePromptStore } from '@/store/prompt'

const store = usePromptStore()
const keyword = ref('')

onMounted(() => {
  store.fetchPrompts(1, 10, keyword.value)
})

function search() {
  store.fetchPrompts(1, 10, keyword.value)
}
</script>

<template>
  <div>
    <h1>Prompt Management</h1>
    <div class="toolbar">
      <input v-model="keyword" placeholder="Search prompts..." @keyup.enter="search" />
      <button @click="search">Search</button>
    </div>
    <div v-if="store.isLoading">Loading...</div>
    <table v-else>
      <thead>
        <tr><th>ID</th><th>Name</th><th>Category</th><th>Status</th><th>Usage</th></tr>
      </thead>
      <tbody>
        <tr v-for="p in store.prompts" :key="p.id">
          <td>{{ p.id }}</td>
          <td>{{ p.name }}</td>
          <td>{{ p.category }}</td>
          <td>{{ p.status }}</td>
          <td>{{ p.usageCount }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="!store.isLoading">Total: {{ store.total }}</div>
  </div>
</template>

<style scoped>
.toolbar { margin-bottom: 1rem; display: flex; gap: 0.5rem; }
input { padding: 0.5rem; border: 1px solid #d1d5db; }
button { padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.25rem; cursor: pointer; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.75rem; border: 1px solid #e5e7eb; text-align: left; }
th { background: #f9fafb; }
</style>
