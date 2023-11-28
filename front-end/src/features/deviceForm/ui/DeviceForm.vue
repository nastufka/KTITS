<script setup lang="ts">
import { vMaska } from 'maska'
import { useI18n } from 'vue-i18n'
import type { FormInstance } from 'ant-design-vue'
import { ref, watch, computed, h, type Component } from 'vue'

import { ax } from '@/shared/api/common'
import EosModal from '@/shared/ui/EosModal'
import EosRadio from '@/shared/ui/EosRadio'
import EosInput from '@/shared/ui/EosInput'
import EosButton from '@/shared/ui/EosButton'
import EosSwitch from '@/shared/ui/EosSwitch'
import EosFormItem from '@/shared/ui/EosFormItem'
import { useGlobalStore } from '@/stores/globalStore'
import CamsIcon from '@/shared/icons/CamsIcon.vue'
import notification from '@/shared/api/common/notification'
import SimulatorIcon from '@/shared/icons/SimulatorIcon.vue'
import ScreenCaptureIcon from '@/shared/icons/ScreenCaptureIcon.vue'
import { DeviceTypes, type DeviceType } from '@/entities/device/model/types'

interface DeviceFormEmits {
  (e: 'submit'): void
  (e: 'update:open', open: boolean): void
}

interface DeviceFormProps {
  open?: boolean
}

interface DeviceForm {
  type: number
  name: string
  login: string
  password: string
  ip: string
  port: string
  path: string
  voice: boolean
  sound: boolean
  control: boolean
  serial_number: string
}

const { t } = useI18n({})
const globalStore = useGlobalStore()

const emit = defineEmits<DeviceFormEmits>()
const props = defineProps<DeviceFormProps>()

const initialValues: DeviceForm = {
  type: DeviceTypes.Camera,
  name: '',
  login: '',
  password: '',
  ip: '',
  port: '',
  path: '',
  voice: false,
  sound: false,
  control: false,
  serial_number: '',
}

const required = { required: true, message: t('theFieldIsRequired') }
const valid = {
  validator({ field }: { field: string }): Promise<string | void> {
    if (errors.value[field]?.length) {
      return Promise.reject(errors.value[field].map(e => t(e)).join(' '))
    } else {
      return Promise.resolve()
    }
  },
}

const rules = {
  name: [required, valid],
  login: [required, valid],
  password: [required, valid],
  ip: [required, valid],
  port: [required, valid],
  serial_number: [required, valid],
  path: [required, valid],
}

function getIcon(type: number, active: boolean): Component  {
  const iconProps = { color: active ? 'var(--sc-base-6)' : 'var(--sc-base-7)' }
  const icons: { [key: number]: Component } = {
    [DeviceTypes.Camera]: h(CamsIcon, iconProps),
    [DeviceTypes.ScreenCapture]: h(ScreenCaptureIcon, iconProps),
    [DeviceTypes.Simulator]: h(SimulatorIcon, iconProps),
  }
  return icons[type]
}

const isOpen = ref<boolean>(false)
const formRef = ref<FormInstance>()
const startValidation = ref<boolean>(false)
const errors = ref<{ [key: string]: string[] }>({})
const deviceForm = ref<DeviceForm>({ ...initialValues })
const deviceTypeList = computed<DeviceType[]>(() => globalStore.deviceTypeList)

function close() {
  isOpen.value = false
}

function clearForm() {
  deviceForm.value = { ...initialValues }
}

function send(params: DeviceForm) {
  ax.post('/devices/', params)
    .then(() => {
      notification.success({
        message: '',
        description: t('dataSavedSuccessfully')
      })
      emit('submit')
      close()
    })
    .catch(e => {
      const errorData: typeof errors.value = e?.response?.data
      if (Object.values(errorData)?.some(arr => arr.length)) {
        startValidation.value = true
        errors.value = errorData
        formRef.value?.validateFields()
      } else {
        notification.error({
          message: '',
          description: t('dataCannotBeSaved'),
        })
      }
    })
}

watch(() => props.open, v => isOpen.value = v)
watch(() => deviceForm.value.control, () => errors.value['control'])
watch(isOpen, v => {
  emit('update:open', v)
  if (!v) {
    clearForm()
  }
})

for (const key in deviceForm.value) {
  watch(() => deviceForm.value[key as keyof DeviceForm], () => {
    errors.value[key] = []
    startValidation.value && formRef.value?.validateFields()
  })
}
</script>

