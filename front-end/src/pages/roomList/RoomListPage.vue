<script setup lang="ts">
import RoomList from '@/widgets/RoomList/ui'
import RoomPlacement from '@/widgets/RoomPlacement/ui'
</script>

<template>
  <div class="room-list-page">
    <room-placement />
    <room-list />
  </div>
</template>

<style lang="scss">
.room-list-page {
  display: grid;
  column-gap: 8px;
  grid-template-rows: 100%;
  height: 100%;
  grid-template-columns: 48% 52%;
}
</style>