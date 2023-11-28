<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { AxiosError } from 'axios'

import { ax } from '@/shared/api/common'
import EosModal from '@/shared/ui/EosModal'
import EosButton from '@/shared/ui/EosButton'
import ArchiveIcon from '@/shared/icons/ArchiveIcon.vue'
import type { Group } from '@/entities/group/model/types'

interface ArchiveGroupEmits {
  (e: 'archive'): void
}

interface ArchiveGroupProps {
  group?: Group
}

const router = useRouter()
const { t } = useI18n({})

const emit = defineEmits<ArchiveGroupEmits>()
const props = defineProps<ArchiveGroupProps>()

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
  if (props.group) {
    ax.put(`/groups/${props.group.id}/`, {
      ...props.group,
      is_active: false,
      teacher: props.group.teacher?.id,
      users: props.group.users?.map(u => u.id)
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
    v-if="group"
    type="secondary"
    :title="t('archiving')"
    @click="open"
  >
    <archive-icon />

    <eos-modal
      v-model:open="isOpen"
      wrapClassName="archive-group"
      :title="t('archiving')"
      @cancel="close"
    >
      <div v-if="error" class="archive-group__text">
        {{ t('groupArchivingError', 0) }}
        <b>{{ group?.name }}</b>
        {{ t('groupArchivingError', 1) }}
        <a target="_blank" href="/sessions">
          {{ t('groupArchivingError', 2) }}
        </a>
      </div>

      <div v-else class="archive-group__text">
        {{ `${t('confirmGroupArchivingMessage', 1)}` }}
        <b>{{ group?.name }}</b>
        {{ `${t('confirmGroupArchivingMessage', 2)}` }}
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
.archive-group {
  &__text, &__text b, &__text a {
    font-size: 15px;
    line-height: 24px;
  }

  &__text a {
    text-decoration: underline;
  }
}
</style>
