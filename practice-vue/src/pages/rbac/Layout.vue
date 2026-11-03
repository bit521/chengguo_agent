<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRbacStore } from '@/store/rbac'

const router = useRouter()
const store = useRbacStore()

onMounted(async () => {
  await store.init()
  if (!store.isLoggedIn) {
    router.push('/login')
  }
})

function logout() {
  store.logout()
  router.push('/login')
}
</script>

<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-text">辰光</span>
        <span class="logo-sub">Agent 平台</span>
      </div>
      <nav class="nav">
        <template v-for="group in store.filteredNavGroups" :key="group.title">
          <div class="nav-group">
            <div class="nav-group-title">{{ group.title }}</div>
            <router-link
              v-for="item in group.items"
              :key="item.key"
              :to="item.href"
              class="nav-item"
              :class="{ 'nav-item--active': $route.path.startsWith(item.href) }"
            >
              <span class="nav-item-label">{{ item.label }}</span>
              <span v-if="item.meta" class="nav-item-meta">{{ item.meta }}</span>
            </router-link>
          </div>
        </template>
      </nav>
      <div class="sidebar-footer">
        <div class="identity-card">
          <div class="identity-main">
            <span class="identity-name">{{ store.identity?.name ?? '用户' }}</span>
            <span class="identity-role">{{ store.roleLabel }}</span>
          </div>
          <button @click="logout" class="btn-logout">退出</button>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="main">
      <header class="topbar">
        <div class="topbar-inner">
          <span class="breadcrumb">{{ $route.meta.title || '工作台' }}</span>
          <div class="topbar-right">
            <span class="identity-badge">{{ store.identity?.account }}</span>
            <span class="perm-count">{{ store.permissionCount }}/40</span>
          </div>
        </div>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100dvh;
  background: #EDEFE9;
}

.sidebar {
  width: 248px;
  background: #17231E;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
}

.logo {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.logo-text {
  display: block;
  font-family: Georgia, "Songti SC", serif;
  font-size: 1.25rem;
  color: #FBFAF6;
  letter-spacing: 0.1em;
}
.logo-sub {
  display: block;
  font-size: 0.7rem;
  color: #C6D0C9;
  margin-top: 0.25rem;
}

.nav {
  flex: 1;
  padding: 0.75rem 0;
}
.nav-group {
  margin-bottom: 0.5rem;
}
.nav-group-title {
  padding: 0.5rem 1rem;
  font-size: 0.7rem;
  color: #8B958E;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  color: #C6D0C9;
  text-decoration: none;
  font-size: 0.875rem;
  border-left: 3px solid transparent;
  transition: all 0.15s ease;
}
.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: #FBFAF6;
}
.nav-item--active {
  background: rgba(255,255,255,0.08);
  border-left-color: #B08442;
  color: #FBFAF6;
}
.nav-item-label { font-weight: 500; }
.nav-item-meta { font-size: 0.7rem; color: #8B958E; }

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.identity-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.identity-main {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.identity-name {
  font-size: 0.875rem;
  color: #FBFAF6;
  font-weight: 500;
}
.identity-role {
  font-size: 0.7rem;
  color: #B08442;
}
.btn-logout {
  font-size: 0.75rem;
  color: #C6D0C9;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}
.btn-logout:hover { color: #FBFAF6; }

.main {
  flex: 1;
  margin-left: 248px;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 56px;
  background: #FBFAF6;
  border-bottom: 1px solid #DCDED5;
  position: sticky;
  top: 0;
  z-index: 10;
}
.topbar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.breadcrumb {
  font-size: 0.875rem;
  color: #55605A;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.identity-badge {
  font-size: 0.8rem;
  color: #1B241F;
}
.perm-count {
  font-family: "Cascadia Code", Consolas, monospace;
  font-size: 0.75rem;
  color: #14503F;
  background: #E8F5EE;
  padding: 0.2rem 0.5rem;
  border-radius: 2px;
}

.content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 980px) {
  .sidebar { transform: translateX(-100%); }
  .main { margin-left: 0; }
}
</style>
