<script setup lang="ts">
import type { TimePickerProps } from 'ant-design-vue'

import ArrowIcon from '@/shared/icons/ArrowIcon.vue'
import CloseIcon from '@/shared/icons/CloseIcon.vue'

export interface EosTimePickerProps extends /* @vue-ignore */ TimePickerProps {}

const props = defineProps<EosTimePickerProps>()
</script>

<template>
  <a-time-picker
    v-bind="{ ...$attrs, ...props }"
    format="HH:mm"
    placeholder="00:00"
    class="eos-time-picker"
    popupClassName="eos-time-picker-dropdown"
    :showNow="false"
  >
    <template #suffixIcon>
      <ArrowIcon />
    </template>

    <template #clearIcon>
      <CloseIcon />
    </template>

    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-time-picker>
</template>

<style lang="scss">
.eos-time-picker {
  height: 56px;
  border-radius: 12px;
  border: 0;
  padding: 0 8px 0 16px;

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

  &:hover:not(.ant-picker-disabled) {
    &::after {
      border-color: var(--sc-base-3);
      border-width: 2px;
    }
  }
  
  &.ant-picker-focused:not(.ant-picker-disabled) {
    box-shadow: none;

    &::after {
      border-color: var(--sc-base-8);
      border-width: 2px;
    }
  }

  &.ant-picker-status-error {
    &::after {
      border-color: var(--sc-error);
      border-width: 2px;
    }
  }

  &.ant-picker-disabled {
    background: var(--sc-base-5);
  }
  
  .ant-picker-input input {
    font-size: 15px;
    line-height: 24px; 

    &::placeholder {
      color: var(--sc-base-2);
    }
  }

  .ant-picker-clear {
    right: 32px;
  }
}

.eos-time-picker-dropdown {
  .ant-picker-panel-container {
    border-radius: 12px;
  }

  .ant-picker-panel .ant-picker-footer {
    border-top: 0;
  }

  .ant-picker-footer-extra {
    padding: 9px 12px 12px;
  }

  .ant-picker-time-panel-column {
    margin: 12px 0 0;
    width: 50%;

    >li.ant-picker-time-panel-cell {
      height: 36px;
      width: 42px;
      padding: 2px;
      margin-inline: 12px;

      .ant-picker-time-panel-cell-inner {
        height: 32px;
        width: 38px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 500;
        line-height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
      }

      &:hover {
        .ant-picker-time-panel-cell-inner {
          background: var(--sc-base-5);
        }
      }

      &.ant-picker-time-panel-cell-selected {
        .ant-picker-time-panel-cell-inner {
          color: var(--sc-base-6);
          background: var(--sc-base-7);
        }
      }
    }
  }

  .ant-picker-time-panel-column:not(:first-child) {
    border-inline-start: 1px solid var(--sc-base-14);
    
    >li.ant-picker-time-panel-cell {
      margin-inline: 11px;
    }
  }

  .ant-picker-time-panel {
    width: 127px;
  }

  .ant-picker-ranges {
    padding: 9px 12px 12px;

    .ant-picker-ok {
      margin-inline-start: 0;

      .ant-btn {
        width: 68px;
        height: 44px;
        border: 0;
        border-radius: 12px;
        background: var(--sc-base-7);

        &:disabled {
          opacity: 0.5600000023841858;
        }

        &:not(:disabled):hover {
          background-color: var(--sc-base-10);
        }

        &:not(:disabled):active {
          background-color: var(--sc-base-11);
        }

        span {
          color: var(--sc-base-6);
          font-size: 15px;
          font-weight: 800;
          line-height: 24px; 
        }
      }
    }
  }
}
</style>
