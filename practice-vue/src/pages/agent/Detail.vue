<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAgentStore } from '@/store/agent'

const route = useRoute()
const router = useRouter()
const store = useAgentStore()
const agent = store.currentAgent

onMounted(() => {
  store.fetchAgent(Number(route.params.id))
})

function goBack() {
  router.push('/agents')
}
</script>

<template>
  <div>
    <button @click="goBack">Back</button>
    <h1 v-if="agent">Agent: {{ agent.name }}</h1>
    <p v-if="agent">Description: {{ agent.description }}</p>
    <p v-if="agent">Status: {{ agent.status }}</p>
    <p v-if="agent">Type: {{ agent.type }}</p>
    <div v-else>Loading...</div>
  </div>
</template>

<style scoped>
button { padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.25rem; cursor: pointer; margin-bottom: 1rem; }
</style>
