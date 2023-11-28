<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'
import { getCapture } from '@/entities/camera/api'

import EosModal from '@/shared/ui/EosModal'
import EosCard from '@/shared/ui/EosCard'
import DeviceItemSettings from './DeviceItemSettings.vue'
import CameraIP from '@/entities/camera/ui/Camera.vue'
import type { Camera } from '@/entities/camera/model/types'
import { DeviceTypes } from '@/entities/device/model/types'


const props = defineProps<{
  open: boolean
  device?: Camera
  roomId?: number
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const { t } = useI18n({})
const deviceCapture = ref<string>('')
const captureLoaded = ref<boolean>(false)
const showCam = ref(false)
watch(() => props.open, v => {
  if (v && !showCam.value) {
    showCam.value = true
  }
})

const onSaved = () => {
  emit('saved')
}
const closeModal = () => {
  emit('close')
}

async function getDeviceCapture(): Promise<void> {
  if (props.device) {
    deviceCapture.value = await getCapture(`/camera/${props.device.id}`)
    captureLoaded.value = true
  }
}
</script>

<template>
  <eos-modal
    v-if="device"
    :open="open"
    :title="t('devicesSettings')"
    centered
    class="device-settings-modal"
    width="748px"
    :show-ok="false"
    :show-cancel="false"
    @cancel="closeModal"
  >
    <div class="device-settings-modal__content">
      <eos-card
        v-if="props.device?.type?.id !== DeviceTypes.Simulator"
        class="camera-card" 
        :body-style="{ height: '100%', padding: 0 }"
      >
        <CameraIP
          v-if="showCam"
          ref="camElem"
          :cam="device"
          :room-id="roomId"
          class="room__camera"
        />
      </eos-card>

      <device-item-settings 
        :device="device"
        mode="modal"
        @saved="onSaved"
        @cancel="closeModal"
      />
    </div>
  </eos-modal>
</template>

<style lang="scss">
.device-settings-modal {
  &__content {
    display: flex;
    flex-direction: column;
    flex: 1;
    max-height: 80vh;
    overflow: auto;
    padding: 0 12px;
  }
  &__capture {
    width: 100%;
    img {
      border-radius: 16px;
      width: 100%;
    }
  }
  .ant-modal-footer {
    margin-top: 0 !important;
  }
}
</style>