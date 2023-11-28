<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import EosSpinner from '@/shared/ui/EosSpinner'
import BadSignalIcon from '@/shared/icons/BadSignalIcon.vue'
import GoodSignalIcon from '@/shared/icons/GoodSignalIcon.vue'

export interface EosSignalProps {
  isLoading?: boolean
  isConnect?: boolean
  loadingMessage?: string
  badSignalMessage?: string
  goodSignalMessage?: string
}

const { t } = useI18n({})

defineProps<EosSignalProps>()
</script>

<template>
  <div class="eos-signal">
    <eos-spinner v-if="isLoading" />
    <good-signal-icon v-else-if="isConnect" class="eos-signal__icon" />
    <bad-signal-icon v-else class="eos-signal__icon" />

    <div
      class="eos-signal__text"
      :class="{
        'eos-signal__text_loading': isLoading,
        'eos-signal__text_good': isConnect && !isLoading,
      }"
    >
      {{
        isLoading
          ? loadingMessage ?? `${t('updating')}...`
          : isConnect
            ? goodSignalMessage ?? t('online')
            : badSignalMessage ?? t('offline')
      }}
    </div>
  </div>
</template>

<style lang="scss">
.eos-signal {
  display: flex;
  align-items: center;

  &__icon {
    margin-right: 8px;
  }

  &__text {
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
    display: flex;
    align-items: center;

    &_good {
      color: #27AE60;
    }

    &_loading {
      color: var(--sc-base-2);
    }
  }

  .eos-spinner {
    height: 24px;
    width: 24px;
    margin-right: 10px;
  }
}
</style>
