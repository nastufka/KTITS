<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, watch, computed } from 'vue'

import { dayjs } from '@/shared/api/common'
import EosModal from '@/shared/ui/EosModal'
import EosButton from '@/shared/ui/EosButton'
import SessionForm from '@/features/sessionForm/ui'
import { canUpdateSession } from '@/features/auth/lib'
import { SessionStatusEnum, type Session } from '@/entities/session/model/types'

interface SessionCardEmits {
  (e: 'cancel'): void
  (e: 'sessionEdit'): void
  (e: 'update:open', open: boolean): void
}

export interface SessionCardProps {
  session?: Session
  open: boolean
}

const { t } = useI18n({})

const emit = defineEmits<SessionCardEmits>()
const props = defineProps<SessionCardProps>()

const isSessionCardOpen = ref<boolean>(false)
const isSessionFormOpen = ref<boolean>(false)

const dateTime = computed<string>(() => {
  const session = props.session
  if (session) {
    const start = dayjs(session.start)
    const end = dayjs(session.end)
    return `${start.format('DD.MM.YYYY')}
      ${t('fromDateTime')}
      ${start.format('HH:mm')}
      ${t('toDateTime')}
      ${end.format('HH:mm')}`
  } else {
    return ''
  }
})

watch(() => props.open, open => isSessionCardOpen.value = open)
watch(isSessionCardOpen, open => emit('update:open', open))

function openSessionForm() {
  isSessionFormOpen.value = true
}

function closeSessionForm() {
  isSessionFormOpen.value = false
}

function onSessionEdit() {
  emit('sessionEdit')
}
</script>

<template>
  <eos-modal
    v-if="session"
    v-model:open="isSessionCardOpen"
    width="480px"
    wrapClassName="session-card"
    :title="`${t('learnSession')} №${session.id}`"
    @cancel="emit('cancel')"
  >
    <div class="session-card__row">
      <div class="session-card__title">
        {{ t('learningModule') }}
      </div>

      <div class="session-card__text">
        {{ session.module }}
      </div>
    </div>

    <div class="session-card__row">
      <div class="session-card__title">
        {{ t('lessonType') }}
      </div>

      <div class="session-card__text">
        {{ t(session.type.name) }}
      </div>
    </div>

    <div class="session-card__row">
      <div class="session-card__title">
        {{ t('group') }}
      </div>

      <div class="session-card__text">
        {{ session.groups.map(g => g.name).join(', ') }}
      </div>
    </div>

    <div class="session-card__row">
      <div class="session-card__title">
        {{ t('sessionDateAndTime') }}
      </div>

      <div class="session-card__text">
        {{ dateTime }}
      </div>
    </div>

    <div class="session-card__row">
      <div class="session-card__title">
        {{ t('status') }}
      </div>

      <div class="session-card__text">
        {{ t(session.status.name) }}
      </div>
    </div>

    <div class="session-card__row">
      <div class="session-card__title">
        {{ t('room') }}
      </div>

      <div class="session-card__text">
        {{ session.rooms.map(r => r.name).join(', ') }}
      </div>
    </div>

    <div class="session-card__row">
      <div class="session-card__title">
        {{ t('teacher') }}
      </div>

      <div class="session-card__text">
        {{ session.users.map(u => u.name).join(', ') }}
      </div>
    </div>

    <template #footer>
      <eos-button
        v-if="session.status.id === SessionStatusEnum.Planned && canUpdateSession(session)"
        type="primary"
        class="session-card__edit"
        @click="openSessionForm"
      >
        {{ t('edit') }}
      </eos-button>

      <router-link
        target="_blank"
        :to="`/session/${session.id}`"
      >
        <eos-button>
          {{ t('sessionPage') }}
        </eos-button>
      </router-link>
    </template>
  </eos-modal>

  <session-form
    v-model:open="isSessionFormOpen"
    :session="session"
    @submit="onSessionEdit"
    @close="closeSessionForm"
  />
</template>

<style lang="scss">
.session-card {
  &__row {
    margin-bottom: 23px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__title {
    font-size: 15px;
    font-weight: 800;
    line-height: 24px;
    margin-bottom: 8px;
  }

  &__text {
    color: var(--sc-base-2);
    font-size: 17px;
    line-height: 28px;
  }

  &__edit {
    margin-inline-end: 12px;
  }
}
</style>
