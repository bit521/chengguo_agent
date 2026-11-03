<script setup lang="ts">
import type { VNode } from 'vue'
import { useRbacStore } from '@/store/rbac'

interface Props {
  perm: string
  fallback?: VNode | null
}

const props = defineProps<Props>()
const store = useRbacStore()

function render() {
  if (store.hasPerm(props.perm)) {
    return props.fallback ?? undefined
  }
  return null
}
</script>

<template>
  <slot :allowed="store.hasPerm(perm)" />
</template>
