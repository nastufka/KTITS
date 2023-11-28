<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import NoVideoIcon from '@/shared/icons/NoVideoIcon.vue'

const { t } = useI18n({})
</script>
<template>
  <div class="eos-no-signal">
    <NoVideoIcon />
    <span class="eos-no-signal-message">{{ t('noSignal') }}</span>
  </div>
</template>
<style lang="scss">
.eos-no-signal {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  &-message {
    font-size: 13px;
    font-weight: 800;
    color: var(--sc-base-9);
    line-height: 20px;
  }
}
</style>