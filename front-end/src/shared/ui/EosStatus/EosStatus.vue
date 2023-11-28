<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import EosTag from '@/shared/ui/EosTag'
import type { SessionStatus } from '@/entities/session/model/types'

export interface EosStatusProps {
  status?: SessionStatus,
}

const { t } = useI18n({})

const props = defineProps<EosStatusProps>()

const color = computed<string>(() => {
  switch (props.status?.id) {
    case 1:
      return '#AFBFF5'
    case 2:
      return '#91C893'
    case 3:
      return '#FFDAA1'
    default:
      return '#F4F4F8'
  }
})
</script>

<template>
  <eos-tag class="eos-status" :color="color">
    {{ t(status?.name || '') }}
  </eos-tag>
</template>

<style lang="scss">
.eos-status {
  padding: 4px 12px;
  border-radius: 43px;
  color: var(--sc-base-1) !important;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
}
</style>
