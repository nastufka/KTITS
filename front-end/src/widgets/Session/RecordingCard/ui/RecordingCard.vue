<script setup lang="ts">
import EosCard from '@/shared/ui/EosCard'
import Recording from '@/features/recording/ui'
import RoomsGridSelection from '@/features/roomsGridSelection/ui'
</script>

<template>
  <eos-card class="recording-card">
    <div class="recording-card__content">
      <Recording />
      <a-divider type="vertical" style="height: 80px; background-color: #E0E0E0" />
      <RoomsGridSelection />
    </div>
  </eos-card>
</template>

<style lang="scss">
.recording-card {
  .ant-body-card {
    padding: 18px 24px;
  }
  &__content {
    display: grid;
    grid-template-columns: auto 1px 414px;
    grid-template-rows: 100%;
    grid-column-gap: 20px;
  }
}
</style>>