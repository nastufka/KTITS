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
  <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.8812 4.35775C10.8396 4.35775 5.13118 10.0661 5.13118 17.1077C5.13118 24.1494 10.8396 29.8577 17.8812 29.8577C24.9228 29.8577 30.6312 24.1494 30.6312 17.1077C30.6312 10.0661 24.9228 4.35775 17.8812 4.35775ZM2.29785 17.1077C2.29785 8.50131 9.27475 1.52441 17.8812 1.52441C26.4876 1.52441 33.4645 8.50131 33.4645 17.1077C33.4645 25.7142 26.4876 32.6911 17.8812 32.6911C9.27475 32.6911 2.29785 25.7142 2.29785 17.1077Z" fill="#FBA465"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.7979 17.1081C10.7979 16.3257 11.4321 15.6914 12.2145 15.6914H23.5479C24.3303 15.6914 24.9645 16.3257 24.9645 17.1081C24.9645 17.8905 24.3303 18.5247 23.5479 18.5247H12.2145C11.4321 18.5247 10.7979 17.8905 10.7979 17.1081Z" fill="#FBA465"/>
  </svg>
</template>