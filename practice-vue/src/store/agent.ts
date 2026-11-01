import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Agent } from '@/services/types'
import { mockAgentService } from '@/services/mock'

export const useAgentStore = defineStore('agent', () => {
  const agents = ref<Agent[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const currentAgent = ref<Agent | null>(null)

  async function fetchAgents(page = 1, pageSize = 10, keyword = '') {
    isLoading.value = true
    try {
      const result = await mockAgentService.getList({ page, pageSize, keyword })
      agents.value = result.items
      total.value = result.total
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAgent(id: number) {
    isLoading.value = true
    try {
      const agent = await mockAgentService.getById(id)
      currentAgent.value = agent
      return agent
    } finally {
      isLoading.value = false
    }
  }

  async function createAgent(data: Partial<Agent>) {
    return mockAgentService.create(data)
  }

  async function updateAgent(id: number, data: Partial<Agent>) {
    return mockAgentService.update(id, data)
  }

  async function deleteAgent(id: number) {
    return mockAgentService.delete(id)
  }

  return {
    agents,
    total,
    isLoading,
    currentAgent,
    fetchAgents,
    fetchAgent,
    createAgent,
    updateAgent,
    deleteAgent,
  }
})
