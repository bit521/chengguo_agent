import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Model } from '@/services/types'
import { mockModelService } from '@/services/mock'

export const useModelStore = defineStore('model', () => {
  const models = ref<Model[]>([])
  const total = ref(0)
  const isLoading = ref(false)

  async function fetchModels(page = 1, pageSize = 10, keyword = '') {
    isLoading.value = true
    try {
      const result = await mockModelService.getList({ page, pageSize, keyword })
      models.value = result.items
      total.value = result.total
    } finally {
      isLoading.value = false
    }
  }

  async function fetchModel(id: number) {
    return mockModelService.getById(id)
  }

  async function createModel(data: Partial<Model>) {
    return mockModelService.create(data)
  }

  async function updateModel(id: number, data: Partial<Model>) {
    return mockModelService.update(id, data)
  }

  async function deleteModel(id: number) {
    return mockModelService.delete(id)
  }

  return {
    models,
    total,
    isLoading,
    fetchModels,
    fetchModel,
    createModel,
    updateModel,
    deleteModel,
  }
})
