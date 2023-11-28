<script setup lang="ts">
import _ from 'lodash-es'
import type { VNode } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AxiosResponse } from 'axios'
import { ref, computed, onMounted, watch } from 'vue'

import { ax } from '@/shared/api/common'
import EosCard from '@/shared/ui/EosCard'
import EosModal from '@/shared/ui/EosModal'
import EosButton from '@/shared/ui/EosButton'
import FileMark from '@/features/fileMark/ui'
import PlanFile from '@/features/planFile/ui'
import RemoveIcon from '@/shared/icons/RemoveIcon.vue'
import RefreshIcon from '@/shared/icons/RefreshIcon.vue'
import EosButttonSelector from '@/shared/ui/EosButtonSelector'
import HasPermission from '@/features/auth/ui/HasPermission.vue'
import { PermissionEnum } from '@/features/auth/model/permissions'

import type { Attachment, MarkerAttachment } from '../model/types'

const { t } = useI18n({})
const attachments = ref<Attachment[]>()
const activeAttach = ref<Attachment>({})
const initialAttach = ref<Attachment>({})
const editing = ref<boolean>(false)
const drawing = ref<boolean>(false)
const fileWidth = ref<number>()
const fileHeight = ref<number>()
const deleteModalOpen = ref<boolean>(false)
const newMarkers = ref<MarkerAttachment[]>([])
const currentMarker = ref<MarkerAttachment>()
const draggableId = ref<number | null>(null)
const attachmentsToRemove = ref<number[]>([])
const planFileRef = ref<typeof PlanFile | null>(null)
const changeFile = ref<boolean>(false)
const isNewFile = computed<boolean>(() => !activeAttach.value.id && editing.value)

const selectedIdx = computed<number | undefined>(() => {
  let selected = 0
  if (editing.value && !activeAttach.value.id && !changeFile.value) {
    return attachments.value?.length as number
  }
  attachments.value?.forEach((attach, idx) => {
    if (attach.id === (activeAttach.value?.id || initialAttach.value.id)) {
      selected = idx
      return
    }
  })
  return selected
})

watch(() => selectedIdx.value, () => {
  // если переключились с добавления нового аттача на сущесвующий - почечаем, что уже отслеживаем замену файла
  if (activeAttach.value.id && editing.value) {
    changeFile.value = true
  }
  // при переключении аттачей запоминаем активный для сохранения/отмены
  if (!editing.value || changeFile.value) {
    initialAttach.value = _.cloneDeep(activeAttach.value)
  }
})

