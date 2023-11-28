<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from "vue-i18n"
import EosCard from "@/shared/ui/EosCard"
import EosModal from '@/shared/ui/EosModal'
import EosInput from '@/shared/ui/EosInput'
import EosSelect from '@/shared/ui/EosSelect'
import EosFormItem from '@/shared/ui/EosFormItem'
import FolderIcon from '@/shared/icons/FolderIcon.vue'
import type { PlayStatus, Room, User } from '@/entities/room/model/types'
import type { Camera } from '@/entities/camera/model/types'
import RecCircleIcon from '@/shared/icons/RecCircleIcon.vue'
import { useRoomsStore } from '@/entities/room/model/roomsStore'
import { dayjs } from '@/shared/api/common'
import { recording } from '../api'
import PlayIcon from '@/shared/icons/PlayIcon.vue'
import PauseIcon from '@/shared/icons/PauseIcon.vue'
import ResetIcon from '@/shared/icons/ResetIcon.vue'
import type { Group } from '@/entities/group/model/types'

const { t } = useI18n({})
const roomsStore = useRoomsStore()
const activeRoom = computed<Room | undefined>(() => roomsStore.activeRoom)
const recordId = computed<number | undefined>(() => activeRoom.value?.recordId)
const playStatus = computed<PlayStatus | undefined>(() => activeRoom.value?.playStatus)
const sessionStatusId = computed<number>(() => roomsStore.sessionInfo.status?.id)
const videoDuration = computed<number | undefined>(() => activeRoom.value?.videoDuration)
const sessionTypeId = computed<number>(() => roomsStore.sessionInfo.type?.id)
const countModalOpen = ref<boolean>(false)
const studentModalOpen = ref<boolean>(false)
const studentID = ref<number | undefined>(undefined)
const studentModalTitle = ref<string>('')
const studentModalText = ref<string>('')
const studentModalValue = ref<string | number | undefined>('')
const studentModalOptions = ref<User[] | Group[]>([])
const sessionGroups = computed<Group[]>(() => roomsStore.sessionGroups)
const sessionStudents = computed<Group[]>(() => roomsStore.sessionStudents)
const time = computed<number | undefined>(() => activeRoom.value?.time)
const activeCams = computed<Camera[] | undefined>(() => activeRoom.value?.cams && activeRoom.value?.cams.filter((c: Camera) => c.active))
const activeRecordId = computed<number | null | undefined>(() => roomsStore.activeRecord?.id)
const currentTime = computed(() => {
  if (sessionStatusId.value !== 3)
    return typeof time.value === 'number' ? dayjs(time.value * 1000).format('m:ss') : '00:00'
  else
    return typeof time.value === 'number' && typeof videoDuration.value === 'number' 
      ? `${dayjs.duration(time.value, 'seconds').format('m:ss')}/${dayjs.duration(videoDuration.value, 'seconds').format('m:ss')}` 
      : '0:00/0:00'
})
const countText = computed<string>(() => sessionStatusId.value === 3 ? t('countFilesModalText') : t('countCamsModalText'))
watch(() => sessionTypeId.value, id => {
  setValuesForStudentModal()
})

const getColor = (): string => activeRoom.value?.recording ? '#F33428' : '#999999'

function setValuesForStudentModal(): void {
  switch (sessionTypeId.value) {
    case 1:
      studentModalTitle.value = t('studentID')
      studentModalText.value = t('studentIDModalText')
      studentModalValue.value = ''
      break
    case 2:
      studentModalTitle.value = t('group')
      studentModalText.value = t('groupModalText')
      studentModalValue.value = undefined
      studentModalOptions.value = sessionGroups.value
      break
    case 3:
      studentModalTitle.value = t('student')
      studentModalText.value = t('studentModalText')
      studentModalValue.value = undefined
      studentModalOptions.value = sessionStudents.value
      break
    default:
      studentModalTitle.value = t('studentID')
      studentModalText.value = t('studentIDModalText')
      studentModalValue.value = ''
  }
}
function openCountModal(): void {
  countModalOpen.value = true
}
function closeCountModal(): void {
  countModalOpen.value = false
}
function handleCountOk(): void {
  closeCountModal()
}
function openStudentModal(): void {
  studentModalOpen.value = true
}
function closeStudentModal(): void {
  studentModalOpen.value = false
}
function handleStudentOk(): void {
  roomsStore.setStudentID(<number>studentModalValue.value)
  handleRecording()
  closeStudentModal()
}
function handleStudentCancel(): void {
  closeStudentModal()
}
function checkForRecording(): void {
  if (activeRoom.value?.recording) {
    handleRecording()
    return
  }
  if (activeCams.value != undefined && activeCams.value.length < 2) {
    openCountModal()
    return
  }
  openStudentModal()
}
function checkForPlaying(): void {
  if (playStatus.value === 'reset' && !activeRecordId.value) {
    openCountModal()
    return
  }
  playToggle()
}
async function handleRecording() {
  const sessionId = roomsStore.sessionInfo.id
  const action = activeRoom.value?.recording ? 'stop' : 'start'
  const devices: number[] | undefined = activeCams.value?.map((c: Camera) => c.id)
  const roomId = <number>activeRoom.value?.id
  try {
    const res = await recording(sessionId, action, devices, roomId, recordId.value, studentModalValue.value)
    const newRecordId = await res.data
    roomsStore.handleRecording(newRecordId)
  } catch(e) {
    console.warn(e)
  }
}
function playToggle(): void {
  roomsStore.setPlayStatus(playStatus.value === 'play' ? 'pause' : 'play')
}
function resetActiveFiles(): void {
  roomsStore.resetActiveFiles()
}

