<script setup lang="ts">
const props = defineProps<{
  color: string
}>()
</script>
<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
    <circle cx="12.9231" cy="12.8283" r="10.6428" :fill="props.color"/>
    <circle opacity="0.48" cx="12.9229" cy="12.8281" r="12" :fill="props.color"/>
  </svg>
</template>