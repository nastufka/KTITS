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
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.8711 4.5C14.8711 3.67157 15.5427 3 16.3711 3H19.7461C20.5745 3 21.2461 3.67157 21.2461 4.5V19.5C21.2461 20.3284 20.5745 21 19.7461 21H16.3711C15.5427 21 14.8711 20.3284 14.8711 19.5V4.5ZM19.7461 4.5H16.3711V19.5H19.7461V4.5Z" :fill="color"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.74609 4.5C4.74609 3.67157 5.41767 3 6.24609 3H9.62109C10.4495 3 11.1211 3.67157 11.1211 4.5V19.5C11.1211 20.3284 10.4495 21 9.62109 21H6.24609C5.41767 21 4.74609 20.3284 4.74609 19.5V4.5ZM9.62109 4.5H6.24609V19.5H9.62109V4.5Z" :fill="color"/>
  </svg>
</template>