onMounted(() => {
  setValuesForStudentModal()
})

</script>

<template>
  <div class="recording">
    <template v-if="sessionStatusId !== 3">
      <eos-card class="recording-button" @click="checkForRecording">
        <div class="recording-button-content">
          <RecCircleIcon :color="getColor()" />
          <span class="record-title">{{ t('record') }}</span>
        </div>
      </eos-card>
    </template>
    <template v-else>
      <eos-card class="recording-button" :class="{ 'active-button': playStatus === 'play' }" @click="checkForPlaying">
        <div class="recording-button-content">
          <PlayIcon v-if="playStatus !== 'play'" />
          <PauseIcon v-else-if="playStatus === 'play'" :active="true" />
          <span class="record-title">{{ playStatus === 'play' ? t('pause') : t('play') }}</span>
        </div>
      </eos-card>
      <eos-card class="recording-button" @click="resetActiveFiles">
        <div class="recording-button-content">
          <ResetIcon />
          <span class="record-title">{{ t('reset') }}</span>
        </div>
      </eos-card>
    </template>
    <div v-if="sessionStatusId !== 3" class="recording-info">
      <div class="recording-info-status">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path opacity="0.48" d="M15.126 7.82812C15.126 11.7979 11.9078 15.0161 7.93799 15.0161C3.96817 15.0161 0.75 11.7979 0.75 7.82812C0.75 3.85831 3.96817 0.640137 7.93799 0.640137C11.9078 0.640137 15.126 3.85831 15.126 7.82812ZM2.1876 7.82812C2.1876 11.004 4.76214 13.5785 7.93799 13.5785C11.1138 13.5785 13.6884 11.004 13.6884 7.82812C13.6884 4.65227 11.1138 2.07773 7.93799 2.07773C4.76214 2.07773 2.1876 4.65227 2.1876 7.82812Z" :fill="getColor()"/>
          <circle cx="7.93842" cy="7.82806" r="3.22845" :fill="getColor()"/>
        </svg>
        <span class="recording-info-status-title" :class="{'title-recording': activeRoom?.recording}">{{ activeRoom?.recording ? t('recordingStarted') : t('recordingNotStarted') }}</span>
      </div>
    </div>
    <div class="recording-time">
      {{ currentTime }}
    </div>
    <eos-modal
      v-model:open="countModalOpen"
      :title="t('attention')"
      centered
      :showCancel="false"
      @ok="handleCountOk"
    >
      <div class="recording-modal-text">
        {{ countText }}
      </div>
    </eos-modal>
    <eos-modal
      v-model:open="studentModalOpen"
      class="recording-modal"
      :title="studentModalTitle"
      :okText="t('save')"
      centered
      :okButtonProps="{ disabled: !studentModalValue }"
      @ok="handleStudentOk"
      @cancel="handleStudentCancel"
    >
      <div class="recording-modal-text">
        {{ studentModalText }}
      </div>
      <eos-form-item
        class="recording-modal-form-item"
        :label="studentModalTitle"
      >
        <eos-input
          v-if="sessionTypeId === 1"
          v-model:value="studentModalValue"
          size="large"
          style="width: 315px;"
        />
        <eos-select
          v-else
          v-model:value="studentModalValue"
          size="large"
          style="width: 372px;"
          optionFilterProp="name"
          :options="studentModalOptions"
          :field-names="{ label: 'name', value: 'id' }"
        />
      </eos-form-item>
    </eos-modal>
  </div>
</template>

<style lang="scss">
.recording {
  display: flex;
  align-items: center;
  gap: 14px;
  &-button {
    width: 148px;
    height: 80px;
    background: var(--sc-base-5);
    cursor: pointer;

    &.active-button {
      background: var(--sc-base-7);
      .record-title {
        color: var(--sc-base-6);
      }
    }

    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      .record-title {
        font-size: 15px;
        font-weight: 800;
        color: var(--sc-base-1);
      }
    }
  }
  &-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-left: 18px;
    &-status {
      display: flex;
      align-items: center;
      gap: 4px;
      &-title {
        color: var(--sc-base-9);
        font-size: 13px;
        font-weight: 500;
        line-height: 20px;
      }
      .title-recording {
        color: var(--sc-error);
      }
    }
    &-file {
      display: flex;
      align-items: end;
      gap: 4px;
      &-name {
        color: var(--sc-base-9);
        font-size: 13px;
        font-weight: 500;
        line-height: 20px;
      }
    }
  }
  &-time {
    margin-left: auto;
    color: var(--sc-base-1);
    font-size: 24px;
    font-weight: 800;
    line-height: 40px;
  }
  .record-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--sc-base-9);
  }
  &-modal {
    width: auto !important;
    min-width: 390px;
    max-width: 420px;
    &-text {
      color: var(--sc-base-2);
      font-size: 17px;
      font-weight: 500;
      line-height: 28px;
    }
    &-form-item {
      margin-top: 24px;
    }
  }
}
</style>