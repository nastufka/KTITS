<script setup lang="ts">
import { hasPermission } from '../lib'
import { PermissionEnum } from '../model/permissions'

interface HasPermissionProps {
  permissions: PermissionEnum[]
}

defineProps<HasPermissionProps>()
</script>

<template>
  <slot v-if="hasPermission(permissions)"></slot>
</template>
