<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

import { ax } from '@/shared/api/common'
import EosSignal from '@/shared/ui/EosSignal'

enum SignalStatus {
  Good = 'good',
  Bad = 'bad'
}

defineProps<{
  customGood?: string,
  customBad?: string
}>()

const { t } = useI18n({})

const intervalId = ref<NodeJS.Timer>()
const status = ref<SignalStatus>(SignalStatus.Good)

const isConnect = computed<boolean>(() => status.value === SignalStatus.Good)

function checkSignal() {
  ax.get(`${import.meta.env.VITE_RTSP_TO_WEB_RTC}/stream/codec/1`)
    .then(r => status.value = r.statusText === 'OK' ? SignalStatus.Good : SignalStatus.Bad)
    .catch(() => status.value = SignalStatus.Bad)
}

onMounted(() => {
  checkSignal()
  intervalId.value = setInterval(checkSignal, 15 * 1000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId.value)
})
</script>

<template>
  <eos-signal
    :isConnect="isConnect"
    :goodSignalMessage="customGood ?? t('signalIsGood')"
    :badSignalMessage="customBad ?? t('badSignalMessage')"
  />
</template>
