import d from 'dayjs'
import utc from 'dayjs/plugin/utc'
import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import weekday from 'dayjs/plugin/weekday'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { t } from '@/app/providers/translations'

d.locale(t.locale)
d.extend(utc)
d.extend(isSameOrBefore)
d.extend(duration)
d.extend(relativeTime)
d.extend(isoWeek)
d.extend(weekday)

export const dayjs = d
