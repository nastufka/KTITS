<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { dayjs } from '@/shared/api/common'
import type { Role } from '@/entities/user/model/types'
import type { Room } from '@/entities/room/model/types'
import type { Session } from '@/entities/session/model/types'
import { useRoomsStore } from '@/entities/room/model/roomsStore'
import { useGlobalStore } from '@/stores/globalStore'

const { t } = useI18n({})

const globalStore = useGlobalStore()
const roomsStore = useRoomsStore()
const sessionInfo = computed<Session>(() => roomsStore.sessionInfo)
const sessionStatusId = computed<number>(() => roomsStore.sessionInfo.status?.id)
const sessionTypeId = computed<number>(() => roomsStore.sessionInfo.type?.id)
const activeRoom = computed<Room | undefined>(() => roomsStore.activeRoom)

const getSessionDateAndTime = () => {
  const start = dayjs(sessionInfo.value.start)
  const end = dayjs(sessionInfo.value.end) 
  return `${start.format('DD.MM.YYYY')}, ${start.format('HH:mm')}-${end.format('HH:mm')}`
}
</script>

<template>
  <div class="session-info">
    <div v-if="sessionInfo.module" class="session-info__item">
      <span class="session-info__item__title">
        {{ t('learningModule') }}
      </span>
      <span class="session-info__item__value">
        {{ sessionInfo.module }}
      </span>
    </div>
    <div v-if="sessionInfo.type" class="session-info__item">
      <span class="session-info__item__title">
        {{ t('lessonType') }}
      </span>
      <span class="session-info__item__value">
        {{ t(sessionInfo.type.name) }}
      </span>
    </div>
    <div v-if="sessionInfo.start && sessionInfo.end" class="session-info__item">
      <span class="session-info__item__title">
        {{ t('dateAndTime') }}
      </span>
      <span class="session-info__item__value">
        {{ getSessionDateAndTime() }}
      </span>
    </div>
    <div v-if="sessionInfo.groups?.length" class="session-info__item">
      <span class="session-info__item__title">
        {{ t('group') }}
      </span>
      <span class="session-info__item__value">
        <template v-for="(group, idx) in sessionInfo.groups" :key="idx">
          <span class="list-value">{{ group.name }}{{ idx === sessionInfo.groups.length - 1 ? '' : ', ' }}</span>
        </template>
      </span>
    </div>
    <div v-if="sessionStatusId !== 3 && sessionTypeId === 1" class="session-info__item">
      <span class="session-info__item__title">
        {{ t('studentID') }}
      </span>
      <span class="session-info__item__value">
        {{ activeRoom?.studentID ? activeRoom.studentID : 'Не указано' }}
      </span>
    </div>
    <div v-if="sessionInfo.users?.length" class="session-info__item">
      <span class="session-info__item__title">
        {{ t('teacher') }}
      </span>
      <span class="session-info__item__value">
        <template v-for="(teacher, idx) in sessionInfo.users" :key="idx">
          <span class="list-value">{{ teacher.name }}{{ idx === sessionInfo.users.length - 1 ? '' : ', ' }}</span>
        </template>
      </span>
    </div>
  </div>
</template>

<style lang="scss">
.session-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100%;
  background: var(--sc-base-6) !important;

  &__item {
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
    &__title {
      color: var(--sc-base-1);
      font-size: 15px;
      font-weight: 800;
      line-height: 24px;
    }
    &__value {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      color: var(--sc-base-2);
      font-size: 17px;
      font-weight: 500;
      line-height: 28px;
      .list-value {
        all:inherit
      }
    }
  } 
}
</style>