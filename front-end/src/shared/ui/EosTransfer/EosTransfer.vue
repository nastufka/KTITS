<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'

import EosInput from '@/shared/ui/EosInput'
import EosButton from '@/shared/ui/EosButton'
import ArrowIcon from '@/shared/icons/ArrowIcon2.vue'
import DeleteIcon from '@/shared/icons/DeleteIcon.vue'
import SearchIcon from '@/shared/icons/SearchIcon.vue'
import DragAndDropIcon from '@/shared/icons/DragAndDropIcon.vue'

interface EosTransferEmits {
  (e: 'update:target', target: Item[]): void,
}

export interface EosTransferProps {
  data: Item[]
  target: Item[]
  sourceTitle?: string
  targetTitle?: string
  searchSourcePlaceholder?: string
  searchTargetPlaceholder?: string
}

interface Item {
  id: number
  name: string
}

const { t } = useI18n({})

const emit = defineEmits<EosTransferEmits>()
const props = withDefaults(defineProps<EosTransferProps>(), {
  target: () => []
})

const searchSource = ref<string>('')
const searchTarget = ref<string>('')

const targetIds = computed<number[]>(() => props.target.map(i => i.id))
const source = computed<Item[]>(() => props.data.filter(i => !targetIds.value.includes(i.id)))
const filteredSource = computed<Item[]>(() => source.value.filter(i => i.name.toLocaleLowerCase().includes(searchSource.value.toLocaleLowerCase())))
const filteredTarget = computed<Item[]>(() => props.target.filter(i => i.name.toLocaleLowerCase().includes(searchTarget.value.toLocaleLowerCase())))

function addItem(id: number) {
  const item = props.data.find(i => i.id === id)
  item && emit('update:target', [...props.target, item])
}

function deleteItem(id: number) {
  emit('update:target', props.target.filter(i => i.id !== id))
}

function drag(event: DragEvent, i: number) {
  event.dataTransfer?.setData('item', i.toString())
}

function drop(event: DragEvent) {
  const id = event.dataTransfer?.getData('item')
  id && addItem(+id)
}
</script>

<template>
  <div class="eos-transfer">
    <div class="eos-transfer__list">
      <div v-if="sourceTitle || targetTitle" class="eos-transfer__list-title">
        {{ sourceTitle }}

        <div>
          <slot name="sourceActions"></slot>
        </div>
      </div>

      <eos-input
        v-model:value="searchSource"
        allowClear
        size="large"
        :placeholder="searchSourcePlaceholder || t('search')"
      >
        <template #prefix>
          <search-icon />
        </template>
      </eos-input>

      <div class="eos-transfer__items">
        <div
          v-for="item in filteredSource"
          draggable="true"
          class="eos-transfer__item eos-transfer__item_drag"
          @dragstart="drag($event, item.id)"
        >
          <drag-and-drop-icon />

          <div class="eos-transfer__name">
            {{ item.name }}
          </div>

          <eos-button class="eos-transfer__btn" @click.stop="addItem(item.id)">
            <arrow-icon />
          </eos-button>
        </div>
      </div>
    </div>

    <div class="eos-transfer__list">
      <div v-if="sourceTitle || targetTitle" class="eos-transfer__list-title">
        {{ targetTitle }}

        <div>
          <slot name="targetActions"></slot>
        </div>
      </div>

      <eos-input
        v-model:value="searchTarget"
        allowClear
        size="large"
        :placeholder="searchTargetPlaceholder || t('search')"
      >
        <template #prefix>
          <search-icon />
        </template>
      </eos-input>

      <div
        class="eos-transfer__items"
        @drop.prevent="drop"
        @dragover.prevent
        @dragenter.prevent
      >
        <div
          v-for="item in filteredTarget"
          class="eos-transfer__item"
        >
          <drag-and-drop-icon />

          <div class="eos-transfer__name">
            {{ item.name }}
          </div>

          <eos-button class="eos-transfer__btn" @click.stop="deleteItem(item.id)">
            <delete-icon />
          </eos-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.eos-transfer {
  display: flex;
  gap: 24px;

  &__list {
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  &__list-title {
    font-size: 15px;
    font-weight: 800;
    line-height: 24px;
    height: 24px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__items {
    background: var(--sc-base-5);
    flex-direction: column;
    overflow-y: auto;
    height: 456px;
    margin-top: 8px;
  }

  &__item {
    background: var(--sc-base-6);
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }

    &_drag {
      cursor: grab;
    }
  }

  &__items,
  &__item {
    padding: 12px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__name {
    font-size: 15px;
    line-height: 24px;
    margin-left: 10px;
  }

  &__btn {
    margin-left: auto;
    width: 44px;
  }
}
</style>
