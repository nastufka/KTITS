<script setup lang="ts">
import { computed } from 'vue';

interface IconProp {
  active?: boolean,
  color?: string
}
const props = defineProps<IconProp>()
const color = computed<string>(() => props.active ? '#3761F3' : '#999999')
</script>
<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
    <g clip-path="url(#clip0_361_31026)">
      <rect x="1" y="5.5293" width="22.5" height="17.5" rx="1.25" :stroke="color" stroke-width="1.5"/>
    </g>
    <defs>
      <clipPath id="clip0_361_31026">
        <rect width="24" height="24" fill="white" transform="translate(0.25 0.828125)"/>
      </clipPath>
    </defs>
  </svg>
</template>