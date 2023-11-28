<script setup lang="ts">
import Icon from '@ant-design/icons-vue'

const props = withDefaults(defineProps<{
  fill?: string
}>(), {
  fill: '#F68B4E'
})
</script>

<template>
  <icon>
    <template #component>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10.75 6.5L7.08331 10L5.25 8.25" stroke="#4AC99B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="#4AC99B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </template>
  </icon>
</template>
