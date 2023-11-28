<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import EosRadio from '@/shared/ui/EosRadio'
import EosButton from '@/shared/ui/EosButton'
import EosPopover from '@/shared/ui/EosPopover'
import SortIcon from '@/shared/icons/SortIcon.vue'

export interface EosSortOption {
  label: string,
  value: string,
}

interface EosSortEmits {
  (e: 'update:sort', sort: string): void
}

export interface EosSortProps {
  sort?: string
  options: EosSortOption[]
}

const { t } = useI18n({})

const emit = defineEmits<EosSortEmits>()
const props = defineProps<EosSortProps>()

const ASC = ''
const DESC = '-'

const isOpen = ref<boolean>(false)
const isSortApplied = ref<boolean>(false)
const orderOptions = ref<EosSortOption[]>([
  { label: t('asc'), value: ASC },
  { label: t('desc'), value: DESC },
])
const option = ref<EosSortOption>(props.options[0])
const order = ref<EosSortOption>(orderOptions.value[0])

watch(order, setSort)
watch(option, setSort)
watch(() => props.sort, handlePropsSort)

function setSort() {
  emit('update:sort', order.value.value + option.value.value)
}

function handlePropsSort(sort?: string) {
  if (sort) {
    const isDesc = sort.startsWith(DESC)
    const optionValue = isDesc ? sort.substring(1) : sort

    option.value = props.options.find(o => o.value === optionValue) || props.options[0]
    order.value = isDesc ? orderOptions.value[1] : orderOptions.value[0]
  }
}

onMounted(() => {
  props.sort ? handlePropsSort(props.sort) : setSort()
})
</script>

<template>
  <span class="eos-sort">
    <eos-popover
      v-model:open="isOpen"
      trigger="click"
      :align="{ points: ['tr', 'br'], offset: [0, -9] }"
    >
      <template #content>
        <eos-radio
          v-model:value="option"
          name="sort-options"
          class="eos-sort__radio"
          :options="options"
          :value-getter="o => o"
        >
          <template v-slot:label="{ value, active }: { value: EosSortOption, active: boolean }">
            <div class="eos-sort__option" :class="{ 'eos-sort__option_active': active }">
              {{ value.label }}
            </div>
          </template>
        </eos-radio>

        <a-divider />

        <eos-radio
          v-model:value="order"
          name="sort-options"
          class="eos-sort__radio"
          :options="orderOptions"
          :value-getter="o => o"
        ></eos-radio>
      </template>

      <eos-button :type="isSortApplied ? 'primary' : 'secondary'" :active="isOpen">
        <SortIcon :active="isSortApplied" />
      </eos-button>
    </eos-popover>
  </span>
</template>

<style lang="scss">
.eos-sort {
  @mixin option {
    height: 44px;
    padding: 10px 8px;
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;

    &_active {
      color: var(--sc-base-7);
    }
  }

  &__radio {
    gap: 6px;

    .eos-radio__label {
      width: 100%;
    }

    .eos-radio__option {
      @include option;
    }
  }

  &__option {
    @include option;
  }
}
</style>
