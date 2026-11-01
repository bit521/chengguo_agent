<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAgentStore } from '@/store/agent'

const store = useAgentStore()
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)

onMounted(() => {
  store.fetchAgents(page.value, pageSize.value, keyword.value)
})

function search() {
  page.value = 1
  store.fetchAgents(page.value, pageSize.value, keyword.value)
}
</script>

<template>
  <div>
    <h1>Agent Management</h1>
    <div class="toolbar">
      <input v-model="keyword" placeholder="Search agents..." @keyup.enter="search" />
      <button @click="search">Search</button>
    </div>
    <div v-if="store.isLoading">Loading...</div>
    <table v-else>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Type</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="agent in store.agents" :key="agent.id">
          <td>{{ agent.id }}</td>
          <td>{{ agent.name }}</td>
          <td>{{ agent.type }}</td>
          <td>{{ agent.status }}</td>
          <td>{{ agent.createdAt }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="!store.isLoading">
      Total: {{ store.total }} | Page {{ page }} of {{ Math.ceil(store.total / pageSize) }}
    </div>
  </div>
</template>

<style scoped>
.toolbar { margin-bottom: 1rem; display: flex; gap: 0.5rem; }
input { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem; }
button { padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.25rem; cursor: pointer; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.75rem; border: 1px solid #e5e7eb; text-align: left; }
th { background: #f9fafb; }
</style>
