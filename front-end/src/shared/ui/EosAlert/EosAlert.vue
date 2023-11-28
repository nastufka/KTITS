<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  type: string
}>()
const color = computed<string>(() => {
  switch (props.type) {
    case 'warning':
      return 'rgba(254,158,104, 24%)'
    case 'info':
      return '#70B6F61F'
    case 'error':
      return 'var(--day-status-error-bg)'
    case 'success':
      return '#F68B4E'
    default:
      return '#FE9E68'
  }
})
</script>

<template>
  <div class="eos-alert" :style="{ background: color }">
    <slot name="icon" />
    <div class="eos-alert-message">
      <div>
        <slot name="title" />
      </div>
      <div class="eos-alert-description">
        <slot name="description" />
      </div>
    </div>
  </div>  
</template>

<style lang="scss">
.eos-alert {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  .anticon {
    align-items: flex-start;
  }
  &-message {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  &-title {
    font-size: 15px;
    font-weight: 800;
    color: var(--sc-base-1);
  }
  &-description {
    font-size: 13px;
    font-weight: 500;
    color: var(--sc-base-1);
  }
}
</style>