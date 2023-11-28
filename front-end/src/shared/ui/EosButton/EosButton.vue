<script setup lang="ts">
import type { ButtonProps } from 'ant-design-vue'

type ButtonType = 'primary' | 'secondary' | 'outline' | 'menu' | 'menu-active' | 'annotation' | 'text' | 'default'
type ButtonSize = 'large' | 'middle'

export interface EosButtonProps extends Omit<ButtonProps, 'type' | 'size'> {
  type?: ButtonType
  size?: ButtonSize
  active?: boolean
}

const props = withDefaults(defineProps<EosButtonProps>(), {
  type: 'outline',
  size: 'middle',
})
</script>

<template>
  <a-button
    v-bind="{ ...$attrs, ...props }"
    class="eos-btn"
    :class="{
      'eos-btn_large': size === 'large',
      'eos-btn_primary': type === 'primary',
      'eos-btn_secondary': type === 'secondary',
      'eos-btn_outline': type === 'outline',
      'eos-btn_menu': type === 'menu',
      'eos-btn_annotation': type === 'annotation',
      'eos-btn_text': type === 'text',
      'eos-btn_active': props.active,
      'eos-btn_disabled': props.disabled,
    }"
  >
    <slot />
  </a-button>
</template>

<style lang="scss">
.eos-btn {
  min-height: 44px;
  min-width: 44px;
  border-radius: 12px !important;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;

  span {
    display: inline-flex;
  }

  &, & span {
    font-weight: 800;
    font-size: 15px;
    line-height: 24px;
  }

  &:disabled {
    opacity: 0.5600000023841858;
  }

  &_large {
    min-height: 56px;
    min-width: 56px;
    padding: 0 16px;
  }

  &_primary {
    border: 1px solid transparent;

    &, &:disabled {
      background-color: var(--sc-base-7);
    }

    &, & span {
      color: var(--sc-base-6);
    }

    &:not(:disabled):hover {
      background-color: var(--sc-base-10);
    }

    &:not(:disabled):active, &.eos-btn_active {
      background-color: var(--sc-base-11);
    }
  }

  &_secondary {
    border: 1px solid transparent;

    &, &:disabled {
      background-color: var(--sc-base-12);
    }

    &, & span {
      color: var(--sc-base-7);
    }

    &:not(:disabled):hover {
      background-color: var(--sc-base-13);
    }

    &:not(:disabled):active, &.eos-btn_active {
      background-color: var(--sc-base-14);
    }
  }

  &_outline {
    border: 1px solid var(--sc-base-4);

    &, & span {
      color: var(--sc-base-7);
    }

    &, &:disabled {
      background-color: var(--sc-base-6);
    }

    &:not(:disabled):hover {
      border: 1px solid var(--sc-base-4);
      background-color: var(--sc-base-13);
    }

    &:not(:disabled):active, &.eos-btn_active {
      border: 1px solid var(--sc-base-4);
      background-color: var(--sc-base-14);
    }
  }

  &_text {
    span {
      color: var(--sc-base-7);
    }
  }

  &_disabled {
    cursor: not-allowed !important;
  }

  &_menu,
  &_menu-active {
    width: 250px;
    border: 1px solid transparent;
    border-radius: 16px;
    justify-content: start;
    min-height: 48px;
    min-width: 48px;
    display: inline-flex;
    justify-content: start;
    padding: 12px;

    &.ant-btn-icon-only {
      justify-content: center;
    }
  }
  
  &_menu {
    &, & span {
      color: var(--sc-base-1);
    }

    &, &:disabled {
      background-color: var(--sc-base-6);
    }

    &:not(:disabled):hover {
      background-color: var(--sc-base-13);
    }

    &:not(:disabled):active {
      background-color: var(--sc-base-14);
    }

    path {
      fill: var(--sc-base-9);
    }

    &.eos-btn_active {
      &, &:disabled {
        background-color: var(--sc-base-7);
      }

      &, & span {
        color: var(--sc-base-6);
      }

      &:not(:disabled):hover {
        background-color: var(--sc-base-10);
      }

      &:not(:disabled):active {
        background-color: var(--sc-base-11);
      }

      path {
        fill: var(--sc-base-6);
      }
    }
  }
  &_annotation {
    box-shadow: 0px 4px 24px 0px rgba(0, 0, 0, 0.12);
    &, & span {
      color: var(--sc-base-6);
    }

    &, &:disabled {
      background-color: var(--sc-base-6);
    }

    &:not(:disabled):hover {
      background-color: var(--sc-base-13);
    }

    &:not(:disabled):active {
      background-color: var(--sc-base-14);
    }

    &.eos-btn_active {
      &, &:disabled {
        background-color: var(--sc-base-7);
      }

      &, & span {
        color: var(--sc-base-6);
      }

      &:not(:disabled):hover {
        background-color: var(--sc-base-10);
      }

      &:not(:disabled):active {
        background-color: var(--sc-base-11);
      }

      path {
        fill: var(--sc-base-6);
      }
    }
  }
}
</style>
