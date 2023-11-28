<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ref, h, computed, watch } from 'vue'

import { ax } from '@/shared/api/common'
import EosInput from '@/shared/ui/EosInput'
import EosButton from '@/shared/ui/EosButton'
import EosSwitch from '@/shared/ui/EosSwitch'
import EosFormItem from '@/shared/ui/EosFormItem'
import InfoIcon  from '@/shared/icons/InfoIcon.vue'
import { DeviceTypes } from '@/entities/device/model/types'
import type { Camera } from '@/entities/camera/model/types'
import notification from '@/shared/api/common/notification'
import { useRoomsStore } from '@/entities/room/model/roomsStore'

import formatObjectKeys from '@/shared/lib/formatObjectKeys'
import type { DeviceItemSettingsProps } from '../model/types'

interface DeviceFormEmits {
  (e: 'saved'): void
  (e: 'cancel'): void
}

const router = useRouter()
const { t } = useI18n({})

const props = withDefaults(defineProps<DeviceItemSettingsProps>(),
  {
    mode: 'collapse'
  }
)
const emit = defineEmits<DeviceFormEmits>()

const roomsStore = useRoomsStore()
const deviceToEdit = ref<Camera>({ ...props.device })

const isNotCamera = computed<boolean>(() => deviceToEdit.value && deviceToEdit.value.type?.id !== 1)

function handleError() {
  notification.error({
    message: '',
    description: t('dataCannotBeSaved'),
  })
}

function save(): void {
  const params = formatObjectKeys({ ...deviceToEdit.value }, _.snakeCase)
  ax.put(`/devices/${deviceToEdit.value.id}/`, params)
  .then(res => {
    notification.success({
      message: '',
      description: t('dataSavedSuccessfully'),
    })
    roomsStore.updateDevice(deviceToEdit.value.id, res.data)
    emit('saved')
    showMessage()
  })
  .catch(handleError)
}

function cancel(): void {
  emit('cancel')
}

function showMessage(): void {
  message.info({
    content: () => t('deviceSettingsSaved'),
    class: 'message-saved',
    icon: () => h(InfoIcon)
  })
}

watch(() => props.device, v => {
  deviceToEdit.value = _.cloneDeep(props.device)
}, { deep: true })
</script>

<template>
  <a-form 
    name="device-form"
    class="device-form"
  >
    <eos-form-item
      name="deviceName"
      :label="t('deviceName')"
    >
      <eos-input v-model:value="deviceToEdit.name" size="large" />
    </eos-form-item>

    <div
      v-if="deviceToEdit.type?.id !== DeviceTypes.Simulator"
      class="device-form-group"
      :style="{ 'flex-direction': mode === 'collapse' ? 'column' : 'row' }"
    >
      <eos-form-item
        name="deviceLogin"
        :label="t('login')"
      >
        <eos-input v-model:value="deviceToEdit.login" size="large" />
      </eos-form-item>

      <eos-form-item
        name="devicePassword"
        :label="t('password')"
      >
        <eos-input v-model:value="deviceToEdit.password" size="large" type="password" />
      </eos-form-item>
    </div>

    <eos-form-item
      v-if="deviceToEdit.type?.id !== DeviceTypes.Simulator"
      class="device-form-ip"
      name="deviceIP"
      :label="t('deviceIP')"
    >
      <eos-input v-model:value="deviceToEdit.ip" size="large" />
    </eos-form-item>

    <eos-form-item
      v-if="deviceToEdit.type?.id !== DeviceTypes.Simulator"
      class="device-form-port"
      name="devicePort"
      :label="t('port')"
    >
      <eos-input v-model:value="deviceToEdit.port" size="large" type="number"/>
    </eos-form-item>

    <eos-form-item
      v-if="deviceToEdit.type?.id !== DeviceTypes.Simulator"
      name="devicePath"
      :label="t('pathToSourceStream')"
    >
      <eos-input v-model:value="deviceToEdit.path" size="large" />
    </eos-form-item>

    <eos-form-item
      v-if="deviceToEdit.type?.id === DeviceTypes.Simulator"
      name="serial_number"
      :label="t('serialNumber')"
    >
      <eos-input
        v-model:value="deviceToEdit.serialNumber"
        size="large"
        style="width: 350px;"
      />
    </eos-form-item>

    <div
      v-if="deviceToEdit.type?.id !== DeviceTypes.Simulator"
      class="device-form-group switch-group"
      :style="{ 'flex-direction': mode === 'collapse' ? 'column' : 'row' }"
    >
      <eos-switch :label="t('haveMicro')" v-model:checked="deviceToEdit.voice" :disabled="isNotCamera" />
      <eos-switch :label="t('haveSpeaker')" v-model:checked="deviceToEdit.sound" :disabled="isNotCamera" />
      <eos-switch :label="t('controlCam')" v-model:checked="deviceToEdit.control" :disabled="isNotCamera" />
    </div>

    <div class="device-form-buttons">
      <eos-button type="primary" size="large" @click="save">{{ t('save') }}</eos-button>
      <eos-button v-if="mode === 'modal'" size="large" @click="cancel">{{ t('cancel') }}</eos-button>
    </div>
  </a-form>
</template>

<style lang="scss">
.device-form {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 12px 0;
  &-group {
    display: flex;
    gap: 12px;
    width: 100%;
    margin-bottom: 24px;
  }
  &-ip {
    max-width: 260px;
  }
  &-port {
    max-width: 94px;
    margin-left: 24px;
  }
  &-buttons {
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .ant-form-item {
    width: 100%;
    &-control {
      width: 100%;
    }
  }
  .switch-group {
    gap: 6px;
  }
}
.message-saved {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  .ant-message-custom-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>