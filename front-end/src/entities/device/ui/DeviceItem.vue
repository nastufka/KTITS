<script setup lang="ts">
import type { VNode } from 'vue'
import { computed, ref, h } from 'vue'

import EosSignal from '@/shared/ui/EosSignal'
import EosButton from '@/shared/ui/EosButton'
import CamsIcon from '@/shared/icons/CamsIcon.vue'
import RemoveIcon from '@/shared/icons/RemoveIcon.vue'
import ControlIcon from '@/shared/icons/ControlIcon.vue'
import SimulatorIcon from '@/shared/icons/SimulatorIcon.vue'
import VolumeIconMini from '@/shared/icons/VolumeIconMini.vue'
import HasPermission from '@/features/auth/ui/HasPermission.vue'
import SettingsCardIcon from '@/shared/icons/SettingsCardIcon.vue'
import { PermissionEnum } from '@/features/auth/model/permissions'
import ScreenCaptureIcon from '@/shared/icons/ScreenCaptureIcon.vue'
import MicrophoneIconMini from '@/shared/icons/MicrophoneIconMini.vue'
import type { Device, DeviceStatus } from '@/entities/device/model/types'

const emit = defineEmits<{
  (e: 'onChangeChecked', value: boolean, id: number): void
  (e: 'onRemove', device: Device): void
  (e: 'onSettings', device: Device): void
}>()
const props = withDefaults(defineProps<{
  device: Device
  status?: DeviceStatus
  mode?: 'show' | 'add'
}>(), {
  mode: 'show'
})

const checkedValue = ref<boolean>(false)
const deviceTypeIcon = computed<VNode>(() => {
  const color = '#3761F3'
  switch (props.device.type?.id) {
    case 1:
      return h(CamsIcon, { color })
    case 2:
      return h(ScreenCaptureIcon, { color })
    case 3:
      return h(SimulatorIcon, { color })
    default:
      return h(CamsIcon, { color })
  }
})

function onChangeChecked(): void {
  emit('onChangeChecked', checkedValue.value, props.device.id)
}
function onClickSettings(): void {
  emit('onSettings', props.device)
}
function onClickRemove(): void {
  emit('onRemove', props.device)
}
function resetChecked(): void {
  checkedValue.value = false
}

defineExpose({
  resetChecked
})

</script>

<template>
  <div class="device-item" :class="{ 'item-selected': checkedValue === true }">
    <div class="device-item__icon">
      <component :is="deviceTypeIcon"/>
    </div>

    <div class="device-item__info">
      <span class="device-item__info__name">
        {{ props.device.name }}
      </span>
      <div class="device-item__info__params">
        <ControlIcon v-if="props.device.control" />
        <VolumeIconMini v-if="props.device.sound" />
        <MicrophoneIconMini v-if="props.device.voice" />
      </div>
    </div>
    <div class="device-item__buttons">
      <eos-signal
        :isLoading="status?.isLoading"
        :isConnect="status?.isConnect"
      />
      <!-- <signal-status :custom-good="t('online')" :custom-bad="t('offline')" /> -->
      <div v-if="mode === 'add'" class="device-item__checkbox">
        <a-checkbox v-model:checked="checkedValue" @change="onChangeChecked"/>
      </div>
      <template v-else-if="mode === 'show'">
        <has-permission :permissions="[PermissionEnum.CAN_UPDATE_DEVICES]">
          <eos-button type="secondary" @click="onClickSettings">
            <SettingsCardIcon color="#3761F3" />
          </eos-button>
        </has-permission>

        <has-permission :permissions="[PermissionEnum.CAN_UPDATE_ROOMS]">
          <eos-button type="secondary" @click="onClickRemove">
            <RemoveIcon />
          </eos-button>
        </has-permission>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.device-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: var(--sc-base-6, #FFF);
  box-shadow: 0px 4px 24px 0px rgba(0, 0, 0, 0.12);
  //box-shadow: 3px 1px 8px 2px rgba(0, 0, 0, 0.12);

  &.item-selected {
    border: 2px solid var(--sc-base-7);
    box-shadow: unset;
  }

  &__icon {
    margin: 0 16px;
  }

  &__info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &__name {
      color: var(--sc_base-1);
      font-size: 17px;
      font-weight: 800;
      line-height: 28px;
    }
    &__params {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
  &__buttons {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    .signal-status {
      width: 82px;
    }
  }
  &__checkbox {
    margin: 0 16px 0 34px;
  }
}
</style>
