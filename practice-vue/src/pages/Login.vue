<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'

const router = useRouter()
const appStore = useAppStore()
const username = ref('')
const password = ref('')
const error = ref('')

async function login() {
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password'
    return
  }
  error.value = ''
  await appStore.login(username.value, password.value)
  router.push('/dashboard')
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Login</h1>
      <p class="subtitle">Vue 3 + TS + Pinia + Vue Router Framework</p>
      <form @submit.prevent="login">
        <div class="field">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="Enter username" />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="Enter password" />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="appStore.isLoading">
          {{ appStore.isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <p class="hint">Demo: any username/password works (mock auth)</p>
    </div>
  </div>
</template>

<style scoped>
.login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f3f4f6; }
.login-box { background: white; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); width: 100%; max-width: 320px; }
.login-box h1 { margin: 0 0 0.5rem; font-size: 1.5rem; }
.subtitle { color: #6b7280; font-size: 0.875rem; margin: 0 0 1.5rem; }
.field { margin-bottom: 1rem; }
.field label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; }
.field input { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem; box-sizing: border-box; }
button { width: 100%; padding: 0.5rem; background: #2563eb; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 1rem; }
button:disabled { opacity: 0.7; }
.error { color: #dc2626; font-size: 0.875rem; margin-bottom: 1rem; }
.hint { color: #9ca3af; font-size: 0.75rem; margin-top: 1rem; text-align: center; }
</style>
