<script setup lang="ts">
import type { StepsProps } from 'ant-design-vue'

export interface EosStepsProps extends StepsProps {}

const props = defineProps<EosStepsProps>()
</script>

<template>
  <a-steps v-bind="{ ...$attrs, ...props }" class="eos-steps">
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-steps>
</template>

<style lang="scss">
.eos-steps {
  --eos-steps-height: 30px;

  .ant-steps-item-icon {
    height: var(--eos-steps-height);
    width: var(--eos-steps-height);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;

    .ant-steps-icon {
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
      position: initial;
    }
  }

  .ant-steps-item-title {
    font-size: 15px;
    font-weight: 500;
    line-height: var(--eos-steps-height);
    padding-right: 11px;

    &::after {
      background: #D9D9D9;
    }
  }

  .ant-steps-item.ant-steps-item-wait {
    padding-inline-start: 11px !important;

    .ant-steps-item-title {
      color: var(--sc-base-2);
    }
  }

  .anticon.anticon-check.ant-steps-finish-icon {
    path {
      color: var(--sc-base-7);
    }
  }
}
</style>
