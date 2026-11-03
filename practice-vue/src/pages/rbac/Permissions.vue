<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRbacStore } from '@/store/rbac'
import type { Permission } from '@/services/rbac/types'

const store = useRbacStore()
const permissions = ref<Permission[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const moduleFilter = ref('')
const loading = ref(false)
const showCreate = ref(false)
const newCode = ref('')
const newName = ref('')
const newDesc = ref('')
const newModule = ref('')
const editingCode = ref<string | null>(null)
const editName = ref('')
const editDesc = ref('')

const MODULE_KEYS = ['user', 'role', 'permission', 'agent', 'model', 'prompt', 'knowledge', 'tool']

onMounted(() => {
  fetchPermissions()
})

async function fetchPermissions() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: pageSize.value }
    if (keyword.value) params.keyword = keyword.value
    if (moduleFilter.value) params.keyword = moduleFilter.value // mock doesn't support this filter well
    const res = await store.fetchPermissions(params)
    permissions.value = res.items
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  fetchPermissions()
}

function startEdit(perm: Permission) {
  editingCode.value = perm.code
  editName.value = perm.name
  editDesc.value = perm.description
}

function cancelEdit() {
  editingCode.value = null
}

async function saveEdit() {
  if (!editingCode.value) return
  // In real API: await permissionService.update(editingCode.value, { name: editName.value, description: editDesc.value })
  const idx = permissions.value.findIndex(p => p.code === editingCode.value)
  if (idx >= 0) {
    permissions.value[idx] = { ...permissions.value[idx], name: editName.value, description: editDesc.value }
  }
  editingCode.value = null
}

function toggleCreate() {
  showCreate.value = !showCreate.value
  if (showCreate.value) {
    newCode.value = ''
    newName.value = ''
    newDesc.value = ''
    newModule.value = ''
  }
}

async function submitCreate() {
  if (!newCode.value || !newName.value) return
  // In real API: await permissionService.create({ code: newCode.value, name: newName.value, description: newDesc.value })
  showCreate.value = false
}

async function deletePermission(code: string) {
  if (!confirm(`确定要删除权限 "${code}" 吗？这将影响所有持有该权限的角色。`)) return
  // In real API: await permissionService.delete(code)
  permissions.value = permissions.value.filter(p => p.code !== code)
  total.value--
}

