<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted, h } from 'vue'
import { message } from 'ant-design-vue'
import EosMark from '@/shared/ui/EosMark'
import EosInput from '@/shared/ui/EosInput'
import EosButton from '@/shared/ui/EosButton'
import EosTooltip from '@/shared/ui/EosTooltip'
import EosPopover from '@/shared/ui/EosPopover'
import InfoIcon from '@/shared/icons/InfoIcon.vue'
import CheckIcon from '@/shared/icons/CheckIcon.vue'
import RemoveIcon from '@/shared/icons/RemoveIcon.vue'
import type { MarkerAttachment } from "@/widgets/RoomPlacement/model/types"

const props = defineProps<{
  mark: MarkerAttachment
  editing: boolean
  itsNewMark: boolean
}>()
const emit = defineEmits<{
  (e: 'setDraggableId', draggableId: number, itsNewMark: boolean): void
  (e: 'setMark', mark: MarkerAttachment, itsNewMark: boolean): void
  (e: 'removeMark', removableId: number, itsNewMark: boolean): void
}>()
const { t } = useI18n({})
const isOpenConfirm = ref<boolean>(false)
const markName = ref<string | undefined>(props.mark.name)
const currentTop = computed<number>(() => props.mark.top)
const currentLeft = computed<number>(() => props.mark.left)
const markerPosition = computed<Record<string, any>>( () => {
  return {
    top: currentTop.value + '%',
    left: currentLeft.value + '%'
  }
})

function openPopover(): void {
  if (props.editing) {
    isOpenConfirm.value = true
    markName.value = props.mark.name
  }
}
function closePopover(): void {
  isOpenConfirm.value = false
}

function onMouseDown(e: any) {
  e.preventDefault()
  props.editing && emit('setDraggableId', props.mark.id, props.itsNewMark)
}
function onMouseUp(e: any) {
  e.preventDefault()
  openPopover()
}
function setMark() {
  if (markName.value?.length) {
    emit('setMark', { 
      ...props.mark,
      top: currentTop.value,
      left: currentLeft.value,
      name: markName.value
    }, props.itsNewMark)
    closePopover()
  } else {
    message.info({
      content: () => t('markNameNeeded'),
      class: 'name-needed',
      icon: h(InfoIcon),
      duration: 2
    })
  }
}
function removeMark() {
  emit('removeMark', props.mark.id, props.itsNewMark)
  closePopover()
}
function openChange(e: any) {
  console.log(e)
}

onMounted(() => {
  if (props.itsNewMark) {
    openPopover()
  }
})

</script>

<template>
  <div 
    class="file-mark"
    :class="{ 'mark-editing': editing }"
    :style="markerPosition"
    @click="openPopover"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  >
    <eos-tooltip>
      <template #title>{{ mark.name }}</template>
      <eos-mark />
    </eos-tooltip>      
    <eos-popover
      v-model:open="isOpenConfirm"
      trigger="click"
      :align="{ offset: [0, -9] }"
      @openChange="openChange"
    >
      <template #title>
        {{ t('enterMarkName') }}
      </template>

      <template #content>
        <div class="file-mark-popover">
          <eos-input v-model:value="markName" :isTextArea="false" />
          <eos-button type="primary" @click="setMark">
            <check-icon />
          </eos-button>
          <eos-button type="secondary" @click="removeMark">
            <remove-icon />
          </eos-button>
        </div>
      </template>
    </eos-popover>
  </div>
</template>

<style lang="scss">
.file-mark {
  position: absolute;
  z-index: 9;
  cursor: pointer;
  &-popover {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
  &:hover {
    transform: scale(1.3);
  }
}
.mark-editing {
  cursor: grabbing;
}
.file-mark:active {
  cursor: move;
}
.name-needed {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  .ant-message-custom-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>