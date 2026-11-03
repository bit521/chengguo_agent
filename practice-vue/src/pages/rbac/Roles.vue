<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRbacStore } from '@/store/rbac'
import type { Role, Permission } from '@/services/rbac/types'

const store = useRbacStore()
const roles = ref<Role[]>([])
const allPermissions = ref<Permission[]>([])
const selectedRoleCode = ref<string>('admin')
const total = ref(0)
const loading = ref(false)
const isEditing = ref(false)
const editName = ref('')
const editDesc = ref('')

// 8个模块 x 10个动作
const MODULES = [
  { key: 'user', name: '用户', actions: ['list', 'create', 'update', 'delete'] },
  { key: 'role', name: '角色', actions: ['list', 'create', 'update', 'delete', 'assign'] },
  { key: 'permission', name: '权限', actions: ['list', 'create', 'update', 'delete'] },
  { key: 'agent', name: 'Agent', actions: ['list', 'create', 'update', 'delete', 'publish', 'execute'] },
  { key: 'model', name: '模型', actions: ['list', 'create', 'update', 'delete', 'test'] },
  { key: 'prompt', name: 'Prompt', actions: ['list', 'create', 'update', 'delete', 'publish'] },
  { key: 'knowledge', name: '知识库', actions: ['list', 'create', 'update', 'delete', 'upload', 'retrieval'] },
  { key: 'tool', name: '工具', actions: ['list', 'create', 'update', 'delete', 'test'] },
]

const ACTION_LABELS: Record<string, string> = {
  list: '查看', create: '创建', update: '编辑', delete: '删除',
  assign: '分配', publish: '发布', execute: '运行',
  upload: '上传', retrieval: '检索测试', test: '测试',
}

const ACTION_ORDER = ['list', 'create', 'update', 'delete', 'assign', 'publish', 'execute', 'upload', 'retrieval', 'test']

const selectedRole = computed(() => roles.value.find(r => r.code === selectedRoleCode.value))
const canEditMatrix = computed(() => {
  if (!selectedRole.value) return false
  return store.hasPerm('role:assign') && !selectedRole.value.permissions.includes('*')
})

onMounted(async () => {
  loading.value = true
  try {
    const [rolesRes, permsRes] = await Promise.all([
      store.fetchRoles(),
      store.fetchPermissions(),
    ])
    roles.value = rolesRes.items
    allPermissions.value = permsRes.items
    total.value = rolesRes.total
    if (roles.value.length > 0 && !selectedRole.value) {
      selectedRoleCode.value = roles.value[0].code
    }
  } finally {
    loading.value = false
  }
})

function selectRole(code: string) {
  selectedRoleCode.value = code
  isEditing.value = false
}

function startEdit() {
  if (!selectedRole.value) return
  editName.value = selectedRole.value.name
  editDesc.value = selectedRole.value.description
  isEditing.value = true
}

async function saveEdit() {
  if (!selectedRole.value) return
  await store.fetchRoles() // refresh
}

function togglePermission(moduleKey: string, action: string) {
  const role = selectedRole.value
  if (!role || !canEditMatrix.value) return
  const code = `${moduleKey}:${action}`
  const perms = [...role.permissions]
  const idx = perms.indexOf(code)
  if (idx >= 0) {
    perms.splice(idx, 1)
  } else {
    perms.push(code)
  }
  role.permissions = perms
}

function selectAll() {
  if (!canEditMatrix.value) return
  const role = selectedRole.value
  if (!role) return
  const allCodes = MODULES.flatMap(m => m.actions.map(a => `${m.key}:${a}`))
  role.permissions = allCodes
}

function hasAll(moduleKey: string, actions: string[]): boolean {
  const role = selectedRole.value
  if (!role) return false
  return actions.every(a => role.permissions.includes(`${moduleKey}:${a}`))
}

