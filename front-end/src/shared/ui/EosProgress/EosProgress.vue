<script setup lang="ts">
import type { ProgressProps } from 'ant-design-vue'

interface EosProgressProps extends ProgressProps {
  text?: string
}

const props = defineProps<EosProgressProps>()
</script>

<template>
  <div class="eos-progress-wrap">
    <a-progress 
      v-bind="{ ...$attrs, ...$props }"
      stroke-color="#3761F3"
      class="eos-progress"
    />
    <span v-if="text" class="eos-progress-text">{{ text }}</span>
  </div>
</template>

<style lang="scss">
.eos-progress-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  .eos-progress {
    &-text {
      font-size: 17px;
      font-weight: 500;
      line-height: 28px;
      color: var(--sc-base-2);
    }
  }
}
</style>