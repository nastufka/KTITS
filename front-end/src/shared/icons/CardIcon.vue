<script setup lang="ts">
import { computed } from 'vue';

interface IconProp {
  active?: boolean,
  color?: string
}
const props = defineProps<IconProp>()
const color = computed<string>(() => props.active ? '#FFF' : '#999')
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.75 11.157a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H14.5a.75.75 0 0 1-.75-.75ZM13.75 14.157a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H14.5a.75.75 0 0 1-.75-.75ZM8.885 10.407a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm-3 1.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" :fill="color"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.884 14.9a2.25 2.25 0 0 0-2.18 1.693.75.75 0 1 1-1.453-.372 3.75 3.75 0 0 1 7.266 0 .75.75 0 0 1-1.453.372 2.25 2.25 0 0 0-2.18-1.692Z" :fill="color"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 5.907a1.5 1.5 0 0 1 1.5-1.5h16.5a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5v-13.5Zm18 0H4v13.5h16.5v-13.5Z" :fill="color"/>
  </svg>
</template>