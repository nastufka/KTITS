import * as _ from 'lodash-es'
import type { Dayjs } from 'dayjs'
import type { Rule } from 'ant-design-vue/es/form'
import type { DisabledTimes } from 'ant-design-vue/es/vc-picker/interface'

import { dayjs } from '@/shared/api/common'

export function getDisabledTimes(
  startTime: Dayjs = dayjs().hour(0).minute(0),
  endTime: Dayjs = dayjs().hour(0).minute(0)
): DisabledTimes {
  const startHour = startTime!.hour()
  const startMinute = startTime!.minute()
  const endHour = endTime!.hour()
  const endMinute = endTime!.minute()

  return {
    disabledHours: () => {
      return [..._.range(0, startHour), ..._.range(endHour + 1, 24)]
    },
    disabledMinutes: selectedHour => {
      if (selectedHour === startHour) {
        return _.range(0, startMinute)
      } else if (selectedHour === endHour) {
        return _.range(endMinute + 1, 60)
      } else {
        return []
      }
    }
  }
}

export function timeValidator(disabledTimes: DisabledTimes, errorText: string): (_rule: Rule, value: Dayjs) => Promise<void> {
  return async (_rule: Rule, value: Dayjs) => {
    return new Promise<void>((resolve, reject) => {
      const hour = value.hour()
      const minute = value.minute()
      const invalidHour: boolean = !!disabledTimes.disabledHours && disabledTimes.disabledHours().includes(hour)
      const invalidMinute: boolean = !!disabledTimes.disabledMinutes && disabledTimes.disabledMinutes(hour).includes(minute)

      if (invalidHour || invalidMinute) {
        reject(errorText)
      } else {
        resolve()
      }
    })
  }
}
