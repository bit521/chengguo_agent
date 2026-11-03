<script setup lang="ts">
</script>

<template>
  <div>
    <h1>知识库管理</h1>
    <p class="subtitle">查看和管理知识库与文档</p>
    <div class="empty-state">
      <p>知识库列表页面（RBAC 权限控制演示）</p>
      <p class="hint">所需权限：knowledge:list</p>
    </div>
  </div>
</template>

<style scoped>
h1 { font-size: 1.5rem; color: #1B241F; margin: 0 0 0.25rem; }
.subtitle { color: #55605A; font-size: 0.875rem; margin: 0 0 1.5rem; }
.empty-state { padding: 3rem; text-align: center; color: #55605A; }
.hint { font-size: 0.8rem; color: #8B958E; margin-top: 0.5rem; }
</style>
