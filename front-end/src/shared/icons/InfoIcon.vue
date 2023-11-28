<script setup lang="ts">
const props = withDefaults(defineProps<{
  color?: string
}>(), {
  color: '#79A2FF'
})
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.125 3C7.15444 3 3.125 7.02944 3.125 12C3.125 16.9706 7.15444 21 12.125 21C17.0956 21 21.125 16.9706 21.125 12C21.125 7.02944 17.0956 3 12.125 3ZM1.125 12C1.125 5.92487 6.04987 1 12.125 1C18.2001 1 23.125 5.92487 23.125 12C23.125 18.0751 18.2001 23 12.125 23C6.04987 23 1.125 18.0751 1.125 12Z" :fill="color"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.125 11C12.6773 11 13.125 11.4477 13.125 12V16C13.125 16.5523 12.6773 17 12.125 17C11.5727 17 11.125 16.5523 11.125 16V12C11.125 11.4477 11.5727 11 12.125 11Z" :fill="color"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.125 8C11.125 7.44772 11.5727 7 12.125 7H12.135C12.6873 7 13.135 7.44772 13.135 8C13.135 8.55228 12.6873 9 12.135 9H12.125C11.5727 9 11.125 8.55228 11.125 8Z" :fill="color"/>
  </svg>
</template>