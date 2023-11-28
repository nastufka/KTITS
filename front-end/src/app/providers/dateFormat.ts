import { t } from './translations'

export const dateFormat: string = (() => {
  switch (t.locale) {
    case 'ru':
    default:
      return 'DD.MM.YYYY'
  }
})()

export const datePlaceholder: string = (() => {
  switch (t.locale) {
    case 'ru':
    default:
      return 'ДД.MM.ГГГГ'
  }
})()