function startEditing(mode: 'edit' | 'new' = 'new'): void {
  changeFile.value = mode === 'edit'
  editing.value = true
  initialAttach.value = _.cloneDeep(activeAttach.value)
}
function cancelEditing(): void {
  editing.value = false
  drawing.value = false
  changeFile.value = false
  activeAttach.value = _.cloneDeep(initialAttach.value)
  initialAttach.value = {}
  attachmentsToRemove.value = []
  newMarkers.value = []
}
function checkBeforeDelete(): void {
  deleteModalOpen.value = true
}
async function getAttachments(action: 'get' | 'save' = 'get') {
  return await ax.get('/attachments')
    .then((res: AxiosResponse<Attachment[]>) => {
      attachments.value = res.data
      if (attachments.value.length) {
        if (action === 'save') {
          activeAttach.value = changeFile.value 
            ? attachments.value.find(a => a.id === initialAttach.value.id) as Attachment
            : attachments.value.at(-1) as Attachment
        } else {
          activeAttach.value = attachments.value[0] as Attachment
        }
        initialAttach.value = _.cloneDeep(activeAttach.value)
      }
    })
}
async function handleDeleteAttach(id: number): Promise<void> {
  return ax.delete(`/attachments/${id}`)
}
async function handleAttachment(): Promise<void> {
  const axMethod = isNewFile.value && !changeFile.value ? ax.post : ax.patch
  const formData = new FormData()
  let marker_attachment = [...newMarkers.value]
  if (activeAttach.value?.marker_attachment) {
    marker_attachment = [...activeAttach.value?.marker_attachment, ...marker_attachment]
  }
  formData.append('marker_attachment', JSON.stringify(marker_attachment))
  const data: { marker_attachment: MarkerAttachment[], file?: File } = {
    marker_attachment
  }
  if (isNewFile.value) {
    formData.append('file', activeAttach.value.blob)
    data.file = activeAttach.value.blob
  }
  return axMethod(`/attachments/${changeFile.value ? initialAttach.value.id + '/' : ''}`, formData)
}
async function deleteAttach(): Promise<void> {
  if (activeAttach.value.id) {
    await handleDeleteAttach(activeAttach.value.id)
    attachments.value = attachments.value?.filter(attach => attach.id !== activeAttach.value.id)
    if (attachments.value) {
      activeAttach.value = attachments.value[0]
      initialAttach.value = _.cloneDeep(activeAttach.value)
    }
    cancelEditing()
  } else {
    cancelEditing()
  }
}
async function handleCreateMarker(marker: MarkerAttachment): Promise<void> {
  return ax.post('/marker_attachment/', marker)
}
async function handleUpdateMarker(marker: MarkerAttachment): Promise<void> {
  return ax.patch(`/marker_attachment/${marker.id}/`, marker)
}
function refreshImg(): void {
  if (!isNewFile.value) {
    attachmentsToRemove.value.push(<number>activeAttach.value.id)
  } 
  planFileRef.value?.doUpload()
}
function saveAttachment(): void {
  const promises: Promise<void>[] = []
  promises.push(handleAttachment())
  // attachmentsToRemove.value.forEach(id => {
  //   promises.push(handleDeleteAttach(id))
  // })
  // newMarkers.value.forEach(marker => {
  //   promises.push(handleCreateMarker(marker))
  // })
  // activeAttach.value?.marker_attachment?.forEach(marker => {
  //   promises.push(handleUpdateMarker(marker))
  // })
  Promise.all(promises).then(() => {
    getAttachments('save').then(() => cancelEditing())
  })
}
function addMarks() {
  drawing.value = true
}
function startDrawing(e: any) {
  if (drawing.value) {
    // Вычитаем 10px, чтобы метка отобразилась прямо под курсором
    const top = getCoordValue(e.layerY - 10, 'y')
    const left = getCoordValue(e.layerX - 10)
    const lastMarkerId = newMarkers.value.at(-1)?.id
    newMarkers.value.push({
      top,
      left,
      name: '',
      id: lastMarkerId ? lastMarkerId + 1 : 1,
      attachment: <number>activeAttach.value?.id
    })
    drawing.value = false
  }
}
function setCoords(e: any) {
  e.preventDefault()
  
  if (currentMarker.value && e.target.className.includes('plan-file-img')) {
    currentMarker.value.top = getCoordValue(e.layerY, 'y')
    currentMarker.value.left = getCoordValue(e.layerX)
  }
}
function getCoordValue(value: number, type: 'x' | 'y' = 'x'): number {
  const dragParentSide = type === 'x' 
    ? document.getElementById('dragParent')?.offsetWidth
    : document.getElementById('dragParent')?.offsetHeight
  return (value / <number>dragParentSide) * 100
}
function setDraggableId(id: number, itsNewMark: boolean = false) {
  if (drawing.value || editing.value) {
    draggableId.value = id
    const dragParent = document.getElementById('dragParent')
    if (dragParent) {
      dragParent.onmousemove = setCoords
    }
    const markersCollection: MarkerAttachment[] | undefined = itsNewMark 
      ? newMarkers.value 
      : activeAttach.value?.marker_attachment
    currentMarker.value = markersCollection?.find(m => m.id === <number>id)
  }
}
function onMouseUp() {
  const dragParent = document.getElementById('dragParent')
  if (dragParent) {
    dragParent.onmouseup = null
    dragParent.onmousemove = null
  }
  if (currentMarker.value) {
    currentMarker.value = undefined
  }
}
function setMark(mark: MarkerAttachment, itsNewMark: boolean = false) {
  const markersCollection: MarkerAttachment[] | undefined = itsNewMark 
    ? newMarkers.value 
    : activeAttach.value?.marker_attachment
  let editableMark = markersCollection?.find(m => m.id === mark.id)
  if (editableMark) {
    editableMark.name = mark.name
  }
}
function removeMark(id: number, itsNewMark: boolean = false) {
  if (itsNewMark) {
    newMarkers.value = newMarkers.value?.filter(m => m.id !== id)
  } else {
    activeAttach.value.marker_attachment = activeAttach.value.marker_attachment?.filter(m => m.id !== id)
  }
}
function selectAttach(idx: number) {
  if (attachments.value?.length) {
    activeAttach.value = attachments.value[idx]
  }
}
function addNewAttach(): void {
  startEditing()
  activeAttach.value = {}
}

