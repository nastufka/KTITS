<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'

import EosButton from '@/shared/ui/EosButton'
import { DeviceTypes } from '@/entities/device/model/types'

import DeviceForm from './DeviceForm.vue'
import DeviceItemControl from './DeviceItemControl.vue'
import type { DeviceSettingsMode, DeviceItemSettingsProps } from '../model/types'

interface DeviceSettingsEmits {
  (e: 'saved'): void
  (e: 'cancel'): void
}

const emit = defineEmits<DeviceSettingsEmits>()
const props = withDefaults(defineProps<DeviceItemSettingsProps>(), {
  mode: 'collapse'
})

const { t } = useI18n({})

const activeMode = ref<DeviceSettingsMode>(props.device.control && props.mode === 'collapse' ? 'control' : 'connectionSettings')

const setMode = (mode: DeviceSettingsMode) => {
  activeMode.value = mode
}

const getButtonType = (mode: DeviceSettingsMode) => {
  return activeMode.value === mode ? 'primary' : 'secondary'
}

const onSaved = (): void => {
  emit('saved')
}

const onCancel = (): void => {
  emit('cancel')
}
</script>

<template>
  <div class="device-item-settings">
    <div
      v-if="props.device?.type?.id !== DeviceTypes.Simulator"
      class="device-item-settings__buttons"
    >
      <EosButton
        v-if="device.control"
        :type="getButtonType('control')"
        class="device-item-button"
        @click="setMode('control')"
      >
        <span class="button-title">{{ t('control') }}</span>
      </EosButton>
      <EosButton
        :type="getButtonType('connectionSettings')"
        class="device-item-button settings-button"
        @click="setMode('connectionSettings')"
      >
        <span class="button-title">{{ t('connectionSettings') }}</span>
      </EosButton>
    </div>
    <DeviceItemControl v-if="activeMode === 'control' && device.control" :cam="device" :mode="mode"  /> 
    <DeviceForm 
      v-if="activeMode === 'connectionSettings'"
      :mode="mode" 
      :device="device" 
      @saved="onSaved"
      @cancel="onCancel"
    />
  </div>
</template>

<style lang="scss">
.device-item-settings {
  padding: 12px 0;
  &__buttons {
    display: flex;
    align-items: center;
    .device-item-button {
      min-height: 36px;
      .button-title {
        font-size: 13px;
        font-weight: 500;
      }
    }
    .eos-btn_secondary {
      .button-title {
        color: var(--sc-base-1);
      }
    }
    .settings-button {
      margin-left: 8px;
    }
  }
}
</style>