function isChecked(moduleKey: string, action: string): boolean {
  const role = selectedRole.value
  if (!role) return false
  return role.permissions.includes(`${moduleKey}:${action}`) || role.permissions.includes('*')
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>角色管理</h1>
      <div class="header-actions">
        <PermissionGate perm="role:create">
          <button class="btn-primary btn-sm">新建角色</button>
        </PermissionGate>
      </div>
    </div>
    <p class="subtitle">维护角色定义与权限矩阵</p>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="roles-layout">
      <!-- 左侧角色列表 -->
      <div class="role-list-panel">
        <div class="panel-header"><span>角色列表</span><span class="count">{{ total }}</span></div>
        <div class="role-list">
          <div
            v-for="role in roles"
            :key="role.code"
            class="role-item"
            :class="{ 'role-item--active': selectedRoleCode === role.code }"
            @click="selectRole(role.code)"
          >
            <div class="role-item-main">
              <span class="role-name">{{ role.name }}</span>
              <span v-if="role.builtin" class="chip chip--super">内置</span>
            </div>
            <div class="role-item-meta">
              <span class="code">{{ role.code }}</span>
              <span>{{ role.permissions.length }}/40</span>
              <span>{{ role.userCount }} 用户</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧详情 -->
      <div class="role-detail-panel">
        <template v-if="selectedRole">
          <div class="panel">
            <div class="panel-header">
              <span>角色详情</span>
              <div class="header-actions">
                <PermissionGate perm="role:update">
                  <button v-if="!isEditing" @click="startEdit" class="btn-secondary btn-sm">编辑</button>
                </PermissionGate>
                <PermissionGate perm="role:delete">
                  <button v-if="!selectedRole.builtin" @click="" class="btn-danger btn-sm">删除</button>
                </PermissionGate>
              </div>
            </div>

            <!-- 编辑表单 -->
            <div v-if="isEditing && !selectedRole.builtin" class="edit-form">
              <div class="field">
                <label>名称</label>
                <input v-model="editName" />
              </div>
              <div class="field">
                <label>描述</label>
                <textarea v-model="editDesc" rows="3"></textarea>
              </div>
              <div class="field" v-if="!selectedRole.builtin">
                <label>角色码</label>
                <input v-model="selectedRole.code" :disabled="selectedRole.builtin" />
              </div>
              <div class="form-actions">
                <button @click="saveEdit" class="btn-primary btn-sm">保存</button>
                <button @click="isEditing = false" class="btn-secondary btn-sm">取消</button>
              </div>
            </div>

            <!-- 角色信息 -->
            <div v-else class="role-info">
              <div class="info-row">
                <span class="label">名称</span>
                <span class="value">{{ selectedRole.name }}</span>
              </div>
              <div class="info-row">
                <span class="label">角色码</span>
                <span class="code">{{ selectedRole.code }}</span>
                <span v-if="selectedRole.builtin" class="chip chip--super">内置</span>
              </div>
              <div class="info-row">
                <span class="label">描述</span>
                <span class="value">{{ selectedRole.description }}</span>
              </div>
              <div class="info-row">
                <span class="label">有效权限</span>
                <span class="value">{{ selectedRole.permissions.length }} / 40</span>
              </div>
              <div class="info-row">
                <span class="label">用户数</span>
                <span class="value">{{ selectedRole.userCount }}</span>
              </div>
            </div>
          </div>

          <!-- 权限矩阵 -->
          <div class="panel">
            <div class="panel-header">
              <span>权限矩阵</span>
              <div class="matrix-controls">
                <span v-if="!canEditMatrix && selectedRole.permissions.includes('*')" class="readonly-hint">
                  通配权限，只读
                </span>
                <span v-else-if="!canEditMatrix" class="readonly-hint">
                  缺少 <span class="code">role:assign</span>，只读
                </span>
                <button v-if="canEditMatrix" @click="selectAll" class="btn-secondary btn-sm">全选</button>
                <button v-if="canEditMatrix" @click="saveEdit" class="btn-primary btn-sm">保存</button>
              </div>
            </div>
            <div class="matrix-wrapper">
              <table class="matrix">
                <thead>
                  <tr>
                    <th class="col-module">模块 / 操作</th>
                    <th v-for="action in ACTION_ORDER" :key="action" class="col-action">
                      <span class="action-label">{{ ACTION_LABELS[action] }}</span>
                      <span class="action-code">:{{ action }}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="mod in MODULES" :key="mod.key">
                    <td class="col-module">
                      <span class="module-name">{{ mod.name }}</span>
                      <span class="module-code">{{ mod.key }}</span>
                    </td>
                    <td v-for="action in mod.actions" :key="action" class="col-check">
                      <label class="checkbox-label">
                        <input
                          type="checkbox"
                          :checked="isChecked(mod.key, action)"
                          :disabled="!canEditMatrix || selectedRole.builtin"
                          @change="togglePermission(mod.key, action)"
                        />
                      </label>
                    </td>
                    <td v-for="action in ACTION_ORDER.filter(a => !mod.actions.includes(a))" :key="action" class="col-dash">
                      —
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import PermissionGate from '@/components/guards/PermissionGate.vue'
export default { components: { PermissionGate } }
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.page-header h1 { font-size: 1.5rem; color: #1B241F; margin: 0; }
.header-actions { display: flex; gap: 0.5rem; }
.subtitle { color: #55605A; font-size: 0.875rem; margin: 0 0 1.5rem; }
.loading { padding: 3rem; text-align: center; color: #55605A; }
.roles-layout { display: grid; grid-template-columns: 260px 1fr; gap: 1.5rem; }
.role-list-panel { background: #FBFAF6; border: 1px solid #DCDED5; border-radius: 3px; }
.role-list-panel .panel-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid #DCDED5; font-size: 0.8rem; color: #55605A; }
.role-list { padding: 0.5rem; }
.role-item { padding: 0.75rem; border-radius: 2px; cursor: pointer; margin-bottom: 0.25rem; transition: background 0.15s ease; }
.role-item:hover { background: #F6F7F1; }
.role-item--active { background: #E8F5EE; border-left: 3px solid #B08442; padding-left: calc(0.75rem - 3px); }
.role-item-main { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
.role-name { font-size: 0.9rem; color: #1B241F; font-weight: 500; }
.chip { display: inline-block; padding: 0.1rem 0.4rem; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.7rem; color: #55605A; }
.chip--super { background: #F5E6D0; border-color: #B08442; color: #7A5723; }
.role-item-meta { display: flex; gap: 0.75rem; font-size: 0.7rem; color: #8B958E; }
.role-detail-panel { display: flex; flex-direction: column; gap: 1rem; }
.panel { background: #FBFAF6; border: 1px solid #DCDED5; border-radius: 3px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid #DCDED5; font-size: 0.8rem; color: #55605A; }
.count { font-family: "Cascadia Code", Consolas, monospace; }
.info-row { display: flex; padding: 0.5rem 1rem; border-bottom: 1px solid #EDEFE9; font-size: 0.85rem; }
.info-row:last-child { border-bottom: none; }
.info-row .label { width: 100px; color: #55605A; flex-shrink: 0; }
.info-row .value { color: #1B241F; }
.code { font-family: "Cascadia Code", Consolas, monospace; font-size: 0.75rem; background: #F6F7F1; padding: 0.1rem 0.3rem; border: 1px dashed #DCDED5; border-radius: 2px; color: #1B241F; }
.edit-form { padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; }
.field label { font-size: 0.75rem; color: #55605A; font-weight: 500; }
.field input, .field textarea { height: 34px; padding: 0 0.75rem; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.85rem; outline: none; }
.field textarea { height: auto; }
.field input:focus, .field textarea:focus { border-color: #14503F; box-shadow: 0 0 0 2px rgba(20,80,63,0.15); }
.form-actions { display: flex; gap: 0.5rem; }
.btn-primary { height: 28px; padding: 0 0.75rem; background: #14503F; color: #FBFAF6; border: none; border-radius: 2px; font-size: 0.8rem; cursor: pointer; }
.btn-primary:hover { background: #0f3d2f; }
.btn-secondary { height: 28px; padding: 0 0.75rem; background: transparent; color: #1B241F; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.8rem; cursor: pointer; }
.btn-secondary:hover { background: #F6F7F1; }
.btn-danger { height: 28px; padding: 0 0.75rem; background: transparent; color: #A6402F; border: 1px solid #A6402F; border-radius: 2px; font-size: 0.8rem; cursor: pointer; }
.btn-danger:hover { background: #FDEAEA; }
.btn-sm { font-size: 0.75rem; height: 26px; }
.matrix-wrapper { overflow-x: auto; padding: 0.5rem; }
.matrix { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.matrix th, .matrix td { padding: 0.5rem; text-align: center; border: 1px solid #EDEFE9; white-space: nowrap; }
.matrix th { background: #F6F7F1; font-weight: 500; color: #55605A; }
.col-module { text-align: left; min-width: 120px; }
.module-name { display: block; font-weight: 500; color: #1B241F; }
.module-code { display: block; font-family: "Cascadia Code", Consolas, monospace; font-size: 0.7rem; color: #8B958E; }
.col-action { min-width: 60px; }
.action-label { display: block; font-size: 0.8rem; }
.action-code { display: block; font-family: "Cascadia Code", Consolas, monospace; font-size: 0.65rem; color: #8B958E; }
.col-check { width: 36px; }
.checkbox-label { display: flex; justify-content: center; }
.checkbox-label input { width: 16px; height: 16px; accent-color: #14503F; cursor: pointer; }
.col-dash { color: #8B958E; font-size: 0.9rem; }
.matrix-controls { display: flex; gap: 0.5rem; align-items: center; }
.readonly-hint { font-size: 0.75rem; color: #A6402F; }
</style>
