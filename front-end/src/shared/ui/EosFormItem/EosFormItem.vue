<script setup lang="ts">
import type { FormItemProps } from 'ant-design-vue'

export interface EosFormItemProps extends FormItemProps {}

const props = withDefaults(defineProps<EosFormItemProps>(), {
  autoLink: true,
})
</script>

<template>
  <a-form-item v-bind="{ ...$attrs, ...props }">
    <slot />
  </a-form-item>
</template>

<style lang="scss">
.ant-form-item {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  .ant-form-row {
    flex-flow: unset !important;
    flex-direction: column !important;
    align-items: flex-start;
  }

  .ant-form-item-control {
    flex: unset !important;
    flex-grow: unset !important;
  }

  .ant-form-item-label {
    & label {
      margin-bottom: 8px;
      font-size: 15px;
      font-weight: 800;
      line-height: 24px;
      height: 24px;
    }
  }
  &-explain-error {
    margin-top: 8px;
    font-size: 13px;
    color: var(--sc-error) !important;
  }
}
</style>
