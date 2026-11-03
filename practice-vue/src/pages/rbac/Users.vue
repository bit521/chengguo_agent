<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRbacStore } from '@/store/rbac'
import type { User } from '@/services/rbac/types'

const store = useRbacStore()
const users = ref<User[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const loading = ref(false)

onMounted(() => {
  fetchUsers()
})

async function fetchUsers() {
  loading.value = true
  try {
    const res = await store.fetchUsers({ page: page.value, pageSize: pageSize.value, keyword: keyword.value })
    users.value = res.items
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  fetchUsers()
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>用户管理</h1>
      <PermissionGate perm="user:create">
        <button class="btn-primary btn-sm">新建用户</button>
      </PermissionGate>
    </div>
    <p class="subtitle">维护账号、角色归属与启用状态</p>

    <!-- 台账摘要 -->
    <div class="ledger-summary">
      <div class="ledger-cell"><span class="num">{{ total }}</span><span class="label">账号总数</span></div>
      <div class="ledger-cell"><span class="num">{{ store.roles.length }}</span><span class="label">角色数</span></div>
      <div class="ledger-cell"><span class="num">{{ users.filter(u => u.roles.length === 0).length }}</span><span class="label">未分配角色</span></div>
      <div class="ledger-cell"><span class="num">{{ users.filter(u => u.status === 'off').length }}</span><span class="label">已禁用</span></div>
    </div>

    <!-- 搜索栏 -->
    <div class="toolbar">
      <input v-model="keyword" placeholder="搜索用户名/邮箱..." @keyup.enter="search" class="input" />
      <button @click="search" class="btn-secondary">搜索</button>
    </div>

    <!-- 用户列表 -->
    <div class="panel">
      <div class="panel-header">
        <span>账号列表</span>
        <span class="count">{{ total }} 条</span>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <table v-else>
        <thead>
          <tr>
            <th>用户</th><th>邮箱</th><th>角色</th><th>状态</th><th>最近登录</th>
            <th v-if="hasAnyAction()">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>
              <div class="user-cell">
                <span class="avatar">{{ u.initials }}</span>
                <span>{{ u.name }}</span>
                <span class="account">{{ u.account }}</span>
              </div>
            </td>
            <td class="code">{{ u.email }}</td>
            <td>
              <span v-for="r in u.roles" :key="r" class="chip chip--role">{{ r }}</span>
              <span v-if="u.roles.length === 0" class="chip chip--muted">未分配</span>
            </td>
            <td>
              <span class="stamp" :class="u.status === 'on' ? 'stamp--on' : 'stamp--off'">
                <span class="dot"></span>{{ u.status === 'on' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ u.lastLogin }}</td>
            <td v-if="hasAnyAction()">
              <PermissionGate perm="role:assign"><a href="#" class="link-action">分配角色</a></PermissionGate>
              <PermissionGate perm="user:delete"><a href="#" class="link-danger">删除</a></PermissionGate>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div v-if="!loading" class="pagination">
      <span>第 {{ page }} 页，共 {{ Math.ceil(total / pageSize) }} 页，{{ total }} 条</span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'
import { useRbacStore } from '@/store/rbac'
import PermissionGate from '@/components/guards/PermissionGate.vue'
export default {
  components: { PermissionGate },
  setup() {
    const store = useRbacStore()
    const hasAnyAction = computed(() => store.hasPerm('role:assign') || store.hasPerm('user:delete'))
    return { store, hasAnyAction }
  }
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.page-header h1 { font-size: 1.5rem; color: #1B241F; margin: 0; }
.subtitle { color: #55605A; font-size: 0.875rem; margin: 0 0 1.5rem; }
.ledger-summary { display: flex; border-top: 1px solid #DCDED5; border-bottom: 1px solid #DCDED5; margin-bottom: 1rem; }
.ledger-cell { flex: 1; text-align: center; padding: 0.75rem 1rem; border-right: 1px solid #DCDED5; }
.ledger-cell:last-child { border-right: none; }
.ledger-cell .num { display: block; font-size: 1.5rem; font-family: Georgia, serif; color: #1B241F; }
.ledger-cell .label { font-size: 0.75rem; color: #55605A; }
.toolbar { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.input { flex: 1; height: 34px; padding: 0 0.75rem; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.9rem; outline: none; }
.input:focus { border-color: #14503F; box-shadow: 0 0 0 2px rgba(20,80,63,0.15); }
.btn-primary { height: 28px; padding: 0 0.75rem; background: #14503F; color: #FBFAF6; border: none; border-radius: 2px; font-size: 0.8rem; cursor: pointer; }
.btn-primary:hover { background: #0f3d2f; }
.btn-secondary { height: 28px; padding: 0 0.75rem; background: transparent; color: #1B241F; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.8rem; cursor: pointer; }
.btn-secondary:hover { background: #F6F7F1; }
.panel { background: #FBFAF6; border: 1px solid #DCDED5; border-radius: 3px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid #DCDED5; font-size: 0.8rem; color: #55605A; }
.count { font-family: "Cascadia Code", Consolas, monospace; }
.loading { padding: 2rem; text-align: center; color: #55605A; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.6rem 1rem; text-align: left; border-bottom: 1px solid #EDEFE9; font-size: 0.85rem; }
th { background: #F6F7F1; font-weight: 500; color: #55605A; font-size: 0.75rem; }
.user-cell { display: flex; align-items: center; gap: 0.5rem; }
.avatar { width: 28px; height: 28px; border-radius: 2px; background: #EDEFE9; color: #14503F; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
.account { color: #8B958E; font-size: 0.75rem; }
.chip { display: inline-block; padding: 0.15rem 0.4rem; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.75rem; color: #55605A; margin-right: 0.25rem; }
.chip--muted { border-style: dashed; color: #8B958E; }
.stamp { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.5rem; border-radius: 2px; font-size: 0.75rem; }
.stamp .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.stamp--on { color: #14503F; background: #E8F5EE; }
.stamp--off { color: #55605A; background: #EDEFE9; }
.code { font-family: "Cascadia Code", Consolas, monospace; font-size: 0.75rem; color: #55605A; }
.link-action { color: #14503F; text-decoration: none; font-size: 0.8rem; margin-right: 0.75rem; }
.link-action:hover { text-decoration: underline; }
.link-danger { color: #A6402F; text-decoration: none; font-size: 0.8rem; }
.link-danger:hover { text-decoration: underline; }
.pagination { padding: 1rem 0; font-size: 0.8rem; color: #55605A; }
</style>