function getAffectedRoles(code: string): string[] {
  return store.roles
    .filter(r => r.permissions.includes(code) || r.permissions.includes('*'))
    .map(r => r.name)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>权限管理</h1>
      <PermissionGate perm="permission:create">
        <button @click="toggleCreate" class="btn-primary btn-sm">{{ showCreate ? '取消' : '新建权限' }}</button>
      </PermissionGate>
    </div>
    <p class="subtitle">40 条权限目录 · 权限码创建后不可修改</p>

    <!-- 台账摘要 -->
    <div class="ledger-summary">
      <div class="ledger-cell"><span class="num">{{ total }}</span><span class="label">总权限数</span></div>
      <div class="ledger-cell"><span class="num">{{ MODULE_KEYS.length }}</span><span class="label">模块数</span></div>
      <div class="ledger-cell"><span class="num">{{ store.roles.filter(r => r.builtin).length }}</span><span class="label">内置角色</span></div>
      <div class="ledger-cell"><span class="num">{{ store.roles.filter(r => !r.builtin).length }}</span><span class="label">自定义角色</span></div>
    </div>

    <!-- 搜索栏 -->
    <div class="toolbar">
      <input v-model="keyword" placeholder="搜索权限码/名称/说明..." @keyup.enter="search" class="input" />
      <select v-model="moduleFilter" class="select" @change="search">
        <option value="">全部模块</option>
        <option v-for="m in MODULE_KEYS" :key="m" :value="m">{{ m }}</option>
      </select>
      <button @click="search" class="btn-secondary">搜索</button>
    </div>

    <!-- 新建表单 -->
    <div v-if="showCreate" class="panel">
      <div class="panel-header"><span>新建权限</span></div>
      <div class="form-body">
        <div class="field">
          <label>权限码（格式：模块:动作）</label>
          <input v-model="newCode" placeholder="如 agent:test" />
        </div>
        <div class="field">
          <label>名称</label>
          <input v-model="newName" placeholder="输入权限名称" />
        </div>
        <div class="field">
          <label>描述</label>
          <input v-model="newDesc" placeholder="输入权限描述" />
        </div>
        <div class="form-actions">
          <button @click="submitCreate" class="btn-primary btn-sm">创建</button>
          <button @click="toggleCreate" class="btn-secondary btn-sm">取消</button>
        </div>
      </div>
    </div>

    <!-- 权限列表 -->
    <div class="panel">
      <div class="panel-header">
        <span>权限目录</span>
        <span class="count">{{ total }} 条</span>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <template v-else>
        <!-- 按模块分组 -->
        <div v-for="mod in MODULE_KEYS" :key="mod" class="module-group">
          <div class="module-group-header">
            <span class="module-code">{{ mod }}</span>
            <span class="module-name">{{ mod }}</span>
            <span class="module-count">{{ permissions.filter(p => p.module === mod).length }} 条</span>
          </div>
          <table class="perm-table">
            <thead>
              <tr>
                <th>权限码</th>
                <th>名称</th>
                <th>说明</th>
                <th>授予角色</th>
                <th v-if="hasActions()">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="perm in permissions.filter(p => p.module === mod)" :key="perm.code">
                <td><span class="code">{{ perm.code }}</span></td>
                <td>
                  <template v-if="editingCode === perm.code">
                    <input v-model="editName" class="input-sm" />
                  </template>
                  <template v-else>{{ perm.name }}</template>
                </td>
                <td>
                  <template v-if="editingCode === perm.code">
                    <input v-model="editDesc" class="input-sm" />
                  </template>
                  <template v-else>{{ perm.description }}</template>
                </td>
                <td>
                  <span v-for="role in getAffectedRoles(perm.code)" :key="role" class="chip chip--role">{{ role }}</span>
                  <span v-if="getAffectedRoles(perm.code).length === 0" class="text-muted">仅 admin（*）</span>
                </td>
                <td v-if="hasActions()">
                  <PermissionGate perm="permission:update">
                    <template v-if="editingCode === perm.code">
                      <button @click="saveEdit" class="btn-sm btn-green">保存</button>
                      <button @click="cancelEdit" class="btn-sm btn-gray">取消</button>
                    </template>
                    <template v-else>
                      <button @click="startEdit(perm)" class="link-action">编辑</button>
                    </template>
                  </PermissionGate>
                  <PermissionGate perm="permission:delete">
                    <button @click="deletePermission(perm.code)" class="link-danger">删除</button>
                  </PermissionGate>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
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
    const hasActions = computed(() => store.hasPerm('permission:update') || store.hasPerm('permission:delete'))
    return { store, hasActions }
  }
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.page-header h1 { font-size: 1.5rem; color: #1B241F; margin: 0; }
.header-actions { display: flex; gap: 0.5rem; }
.subtitle { color: #55605A; font-size: 0.875rem; margin: 0 0 1.5rem; }
.ledger-summary { display: flex; border-top: 1px solid #DCDED5; border-bottom: 1px solid #DCDED5; margin-bottom: 1rem; }
.ledger-cell { flex: 1; text-align: center; padding: 0.75rem 1rem; border-right: 1px solid #DCDED5; }
.ledger-cell:last-child { border-right: none; }
.ledger-cell .num { display: block; font-size: 1.5rem; font-family: Georgia, serif; color: #1B241F; }
.ledger-cell .label { font-size: 0.75rem; color: #55605A; }
.toolbar { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.input { flex: 1; height: 34px; padding: 0 0.75rem; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.9rem; outline: none; }
.input:focus { border-color: #14503F; box-shadow: 0 0 0 2px rgba(20,80,63,0.15); }
.input-sm { width: 100%; height: 28px; padding: 0 0.5rem; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.8rem; outline: none; }
.input-sm:focus { border-color: #14503F; }
.select { height: 34px; padding: 0 0.5rem; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.85rem; background: #fff; cursor: pointer; }
.btn-primary { height: 28px; padding: 0 0.75rem; background: #14503F; color: #FBFAF6; border: none; border-radius: 2px; font-size: 0.8rem; cursor: pointer; }
.btn-primary:hover { background: #0f3d2f; }
.btn-secondary { height: 28px; padding: 0 0.75rem; background: transparent; color: #1B241F; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.8rem; cursor: pointer; }
.btn-secondary:hover { background: #F6F7F1; }
.btn-sm { height: 24px; padding: 0 0.5rem; font-size: 0.75rem; border-radius: 2px; cursor: pointer; }
.btn-green { background: #14503F; color: #FBFAF6; border: none; }
.btn-gray { background: transparent; color: #55605A; border: 1px solid #DCDED5; }
.link-action { color: #14503F; text-decoration: none; font-size: 0.8rem; margin-right: 0.5rem; cursor: pointer; background: none; border: none; }
.link-action:hover { text-decoration: underline; }
.link-danger { color: #A6402F; text-decoration: none; font-size: 0.8rem; cursor: pointer; background: none; border: none; }
.link-danger:hover { text-decoration: underline; }
.panel { background: #FBFAF6; border: 1px solid #DCDED5; border-radius: 3px; margin-bottom: 1rem; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid #DCDED5; font-size: 0.8rem; color: #55605A; }
.count { font-family: "Cascadia Code", Consolas, monospace; }
.loading { padding: 2rem; text-align: center; color: #55605A; }
.form-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; }
.field label { font-size: 0.75rem; color: #55605A; font-weight: 500; }
.field input { height: 34px; padding: 0 0.75rem; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.85rem; outline: none; }
.field input:focus { border-color: #14503F; box-shadow: 0 0 0 2px rgba(20,80,63,0.15); }
.form-actions { display: flex; gap: 0.5rem; }
.module-group { border-bottom: 1px solid #EDEFE9; }
.module-group:last-child { border-bottom: none; }
.module-group-header { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 1rem; background: #F6F7F1; font-size: 0.75rem; }
.module-code { font-family: "Cascadia Code", Consolas, monospace; color: #14503F; }
.module-name { color: #1B241F; font-weight: 500; }
.module-count { color: #8B958E; }
.perm-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.perm-table th, .perm-table td { padding: 0.6rem 1rem; text-align: left; border-bottom: 1px solid #EDEFE9; }
.perm-table th { background: #F9FAFB; font-weight: 500; color: #55605A; font-size: 0.75rem; }
.code { font-family: "Cascadia Code", Consolas, monospace; font-size: 0.75rem; background: #F6F7F1; padding: 0.1rem 0.3rem; border: 1px dashed #DCDED5; border-radius: 2px; color: #1B241F; }
.chip { display: inline-block; padding: 0.1rem 0.4rem; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.7rem; color: #55605A; margin-right: 0.25rem; }
.chip--role { background: #EDEFE9; }
.text-muted { color: #8B958E; font-size: 0.75rem; }
.pagination { padding: 1rem 0; font-size: 0.8rem; color: #55605A; }
</style>
