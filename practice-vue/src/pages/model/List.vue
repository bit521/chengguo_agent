<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useModelStore } from '@/store/model'

const store = useModelStore()
const keyword = ref('')

onMounted(() => {
  store.fetchModels(1, 10, keyword.value)
})

function search() {
  store.fetchModels(1, 10, keyword.value)
}
</script>

<template>
  <div>
    <h1>Model Management</h1>
    <div class="toolbar">
      <input v-model="keyword" placeholder="Search models..." @keyup.enter="search" />
      <button @click="search">Search</button>
    </div>
    <div v-if="store.isLoading">Loading...</div>
    <table v-else>
      <thead>
        <tr><th>ID</th><th>Name</th><th>Provider</th><th>Context</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr v-for="m in store.models" :key="m.id">
          <td>{{ m.id }}</td>
          <td>{{ m.name }}{{ m.isDefault ? ' (default)' : '' }}</td>
          <td>{{ m.provider }}</td>
          <td>{{ m.contextLength }}</td>
          <td>{{ m.status }}</td>
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
