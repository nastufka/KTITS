<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SelectProps } from 'ant-design-vue'

import EosTag from '@/shared/ui/EosTag'
import ArrowIcon from '@/shared/icons/ArrowIcon.vue'
import CloseIcon from '@/shared/icons/CloseIcon.vue'

export interface EosSelectProps extends Omit<SelectProps, 'size'> {
  size?: 'medium' | 'large',
  disabled?: boolean,
  hasPlaceholder?: boolean
}

const { t } = useI18n({})

const props = withDefaults(defineProps<EosSelectProps>(), {
  size: 'medium',
  showArrow: true,
  showSearch: true,
  hasPlaceholder: true,
  autoClearSearchValue: true,
  defaultActiveFirstOption: true,
})

const select = ref<HTMLDivElement>()
const isOpen = ref<boolean>(false)

function open(): void {
  isOpen.value = true
}

function close(): void {
  isOpen.value = false
}

function focus(): void {
  !props.disabled && select.value?.focus()
}

function onFocus(): void {
  open()
}

function onBlur(): void {
  close()
}

defineExpose({
  open,
  close
})
</script>

<template>
  <a-select
    v-bind="{ ...$attrs, ...props }"
    ref="select"
    class="eos-select"
    popupClassName="eos-select__popup"
    :class="{
      'eos-select_medium': size === 'medium',
      'eos-select_large': size === 'large',
    }"
    :open="isOpen"
    :disabled="disabled"
    :placeholder="placeholder || (hasPlaceholder ? t('startTypingToChoose') : '')"
    @blur="onBlur"
    @focus="onFocus"
  >
    <template #tagRender="{ value, label, onClose }">
      <eos-tag
        :size="size"
        :closable="!disabled"
        :disabled="disabled"
        @close="onClose"
      >
        {{ label || value }}
      </eos-tag>
    </template>

    <template #clearIcon>
      <CloseIcon />
    </template>

    <template #suffixIcon>
      <ArrowIcon @click="focus" />
    </template>

    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-select>
</template>

<style lang="scss">
.eos-select {
  &_medium {
    .ant-select-selector {
      min-height: 44px;
    }

    .ant-select-selection {
      &-search {
        padding: 8px 0;
      }
      &-overflow {
        padding: 8px 0;
        .ant-select-selection-search {
          padding: 0;
        }
      }
    }
  }

  &_large {
    .ant-select-selector {
      min-height: 56px;
    }

    .ant-select-selection {
      &-search {
        padding: 10px 0;
      }
      &-overflow {
        padding: 10px 0;
        .ant-select-selection-search {
          padding: 0;
        }
      }
    }
  }

  &.ant-select {
    border-radius: 12px;
    display: flex;
    align-items: center;

    .ant-select-selection-item {
      font-size: 15px;
      font-weight: 500;
      line-height: 24px;
      font-family: 'Manrope';
    }

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

    &:hover:not(.ant-select-disabled) {
      &::after {
        border-color: var(--sc-base-3);
        border-width: 2px;
      }
    }

    &.ant-select-focused:not(.ant-select-disabled) {
      &::after {
        border-color: var(--sc-base-8);
        border-width: 2px;
      }
    }

    &.ant-select-status-error {
      &::after {
        border-color: var(--sc-error);
        border-width: 2px;
      }
    }

    &.ant-select-disabled {
      background: var(--sc-base-5);
      cursor: not-allowed;

      .ant-select-selector {
        background: var(--sc-base-5, #F4F4F8) !important;
      }
    }

    .ant-select-selector {
      display: flex;
      align-items: center;
      border-width: 0 !important;
      border-radius: 12px;
      box-shadow: none !important;
      padding: 0 8px 0 16px;
      flex: 1;
    }

    .ant-select-clear,
    .ant-select-arrow {
      height: 32px;
      width: 32px;
      margin: 0 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      position: static;
    }

    .ant-select-arrow {
      order: 1;
    }

    .ant-select-selection-overflow {
      gap: 4px;
    }

    .ant-select-selection-placeholder {
      inset-inline-start: 16px;
      color: var(--sc-base-2);
    }

    .ant-select-selection-search {
      margin-inline-start: 0;
    }
  }

  &__popup {
    padding: 8px;

    & .ant-select-item {
      height: 44px;
      border-radius: 8px;
      padding: 10px 8px;
      display: flex;
      align-items: center;
    }

    &.ant-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
      background-color: var(--sc-base-5);
    }

    & .ant-select-item-option-content {
      font-size: 15px;
      line-height: 24px;
    }
  }
}
</style>
