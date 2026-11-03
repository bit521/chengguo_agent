<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRbacStore } from '@/store/rbac'
import type { User } from '@/services/rbac/types'

const store = useRbacStore()
const users = ref<User[]>([])
const stats = ref({ total: 0, roles: 0, unassigned: 0, disabled: 0 })

onMounted(async () => {
  const res = await store.fetchUsers()
  users.value = res.items
  stats.value = {
    total: res.total,
    roles: store.roles.length,
    unassigned: res.items.filter(u => u.roles.length === 0).length,
    disabled: res.items.filter(u => u.status === 'off').length,
  }
})
</script>

<template>
  <div>
    <h1>工作台</h1>
    <p class="subtitle">RBAC 授权管理</p>

    <div v-if="!store.isLoggedIn" class="empty-state">
      <p>请先登录</p>
      <router-link to="/login" class="btn-link">前往登录</router-link>
    </div>

    <template v-else>
      <!-- 访问范围摘要 -->
      <div class="scope-panel">
        <h2>你的访问范围</h2>
        <div class="scope-info">
          <div class="scope-item">
            <span class="label">身份</span>
            <span class="value">{{ store.roleLabel }}</span>
          </div>
          <div class="scope-item">
            <span class="label">账号</span>
            <span class="value">{{ store.currentUser?.account ?? '-' }}</span>
          </div>
          <div class="scope-item">
            <span class="label">有效权限</span>
            <span class="value code">{{ store.permissionCount }}/40</span>
          </div>
          <div class="scope-item">
            <span class="label">状态</span>
            <span class="stamp stamp--on">已登录</span>
          </div>
        </div>
      </div>

      <!-- 台账摘要 -->
      <div class="ledger-summary">
        <div class="ledger-cell">
          <span class="num">{{ stats.total }}</span>
          <span class="label">账号总数</span>
        </div>
        <div class="ledger-cell">
          <span class="num">{{ stats.roles }}</span>
          <span class="label">角色数</span>
        </div>
        <div class="ledger-cell">
          <span class="num">{{ stats.unassigned }}</span>
          <span class="label">未分配角色</span>
        </div>
        <div class="ledger-cell">
          <span class="num">{{ stats.disabled }}</span>
          <span class="label">已禁用</span>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="panel">
        <div class="panel-header">
          <span>最近操作记录</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>操作人</th>
              <th>动作</th>
              <th>目标</th>
              <th>权限码</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>09:41</td><td>林恪</td><td>分配角色</td>
              <td>给「张岚」追加角色「运营」</td>
              <td><span class="code">{{ 'role:assign' }}</span></td>
            </tr>
            <tr>
              <td>09:27</td><td>张岚</td><td>发布版本</td>
              <td>智能客服「听澜」v2.4</td>
              <td><span class="code">agent:publish</span></td>
            </tr>
            <tr>
              <td>09:12</td><td>李云</td><td>上传文档</td>
              <td>产品知识库 · 3 个文档</td>
              <td><span class="code">knowledge:upload</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 用户列表 -->
      <div class="panel">
        <div class="panel-header">
          <span>账号列表</span>
          <PermissionGate perm="user:create"><router-link to="/rbac/users/create" class="btn-primary btn-sm">新建用户</router-link></PermissionGate>
        </div>
        <table>
          <thead>
            <tr>
              <th>用户</th><th>邮箱</th><th>角色</th><th>状态</th><th>最近登录</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>
                <div class="user-cell">
                  <span class="avatar">{{ u.initials }}</span>
                  <span>{{ u.name }} <span class="account">{{ u.account }}</span></span>
                </div>
              </td>
              <td class="code">{{ u.email }}</td>
              <td>
                <span v-for="r in u.roles" :key="r" class="chip chip--role">{{ r }}</span>
                <span v-if="u.roles.length === 0" class="chip chip--muted">未分配</span>
              </td>
              <td>
                <span class="stamp" :class="u.status === 'on' ? 'stamp--on' : 'stamp--off'">
                  {{ u.status === 'on' ? '启用' : '禁用' }}
                </span>
              </td>
              <td>{{ u.lastLogin }}</td>
              <td>
                <PermissionGate perm="role:assign"><a href="#" class="link-action">分配角色</a></PermissionGate>
                <PermissionGate perm="user:delete"><a href="#" class="link-danger">删除</a></PermissionGate>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import PermissionGate from '@/components/guards/PermissionGate.vue'
