<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { AxiosError } from 'axios'

import { ax } from '@/shared/api/common'
import EosModal from '@/shared/ui/EosModal'
import EosButton from '@/shared/ui/EosButton'
import ArchiveIcon from '@/shared/icons/ArchiveIcon.vue'
import type { User } from '@/entities/user/model/types'

interface ArchiveUserEmits {
  (e: 'archive'): void
}

interface ArchiveUserProps {
  user?: User
}

const router = useRouter()
const { t } = useI18n({})

const emit = defineEmits<ArchiveUserEmits>()
const props = defineProps<ArchiveUserProps>()

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
  if (props.user) {
    ax.put(`/users/${props.user.id}/`, {
      ...props.user,
      is_active: false,
      role: props.user.role?.id
    })
      .then(() => {
        close()
        emit('archive')
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
    v-if="user"
    type="secondary"
    :title="t('archiving')"
    @click="open"
  >
    <archive-icon />

    <eos-modal
      v-model:open="isOpen"
      wrapClassName="archive-user"
      :title="t('archiving')"
      @cancel="close"
    >
      <div v-if="error" class="archive-user__text">
        {{ t('userArchivingError', 0) }}
        <b>{{ user?.name }}</b>
        {{ t('userArchivingError', 1) }}
        <a target="_blank" href="/sessions">
          {{ t('userArchivingError', 2) }}
        </a>
      </div>

      <div v-else class="archive-user__text">
        {{ `${t('confirmUserArchivingMessage', 1)}` }}
        <b>{{ user?.name }}</b>
        {{ `${t('confirmUserArchivingMessage', 2)}` }}
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
.archive-user {
  &__text, &__text b, &__text a {
    font-size: 15px;
    line-height: 24px;
  }

  &__text a {
    text-decoration: underline;
  }
}
</style>
