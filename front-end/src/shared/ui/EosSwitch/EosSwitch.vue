<script setup lang="ts">
import type { SwitchProps } from 'ant-design-vue'

export interface EosSwitchProps extends /* @vue-ignore */ SwitchProps {
  label?: string,
  size?: 'small' | 'default',
  disabled?: boolean,
}

const props = withDefaults(defineProps<EosSwitchProps>(), {
  label: '',
  size: 'default'
})
</script>

<template>
  <div>
    <a-switch 
      v-bind="{ ...$attrs, ...props }"
      class="eos-switch"
    >
      <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope || {}" />
      </template>
    </a-switch>
    <span class="eos-switch-label">{{ label }}</span>
  </div>
</template>

<style lang="scss">
.eos-switch {
  background: var(--sc-base-4);
  &-label {
    margin-left: 8px;
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
    color: var(--sc-base-1);
  }
  .ant-switch-handle {
    top: 3px;
  }
}
.ant-switch-checked {
  background: var(--sc-base-7) !important;
}
.eos-switch[size='default'] {
  width: 48px;
  height: 24px;
}
</style>