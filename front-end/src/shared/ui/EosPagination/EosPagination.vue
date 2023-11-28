<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

import type { PaginationProps } from 'ant-design-vue'

interface EosPaginationEmits {
  (e: 'update:current', value: number | undefined): void
  (e: 'update:pageSize', value: number | undefined): void
}

export interface EosPaginationProps extends Omit<PaginationProps, 'onUpdate:pageSize'> {}

const emit = defineEmits<EosPaginationEmits>()
const props = defineProps<EosPaginationProps>()

const page = ref<number>()
const pageSizeLocal = ref<number>()

watch(page, v => emit('update:current', v))
watch(() => props.current, v => page.value = v)
watch(pageSizeLocal, v => emit('update:pageSize', v))
watch(() => props.pageSize, v => pageSizeLocal.value = v)

onMounted(() => {
  pageSizeLocal.value = props.pageSize
  if (props.current === undefined) {
    page.value = 1
  }
})
</script>

<template>
  <a-pagination
    v-bind="{ ...$attrs, ...props }"
    v-model:pageSize="pageSizeLocal"
    class="eos-pagination"
  >
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-pagination>
</template>

<style lang="scss">
.eos-pagination {
  .ant-pagination-item {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background-color: var(--sc-base-6);
  }

  .ant-pagination-item-link {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--sc-base-6) !important;
    border-radius: 8px !important;
  }

  .ant-pagination-item-container {
    width: 100%;
  }

  .ant-pagination-jump-prev,
  .ant-pagination-jump-next {
    display: inline-flex;
  }
}
</style>
