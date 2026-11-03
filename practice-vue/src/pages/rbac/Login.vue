<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRbacStore } from '@/store/rbac'

const router = useRouter()
const store = useRbacStore()
const username = ref('')
const password = ref('')
const error = ref('')

async function login() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  error.value = ''
  try {
    await store.login(username.value, password.value)
    const redirect = router.currentRoute.value.query.redirect as string || '/dashboard'
    router.push(redirect)
  } catch (e: any) {
    error.value = e.message || '登录失败，请重试'
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="brand">
        <h1>辰光 Agent 平台</h1>
        <p class="slogan">每一次访问，先判定身份，再判定权限</p>
      </div>
      <form @submit.prevent="login" class="login-form">
        <div class="field">
          <label for="username">用户名</label>
          <input id="username" v-model="username" type="text" placeholder="输入用户名" autocomplete="username" />
        </div>
        <div class="field">
          <label for="password">密码</label>
          <input id="password" v-model="password" type="password" placeholder="输入密码" autocomplete="current-password" />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="store.isLoading" class="btn-primary">
          {{ store.isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="demo-accounts">
        <p class="demo-title">演示账号（密码任意）</p>
        <table class="account-table">
          <thead>
            <tr><th>账号</th><th>身份</th></tr>
          </thead>
          <tbody>
            <tr><td>admin</td><td>超级管理员</td></tr>
            <tr><td>zhang.lan</td><td>运营</td></tr>
            <tr><td>zhou.ning</td><td>只读审计</td></tr>
            <tr><td>chen.mo</td><td>未分配角色</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #EDEFE9;
}
.login-box {
  background: #FBFAF6;
  border: 1px solid #DCDED5;
  border-radius: 3px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 24px 64px rgba(12,18,16,0.28);
}
.brand {
  text-align: center;
  margin-bottom: 2rem;
}
.brand h1 {
  font-family: Georgia, "Songti SC", "STSong", SimSun, serif;
  font-size: 1.75rem;
  color: #1B241F;
  margin: 0 0 0.5rem;
  letter-spacing: 0.05em;
}
.slogan {
  font-size: 0.8rem;
  color: #55605A;
  margin: 0;
  letter-spacing: 0.02em;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.field label {
  font-size: 0.8rem;
  color: #55605A;
  font-weight: 500;
}
.field input {
  height: 34px;
  padding: 0 0.75rem;
  border: 1px solid #DCDED5;
  border-radius: 2px;
  font-size: 0.9rem;
  color: #1B241F;
  background: #fff;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.field input:focus {
  border-color: #14503F;
  box-shadow: 0 0 0 2px rgba(20,80,63,0.15);
}
.error {
  color: #A6402F;
  font-size: 0.8rem;
  padding-left: 0.25rem;
  border-left: 3px solid #A6402F;
  margin: 0;
}
.btn-primary {
  height: 36px;
  background: #14503F;
  color: #FBFAF6;
  border: none;
  border-radius: 2px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-primary:hover:not(:disabled) {
  background: #0f3d2f;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.demo-accounts {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #EDEFE9;
}
.demo-title {
  font-size: 0.75rem;
  color: #8B958E;
  margin: 0 0 0.75rem;
}
.account-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}
.account-table th, .account-table td {
  padding: 0.4rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid #EDEFE9;
}
.account-table th {
  color: #55605A;
  font-weight: 500;
}
.account-table td:first-child {
  font-family: "Cascadia Code", Consolas, monospace;
  color: #14503F;
}
</style>
