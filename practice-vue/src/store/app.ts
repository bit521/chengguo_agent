import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/services/types'

export const useAppStore = defineStore('app', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => user.value?.username ?? '')
  const displayName = computed(() => user.value?.name ?? user.value?.username ?? '用户')

  // Actions
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUser(userData: User) {
    user.value = userData
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function login(username: string, password: string): Promise<void> {
    isLoading.value = true
    try {
      // TODO: 调用真实登录 API
      // 这里使用 mock 数据模拟登录
      const mockToken = `mock_token_${Date.now()}`
      const mockUser: User = {
        id: 1,
        username,
        name: username,
        email: `${username}@example.com`,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setToken(mockToken)
      setUser(mockUser)
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    clearAuth()
  }

  return {
    user,
    token,
    isLoading,
    isLoggedIn,
    username,
    displayName,
    setToken,
    setUser,
    clearAuth,
    login,
    logout,
  }
})
