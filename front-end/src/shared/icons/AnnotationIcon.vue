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
    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.256 4.442a8.24 8.24 0 0 0-7.604 12.426.75.75 0 0 1 .076.587l-.878 3.102 3.102-.878.205.722.382-.646a8.24 8.24 0 1 0 4.717-15.313ZM8.058 21.208a9.74 9.74 0 1 0-3.859-3.86l-.795 2.808a1.49 1.49 0 0 0 1.847 1.847l2.807-.795Z" :fill="color"/>
    <path d="M12.75 13.782a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25ZM8.25 13.782a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25ZM17.25 13.782a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" :fill="color"/>
  </svg>
</template>