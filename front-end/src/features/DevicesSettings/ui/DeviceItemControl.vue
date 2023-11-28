<script setup lang="ts">
// @ts-nocheck
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import EosAlert from '@/shared/ui/EosAlert'
import EosButton from '@/shared/ui/EosButton'
import EosSlider from '@/shared/ui/EosSlider'
import VolumeIcon from '@/shared/icons/VolumeIcon.vue'
import EosZoomControl from '@/shared/ui/EosZoomControl'
import type { Room } from '@/entities/room/model/types'
import type { Camera } from '@/entities/camera/model/types'
import VolumeOffIcon from '@/shared/icons/VolumeOffIcon.vue'
import AttentionIcon from '@/shared/icons/AttentionIcon.vue'
import EosRotatorControl from '@/shared/ui/EosRotatorControl'
import MicrophoneIcon from '@/shared/icons/MicrophoneIcon.vue'
import { useRoomsStore } from '@/entities/room/model/roomsStore'
import MicrophoneOffIcon from '@/shared/icons/MicrophoneOffIcon.vue'

const { t } = useI18n({})

const props = defineProps<{
  cam: Camera
  mode: 'collapse' | 'modal'
}>()
const roomsStore = useRoomsStore()
const activeRoom = computed<Room>(() => roomsStore.activeRoom)
const volumeOn = ref<boolean>(!props.cam.muted)
const volumeLevel = ref<number>(props.cam.volume * 100)
const microphoneOn = ref<boolean>(false)
const microphoneLevel = ref<number>(0)
const disabledControls = computed<boolean>(() => !props.cam.pluginConnected && props.mode === 'collapse')

const wId = computed<number>(() => [...roomsStore.wndSet].findIndex(i => i === props.cam.id))

const ptzControlStart = (direction: number): void => {
  WebVideoCtrl.I_PTZControl(direction, false, { iPTZSpeed: 6, iWndIndex: wId.value })
}
const ptzControlStop = (): void => {
  WebVideoCtrl.I_PTZControl(1, true, { iWndIndex: wId.value })
}
const goToPreset = (): void => {
  WebVideoCtrl.I_GoPreset(1, { iWndIndex: wId.value })
}
const setVolume = (v: number): void => {
  WebVideoCtrl.I_SetVolume(v)
}
const volumeToggle = (): void => {
  volumeOn.value = !volumeOn.value
  roomsStore.setCamMuted(activeRoom.value?.id, props.cam.id, !volumeOn.value)
}
const volumeMicrophoneToggle = (): void => {
  microphoneOn.value = !microphoneOn.value
  if (microphoneOn.value) 
    WebVideoCtrl.I_StartVoiceTalk(props.cam.ip, 1)
  else
    WebVideoCtrl.I_StopVoiceTalk()
}
const onVolumeChange = (v: number) => {
  roomsStore.setCamVolume(activeRoom.value?.id, props.cam.id, v/100)
}

watch(props.cam.volume, (v, oV) => {
  volumeLevel.value = v * 100
})


</script>

<template>
  <div class="device-control">
    <eos-alert v-if="disabledControls" type="warning">
      <template #icon>
        <AttentionIcon />
      </template>
      <template #title>
        {{ t('attention') }}
      </template>
      <template #description>
        Управление устройством не доступно. Установите плагин SDK.
      </template>
    </eos-alert>
    <div class="device-control__ptz">
      <div class="device-control__ptz__item">
        <span class="ptz-title">{{ t('cameraRotation') }}</span>
        <EosRotatorControl 
          class="device-control__ptz__item__control"
          :disabled="disabledControls"
          @ptzControlStart="ptzControlStart"
          @ptzControlStop="ptzControlStop" 
        />
      </div>
      <div class="device-control__ptz__item zoom-item">
        <span class="ptz-title">{{ t('zoom') }}</span>
        <EosZoomControl 
          class="device-control__ptz__item__control" 
          :disabled="disabledControls"
          @ptzControlStart="ptzControlStart" 
          @ptzControlStop="ptzControlStop" 
        />
      </div>
    </div>
    <div class="device-control__reset">
      <EosButton type="secondary" :disabled="disabledControls" @click="goToPreset">
        Сбросить положение камеры
      </EosButton>
    </div>
    <div class="device-control__volume">
      <span class="device-control__volume__title">
        {{ t('volumeSettings') }}
      </span>
      <div class="device-control__volume__controls" :style="{ flexDirection: mode === 'collapse' ? 'column' : 'row' }">
        <div class="device-control__volume__control">
          <EosButton class="volume-button" @click="volumeToggle">
            <VolumeIcon v-if="!props.cam.muted" />
            <VolumeOffIcon v-else />
          </EosButton>
          <EosSlider class="volume-slider" v-model:value="volumeLevel" @change="onVolumeChange" :disabled="!volumeOn" />
        </div>
        <div class="device-control__volume__control microphone-control">
          <EosButton class="volume-button" @click="volumeMicrophoneToggle" :disabled="disabledControls">
            <MicrophoneIcon v-if="microphoneOn" />
            <MicrophoneOffIcon v-else />
          </EosButton>
          <EosSlider class="volume-slider" v-model:value="microphoneLevel" :disabled="!microphoneOn || disabledControls" />
        </div>
      </div>
    </div>
  </div>  
</template>

<style lang="scss">
.device-control {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  &__ptz {
    display: flex;
    align-items: flex-start;
    padding: 12px;
    &__item {
      display: flex;
      flex-direction: column;
      .ptz-title {
        font-size: 15px;
        font-weight: 800;
        line-height: 24px;
      }
      &__control {
        margin-top: 12px;
      }
    }
    .zoom-item {
      margin-left: 44px;
    }
  }
  &__reset {
    margin-top: 24px;
    width: 100%;
    .eos-btn {
      width: 100%;
    }
  }
  &__volume {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 12px;
    gap: 12px;
    &__title {
      font-size: 15px;
      font-weight: 800;
      line-height: 24px;
    }
    &__controls {
      display: flex;
      gap: 12px;
      width: 100%;
    }
    &__control {
      display: flex;
      align-items: center;
      flex: 1;
      .volume-button {
        min-height: 56px;
        min-width: 56px;
      }
      .volume-slider {
        flex: 1;
        margin-left: 9px;
      }
    }
  }
}
</style>