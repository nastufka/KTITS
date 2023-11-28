<script setup lang="ts">
import { ref } from 'vue'
import type { InputProps } from 'ant-design-vue'
import EyeShow from '@/shared/icons/EyeShow.vue'
import EyeHide from '@/shared/icons/EyeHide.vue'
import CloseIcon from '@/shared/icons/CloseIcon.vue'

export interface EosInputProps extends Omit<InputProps, 'size'> {
  size?: 'medium' | 'large'
  isTextArea?: boolean
}

const props = withDefaults(defineProps<EosInputProps>(), {
  isTextArea: false
})

const input = ref<HTMLInputElement>()
const type = ref<string | undefined>(props.type)

function passEyeClick(): void {
  type.value = type.value === 'password' ? 'text' : 'password'
}

function focus() {
  input.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <a-input
    v-if="!isTextArea"
    v-bind="{ ...$attrs, ...props }"
    ref="input"
    class="eos-input"
    :class="{
      'eos-input_large': size === 'large'
    }"
    :type="type"
  >
    <template v-if="props.type === 'password'" #suffix>
      <div class="pass-eye-icon" @click="passEyeClick">
        <EyeShow v-if="type === 'password'" />
        <EyeHide v-else />
      </div>
    </template>

    <template #clearIcon>
      <close-icon />
    </template>

    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-input>
  <a-textarea
    v-else
    v-bind="{ ...$attrs, ...props }"
    class="eos-textarea"
    bordered="true"
  >

  </a-textarea>
</template>

<style lang="scss">
.eos-input {
  height: 44px;
  border-radius: 12px;
  font-family: 'Manrope';
  padding: 0;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: 12px;
    border: 1px solid var(--sc-base-4);
    pointer-events: none;
    transition: all 0.3s ease-in-out;
  }

  &:hover:not(.ant-input-affix-wrapper-disabled) {
    &::after {
      border-color: var(--sc-base-3);
      border-width: 2px;
    }
  }

  &.ant-input-affix-wrapper-focused:not(.ant-input-affix-wrapper-disabled) {
    &::after {
      border-color: var(--sc-base-8);
      border-width: 2px;
    }
  }

  &.ant-input-affix-wrapper-status-error {
    &::after {
      border-color: var(--sc-error);
      border-width: 2px;
    }
  }

  &.ant-input-affix-wrapper-disabled {
    background: var(--sc-base-5);
  }

  & input {
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
    font-family: 'Manrope';
    padding: 0 8px 0 16px !important;
    border-radius: 12px !important;

    &::placeholder {
      color: var(--sc-base-2);
      font-size: 15px;
      font-weight: 500;
      line-height: 24px;
    }

    &:-internal-autofill-selected {
      background-color: transparent !important;
    }
  }

  &_large {
    height: 56px;
  }

  .pass-eye-icon {
    padding: 0 8px;
    cursor: pointer;
  }

  &:has(.ant-input-prefix) {
    input {
      padding-left: 0 !important;
    }
  }

  .ant-input-prefix {
    margin-inline-start: 16px;
    margin-inline-end: 8px;
  }

  .ant-input-suffix {
    margin-inline-start: 7px;
    margin-inline-end: 15px;
  }
}
.eos-textarea {
  font-family: 'Manrope';
  font-size: 15px;
  font-weight: 500;
  line-height: 24px;
  padding: 8px 8px 8px 16px !important;
  border-radius: 12px !important;
  min-height: 56px !important;
  border: 1px solid var(--sc-base-4);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: 12px;
    border: 1px solid var(--sc-base-4);
    pointer-events: none;
    transition: all 0.3s ease-in-out;
  }
  &::placeholder {
    color: var(--sc-base-2);
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
  }
  &:hover:not(.ant-input-disabled) {
    border-color: var(--sc-base-3);
    border-width: 2px;
    &::after {
      border-color: var(--sc-base-3);
      border-width: 2px;
    }
  }
  &:focus {
    border-color: var(--sc-base-8);
    border-width: 2px;
    &::after {
      border-color: var(--sc-base-8);
      border-width: 2px;
    }
  }
}
</style>
