<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { mockKnowledgeService } from '@/services/mock'

const knowledgeBases = ref<any[]>([])
const total = ref(0)
const keyword = ref('')
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  const result = await mockKnowledgeService.getList({ page: 1, pageSize: 10 })
  knowledgeBases.value = result.items
  total.value = result.total
  loading.value = false
})

async function search() {
  loading.value = true
  const result = await mockKnowledgeService.getList({ page: 1, pageSize: 10, keyword: keyword.value })
  knowledgeBases.value = result.items
  total.value = result.total
  loading.value = false
}
</script>

<template>
  <div>
    <h1>Knowledge Base Management</h1>
    <div class="toolbar">
      <input v-model="keyword" placeholder="Search..." @keyup.enter="search" />
      <button @click="search">Search</button>
    </div>
    <div v-if="loading">Loading...</div>
    <table v-else>
      <thead>
        <tr><th>ID</th><th>Name</th><th>Docs</th><th>Segments</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr v-for="kb in knowledgeBases" :key="kb.id">
          <td>{{ kb.id }}</td>
          <td>{{ kb.name }}</td>
          <td>{{ kb.documentCount }}</td>
          <td>{{ kb.segmentCount }}</td>
          <td>{{ kb.status }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="!loading">Total: {{ total }}</div>
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
