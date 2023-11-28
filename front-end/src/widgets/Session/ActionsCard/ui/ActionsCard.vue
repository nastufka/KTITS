<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { cloneDeep } from 'lodash-es'
import { useRouter } from 'vue-router' 
import type { AxiosError } from 'axios'
import { ref, computed, onMounted } from 'vue'

import { ax } from '@/shared/api/common'
import EosCard from '@/shared/ui/EosCard'
import EosModal from '@/shared/ui/EosModal'
import EosSearch from '@/shared/ui/EosSearch'
import EosButton from '@/shared/ui/EosButton'
import RecordFiles from '@/features/files/ui'
import EditIcon from '@/shared/icons/EditIcon.vue'
import Annotations from '@/features/annotations/ui'
import SessionForm from '@/features/sessionForm/ui'
import { useGlobalStore } from '@/stores/globalStore'
import CamsSelection from '@/features/camsSelection/ui'
import type { User } from '@/entities/user/model/types'
import ArchiveIcon from '@/shared/icons/ArchiveIcon.vue'
import DevicesSettings from '@/features/DevicesSettings/ui'
import SessionInfoCard from '@/features/sessionInfoCard/ui'
import type { Session } from '@/entities/session/model/types'
import type { Group, Room } from '@/entities/room/model/types'
import { useRoomsStore } from '@/entities/room/model/roomsStore'
import type { ActionMode } from '@/features/roomsActionSwitcher/model/types'
import { useActionSwitcherStore } from '@/features/roomsActionSwitcher/model/actionSwitcherStore'


const { t } = useI18n({})
const router = useRouter()

const roomsStore = useRoomsStore()
const sessionInfo = computed(() => roomsStore.sessionInfo)
const sessionStatusId = computed<number>(() => roomsStore.sessionInfo.status?.id)
const recordinginProgress = computed<boolean>(() => roomsStore.recordinginProgress)
const actionSwitcherStore = useActionSwitcherStore()
const modes = computed<ActionMode[]>(() => actionSwitcherStore.modes)
const activeMode = computed<ActionMode>(() => actionSwitcherStore.activeMode)
const sessionToEdit = ref<Session>()
const isSessionFormOpen = ref<boolean>(false)
const isOpenCancelModal = ref<boolean>(false)
const searchValue = ref<string>('')

const impossibleArchiving = computed<boolean>(() => recordinginProgress.value)

const displayCondition = (modeName: string): boolean => {
  const mode = modes.value.find(m => m.name === modeName)
  return mode ? mode.availableStatus.includes(sessionStatusId.value) : false
}

function openSessionForm() {
  isSessionFormOpen.value = true
  sessionToEdit.value = cloneDeep(sessionInfo.value)
}

function closeSessionForm() {
  isSessionFormOpen.value = false
  sessionToEdit.value = undefined
}

function openCancelModal() {
  isOpenCancelModal.value = true
}

function closeCancelModal() {  
  isOpenCancelModal.value = false
}

function handleError(e: AxiosError) {
  if (e.response) {
    router.push({ name: 'error', params: { status: e.response.status }})
  }
}

function archiveSession() {
  ax.put(`/sessions/${sessionInfo.value.id}/`, { 
    start: sessionInfo.value.start,
    end: sessionInfo.value.end,
    module: sessionInfo.value.module,
    rooms: sessionInfo.value.rooms.map((r: Room) => r.id),
    gropus: sessionInfo.value.rooms.map((g: Group) => g.id),
    users: sessionInfo.value.users.map((u: User) => u.id),
    type: sessionInfo.value.type.id,
    status: 4,
    is_active: false 
  })
    .then(() => {
      closeCancelModal()
      router.push('/sessions')
    })
    .catch(handleError)
}

function refresh() {
  window.location.reload()
}

onMounted(() => {

})

</script>

<template>
  <eos-card :title="t(activeMode.cardTitle)" class="actions-card">
    <template #extra>
      <div class="actions-card-extra">
        <template v-if="activeMode.name === 'card' && sessionStatusId === 1 && !impossibleArchiving">
          <eos-button type="secondary" @click="openCancelModal">
            <ArchiveIcon />
          </eos-button>
          <eos-button type="primary" @click="openSessionForm">
            <EditIcon color="#FFF" />
          </eos-button>
        </template>
        <template v-else-if="activeMode.name === 'files' && sessionStatusId === 3">
          <eos-search
            v-model:value="searchValue"
            class="search-input"
          />
        </template>
      </div>
    </template>
    <SessionInfoCard v-show="activeMode.name === 'card'" class="actions-card__content" />
    <Annotations v-show="activeMode.name === 'annotations'" class="actions-card__content" />
    <CamsSelection v-if="displayCondition('cams')" v-show="activeMode.name === 'cams'" class="actions-card__content" />
    <DevicesSettings v-if="displayCondition('settings')" v-show="activeMode.name === 'settings'" class="actions-card__content" />
    <RecordFiles 
      v-if="displayCondition('files')" 
      v-show="activeMode.name === 'files'" 
      :searchValue="searchValue" 
      class="actions-card__content"
    />

    <session-form
      v-model:open="isSessionFormOpen"
      :session="sessionToEdit"
      @close="closeSessionForm"
    />
    <eos-modal
      v-model:open="isOpenCancelModal"
      wrapClassName="actions-card__archive-session"
      :title="t('archiving')"
      @cancel="closeCancelModal"
    >
      <div v-if="impossibleArchiving" class="actions-card__archive-session__text">
        {{ t('sessionArchivingError') }}
      </div>

      <div v-else class="actions-card__archive-session__text">
        {{ `${t('confirmSessionArchivingMessage')}` }}
        <b>№{{ sessionInfo.id }}</b> ?
      </div>

      <template #footer>
        <eos-button
          v-if="!impossibleArchiving"
          type="primary"
          size="large"
          @click="archiveSession"
        >
          {{ t('confirm') }}
        </eos-button>

        <eos-button size="large" @click="closeCancelModal">
          {{ impossibleArchiving ? t('ok'): t('cancel') }}
        </eos-button>
      </template>
    </eos-modal>
  </eos-card>
</template>

<style lang="scss">
.actions-card {
  &-extra {
    display: flex;
    align-items: center;
    gap: 14px;

    .search-input {
      width: 300px;
    }
  }
  .ant-card-head {
    &-title {
      color: #000;
      font-size: 24px;
      font-weight: 800;
      line-height: 28px;
    }
  }
  .ant-card-body {
  }
  &__content {
    background: var(--sc-base-5);
    overflow-y: auto;
  }
  &__archive-session {
    &__text, &__text b {
      font-size: 15px;
      line-height: 24px;
    }
  }
}
</style>