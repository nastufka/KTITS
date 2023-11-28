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
    <g clip-path="url(#clip0_361_31015)">
      <rect x="1.5" y="6.47412" width="16.0254" height="12.7079" rx="1.25" :stroke="color" stroke-width="1.5"/>
      <rect x="19.167" y="5.72412" width="5.57767" height="4.38961" rx="1" :fill="color"/>
      <rect x="19.167" y="10.6333" width="5.57767" height="4.38961" rx="1" :fill="color"/>
      <rect x="19.1719" y="15.5425" width="5.57767" height="4.38961" rx="1" :fill="color"/>
    </g>
    <defs>
      <clipPath id="clip0_361_31015">
        <rect width="24" height="24" fill="white" transform="translate(0.75 0.828125)"/>
      </clipPath>
    </defs>
  </svg>
</template>