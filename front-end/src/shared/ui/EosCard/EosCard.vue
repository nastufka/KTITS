<script setup lang="ts">
import type { CardProps } from 'ant-design-vue'

export interface EosCardProps extends CardProps {
  hideHeadBorder?: boolean
}

const props = withDefaults(defineProps<EosCardProps>(), { hideHeadBorder: true })
</script>

<template>
  <a-card v-bind="{ ...$attrs, ...props }" class="eos-card" :class="{ 'eos-card_hide-head-border': hideHeadBorder }">
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-card>
</template> 

<style lang="scss">
@import "@/app/styles/mixins";

.eos-card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  &_hide-head-border {
    .ant-card-head {
      border-bottom: 0;
    }
  }

  &:not(:has(.ant-card-head)) {
    .ant-card-body {
      padding-top: 16px;
      overflow-y: initial;
    }
  }

  .ant-card-head {
    min-height: 52px;
    padding: 16px 24px;
    justify-content: flex-end;
  }

  .ant-card-head-title {
    @include h5;
  }

  .ant-card-body {
    padding: 0 24px 16px;
    flex: 1;
    overflow-y: auto;
  }
}
</style>