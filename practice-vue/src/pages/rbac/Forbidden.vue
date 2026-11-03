<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useRbacStore } from '@/store/rbac'

const route = useRoute()
const router = useRouter()
const store = useRbacStore()

const from = route.query.from as string || '/dashboard'
const need = route.query.need as string || ''
const title = route.query.title as string || '该页面'

function goBack() {
  router.push('/dashboard')
}

function goToPermissions() {
  router.push('/rbac/permissions')
}
</script>

<template>
  <div class="forbidden-container">
    <div class="forbidden-box">
      <div class="seal">
        <div class="seal-border">
          <div class="seal-inner">
            <span class="seal-text">REJECTED</span>
            <span class="seal-num">403</span>
          </div>
        </div>
      </div>
      <div class="info">
        <h1>{{ store.isLoggedIn ? '权限不足' : '未授权访问' }}</h1>
        <p class="desc">您没有访问此页面的权限。请联系管理员获取相应权限。</p>
        <table class="fact-table">
          <tbody>
            <tr>
              <td class="fact-label">当前身份</td>
              <td class="fact-value">{{ store.identity?.name ?? '未登录' }}（{{ store.identity?.roleLabel ?? '-' }}）</td>
            </tr>
            <tr>
              <td class="fact-label">请求路径</td>
              <td class="fact-value code">{{ from }}</td>
            </tr>
            <tr v-if="need">
              <td class="fact-label">所需权限</td>
              <td class="fact-value"><span class="code code--deny">{{ need }}</span></td>
            </tr>
            <tr>
              <td class="fact-label">有效权限数</td>
              <td class="fact-value">{{ store.permissionCount }} / 40</td>
            </tr>
          </tbody>
        </table>
        <div class="actions">
          <button @click="goBack" class="btn-primary">返回工作台</button>
          <PermissionGate perm="permission:list">
            <button @click="goToPermissions" class="btn-secondary">查看我的权限</button>
          </PermissionGate>
        </div>
        <p class="help">如需获取权限，请联系系统管理员分配相应角色。</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import PermissionGate from '@/components/guards/PermissionGate.vue'
export default { components: { PermissionGate } }
</script>

<style scoped>
.forbidden-container { min-height: 100dvh; display: flex; align-items: center; justify-content: center; background: #EDEFE9; padding: 2rem; }
.forbidden-box { display: flex; gap: 3rem; align-items: center; max-width: 800px; width: 100%; }
.seal { flex-shrink: 0; }
.seal-border { border: 3px double #A6402F; padding: 1.5rem 2rem; text-align: center; }
.seal-inner { display: flex; flex-direction: column; gap: 0.25rem; }
.seal-text { font-size: 0.7rem; color: #A6402F; letter-spacing: 0.2em; font-weight: 600; }
.seal-num { font-size: 2.5rem; font-family: Georgia, serif; color: #A6402F; font-weight: 700; line-height: 1; }
.info h1 { font-size: 1.5rem; color: #1B241F; margin: 0 0 0.5rem; }
.desc { color: #55605A; font-size: 0.9rem; margin: 0 0 1.5rem; }
.fact-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.85rem; }
.fact-table td { padding: 0.5rem 0; border-bottom: 1px solid #EDEFE9; }
.fact-label { color: #55605A; width: 120px; }
.fact-value { color: #1B241F; }
.code { font-family: "Cascadia Code", Consolas, monospace; font-size: 0.8rem; background: #F6F7F1; padding: 0.15rem 0.4rem; border: 1px dashed #DCDED5; border-radius: 2px; }
.code--deny { background: #FDEAEA; border-color: #A6402F; color: #A6402F; }
.actions { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.btn-primary { height: 32px; padding: 0 1rem; background: #14503F; color: #FBFAF6; border: none; border-radius: 2px; font-size: 0.9rem; cursor: pointer; }
.btn-primary:hover { background: #0f3d2f; }
.btn-secondary { height: 32px; padding: 0 1rem; background: transparent; color: #1B241F; border: 1px solid #DCDED5; border-radius: 2px; font-size: 0.9rem; cursor: pointer; }
.btn-secondary:hover { background: #F6F7F1; }
.help { font-size: 0.8rem; color: #8B958E; margin: 0; }
</style>
