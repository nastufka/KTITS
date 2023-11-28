<script setup lang="ts">

import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import RoomDevices from '@/widgets/RoomDevices/ui'
import RoomInfoCard from '@/widgets/RoomInfoCard/ui'
import SessionList from '@/widgets/SessionList/ui'
import RoomStudyWorkload from '@/widgets/RoomStudyWorkload/ui'

const route = useRoute()
const roomId = computed<number>(() => {
  if (typeof route.params.id === 'string') {
    return Number(route.params.id)
  } else {
    return 0
  }
})

</script>

<template>
  <div class="room-page">
    <room-info-card :roomId="roomId" />
    <room-study-workload :roomId="roomId" />
    <room-devices :roomId="roomId" />
    <session-list type="widget" :roomId="roomId" />
  </div>
</template>

<style lang="scss">
.room-page {
  display: grid;
  grid-template-rows: 40% 60%;
  grid-template-columns: repeat(2, 50%);
  grid-gap: 8px;
  height: calc(100% - 8px);
  .session-list {
    height: unset !important;
    .ant-table-container {
      max-height: calc(100% - 65px);
      display: flex;
      flex-direction: column;
      .ant-table-body {
        flex: 1;
      }
    }
  }
}
</style>