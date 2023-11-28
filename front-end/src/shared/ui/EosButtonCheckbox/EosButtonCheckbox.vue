<script setup lang="ts">
import * as _ from 'lodash-es'

import EosButton, { type EosButtonProps } from '@/shared/ui/EosButton'

type ModelValue = Array<string | number>
type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse'

export interface EosButtonCheckboxOption {
  label?: any
  value?: number | string | null
}

interface EosButtonCheckboxEmits {
  (e: 'update:value', value: ModelValue): void
}

export interface EosButtonCheckboxProps {
  value: ModelValue
  buttonClass?: string
  size?: EosButtonProps['size']
  flexDirection?: FlexDirection
  options: EosButtonCheckboxOption[]
}

const emit = defineEmits<EosButtonCheckboxEmits>()
const props = withDefaults(defineProps<EosButtonCheckboxProps>(), {
  size: 'middle',
  flexDirection: 'row'
})

function toggle(value: EosButtonCheckboxOption['value']) {
  if (value !== null && value !== undefined) {
    if (props.value.includes(value)) {
      emit('update:value', props.value.filter(v => v !== value))
    } else {
      emit('update:value', [...props.value, value])
    }
  }
}

function isBtnActive(value: EosButtonCheckboxOption['value']): boolean {
  return value !== null && value !== undefined && props.value.includes(value)
}
</script>

<template>
  <div class="eos-button-checkbox" :style="{ flexDirection }">
    <div v-for="option in options" class="eos-button-checkbox__wrapper">
      <eos-button
        :size="size"
        :class="buttonClass"
        :type="isBtnActive(option.value) ? 'primary' : 'outline'"
        @click="toggle(option['value'])"
      >
        {{ option.label }}
      </eos-button>

      <div>
        <slot
          :label="option.label"
          :value="option.value"
          :active="isBtnActive(option.value)"
        ></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.eos-button-checkbox {
  display: flex;
  gap: 10px;

  &__wrapper {
    display: flex;
  }
}
</style>
