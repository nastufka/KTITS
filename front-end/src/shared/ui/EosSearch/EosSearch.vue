<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

import EosInput from '@/shared/ui/EosInput'
import EosButton from '@/shared/ui/EosButton'
import CloseIcon from '@/shared/icons/CloseIcon.vue'
import SearchIcon from '@/shared/icons/SearchIcon.vue'

interface EosSearchEmits {
  (e: 'update:value', value: string): void
  (e: 'update:show', show: boolean): void
}

export interface EosSearchProps {
  value: string
}

const { t } = useI18n({})

const emit = defineEmits<EosSearchEmits>()
const props = defineProps<EosSearchProps>()

const show = ref<boolean>(false)
const inputValue = ref<string>('')
const input = ref<HTMLInputElement>()

watch(inputValue, v => emit('update:value', v))
watch(() => props.value, v => inputValue.value = v)

function handleClick() {
  inputValue.value ? clear() : focus()
}

function toggle() {
  show.value = !show.value
  emit('update:show', show.value)
}

function clear() {
  inputValue.value = ''
  toggle()
}

function focus() {
  toggle()
  nextTick(() => input.value?.focus())
}
</script>

<template>
  <div class="eos-search">
    <eos-button
      class="eos-search__button"
      type="secondary"
      @click="handleClick"
    >
      <close-icon v-if="show" />
      <search-icon v-else />
    </eos-button>

    <eos-input
      v-show="show"
      v-model:value="inputValue"
      allowClear
      ref="input"
      :placeholder="t('search')"
    >
      <template #prefix>
        <search-icon />
      </template>
    </eos-input>
  </div>
</template>

<style lang="scss">
.eos-search {
  display: inline-flex;
  flex-direction: row-reverse;

  &__button {
    display: flex;
    margin-left: 16px;
    width: 44px;
  }
}
</style>
