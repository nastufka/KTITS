<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { AxiosError } from 'axios'

import { ax } from '@/shared/api/common'
import EosModal from '@/shared/ui/EosModal'
import EosButton from '@/shared/ui/EosButton'
import ArchiveIcon from '@/shared/icons/ArchiveIcon.vue'
import type { Device } from '@/entities/device/model/types'

interface ArchiveDeviceEmits {
  (e: 'archive'): void
}

interface ArchiveDeviceProps {
  device?: Device
}

const router = useRouter()
const { t } = useI18n({})

const emit = defineEmits<ArchiveDeviceEmits>()
const props = defineProps<ArchiveDeviceProps>()

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
  if (props.device) {
    ax.patch(`/devices/${props.device.id}/`, {
      ...props.device,
      is_active: false,
      rooms: props.device.rooms?.map(r => r.id)
    })
      .then(() => {
        close()
        emit('archive')
      })
      .catch(e => {
        if (e.response.data?.device_room?.includes('The rooms have scheduled sessions.')) {
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
    v-if="device"
    type="secondary"
    :title="t('archiving')"
    @click="open"
  >
    <archive-icon />

    <eos-modal
      v-model:open="isOpen"
      wrapClassName="archive-device"
      :title="t('archiving')"
      @cancel="close"
    >
      <div v-if="error" class="archive-device__text">
        {{ t('deviceArchivingError', 0) }}
        <b>{{ device?.name }}</b>
        {{ t('deviceArchivingError', 1) }}
        <a target="_blank" href="/sessions">
          {{ t('deviceArchivingError', 2) }}
        </a>
      </div>

      <div v-else class="archive-device__text">
        {{ `${t('confirmDeviceArchivingMessage', 1)}` }}
        <b>{{ device?.name }}</b>
        {{ `${t('confirmDeviceArchivingMessage', 2)}` }}
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
.archive-device {
  &__text, &__text b, &__text a {
    font-size: 15px;
    line-height: 24px;
  }

  &__text a {
    text-decoration: underline;
  }
}
</style>
