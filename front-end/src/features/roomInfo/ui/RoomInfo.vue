<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { Room } from '@/entities/room/model/types'

const props = defineProps<{
  room?: Room
}>()
const { t } = useI18n({})

const room = computed<Room | undefined>(() => props.room)

</script>

<template>
  <div class="room-info">
    <div v-if="room?.description" class="room-info__item">
      <span class="room-info__item__title">
        {{ t('description') }}
      </span>
      <span class="room-info__item__value">
        {{ room.description }}
      </span>
    </div>
    <div v-if="room?.address" class="room-info__item">
      <span class="room-info__item__title">
        {{ t('placementAddress') }}
      </span>
      <span class="room-info__item__value">
        {{ room.address }}
      </span>
    </div>
    <div v-if="room?.responsible" class="room-info__items">
      <div v-if="room?.responsible" class="room-info__item">
        <span class="room-info__item__title">
          {{ t('responsible') }}
        </span>
        <span class="room-info__item__value">
          {{ room.responsible.name }}
        </span>
      </div>
      <div v-if="room?.responsible.email" class="room-info__item">
        <span class="room-info__item__title">
          {{ t('contacts') }}
        </span>
        <span class="room-info__item__value">
          {{ room.responsible.email }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.room-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  //height: 100%;
  flex: 1;
  background: var(--sc-base-6) !important;
  margin-top: 8px;

  &__items {
    display: flex;
    align-items: center;
    gap: 60px;
  }

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