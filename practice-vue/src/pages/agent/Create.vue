<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentStore } from '@/store/agent'

const router = useRouter()
const store = useAgentStore()
const form = ref({ name: '', description: '', type: 'conversation', modelId: 1 })

async function submit() {
  await store.createAgent(form.value)
  router.push('/agents')
}
</script>

<template>
  <div>
    <h1>Create Agent</h1>
    <form @submit.prevent="submit">
      <div>
        <label>Name</label>
        <input v-model="form.name" required />
      </div>
      <div>
        <label>Description</label>
        <textarea v-model="form.description"></textarea>
      </div>
      <div>
        <label>Type</label>
        <select v-model="form.type">
          <option value="conversation">Conversation</option>
          <option value="tool">Tool</option>
          <option value="analysis">Analysis</option>
          <option value="creative">Creative</option>
        </select>
      </div>
      <button type="submit">Create</button>
    </form>
  </div>
</template>

<style scoped>
form { display: flex; flex-direction: column; gap: 1rem; max-width: 400px; }
label { font-weight: 600; }
input, textarea, select { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem; }
button { padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.25rem; cursor: pointer; }
</style>
