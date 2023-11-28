<script setup lang="ts">
import { computed } from 'vue';

interface IconProp {
  active?: boolean,
  color?: string
}
const props = defineProps<IconProp>()
const color = computed<string>(() => props.color ?? (props.active ? '#FFF' : '#999'))
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.25 11.157a.75.75 0 0 1 .75.75v9a.75.75 0 1 1-1.5 0v-9a.75.75 0 0 1 .75-.75ZM12.25 3.657a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75ZM19 18.657a.75.75 0 0 1 .75.75v1.5a.75.75 0 1 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM19 3.657a.75.75 0 0 1 .75.75v12a.75.75 0 1 1-1.5 0v-12a.75.75 0 0 1 .75-.75Z" :fill="color"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M16 16.407a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75ZM5.5 15.657a.75.75 0 0 1 .75.75v4.5a.75.75 0 1 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75ZM5.5 3.657a.75.75 0 0 1 .75.75v9a.75.75 0 1 1-1.5 0v-9a.75.75 0 0 1 .75-.75Z" :fill="color"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 13.407a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75ZM9.25 8.907a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5H10a.75.75 0 0 1-.75-.75Z" :fill="color"/>
  </svg>
</template>