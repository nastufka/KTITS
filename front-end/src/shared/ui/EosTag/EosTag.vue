<script setup lang="ts">
import type { TagProps } from 'ant-design-vue'

import CloseIcon from '@/shared/icons/CloseIcon.vue'

export interface EosTagProps extends /* @vue-ignore */ TagProps {
  size?: 'medium' | 'large',
  disabled?: boolean,
}

const props = withDefaults(defineProps<EosTagProps>(), {
  size: 'medium'
})
</script>

<template>
  <a-tag
    v-bind="{ ...$attrs, ...props }"
    class="eos-tag"
    :class="{
      'eos-tag_medium': size === 'medium',
      'eos-tag_large': size === 'large',
      'eos-tag_disabled': disabled,
    }"
  >
    <template #closeIcon>
      <CloseIcon fill="#999999" />
    </template>

    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-tag>
</template>

<style lang="scss">
.eos-tag {
  display: inline-flex;
  align-items: center;
  border: 0;
  border-radius: 8px;
  background: var(--sc-base-5);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  padding: 8px 8px 8px 12px;
  font-family: inherit;
  margin-right: 0;
  flex-wrap: wrap;
  white-space: break-spaces;

  &_medium {
    min-height: 28px;
  }

  &_large {
    min-height: 36px;
  }

  &_disabled {
    background: var(--sc-base-6);
  }
}
</style>
