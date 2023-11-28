<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import { ref, computed, watch } from 'vue'
import type { Rule, RuleObject } from 'ant-design-vue/es/form'
import type { RawValueType, DefaultOptionType, LabelInValueType } from 'ant-design-vue/es/vc-select/Select'

import EosModal from '@/shared/ui/EosModal'
import EosInput from '@/shared/ui/EosInput'
import EosButton from '@/shared/ui/EosButton'
import EosSelect from '@/shared/ui/EosSelect'
import EosFormItem from '@/shared/ui/EosFormItem'
import { useGlobalStore } from '@/stores/globalStore'
import type { Room } from '@/entities/room/model/types'
import type { User } from '@/entities/user/model/types'

interface RoomFormEmits {
  (e: 'submit', roomData: Room): void
  (e: 'close'): void
}
type RoomToEdit = Room & {
  responsibleId?: number | null
}
export interface RoomFormProps {
  open?: boolean,
  roomToEdit?: Room
  sameNameError?: boolean
}
const { t } = useI18n({})
const emit = defineEmits<RoomFormEmits>()
const props = defineProps<RoomFormProps>()

const globalStore = useGlobalStore()

const initialRoom: RoomToEdit = {
  id: 0,
  name: '',
  address: '',
  description: '',
  responsible: {
    name: ''
  }
}
const roomData = ref<RoomToEdit>(_.cloneDeep(initialRoom))
const select = ref<typeof EosSelect>()
const roomList = computed<Room[]>(() => globalStore.roomList)
const responsibleUsers = computed<User[] | undefined>(() => globalStore.responsibleList?.map((r: User) => {
  return {
    ...r,
    value: r.name,
    label: r.name
  }
}))
const nameRules = ref<RuleObject[]>([
  { required: true, message: t('roomNameMessage') },
  { validator: validateName, trigger: 'blur', message: t('hasRoomName') },
])
// const useForm = Form.useForm
// const { validate, validateInfos } = useForm(roomData.value, reactive({ name: nameRules }))
watch(() => props.roomToEdit, value => {
  if (value) {
    roomData.value = _.cloneDeep(value)
    if (!roomData.value.responsible) {
      roomData.value.responsible = {
        name: ''
      }
    }
    roomData.value.responsibleId = value.responsible && value.responsible.id ? value.responsible.id : null 
  }
})
watch(() => props.open, v => !v && clear())
// watch(() => props.sameNameError, value => {
//   value && validate()
// })

function clear() {
  roomData.value = _.cloneDeep(initialRoom)
}

function close() {
  emit('close')
  clear()
}
function onSelect(value: RawValueType | LabelInValueType, option: DefaultOptionType): void {
  roomData.value.responsibleId = option.id
  select.value?.close()
}
function onFinish(): void {
  emit('submit', { ...roomData.value, responsible: roomData.value.responsibleId })
}
async function validateName(rule: Rule, value: string): Promise<void> {
  const sameNameRoom = roomList.value.find(r => r.name === value && r.id !== props.roomToEdit?.id)
  if (sameNameRoom || props.sameNameError) {
    return Promise.reject()
  }
  return Promise.resolve()
}
</script>

<template>
  <eos-modal
    destroyOnClose
    width="761px"
    dropdown-class-name="room-form"
    :open="open"
    :footer="null"
    :title="t('roomCreation')"
    @cancel="close"
  >
    <a-form
      :model="roomData"
      @finish="onFinish"
    >
      <eos-form-item
        name="name"
        :label="t('roomName')"
        :rules="nameRules"
      >
        <eos-input
          v-model:value="roomData.name"
          size="large"
          style="width: 700px;"
          :placeholder="t('enterNameOfTheRoom')"
        />
      </eos-form-item>

      <eos-form-item
        name="description"
        :label="t('description')"
      >
        <eos-input
          v-model:value="roomData.description"
          is-text-area
          style="width: 700px;"
          :auto-size="{ minRows: 2, maxRows: 5 }"
          :placeholder="t('enterDescriptionOfTheRoom')"
        />
      </eos-form-item>

      <eos-form-item
        name="address"
        :label="t('placementAddress')"
      >
        <eos-input
          v-model:value="roomData.address"
          size="large"
          style="width: 700px;"
          :placeholder="t('addressPlaceholder')"
        />
      </eos-form-item>

      <eos-form-item
        name="responsible"
        :label="t('responsible')"
      >
        <eos-select
          v-model:value="roomData.responsible.name"
          ref="select"
          size="large"
          style="width: 700px;"
          :allowClear="true"
          :options="responsibleUsers"
          @select="onSelect"
        />
      </eos-form-item>

      <eos-button
        size="large"
        type="primary"
        html-type="submit"
        style="margin-right: 24px; width: 131px;"
      >
        {{ t('save') }}
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