<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import EosCard from '@/shared/ui/EosCard'
import EosNoSignal from '@/shared/ui/EosNoSignal'
import type { Room, PlayStatus } from '@/entities/room/model/types'
import { useRoomsStore } from '@/entities/room/model/roomsStore'

interface SelectionProps {
  filesSelection?: boolean,
  videoFiles?: any[],
  recordId?: number | null
}
const props = withDefaults(defineProps<SelectionProps>(), {
  filesSelection: false,
  videoFiles: () => [],
  recordId: null
})

const { t } = useI18n({})
const roomsStore = useRoomsStore()
const rooms = computed<Room[]>(() => roomsStore.rooms)
const sessionStatusId = computed<number>(() => roomsStore.sessionInfo.status.id)
const activeRoom = computed<Room | undefined>(() => roomsStore.activeRoom)
const playStatus = computed<PlayStatus | undefined>(() => activeRoom.value?.playStatus)
const activeRecordId = computed<number | null | undefined>(() => roomsStore.activeRecord?.id)
const disabled = computed<boolean | undefined>(() => {
  if (sessionStatusId.value !== 3) {
    return activeRoom.value?.recording
  } else {
    return activeRecordId.value ? props.recordId !== activeRecordId.value || playStatus.value !== 'reset' : false
  }
})
const selectionBodyStyle = computed(() => {
  return {
    height: props.filesSelection ? 'auto' : '100%',
    padding: props.filesSelection ? 0 : '12px'
  }
})
const entityItems = computed(() => props.filesSelection ? props.videoFiles : activeRoom.value?.cams)

function onDragStart(e: DragEvent, id: number) {
  if (!disabled.value) {
    let data = id.toString()
    if (props.recordId) {
      data += `/${props.recordId}`
    }
    e.dataTransfer && e.dataTransfer.setData('text/plain', data)
  } else { 
    e.preventDefault()
  }
}
</script>

<template>
  <eos-card class="cams-selection" :body-style="selectionBodyStyle">
    <div class="cams-list">
      <div 
        v-for="(item) in entityItems" :key="item.id" 
        class="cams-list__item" 
        :class="{ 'item-active': item.active}"
        :id="`camItem${item.id}`"
      >
        <eos-card
          class="cams-list__item__card cam-card"
          draggable="true"
          :bodyStyle="{ height: '100%', padding: 0 }"
          @dragstart="(e) => onDragStart(e, item.id)"
        >
          <img v-if="item.image" :src="item.image"  />
          <EosNoSignal v-else />
        </eos-card>
        <span class="cams-list__item__title cam-title">{{ item.name }} <span v-if="item.active" class="title-selected">Выбрана</span></span>
      </div>
    </div>
  </eos-card>
</template>

<style lang="scss">
.cams-selection {
  background: var(--sc-base-5);
  .cams-list {
    display: grid;
    grid-template-columns: repeat(2, calc(50% - 6px));
    grid-gap: 12px;
    &__item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 180px;
      &__card {
        height: 128px;
        width: 100%;
        border-radius: 12px;
        cursor: pointer;
        img {
          height: 100%;
          width: 100%;
          border-radius: 10px;
        }
      }
      &__title {
        color: var(--sc-base-2);
        font-size: 13px;
        font-weight: 800;
        line-height: 20px;
        text-overflow: ellipsis;
        word-break: break-all;
        .title-selected {
          margin-left: 6px;
          color: var(--sc-base-2);
          font-size: 13px;
          font-weight: 500;
          line-height: 20px;
        }
      }
    }
    .item-active {
      .cam-card {
        border: 2px solid var(--sc-base-7);
      }
      .cam-title {
        color: var(--sc-base-7);
      }
    }
  }
}
</style>