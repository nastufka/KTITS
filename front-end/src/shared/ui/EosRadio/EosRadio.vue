<script setup lang="ts">
import * as _ from 'lodash-es'
import { ref, watch, onBeforeMount } from 'vue'

import EosButton from '../EosButton/EosButton.vue'
import RadioIcon from '@/shared/icons/RadioIcon.vue'

interface EosRadioEmits {
  (e: 'click', value: Option): void,
  (e: 'update:value', value: Option): void,
}

type Type = 'classic' | 'button'

type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse'

type Option = any

export interface EosRadioProps {
  type?: Type
  name: string
  options?: Option[]
  value: Option
  disabled?: boolean
  flexDirection?: FlexDirection
  valueGetter?: (option: Option) => any
  labelGetter?: (option: Option) => any
}

const emit = defineEmits<EosRadioEmits>()

const props = withDefaults(defineProps<EosRadioProps>(), {
  type: 'classic',
  flexDirection: 'column',
  labelGetter: (option: Option): Option => option,
  valueGetter: (option: Option): Option => option?.value || option,
})

const currentValue = ref<Option>(props.value)
const inputs = ref<HTMLInputElement[] | null>(null)

watch(() => props.value, updateValue)

function onChange() {
  emit('update:value', props.valueGetter(currentValue.value))
}

function clickRadio(i: number) {
  !props.disabled && inputs.value && inputs.value[i].click()
  emit('click', props.valueGetter(currentValue.value))
}

function isActive(option: Option): boolean {
  return _.isEqual(currentValue.value, props.valueGetter(option))
}

function updateValue(v: Option) {
  const find = props.options?.find(option => _.isEqual(v, props.valueGetter(option)))
  if (find) {
    currentValue.value = props.valueGetter(find)
  }
}

onBeforeMount(() => {
  updateValue(props.value)
})
</script>

<template>
  <div
    class="eos-radio"
    :style="{ flexDirection: type === 'button' ? 'row' : flexDirection }"
    :class="{ 'eos-radio_button': type === 'button' }"
  >
    <label
      v-for="(option, i) in options"
      class="eos-radio__label"
      :class="{ 'eos-radio__label_disabled': disabled }"
      @click="clickRadio(i)"
    >
      <input
        v-model="currentValue"
        ref="inputs"
        type="radio"
        class="eos-radio__input"
        :name="name"
        :value="option"
        :disabled="disabled"
        @change="onChange"
      >
      <slot
        name="label"
        :value="option"
        :active="isActive(option)"
      >
        <div v-if="type === 'classic'" class="eos-radio__option">
          <RadioIcon class="eos-radio__icon" :active="isActive(option)" :disabled="disabled"/>
          {{ labelGetter((typeof option === 'object' && option.label) || option) }}
        </div>

        <div v-else>
          <eos-button class="eos-radio__button" :type="isActive(option) ? 'primary' : 'outline'">
            {{ labelGetter((typeof option === 'object' && option.label) || option) }}
          </eos-button>
        </div>
      </slot>
    </label>
  </div>
</template>

<style lang="scss">
.eos-radio {
  display: flex;
  gap: 10px;

  &_button {
    gap: 0;
  }

  &__input {
    display: none;
  }

  &__label {
    cursor: pointer;
    display: flex;
    align-self: center;
    flex-wrap: wrap;

    &_disabled {
      cursor: not-allowed;
    }

    &:first-child {
      .eos-radio__button.eos-btn {
        border-top-left-radius: 12px !important;
        border-bottom-left-radius: 12px !important;
      }
    }

    &:last-child {
      .eos-radio__button.eos-btn {
        border-top-right-radius: 12px !important;
        border-bottom-right-radius: 12px !important;
      }
    }

    .eos-radio__button.eos-btn {
      border-radius: 0 !important;
      padding: 0 24px;
      border-color: var(--sc-base-5);
      border-left: 0;

      span {
        color: var(--sc-base-1);
      }

      &_primary {
        border: 1px solid var(--sc-base-7);

        span {
          color: var(--sc-base-6);
        }
      }
    }

    &:first-child,
    &:last-child {
      .eos-radio__button.eos-btn {
        border-right-width: 1px;
      }
    }

    &:first-child {
      .eos-radio__button.eos-btn {
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
      }
    }

    &:last-child {
      .eos-radio__button.eos-btn {
        border-top-right-radius: 12px;
        border-bottom-right-radius: 12px;
      }
    }
  }

  &__option {
    display: flex;
    align-items: center;
    font-size: 15px;
    line-height: 24px;
  }

  &__icon {
    margin-right: 10px; 
  }
}
</style>
