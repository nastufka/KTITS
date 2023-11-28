<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'
import EosCard from '@/shared/ui/EosCard'
import EosStatus from '@/shared/ui/EosStatus'
import RoomsTabs from '@/features/roomsTabs/ui'
import { useRoomsStore } from '@/entities/room/model/roomsStore'
import type { Session } from '@/entities/session/model/types'

const { t } = useI18n({})
const roomsStore = useRoomsStore()
const sessionInfo = computed<Session>(() => roomsStore.sessionInfo)
const sessionTitle = computed<string>(() => `${t('studySession')} №${sessionInfo.value.id}`)

</script>

<template>
  <eos-card 
    :title="sessionTitle" 
    class="rooms-card"
  >
    <template #extra>
      <eos-status :status="sessionInfo.status"/>
    </template>
    <rooms-tabs />
  </eos-card>
</template>

<style lang="scss">
.rooms-card {
  .ant-card-head {
    min-height: 60px;
    border-bottom: unset !important;
    &-title {
      color: #000;
      font-size: 24px;
      font-weight: 800;
      line-height: 28px;
    }
  }

  .ant-card-body {
    overflow-y: initial;
  }
}
</style>