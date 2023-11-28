<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Form } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { ref, reactive, watch } from 'vue'

import Logo from '@/shared/icons/Logo.vue'
import EosCard from '@/shared/ui/EosCard'
import EosForm from '@/shared/ui/EosForm'
import EosModal from '@/shared/ui/EosModal'
import EosInput from '@/shared/ui/EosInput'
import EosButton from '@/shared/ui/EosButton'
import { login } from '@/features/auth/lib'
import EosFormItem from '@/shared/ui/EosFormItem'
import type { LoginData } from '@/features/auth/model/types'
import { useUserStore } from '@/entities/user/model/userStore'

interface FormCredentials {
  login: string
  password: string
}
interface Rule {
  message?: string
  trigger?: string
  required?: boolean
  validator?: (rule: Rule, value: string) => Promise<any>
}

const { t } = useI18n({})
const router = useRouter()
const userStore = useUserStore()
const useForm = Form.useForm
const formCredentials = reactive<FormCredentials>({
  login: '',
  password: ''
})
const wrongLogin = ref<boolean>(false)
const wrongPassword = ref<boolean>(false)

const wrongLoginValidator = async (rule: Rule, value: string): Promise<any> => {
  return wrongLogin.value ? Promise.reject(t('wrongLogin')) : Promise.resolve()
}
const wrongPasswordValidator = async (rule: Rule, value: string): Promise<any> => {
  return wrongPassword.value ? Promise.reject(t('wrongPassword')) : Promise.resolve()
}
const loginRules = reactive<Rule[]>([
  {
    required: true,
    message: t('enterLogin')
  },
  {
    required: wrongLogin.value,
    trigger: 'wrong',
    validator: wrongLoginValidator
  }
])
const passwordRules = reactive<Rule[]>([
  {
    required: true,
    message: t('enterPassword')
  },
  {
    required: wrongPassword.value,
    trigger: 'wrong',
    validator: wrongPasswordValidator
  }
])
const rulesRef = reactive<Record<string, Rule[]>>({
  login: loginRules,
  password: passwordRules
})
const { validate, validateInfos } = useForm(formCredentials, rulesRef)

const bodyStyle = ref({
  height: '100%',
  padding: '48px',
  borderRadius: '12px',
})
const forgotModalOpen = ref<boolean>(false)

watch(wrongLogin, val => {
  if (val) {
    validate('login', { trigger: 'wrong' })
  }
})
watch(wrongPassword, val => {
  if (val) {
    validate('password', { trigger: 'wrong' })
  }
})

const openForgotModal = () => {
  forgotModalOpen.value = true
}

const onFinish = () =>  {
  wrongLogin.value = false
  wrongPassword.value = false
  validate()
    .then(async () => {
      const res: LoginData = await login(formCredentials.login, formCredentials.password)
      if (!res.error) {
        userStore.setAuth(true)
        userStore.setCurrentUser({ 
          name: '',
          ...res,
          role: { 
            id: res.role_id as number, 
            name: res.role_name as string 
          } 
        })
        router.push('/schedule')
      } else {
        if (res.error === 'login') {
          wrongLogin.value = true
          wrongPassword.value = true
        } else {
          wrongPassword.value = true
        }
      }
    })
}
</script>

<template>
  <div>
    <eos-card class="login-card" :bodyStyle="bodyStyle">
      <div class="login-card-content">
        <div class="login-card-content-logo">
          <Logo />
          <span class="login-card-content-logo-title">{{ t('simulationCenter') }}</span>
        </div>
        <eos-form 
          class="login-card-content-form"
          :model="formCredentials"
          autocomplete="off"
          @finish="onFinish"
        >
          <eos-form-item 
            class="login-card-content-form-item"
            label="Логин"
            name="login"
            v-bind="validateInfos.login"
          >
            <eos-input class="form-input" v-model:value="formCredentials.login" size="large" />
          </eos-form-item>
          <eos-form-item 
            class="login-card-content-form-item"
            label="Пароль"
            name="password"
            v-bind="validateInfos.password"
          >
            <eos-input class="form-input" v-model:value="formCredentials.password" type="password" size="large" />
          </eos-form-item>
          <div class="login-card-content-form-buttons">
            <eos-button 
              type="primary"
              size="large"
              html-type="submit"
            >
              {{ t('login', 2) }}
          </eos-button>
            <eos-button
              class="forgot-password"
              type="text"
              size="large"
              @click="openForgotModal"
            >
              {{ t('forgotPassword') }}
            </eos-button>
          </div>
        </eos-form>
      </div>
      <eos-modal
        v-model:open="forgotModalOpen"
        centered
        :title="t('forgotPassword')"
        :cancelText="t('close')"
        :showOk="false"
        width="578px"
      >
        <div class="forgot-modal-text">
          {{ t('forgotPasswordText') }}
        </div>
      </eos-modal>
    </eos-card>
  </div>
</template>

<style lang="scss">
.login-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 20px;
  &-logo {
    align-self: center;
    display: flex;
    align-items: center;
    gap: 14px;
    &-title {
      font-size: 24px;
      line-height: 28px;
      font-weight: 800;
      color: var(--sc-base-1);
    }
  }
  &-form {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 20px;
    &-item {
      width: 100%;
      .ant-form-item-no-colon {
        font-size: 15px;
        line-height: 24px;
        color: var(--sc-base-1);
      }
      .ant-form-item-control {
        width: 100%;
      }
    }
    &-buttons {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 8px;
      margin-top: 12px;
      .forgot-password span {
        font-size: 15px !important;
        line-height: 24px !important;
        font-weight: 500 !important;
      }
    }
    .ant-form-item {
      margin-bottom: 0 !important;
    }
  }
}
.forgot-modal-text {
  color: var(--sc_base-1);
  font-size: 17px;
  font-style: normal;
  font-weight: 500;
  line-height: 28px;
}
</style>