onMounted(() => getAttachments())

</script>

<template>
  <eos-card 
    :title="t('placementPlan')" 
    class="placement-card"
    :body-style="{ height: 'calc(100% - 60px)', padding: '24px', display: 'flex' }"
  >
    <template #extra>
      <div class="placement-card-buttons">
        <template v-if="editing || drawing">
          <eos-button type="secondary" :disabled="!activeAttach || !activeAttach.id" @click="addMarks">
            {{ t('addMark') }}
          </eos-button>
          <eos-button type="secondary" @click="cancelEditing">
            {{ t('cancel') }}
          </eos-button>
          <eos-button type="primary" :disabled="!activeAttach.file" @click="saveAttachment">
            {{ t('save') }}
          </eos-button>
        </template>
        <has-permission v-else :permissions="[PermissionEnum.CAN_UPDATE_ROOMS]">
          <eos-button
            @click="startEditing('edit')"
            type="primary"
          >
            {{ t('edit') }}
          </eos-button>
        </has-permission>
      </div>
    </template>
    <div class="placement-card-attachments">
      <div 
        id="dragParent"
        style="position: relative;"
        :class="{'drag-parent-drawing': drawing}"
        @mouseup="onMouseUp"
        @click="startDrawing"
      >
        <plan-file 
          v-model:attach="activeAttach" 
          :drawing="drawing" 
          :newFile="isNewFile"
          ref="planFileRef"
          class="placement-card-attachments-file"
         />
        <file-mark
          v-for="mark in activeAttach?.marker_attachment" 
          :key="mark.id"
          :mark="mark"
          :itsNewMark="false"
          :editing="editing"
          class="placement-card-attachments-mark"
          @setMark="setMark"
          @removeMark="removeMark"
          @setDraggableId="setDraggableId"
        />
        <file-mark
          v-for="newMark in newMarkers" 
          :key="newMark.id"
          :mark="newMark"
          :itsNewMark="true"
          :editing="editing"
          class="placement-card-attachments-newMark"
          @setMark="setMark"
          @removeMark="removeMark"
          @setDraggableId="setDraggableId"
        />
      </div>
      
      <div class="placement-card-bottom">
        <div class="placement-card-actions">
          <template v-if="editing && activeAttach.file">
            <eos-button @click="checkBeforeDelete" type="secondary">
              <remove-icon color="#3761F3" />
              {{ t('deleteAttach') }}
            </eos-button>
            <eos-button @click="refreshImg" type="secondary">
              <refresh-icon />
              {{ t('refreshImg') }}
            </eos-button>
          </template>
        </div>
      </div>
    </div>
    <div class="placement-card-selector">
      <eos-buttton-selector 
        :max="20"
        :editing="editing"
        :length="attachments?.length"
        :selected-idx="selectedIdx"
        direction="column-reverse"
        @select="selectAttach"
        @add="addNewAttach"
      />
    </div>
    <eos-modal
      v-model:open="deleteModalOpen"
      :title="t('deleting')"
      :okText="t('delete')"
      centered
      width="498px"
      @ok="deleteAttach"
      @cancel="deleteModalOpen = false"
    >
      <p class="deleting-modal-text">
        {{ t('deletingAttachModalText') }}
      </p>
      <p class="deleting-modal-text">
        {{ t('deleteConfirm') }}
      </p>
    </eos-modal>
  </eos-card>
</template>

<style lang="scss">
.placement-card {
  &-buttons {
    display: flex;
    align-items: center;
    gap: 14px;
    .eos-btn_secondary {
      span {
        color: var(--sc-base-2) !important;
      }
    }
  }
  &-attachments {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    flex: 1;
    .drag-parent-drawing {
      cursor: crosshair;
    }
  }
  &-bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
  }
  &-actions {
    display: flex;
    align-items: flex-end;
    gap: 12px;
  }
  &-selector {
    align-self: flex-end;
    width: 42px;
    margin-left: auto;
  }
  .ant-card-head {
    &-title {
      color: #000;
      font-size: 24px;
      font-weight: 800;
      line-height: 28px;
    }
  }
  .deleting-modal-text {
    color: var(--sc_base-1);
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
  }
}
</style>
