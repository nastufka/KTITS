<script setup lang="ts">
import { inject } from 'vue'

import DateIcon from '@/shared/icons/DateIcon.vue'
import CloseIcon from '@/shared/icons/CloseIcon.vue'
import { dateFormatKey, datePlaceholderKey } from '@/shared/api/common'

import PrevIcon from './PrevIcon.vue'
import NextIcon from './NextIcon.vue'

enum Days {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

const props = withDefaults(defineProps<{
  size?: 'large' | 'medium'
}>(), {
  size: 'large'
})

const dateFormat = inject<string>(dateFormatKey)
const datePlaceholder = inject<string>(datePlaceholderKey)

function getDay(date: string): number {
  return new Date(date).getDate()
}

function isWeekend(date: string): boolean {
  const weekendDays: Days[] = [Days.Sunday, Days.Saturday]
  return weekendDays.includes(new Date(date).getDay())
}
</script>

<template>
  <a-range-picker
    v-bind="$attrs"
    separator="-"
    class="eos-range-picker"
    :class="{
      'eos-range-picker__large': size === 'large',
      'eos-range-picker__medium': size === 'medium'
    }"
    popupClassName="eos-range-picker__dropdown"
    :format="dateFormat"
    :showToday="false"
    :placeholder="[datePlaceholder, datePlaceholder]"
  >
    <template #prevIcon>
      <PrevIcon />
    </template>

    <template #superPrevIcon>
      <PrevIcon />
    </template>

    <template #nextIcon>
      <NextIcon />
    </template>

    <template #superNextIcon>
      <NextIcon />
    </template>

    <template #clearIcon>
      <CloseIcon />
    </template>

    <template #suffixIcon>
      <DateIcon />
    </template>

    <template #dateRender="date">
      <span :class="{ 'eos-range-picker__weekend': isWeekend(date.current) }">
        {{ getDay(date.current) }}
      </span>
    </template>

    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-range-picker>
</template>

<style lang="scss">
.eos-range-picker {
  //min-height: 56px;
  padding: 0 8px 0 16px;
  border: 0;

  &__large {
    min-height: 56px;
  }
  &__medium {
    min-height: 44px;
    .ant-picker-header-view {
      font-size: 13px;
      line-height: 20px;
      font-weight: 500;
    }
    .ant-picker-input input {
      font-size: 13px;
      line-height: 20px; 
    }
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

  &__weekend {
    color: var(--sc-error);
  }

  &__dropdown {
    .ant-picker-header {
      padding: 0 12px;
      border-bottom: 0;
      height: 28px;
      margin-top: 12px;
      align-items: center;

      button {
        line-height: 28px;
      }
    }

    .ant-picker-header-view {
      font-size: 17px;
      line-height: 28px;
      font-weight: 500;

      .ant-picker-year-btn {
        color: var(--sc-base-7);
      }
    }

    .ant-picker-prev-icon,
    .ant-picker-super-prev-icon,
    .ant-picker-next-icon,
    .ant-picker-super-next-icon
      {
      color: var(--sc-base-7);
    }

    .ant-picker-header-prev-btn,
    .ant-picker-header-next-btn,
    .ant-picker-header-super-prev-btn,
    .ant-picker-header-super-next-btn {
      height: 100%;
      width: 24px;
      min-width: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ant-picker-cell {
      padding: 4px 0px;
      border-radius: 8px;

      &:hover {
        background-color: var(--sc-base-5);
      }

      &:active {
        background-color: var(--sc-base-13);
      }

      &:not(.ant-picker-cell-in-view) {
        opacity: 0.65;
      }

      &::before,
      &::after {
        height: 32px !important;
      }

      span {
        font-size: 15px;
        line-height: 24px;
        z-index: 2;
        position: relative;
      }
    }

    .ant-picker-cell-selected:not(.ant-picker-cell-in-range):not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end) {
      background-color: var(--sc-base-7);

      &:hover {
        background-color: var(--sc-base-10);
      }

      &:active {
        background-color: var(--sc-base-11);
      }

      span {
        color: var(--sc-base-6);
      }
    }

    .ant-picker-cell-in-view {
      &.ant-picker-cell-range-start {
        &::before {
          inset-inline-start: 0;
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }
      }

      &.ant-picker-cell-range-hover-start {
        background-color: transparent;

        &::after {
          inset-inline-start: 0;
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }
      }

      &.ant-picker-cell-range-end {
        &::before {
          inset-inline-end: 0;
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
        }
      }

      &.ant-picker-cell-range-hover-end {
        background-color: transparent;

        &::after {
          inset-inline-end: 0;
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
        }
      }
    }

    .ant-picker-cell-today {
      span {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        &::before {
          position: absolute;
          top: 50%;
          inset-inline-start: 0;
          inset-inline-end: 0;
          z-index: 1;
          width: 100%;
          height: 32px;
          transform: translateY(-50%);
          transition: all 0.3s ease-in-out;
          content: "";
          border: 1px solid var(--sc-base-7);
          border-radius: 8px;
        }
      }
    }

    .ant-picker-date-panel {
      .ant-picker-header-super-prev-btn,
      .ant-picker-header-super-next-btn {
        display: none;
      }

      .ant-picker-content {
        th {
          font-size: 13px;
          line-height: 20px;
          color: var(--sc-base-2);
        }

        width: 100%;
      }

    }

    .ant-picker-month-panel,
    .ant-picker-year-panel,
    .ant-picker-decade-panel {
      .ant-picker-content {
        height: 128px;
      }

      .ant-picker-cell {
        padding: 0;
      }

      .ant-picker-cell-inner {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        line-height: 24px;
        padding: 0;
      }
    }
    
    .ant-picker-date-panel,
    .ant-picker-month-panel,
    .ant-picker-year-panel,
    .ant-picker-decade-panel {
      width: 296px;
      
      .ant-picker-body {
        padding: 12px;
      }
    }
  }

  .ant-picker-input {
    flex-flow: row-reverse;
  }

  .ant-picker-suffix {
    margin-inline-start: 0;
    margin-inline-end: 4px;

    path {
      color: #999999;
    }
  }

  .ant-picker-clear {
    padding: 0px 4px;
    height: 56px;
    display: flex;
    align-items: center;

    .anticon {
      padding: 3px;
      margin: auto 0;
    }
  }

  .ant-picker-input input {
    font-size: 15px;
    line-height: 24px; 

    &::placeholder {
      color: var(--sc-base-2);
    }
  }

  .ant-picker-active-bar {
    bottom: 2px;
    background: var(--sc-base-7);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
}
</style>
