<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { AxiosError } from 'axios'

import { ax } from '@/shared/api/common'
import EosModal from '@/shared/ui/EosModal'
import EosButton from '@/shared/ui/EosButton'
import ArchiveIcon from '@/shared/icons/ArchiveIcon.vue'
import { type Session, SessionStatusEnum } from '@/entities/session/model/types'

interface ArchiveSessionEmits {
  (e: 'archive'): void
}

interface ArchiveSessionProps {
  session?: Session
}

const router = useRouter()
const { t } = useI18n({})

const emit = defineEmits<ArchiveSessionEmits>()
const props = defineProps<ArchiveSessionProps>()

const isOpen = ref<boolean>(false)

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function handleError(e: AxiosError) {
  if (e.response) {
    router.push({ name: 'error', params: { status: e.response.status }})
  }
}

function archive() {
  if (props.session) {
    ax.put(`/sessions/${props.session.id}/`, {
      ...props.session,
      status: SessionStatusEnum.Canceled,
      groups: props.session.groups.map(g => g.id),
      rooms: props.session.rooms.map(r => r.id),
      users: props.session.users.map(u => u.id),
      type: props.session.type.id,
    })
      .then(() => {
        close()
        emit('archive')
      })
      .catch(handleError)
  }
}
</script>

<template>
  <eos-button
    v-if="session"
    type="secondary"
    :title="t('archiving')"
    @click="open"
  >
    <archive-icon />

    <eos-modal
      v-model:open="isOpen"
      wrapClassName="archive-session"
      :title="t('archiving')"
      @cancel="close"
    >
      <div class="archive-session__text">
        {{ `${t('confirmSessionArchivingMessage', 1)}` }}
        <b>{{ session?.module }}</b>
        {{ `${t('confirmSessionArchivingMessage', 2)}` }}
        <br><br>
        {{ t('confirmToContinue') }}
      </div>

      <template #footer>
        <eos-button
          type="primary"
          size="large"
          @click="archive"
        >
          {{ t('confirm') }}
        </eos-button>

        <eos-button size="large" @click="close">
          {{ t('cancel') }}
        </eos-button>
      </template>
    </eos-modal>
  </eos-button>
</template>

<style lang="scss">
.archive-session {
  &__text, &__text b, &__text a {
    font-size: 15px;
    line-height: 24px;
  }

  &__text a {
    text-decoration: underline;
  }
}
</style>