export default { components: { PermissionGate } }
</script>

<style scoped>
h1 { font-size: 1.5rem; color: #1B241F; margin: 0 0 0.25rem; }
.subtitle { color: #55605A; font-size: 0.875rem; margin: 0 0 1.5rem; }
.scope-panel {
  background: #FBFAF6;
  border: 1px solid #DCDED5;
  border-radius: 3px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}
.scope-panel h2 { font-size: 0.875rem; color: #55605A; margin: 0 0 0.75rem; font-weight: 500; }
.scope-info { display: flex; gap: 2rem; flex-wrap: wrap; }
.scope-item { display: flex; flex-direction: column; gap: 0.25rem; }
.scope-item .label { font-size: 0.75rem; color: #8B958E; }
.scope-item .value { font-size: 0.9rem; color: #1B241F; }
.scope-item .code { font-family: "Cascadia Code", Consolas, monospace; color: #14503F; font-size: 0.85rem; }
.ledger-summary {
  display: flex;
  border-top: 1px solid #DCDED5;
  border-bottom: 1px solid #DCDED5;
  margin-bottom: 1.5rem;
}
.ledger-cell {
  flex: 1;
  text-align: center;
  padding: 0.75rem 1rem;
  border-right: 1px solid #DCDED5;
}
.ledger-cell:last-child { border-right: none; }
.ledger-cell .num { display: block; font-size: 1.5rem; font-family: Georgia, serif; color: #1B241F; }
.ledger-cell .label { font-size: 0.75rem; color: #55605A; }
.panel {
  background: #FBFAF6;
  border: 1px solid #DCDED5;
  border-radius: 3px;
  margin-bottom: 1.5rem;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #DCDED5;
  font-size: 0.8rem;
  color: #55605A;
}
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.6rem 1rem; text-align: left; border-bottom: 1px solid #EDEFE9; font-size: 0.85rem; }
th { background: #F6F7F1; font-weight: 500; color: #55605A; font-size: 0.75rem; }
.user-cell { display: flex; align-items: center; gap: 0.5rem; }
.avatar {
  width: 28px; height: 28px; border-radius: 2px;
  background: #EDEFE9; color: #14503F;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 600; flex-shrink: 0;
}
.account { color: #8B958E; font-size: 0.75rem; margin-left: 0.25rem; }
.chip { display: inline-block; padding: 0.15rem 0.4rem; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.75rem; color: #55605A; margin-right: 0.25rem; }
.chip--muted { border-style: dashed; color: #8B958E; }
.stamp { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.5rem; border-radius: 2px; font-size: 0.75rem; }
.stamp--on { color: #14503F; background: #E8F5EE; }
.stamp--off { color: #55605A; background: #EDEFE9; }
.code { font-family: "Cascadia Code", Consolas, monospace; font-size: 0.75rem; background: #F6F7F1; padding: 0.1rem 0.3rem; border: 1px dashed #DCDED5; border-radius: 2px; color: #1B241F; }
.link-action { color: #14503F; text-decoration: none; font-size: 0.8rem; margin-right: 0.75rem; }
.link-action:hover { text-decoration: underline; }
.link-danger { color: #A6402F; text-decoration: none; font-size: 0.8rem; }
.link-danger:hover { text-decoration: underline; }
.btn-primary { height: 28px; padding: 0 0.75rem; background: #14503F; color: #FBFAF6; border: none; border-radius: 2px; font-size: 0.8rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; }
.btn-primary:hover { background: #0f3d2f; }
.btn-sm { font-size: 0.75rem; height: 26px; padding: 0 0.5rem; }
.empty-state { padding: 3rem; text-align: center; color: #55605A; }
.btn-link { color: #14503F; }
</style>