<template>
  <eos-modal
    v-model:open="isOpen"
    destroyOnClose
    wrapClassName="add-device-form"
    :width="748"
    :footer="null"
    :title="t('addingDevice')"
    @cancel="close"
  >
    <a-form
      ref="formRef"
      name="add-device-form"
      :rules="rules"
      :model="deviceForm"
      @finish="send"
    >
      <eos-form-item name="type" :label="t('addDevice')">
        <eos-radio
          v-model:value="deviceForm.type"
          name="device-type"
          flexDirection="row"
          :options="deviceTypeList"
          :value-getter="t => t.id"
        >
          <template v-slot:label="{ active, value }: { active: boolean, value: DeviceType }">
            <eos-button
              size="large"
              :icon="getIcon(value.id, active)"
              :type="active ? 'primary' : 'outline'"
            >
              {{ t(value.name) }}
            </eos-button>
          </template>
        </eos-radio>
      </eos-form-item>

      <div class="add-device-form__connect">
        {{ deviceForm.type === DeviceTypes.Simulator ? t('addSimMessage') : t('connectDeviceMessage') }}
      </div>

      <eos-form-item name="name" :label="t('deviceName')">
        <eos-input
          v-model:value="deviceForm.name"
          size="large"
          style="width: 700px;"
        />
      </eos-form-item>

      <a-row v-if="deviceForm.type !== DeviceTypes.Simulator">
        <eos-form-item name="login" :label="t('login')">
          <eos-input
            v-model:value="deviceForm.login"
            size="large"
            style="width: 338px; margin-right: 24px;"
          />
        </eos-form-item>
        
        <eos-form-item
          v-if="deviceForm.type !== DeviceTypes.Simulator"
          name="password"
          :label="t('password')"
        >
          <eos-input
            v-model:value="deviceForm.password"
            size="large"
            type="password"
            style="width: 338px;"
          />
        </eos-form-item>
      </a-row>

      <a-row v-if="deviceForm.type !== DeviceTypes.Simulator">
        <eos-form-item
          name="ip"
          style="width: 338px; margin-right: 24px;"
          :label="t('deviceIP')"
        >
          <eos-input
            v-model:value="deviceForm.ip"
            v-maska
            size="large"
            style="width: 338px;"
            data-maska="#00.#00.#00.#00"
            data-maska-tokens="0:[0-9]:optional"
          />
        </eos-form-item>
        
        <eos-form-item name="port" :label="t('port')">
          <eos-input
            v-model:value="deviceForm.port"
            v-maska
            size="large"
            data-maska="#000"
            data-maska-tokens="0:[0-9]:optional"
            style="width: 167px;"
          />
        </eos-form-item>
      </a-row>

      <eos-form-item
        v-if="deviceForm.type !== DeviceTypes.Simulator"
        name="path"
        :label="t('pathToSourceStream')"
      >
        <eos-input
          v-model:value="deviceForm.path"
          size="large"
          style="width: 700px;"
        />
      </eos-form-item>

      <eos-form-item
        v-if="deviceForm.type === DeviceTypes.Simulator"
        name="serial_number"
        :label="t('serialNumber')"
      >
        <eos-input
          v-model:value="deviceForm.serial_number"
          size="large"
          style="width: 350px;"
        />
      </eos-form-item>
      
      <a-row v-if="deviceForm.type === DeviceTypes.Camera" class="add-device-form__cam-settings">
        <eos-form-item name="voice">
          <eos-switch :label="t('haveMicro')" v-model:checked="deviceForm.voice" />
        </eos-form-item>
        <eos-form-item name="sound">
          <eos-switch :label="t('haveSpeaker')" v-model:checked="deviceForm.sound" />
        </eos-form-item>
        <eos-form-item name="control">
          <eos-switch :label="t('controlCam')" v-model:checked="deviceForm.control" />
        </eos-form-item>
      </a-row>

      <eos-button
        size="large"
        type="primary"
        html-type="submit"
        style="margin-right: 24px; width: 131px;"
      >
        {{ t('add') }}
      </eos-button>

      <eos-button
        size="large"
        type="outline"
        style="width: 106px;"
        @click="close"
      >
        {{ t('cancel') }}
      </eos-button>
    </a-form>
  </eos-modal>
</template>

<style lang="scss">
.add-device-form {
  &__connect {
    color: var(--sc-base-2);
    font-size: 17px;
    line-height: 28px;
    margin: 24px 0;
  }

  &__cam-settings {
    justify-content: space-between;
  }

  &:has(.add-device-form__cam-settings) {
    .ant-modal-footer {
      margin-top: 0;
    }
  }
}
</style>
