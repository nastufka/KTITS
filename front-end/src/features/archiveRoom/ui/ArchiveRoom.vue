<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ax } from '@/shared/api/common'
import type { AxiosError, AxiosResponse } from 'axios'
import { useGlobalStore } from '@/stores/globalStore'
import type { Room } from '@/entities/room/model/types'

import EosModal from '@/shared/ui/EosModal'
import EosButton from '@/shared/ui/EosButton'
import ArchiveIcon from '@/shared/icons/ArchiveIcon.vue'

interface ArchiveRoomEmits {
  (e: 'archive'): void
}

interface ArchiveRoomProps {
  room?: Room
}

const router = useRouter()
const { t } = useI18n({})

const emit = defineEmits<ArchiveRoomEmits>()
const props = defineProps<ArchiveRoomProps>()

const globalStore = useGlobalStore()
const error = ref<boolean>(false)
const isOpen = ref<boolean>(false)

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
  error.value = false
}

function handleError(e: AxiosError) {
  if (e.response) {
    router.push({ name: 'error', params: { status: e.response.status }})
  }
}

function archive() {
  if (props.room) {
    const { name, description, address } = props.room
    ax.patch<Room>(`/rooms/${props.room.id}/`, {
      name,
      description,
      address,
      responsible: props.room.responsible ? props.room.responsible.id : null,
      is_active: false,
    })
      .then((res: AxiosResponse<Room>) => {
        close()
        emit('archive')
        globalStore.changeRoom(props.room?.id as number, res.data)
      })
      .catch(e => {
        if (e.response.data?.room?.includes('Rooms have planned or going sessions.')) {
          error.value = true
          return
        }
        handleError(e)
      })
  }
}
</script>

<template>
  <eos-button
    v-if="room"
    type="secondary"
    :title="t('archiving')"
    @click="open"
  >
    <archive-icon />

    <eos-modal
      v-model:open="isOpen"
      wrapClassName="archive-room"
      :title="t('archiving')"
      @cancel="close"
    >
      <div v-if="error" class="archive-room__text">
        {{ t('roomArchivingError', 0) }}
        <b>{{ room?.name }}</b>
        {{ t('roomArchivingError', 1) }}
        <a target="_blank" href="/sessions">
          {{ t('roomArchivingError', 2) }}
        </a>
      </div>

      <div v-else class="archive-room__text">
        {{ `${t('confirmRoomArchivingMessage', 1)}` }}
        <b>{{ room?.name }}</b>
        {{ `${t('confirmRoomArchivingMessage', 2)}` }}
        <br><br>
        {{ t('confirmToContinue') }}
      </div>

      <template #footer>
        <eos-button
          v-if="!error"
          type="primary"
          size="large"
          @click="archive"
        >
          {{ t('confirm') }}
        </eos-button>

        <eos-button size="large" @click="close">
          {{ error ? t('ok'): t('cancel') }}
        </eos-button>
      </template>
    </eos-modal>
  </eos-button>
</template>

<style lang="scss">
.archive-room {
  &__text, &__text b, &__text a {
    font-size: 15px;
    line-height: 24px;
  }

  &__text a {
    text-decoration: underline;
  }
}
</style>
