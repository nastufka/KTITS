<script setup lang="ts">
export interface RadioIconProps {
  active?: boolean,
  disabled?: boolean
}

withDefaults(defineProps<RadioIconProps>(), {
  active: false,
  disabled: false,
})
</script>

<template>
  <svg v-if="!active && !disabled" width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="1" width="15" height="15" rx="7.5" fill="white"/>
    <rect x="0.5" y="1" width="15" height="15" rx="7.5" stroke="#E0E0E0"/>
  </svg>

  <svg v-else-if="!active && disabled" width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.48">
      <rect x="0.5" y="1" width="15" height="15" rx="7.5" fill="#E0E0E0"/>
      <rect x="0.5" y="1" width="15" height="15" rx="7.5" stroke="#E0E0E0"/>
    </g>
  </svg>

  <svg v-else-if="active && !disabled" xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
    <rect x="0.5" y="1" width="15" height="15" rx="7.5" fill="white"/>
      <circle cx="8" cy="8.5" r="4" fill="#3761F3"/>
    <rect x="0.5" y="1" width="15" height="15" rx="7.5" stroke="#3761F3"/>
  </svg>

  <svg v-else-if="active && disabled" xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
    <g opacity="0.48">
      <rect x="0.5" y="1" width="15" height="15" rx="7.5" fill="white"/>
        <circle cx="8" cy="8.5" r="4" fill="#3761F3"/>
      <rect x="0.5" y="1" width="15" height="15" rx="7.5" stroke="#3761F3"/>
    </g>
  </svg>
</template>
