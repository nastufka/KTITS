<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import type { Dayjs } from 'dayjs'
import { useRouter } from 'vue-router'
import type { AxiosError } from 'axios'
import { ref, watch, computed, onMounted } from 'vue'

import EosCard from '@/shared/ui/EosCard'
import EosInput from '@/shared/ui/EosInput'
import EosSwitch from '@/shared/ui/EosSwitch'
import EosButton from '@/shared/ui/EosButton'
import { ax, dayjs } from '@/shared/api/common'
import EosFormItem from '@/shared/ui/EosFormItem'
import { hasPermission } from '@/features/auth/lib'
import SignalStatus from '@/features/signalStatus/ui'
import EosTimePicker from '@/shared/ui/EosTimePicker'
import { useGlobalStore } from '@/stores/globalStore'
import notification from '@/shared/api/common/notification'
import formatObjectKeys from '@/shared/lib/formatObjectKeys'
import { getDisabledTimes } from '@/shared/lib/timeValidation'
import HasPermission from '@/features/auth/ui/HasPermission.vue'
import { PermissionEnum } from '@/features/auth/model/permissions'
import type { SystemSettings, SystemSettingsResponse } from '@/entities/systemSettings/model/types'

const router = useRouter()
const { t } = useI18n({})
const globalStore = useGlobalStore()

const defaultStartTime = dayjs().hour(0).minute(0)
const defaultEndTime = dayjs().hour(23).minute(59)

const formData = ref<SystemSettings>({
  centerName: '',
  workingModes: {
    '1': {},
    '2': {},
    '3': {},
    '4': {},
    '5': {},
    '6': {},
    '7': {},
  },
})

const systemSettings = computed<SystemSettings | undefined>(() => globalStore.systemSettings)
const canUpdateSettings = computed<boolean>(() => hasPermission([PermissionEnum.CAN_UPDATE_SETTINGS]))

watch(systemSettings, setSystemSettings)

function setSystemSettings(v?: SystemSettings) {
  if (v) {
    formData.value = _.cloneDeep(v)
  } else if (systemSettings.value) {
    formData.value = _.cloneDeep(systemSettings.value)
  }
}

function formatDay(day: number): string {
  return _.capitalize(dayjs().isoWeekday(day).format('dd'))
}

function formatFields<T extends { [key: string]: any }>(
  target: T,
  formatter: { [key: string]: Function }
): T {
  const result: { [key: string]: any } = {}

  for (const key in target) {
    const value = target[key]
    const isObject = value !== null && typeof value === 'object'

    if (!formatter.hasOwnProperty(key)) {
      if (isObject) {
        result[key] = formatFields(value, formatter)
      } else {
        result[key] = value
      }
    } else {
      result[key] = formatter[key](value)
    }
  }

  return result as T
}

function formatTime(t: Dayjs): string {
  return t.format('HH:mm')
}

function handleError() {
  notification.error({
    message: '',
    description: t('dataCannotBeSaved'),
  })
}

function send(data: SystemSettings) {
  const formattedData: SystemSettings = formatFields<SystemSettings>(data, {
    startLunch: formatTime,
    endLunch: formatTime,
    startWork: formatTime,
    endWork: formatTime,
  })
  const params: SystemSettingsResponse = formatObjectKeys<SystemSettings, SystemSettingsResponse>(formattedData, _.snakeCase)

  ax.patch('/settings/', params)
    .then(res => {
      notification.success({
        message: '',
        description: t('dataSavedSuccessfully'),
      })
      globalStore.setSystemSettings(res.data)
    })
    .catch(handleError)
}

onMounted(() => {
  setSystemSettings()
})
</script>

<template>
  <eos-card
    class="system-settings"
    :hideHeadBorder="true"
    :title="t('systemSettings')"
  >
    <a-form
      name="system-settings"
      :model="formData"
      @finish="send"
    >
      <eos-form-item name="centerName" :label="t('nameOfEducationalCenter')">
        <eos-input
          v-model:value="formData.centerName"
          size="large"
          :style="{ width: 549 }"
          :disabled="!canUpdateSettings"
        />
      </eos-form-item>
      
      <eos-form-item :label="t('connectionToVideoServer')">
        <signal-status />
      </eos-form-item>

      <eos-form-item
        name="workingModes"
        :label="t('workingDays')"
      >
        <div
          v-for="(mode, day) in Object.values(formData.workingModes)"
          class="system-settings__working-day"
        >
          <eos-button
            class="system-settings__button-checkbox"
            :type="mode.isWorking ? 'primary' : 'outline'"
            @click="() => mode.isWorking = !mode.isWorking"
            :disabled="!canUpdateSettings"
          >
            {{ formatDay(day + 1) }}
          </eos-button>

          <eos-form-item :label="t('workingHours')">
            <div class="system-settings__time">
              <eos-form-item>
                <eos-time-picker
                  v-model:value="mode.startWork"
                  class="system-settings__time-picker"
                  :disabled="!canUpdateSettings || !mode.isWorking"
                  :disabledTime="() => getDisabledTimes(defaultStartTime, mode.endWork)"
                />
              </eos-form-item>

              <eos-form-item>
                <eos-time-picker
                  v-model:value="mode.endWork"
                  class="system-settings__time-picker"
                  :disabled="!canUpdateSettings || !mode.isWorking"
                  :disabledTime="() => getDisabledTimes(mode.startWork, defaultEndTime)"
                />
              </eos-form-item>
            </div>
          </eos-form-item>

          <eos-form-item :label="t('lunchBreak')">
            <div class="system-settings__time">
              <eos-form-item>
                <eos-time-picker
                  v-model:value="mode.startLunch"
                  class="system-settings__time-picker"
                  :disabled="!canUpdateSettings || !mode.isWorking || mode.noLunch"
                  :disabledTime="() => getDisabledTimes(defaultStartTime, mode.endLunch)"
                />
              </eos-form-item>

              <eos-form-item>
                <eos-time-picker
                  v-model:value="mode.endLunch"
                  class="system-settings__time-picker"
                  :disabled="!canUpdateSettings || !mode.isWorking || mode.noLunch"
                  :disabledTime="() => getDisabledTimes(mode.startLunch, defaultEndTime)"
                />
              </eos-form-item>
            </div>
          </eos-form-item>

          <eos-form-item>
            <eos-switch
              v-model:checked="mode.noLunch"
              class="system-settings__switch"
              :disabled="!canUpdateSettings || !mode.isWorking"
              :label="t('workWithoutLunchBreak')"
            />
          </eos-form-item>
        </div>
      </eos-form-item>
      
      <has-permission :permissions="[PermissionEnum.CAN_UPDATE_SETTINGS]">
        <eos-button
          size="large"
          type="primary"
          html-type="submit"
          :style="{ marginRight: 24 }"
        >
          {{ t('save') }}
        </eos-button>
      </has-permission>

      <has-permission :permissions="[PermissionEnum.CAN_UPDATE_SETTINGS]">
        <eos-button
          size="large"
          @click="() => setSystemSettings()"
        >
          {{ t('cancel') }}
        </eos-button>
      </has-permission>
    </a-form>
  </eos-card>
</template>

<style lang="scss">
.system-settings {
  overflow-y: auto;

  &__button-checkbox {
    width: 68px;
    height: 87px;
    margin-right: 24px;
  }

  &__working-day {
    display: flex;
  }

  &__time {
    display: flex;
  }

  &__time-picker {
    margin-right: 24px;
  }

  &__switch {
    display: flex;

    .eos-switch, .eos-switch-label {
      margin-top: 48px;
    }

    .eos-switch-label {
      display: block;
    }
  }
}
</style>
