import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Prompt } from '@/services/types'
import { mockPromptService } from '@/services/mock'

export const usePromptStore = defineStore('prompt', () => {
  const prompts = ref<Prompt[]>([])
  const total = ref(0)
  const isLoading = ref(false)

  async function fetchPrompts(page = 1, pageSize = 10, keyword = '') {
    isLoading.value = true
    try {
      const result = await mockPromptService.getList({ page, pageSize, keyword })
      prompts.value = result.items
      total.value = result.total
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPrompt(id: number) {
    return mockPromptService.getById(id)
  }

  async function createPrompt(data: Partial<Prompt>) {
    return mockPromptService.create(data)
  }

  async function updatePrompt(id: number, data: Partial<Prompt>) {
    return mockPromptService.update(id, data)
  }

  async function deletePrompt(id: number) {
    return mockPromptService.delete(id)
  }

  return {
    prompts,
    total,
    isLoading,
    fetchPrompts,
    fetchPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
  }
})
