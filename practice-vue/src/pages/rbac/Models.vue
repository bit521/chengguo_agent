<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRbacStore } from '@/store/rbac'
import type { Role } from '@/services/rbac/types'

const store = useRbacStore()
const roles = ref<Role[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await store.fetchRoles()
    roles.value = res.items
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1>模型管理</h1>
    <p class="subtitle">查看和管理 AI 模型与供应商</p>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="empty-state">
      <p>模型列表页面（RBAC 权限控制演示）</p>
      <p class="hint">所需权限：model:list</p>
    </div>
  </div>
</template>

<style scoped>
h1 { font-size: 1.5rem; color: #1B241F; margin: 0 0 0.25rem; }
.subtitle { color: #55605A; font-size: 0.875rem; margin: 0 0 1.5rem; }
.loading { padding: 3rem; text-align: center; color: #55605A; }
.empty-state { padding: 3rem; text-align: center; color: #55605A; }
.empty-state .hint { font-size: 0.8rem; color: #8B958E; margin-top: 0.5rem; }
</style>
