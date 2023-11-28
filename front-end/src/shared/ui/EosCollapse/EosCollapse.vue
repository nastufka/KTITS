<script setup lang="ts">
import { ref } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue';
</script>

<template>
  <a-collapse
    v-bind="{ ...$attrs, ...$props }"
    :bordered="false"
  >
    <template #expandIcon="{ isActive }">
      <down-outlined :style="{ color: 'var(--sc-base-9, #999)' }" :rotate="isActive ? 180 : 0" />
    </template>
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-collapse>
</template>

<style lang="scss">
.ant-collapse {
  &-header {
    border-bottom: 1px solid var(--sc-base-5, #F4F4F8);
    &-text {
      color: var(--sc-base-0, #000);
      font-feature-settings: 'liga' off;
      font-size: 15px;
      font-weight: 800;
      line-height: 24px;
    }
  }
  &-content-box {
    padding: 12px 12px !important;
  }
}
</style>