<script setup lang="ts">
import type { TooltipProps } from 'ant-design-vue'

export interface EosTooltipProps extends /* @vue-ignore */ TooltipProps {
  
}

const props = defineProps<EosTooltipProps>()

</script>

<template>
  <a-tooltip
    v-bind="{ ...$attrs, ...props }"
    color="#FFF"
    :overlay-inner-style="{
      fontSize: '13px',
      fontWeight: '500',
      color: '#2F3144'
    }"
  >

    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-tooltip>
</template>