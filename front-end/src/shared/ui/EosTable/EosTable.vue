<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { TableProps } from 'ant-design-vue'
import { ref, watch, computed, onBeforeMount } from 'vue'

import EosSpinner from '@/shared/ui/EosSpinner'
import ArrowIcon from '@/shared/icons/ArrowIcon.vue'
import EosPagination from '@/shared/ui/EosPagination'

interface EosTableEmits {
  (e: 'update:page', value: number | undefined): void
  (e: 'update:pageSize', value: number | undefined): void
}

export interface EosTableProps extends TableProps {
  page?: number
  sort?: string
  total?: number
  loading?: boolean
  pageSize?: number
  fullHeight?: boolean
  serverSidePagination?: boolean
}

const { t } = useI18n({})

const emit = defineEmits<EosTableEmits>()
const props = withDefaults(defineProps<EosTableProps>(), {
  showHeader: true
})

const currentPage = ref<number>()
const pageSizeLocal = ref<number>()

const isSortDesc = computed<boolean>(() => props.sort?.startsWith('-') || false)

watch(currentPage, v => emit('update:page', v))
watch(pageSizeLocal, v => emit('update:pageSize', v))
watch(() => props.page, v => currentPage.value = v)
watch(() => props.pageSize, v => pageSizeLocal.value = v)

function isColumnSorted(column: string) {
  const sortWithoutOrder = isSortDesc.value ? props.sort?.substring(1) : props.sort
  return column === sortWithoutOrder
}

onBeforeMount(() => {
  currentPage.value = props.page
  pageSizeLocal.value = props.pageSize
})
</script>

<template>
  <div
    class="eos-table"
    :class="{ 'eos-table_full-height': fullHeight }"
  >
    <div v-if="loading" class="eos-table__preloader">
      <eos-spinner />
      {{ t('loadingDataPleaseWait') }}
    </div>

    <a-table v-bind="{ ...$attrs, ...props }" :loading="false">
      <template v-if="loading" #emptyText></template>
      
      <template v-if="sort" #headerCell="{ title, column }">
        <div class="eos-table__header-cell">
          <div class="eos-table__header-cell-text">
            {{ title }}
          </div>

          <div v-if="isColumnSorted(column.key)" class="eos-table__sort-icon">
            <arrow-icon :style="{ transform: isSortDesc ? 'none' : 'rotate(180deg)' }" />
          </div>
        </div>
      </template>

      <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope || {}" />
      </template>

      <template v-if="serverSidePagination" #footer>
        <eos-pagination
          v-model:current="currentPage"
          v-model:pageSize="pageSizeLocal"
          :total="total"
          :showSizeChanger="false"
        />
      </template>
    </a-table>
  </div>
</template>

<style lang="scss">
.eos-table {
  position: relative;

  &_full-height {
    &,
    .ant-table,
    .ant-table-content,
    .ant-table-content table {
      height: 100%;
    }

    .ant-table {
      display: flex;
      flex-direction: column;
    }

    .ant-table-container {
      flex: 1;
    }

    .ant-table-placeholder {
      .ant-table-cell {
        border-bottom: 0 !important;
      }
    }
  }

  &__preloader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, .78);
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    color: var(--sc-base-2);
    font-size: 17px;
    font-weight: 500;
    line-height: 28px;

    svg {
      margin-right: 12px;
    }
  }

  &__header-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__header-cell-text {
    font-size: 17px;
    font-weight: 800;
    line-height: 28px;
  }

  &__sort-icon {
    height: 32px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .ant-table {
    border: 1px solid #E8EAEC;
    border-radius: 12px;
  }

  .ant-table-thead {
    .ant-table-cell {
      background-color: #F5F7F9;
      font-size: 17px;
      font-weight: 800;
      line-height: 28px;
      border-bottom-color: #E8EAEC;
      padding: 10px 16px;

      &::before {
        display: none;
      }
    }
  }

  .ant-table-row {
    &:nth-child(odd) {
      background-color: var(--sc-base-12) !important;
    }

    .ant-table-cell {
      padding: 10px 16px;
      font-size: 15px;
      line-height: 24px;
      border-radius: 0 !important;
    }
  }

  & .ant-table-wrapper {
    & .ant-table-tbody >tr.ant-table-row:hover>td {
      background-color: var(--sc-base-5);
    }

    & .ant-table-footer {
      border-radius: 0 0 12px 12px;
      background: #F5F7F9;
      border-top: 1px solid #E8EAEC;
    }
  }
}
</style>
