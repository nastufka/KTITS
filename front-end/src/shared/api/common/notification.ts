import { h, type VNode } from 'vue'
import { notification as _notification, type NotificationPlacement } from 'ant-design-vue'

import CloseIcon from '@/shared/icons/CloseIcon.vue'
import SuccessIcon from '@/shared/icons/SuccessIcon.vue'
import AttentionIcon from '@/shared/icons/AttentionIcon.vue'

interface NotificationConfig {
  placement: NotificationPlacement
  duration: number
  closeIcon: VNode
  icon?: VNode
  class?: string
}

const notificationConfig: NotificationConfig = {
  placement: 'bottomRight',
  duration: 5,
  closeIcon: h(CloseIcon),
}

const successConfig: NotificationConfig = {
  ...notificationConfig,
  class: 'eos-notification eos-notification_success',
  icon: h(SuccessIcon),
}

const errorConfig: NotificationConfig = {
  ...notificationConfig,
  class: 'eos-notification eos-notification_error',
  icon: h(AttentionIcon),
}

const infoConfig: NotificationConfig = {
  ...notificationConfig,
  class: 'eos-notification eos-notification_info',
  icon: h(AttentionIcon),
}

const warningConfig: NotificationConfig = {
  ...notificationConfig,
  class: 'eos-notification eos-notification_warning',
  icon: h(AttentionIcon),
}

const notification: typeof _notification = {
  ..._notification,
  success: config => _notification.success({ ...successConfig, ...config }),
  error: config => _notification.error({ ...errorConfig, ...config }),
  info: config => _notification.info({ ...infoConfig, ...config }),
  warning: config => _notification.warning({ ...warningConfig, ...config }),
}

export default notification
