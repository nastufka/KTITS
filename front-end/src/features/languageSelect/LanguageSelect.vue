<script setup lang="ts">
import type { VNode } from 'vue'
import { useI18n } from 'vue-i18n'
import { computed, h, ref } from 'vue'

import { dayjs } from '@/shared/api/common'
import EosButton from '@/shared/ui/EosButton'
import EosSelect from '@/shared/ui/EosSelect'
import RuIcon from '@/shared/icons/RuIcon.vue'
import EnIcon from '@/shared/icons/EnIcon.vue'

const emit = defineEmits(['onButtonClick'])

const props = withDefaults(defineProps<{
  type: 'default' | 'menu'
  size: 'large' | 'medium'
  collapsed: boolean
}>(), {
  type: 'default',
  size: 'large',
  collapsed: false
})

export interface Language {
  label: VNode
  icon?: VNode
  value: string
}
const { locale } = useI18n({})

const languages = ref<Language[]>([
  {
    value: 'ru',
    label: h(
      'div',
      { class: 'language-select-item' },
      [
        h(RuIcon),
        h('span', { class: 'item-label', innerHTML: props.type === 'menu' ? 'Русский' : 'RU'  })
      ]
    )
  },
  {
    value: 'en',
    label: h(
      'div',
      { class: 'language-select-item' },
      [
        h(EnIcon),
        h('span', { class: 'item-label', innerHTML: props.type === 'menu' ? 'English' : 'EN' })
      ]
    )
  },
])
const currentLanguage = ref<string | null>(localStorage.getItem('locale'))
const currentLanguageIcon = computed<VNode>(() => {
  switch (locale.value) {
    case 'en':
      return h(EnIcon)
    case 'ru':
      return h(RuIcon)
    default: 
      return h(RuIcon)
  }
})
const select = ref<typeof EosSelect>()

const onButtonClick = (): void => {
  emit('onButtonClick')
  queueMicrotask(() => select.value?.open())
}
const onSelect = (option: any): void => {
  localStorage.setItem('locale', option.value)
  locale.value = option.value
  dayjs.locale(option.value)
  select.value?.close()
}
</script>

<template>
  <div>
    <template v-if="collapsed">
      <eos-button :icon="currentLanguageIcon" @click="onButtonClick"></eos-button>
    </template>
    <template v-else>
      <eos-select
        v-model:value="<string>currentLanguage"
        :showSearch="false"
        :options="languages"
        :hasPlaceholder="false"
        labelInValue
        :size="props.size"
        class="language-select"
        :class="{ 'language-select-menu': props.type === 'menu' }"
        ref="select"
        @select="onSelect"
      />
    </template>
  </div>
</template>

<style lang="scss">
.language-select {
  width: 134px;
  &-menu {
    width: 100%;
    .ant-select-selector {
      min-height: 48px;
    }
  }
  &-item {
    display: flex;
    align-items: center;
    gap: 12px;
    .item-label {
      color: var(--sc-base-1);
      font-size: 15px;
      font-weight: 800;
      line-height: 24px;
    }
  }
  .ant-select-selection-item {
    height: 24px !important;
    padding-inline-end: unset !important;
  }
}
</style>