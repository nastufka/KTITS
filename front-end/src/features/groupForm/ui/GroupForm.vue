<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { AxiosError } from 'axios'
import { ref, watch, computed } from 'vue'
import type { FormInstance } from 'ant-design-vue'

import { ax } from '@/shared/api/common'
import EosModal from '@/shared/ui/EosModal'
import EosInput from '@/shared/ui/EosInput'
import EosButton from '@/shared/ui/EosButton'
import EosSelect from '@/shared/ui/EosSelect'
import EosTransfer from '@/shared/ui/EosTransfer'
import EosFormItem from '@/shared/ui/EosFormItem'
import { useGlobalStore } from '@/stores/globalStore'
import type { User } from '@/entities/user/model/types'
import notification from '@/shared/api/common/notification'
import type { GroupData } from '@/entities/group/model/types'
import HasPermission from '@/features/auth/ui/HasPermission.vue'
import { PermissionEnum } from '@/features/auth/model/permissions'

interface GroupFormEmits {
  (e: 'submit'): void
  (e: 'addStudent'): void
  (e: 'update:open', open: boolean): void
}

interface GroupFormProps {
  open: boolean
  group?: GroupData
}

interface FormData {
  name?: string
  teacher?: number
  speciality?: string
  users?: User[]
}

const router = useRouter()
const { t } = useI18n({})
const globalStore = useGlobalStore()

const emit = defineEmits<GroupFormEmits>()
const props = defineProps<GroupFormProps>()

const fieldNames = { label: 'name', value: 'id' }
const required = { required: true, message: t('theFieldIsRequired') }
const rules = {
  name: [required, { validator: uniqueName }],
  teacher: [required],
  speciality: [required],
  users: [required],
}

const formData = ref<FormData>({})
const isOpen = ref<boolean>(false)
const formRef = ref<FormInstance>()
const freeStudents = ref<User[]>([])
const isNameUnique = ref<boolean>(true)

const isEditing = computed<boolean>(() => !!props.group?.id)
const teacherList = computed<User[]>(() => globalStore.teacherList)

watch(() => props.open, open => {
  open && getFreeStudents()
  isOpen.value = open
})

watch(() => props.group, group => {
  if (group) {
    formData.value.name = group.name
    formData.value.speciality = group.speciality
    group.teacher && (formData.value.teacher = group.teacher.id)
    formData.value.users = group.users
  }
})

watch(isOpen, v => {
  emit('update:open', v)
  if (!v) {
    formData.value = {}
  }
})

watch(() => formData.value.name, () => isNameUnique.value = true)

async function uniqueName() {
  return isNameUnique.value
    ? Promise.resolve()
    : Promise.reject(t('nonUniqueGroupNameMessage'))
}

function close() {
  isOpen.value = false
}

function getFreeStudents() {
  ax.get<User[]>('/free_student_list/')
    .then(r => freeStudents.value = r.data)
    .catch(handleError)
}

function handleSuccess() {
  notification.success({
    message: '',
    description: t('dataSavedSuccessfully'),
  })
  emit('submit')
  close()
}

function handleError(e: AxiosError<{ name: string[] }>) {
  if (e.response?.data.name.includes('group with this name already exists.')) {
    isNameUnique.value = false
    formRef.value?.validateFields()
  } else {
    notification.error({
      message: '',
      description: t('dataCannotBeSaved'),
    })
  }
}

function send(data: FormData) {
  const params = { ...data, users: data.users?.map(u => u.id) || [] }
  const makeRequest = isEditing.value ? ax.put : ax.post
  const baseUrl = '/groups/'
  const url = isEditing.value ? `${baseUrl}${props.group!.id}/` : baseUrl
  makeRequest(url, params)
    .then(handleSuccess)
    .catch(handleError)
}

function addStudent() {
  emit('addStudent')
}

defineExpose({ getFreeStudents })
</script>

<template>
  <eos-modal
    v-model:open="isOpen"
    width="890"
    destroyOnClose
    :footer="null"
    :title="isEditing ? t('groupEditing') : t('groupCreation')"
  >
    <a-form
      ref="formRef"
      name="group-form"
      :rules="rules"
      :model="formData"
      @finish="send"
    >
      <a-row>
        <eos-form-item
          name="name"
          style="margin-right: 24px;"
          :label="t('groupName')"
        >
          <eos-input
            v-model:value="formData.name"
            size="large"
            style="width: 319px;"
          />
        </eos-form-item>

        <eos-form-item
          name="teacher"
          :label="t('teacher')"
        >
          <eos-select
            v-model:value="formData.teacher"
            size="large"
            style="width: 499px;"
            optionFilterProp="name"
            :allowClear="true"
            :options="teacherList"
            :field-names="fieldNames"
          />
        </eos-form-item>
      </a-row>

      <eos-form-item
        name="speciality"
        :label="t('speciality')"
      >
        <eos-input
          v-model:value="formData.speciality"
          size="large"
          style="width: 842px;"
        />
      </eos-form-item>

      <eos-form-item
        name="users"
      >
        <eos-transfer
          v-model:target="formData.users"
          :data="freeStudents"
          :source-title="t('studentList')"
          :target-title="t('studentsInGroup')"
          :search-source-placeholder="t('searchStudent')"
          :search-target-placeholder="t('searchStudent')"
        >
          <template #sourceActions>
            <has-permission :permissions="[PermissionEnum.CAN_CREATE_USERS]">
              <span class="group-form__add-student" @click="addStudent">
                {{ t('add') }}
              </span>
            </has-permission>
          </template>
        </eos-transfer>
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

<style lang="scss">
  .group-form {
    &__add-student {
      color: var(--sc-base-7);
      font-size: 13px;
      line-height: 20px;
      cursor: pointer;
    }
  }
</style>
