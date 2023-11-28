<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { AxiosError } from 'axios'
import { ref, watch, computed } from 'vue'
import type { Rule } from 'ant-design-vue/es/form'
import { transliterate as tr } from 'transliteration'
import type { SelectProps, FormInstance } from 'ant-design-vue'

import { ax } from '@/shared/api/common'
import EosModal from '@/shared/ui/EosModal'
import EosInput from '@/shared/ui/EosInput'
import EosSelect from '@/shared/ui/EosSelect'
import EosButton from '@/shared/ui/EosButton'
import EosFormItem from '@/shared/ui/EosFormItem'
import { useGlobalStore } from '@/stores/globalStore'
import type { Role } from '@/entities/user/model/types'
import type { UserData } from '@/entities/user/model/types'
import notification from '@/shared/api/common/notification'

import { generatePassword, passwordRegExp } from '../lib/password'

const { t } = useI18n({})
const globalStore = useGlobalStore()

interface UserFormEmits {
  (e: 'submit'): void
  (e: 'update:open', open: boolean): void
}

export interface UserFormProps {
  open?: boolean
  user?: UserData
}

interface FormData {
  role?: number
  name?: string
  login?: string
  email?: string
  password?: string
}

type Options = SelectProps['options']

const router = useRouter()

const emit = defineEmits<UserFormEmits>()
const props = defineProps<UserFormProps>()

const required = { required: true, message: t('theFieldIsRequired') }

const validatePassword = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.resolve()
  }
  const test = passwordRegExp.test(value)
  passwordRegExp.lastIndex = 0

  if (test) {
    return Promise.resolve()
  } else {
    return Promise.reject(t('invalidCharacters'))
  }
}

const uniqueLogin = async () => {
  return isLoginUnique.value
    ? Promise.resolve()
    : Promise.reject(t('nonUniqueLoginMessage'))
}

const validLogin = async (_rule: Rule, value: string) => {
  const loginRegex = /^(\w|\.)+$/g
  const test = loginRegex.test(value)
  loginRegex.lastIndex = 0

  if (test) {
    return Promise.resolve()
  } else {
    return Promise.reject(t('invalidCharacters'))
  }
}

const isOpen = ref<boolean>(false)
const formData = ref<FormData>({})
const formRef = ref<FormInstance>()
const isLoginUnique = ref<boolean>(true)

const isEditing = computed<boolean>(() => !!props.user?.id)
const roleList = computed<Role[]>(() => globalStore.roleList)
const roleOptions = computed<Options>(() => roleList.value.map(r => ({ value: r.id, label: t(r.name) })))
const rules = computed(() => ({
  role: [required],
  name: [required],
  login: [
    required,
    { validator: validLogin },
    { validator: uniqueLogin },
  ],
  email: [
    required,
    { type: 'email', message: t('invalidEmailAddress') }
  ],
  password: [
    { ...required, required: !isEditing.value },
    { validator: validatePassword },
    { min: 8, message: t('atLeast8Characters') },
    { max: 256, message: t('noMoreThan256Characters') },
  ],
}))

watch(() => props.open, v => isOpen.value = v)
watch(isOpen, v => {
  emit('update:open', v)
  !v && (formData.value = {})
})
watch(() => props.user, user => {
  user?.role && (formData.value.role = user.role.id)
  user?.name && (formData.value.name = user.name)
  user?.login && (formData.value.login = user.login)
  user?.email && (formData.value.email = user.email)
  formData.value.password = user?.password || ''
})
watch(() => formData.value.login, () => isLoginUnique.value = true)

function close() {
  isOpen.value = false
}

function setPassword() {
  formData.value.password = generatePassword()
}

function handleError() {
  notification.error({
    message: '',
    description: t('dataCannotBeSaved'),
  })
}

function send(data: FormData) {
  if (isEditing.value) {
    ax.put(`/users/${props.user!.id}/`, data)
      .then(() => {
        notification.success({
          message: '',
          description: t('dataSavedSuccessfully'),
        })
        emit('submit')
        close()
      })
      .catch(handleError)
  } else {
    ax.post('/register/', data)
      .then(() => {
        notification.success({
          message: '',
          description: t('dataSavedSuccessfully'),
        })
        emit('submit')
        close()
      })
      .catch((e: AxiosError<{ login: string[] }>) => {
        if (e.response?.data.login.includes('This field must be unique.')) {
          isLoginUnique.value = false
          formRef.value?.validateFields()
        } else {
          handleError()
        }
      })
  }
}

function generateLogin() {
  formData.value.login = formData.value.name
    ? tr(formData.value.name)
      .replace('-', ' ')
      .split(' ')
      .map(str => str.replaceAll(/\W/g, ''))
      .join('.')
      .toLocaleLowerCase()
    : ''
}
</script>

<template>
  <eos-modal
    v-model:open="isOpen"
    width="562"
    destroyOnClose
    :footer="null"
    :title="isEditing ? t('userEditing') : t('userAdding')"
  >
    <a-form
      ref="formRef"
      class="user-form"
      :rules="rules"
      :model="formData"
      @finish="send"
    >
      <eos-form-item
        name="role"
        :label="t('userRole')"
      >
        <eos-select
          v-model:value="formData.role"
          size="large"
          optionFilterProp="label"
          :allowClear="true"
          :options="roleOptions"
          :style="{ width: 320 }"
          :placeholder="t('selectFromList')"
        ></eos-select>
      </eos-form-item>

      <eos-form-item
        name="name"
        :label="t('firstnameAndLastname')"
      >
        <eos-input
          v-model:value="formData.name"
          size="large"
          :style="{ width: 514 }"
          @blur="!isEditing && generateLogin()"
        />
      </eos-form-item>

      <eos-form-item
        name="login"
        :label="t('login')"
      >
        <eos-input
          v-model:value="formData.login"
          size="large"
          :style="{ width: 514 }"
        />
      </eos-form-item>

      <eos-form-item
        name="email"
        type="email"
        :label="t('email')"
      >
        <eos-input
          v-model:value="formData.email"
          size="large"
          :style="{ width: 514 }"
        />
      </eos-form-item>

      <div class="user-form__password">
        <eos-form-item
          name="password"
          :label="t('password')"
        >
          <eos-input
            v-model:value="formData.password"
            showCount
            size="large"
            type="password"
            :style="{ width: 320 }"
          />
        </eos-form-item>

        <eos-button
          size="large"
          class="user-form__password-btn"
          @click="setPassword"
        >
          {{ t('createPassword') }}
        </eos-button>
      </div>

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
.user-form {
  &__password {
    display: flex;
    align-items: center;
  }

  &__password-btn {
    margin-left: 24px;
    margin-top: 8px;
    width: 170px;
  }
}
</style>
