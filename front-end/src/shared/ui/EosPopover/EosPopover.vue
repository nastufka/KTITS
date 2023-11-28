<script setup lang="ts">
import type { PopoverProps } from 'ant-design-vue'

export interface EosPopoverProps extends PopoverProps {}

const props = defineProps<EosPopoverProps>()
</script>

<template>
  <a-popover
    v-bind="{ ...$attrs, ...props }"
    overlay-class-name="eos-popover"
  >
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-popover>
</template>

<style lang="scss">
.eos-popover {
  .ant-popover-arrow {
    display: none;
  }
}
</style>
