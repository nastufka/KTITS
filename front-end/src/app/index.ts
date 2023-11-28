import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import { router, t } from './providers'

import './styles/index.scss'

const i18n = createI18n({
  messages: t.messages,
  locale: t.locale,
  legacy: false,
  fallbackLocale: 'ru',
})

export const app = createApp(App)
  .use(i18n)
  .use(Antd)
  .use(router)
  .use(createPinia())
