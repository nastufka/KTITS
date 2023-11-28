<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@ant-design/icons-vue'

interface IconProp {
  active?: boolean,
  color?: string
}
const props = defineProps<IconProp>()
const color = computed<string>(() => props.color ?? (props.active ? '#FFF' : '#999'))
</script>

<template>
  <icon>
    <template #component>
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M1.94 5.971A1.5 1.5 0 0 1 3 5.531h12a3.75 3.75 0 0 1 3.75 3.75v9a1.5 1.5 0 0 1-1.5 1.5h-12a3.75 3.75 0 0 1-3.75-3.75v-9c0-.397.158-.779.44-1.06ZM3 7.031v9a2.25 2.25 0 0 0 2.25 2.25h12v-9A2.25 2.25 0 0 0 15 7.032H3Z" :fill="color"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M23.627 7.508a.75.75 0 0 1 .373.649v9a.75.75 0 0 1-1.122.65l-5.25-3a.75.75 0 0 1 .744-1.301l4.128 2.358V9.45l-4.128 2.359a.75.75 0 0 1-.744-1.302l5.25-3a.75.75 0 0 1 .749.002Z" :fill="color"/>
      </svg>
    </template>
  </icon>
</template>
