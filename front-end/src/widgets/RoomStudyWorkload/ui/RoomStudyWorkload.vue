<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Dayjs } from 'dayjs'
import { computed, onMounted, ref, watch } from 'vue'
import { dayjs } from '@/shared/api/common'
import type { Period } from '../api'
import { getWorkloadData } from '../api'

import EosCard from '@/shared/ui/EosCard'
import EosButton from '@/shared/ui/EosButton'
import EosDatePicker from '@/shared/ui/EosDatePicker'
import EosRangePicker from '@/shared/ui/EosRangePicker'
import InfoIcon from '@/shared/icons/InfoIcon.vue'
import WorkloadChart from '@/features/workloadChart/ui'

interface WorkloadData {
  workload: any
  average_hours_per_day: number
  start: string
  end: string
}
const props = defineProps<{
  roomId: number
}>()

const { t } = useI18n({})

const studyPeriod = ref<Dayjs[]>([])
const start = ref<Dayjs>(dayjs().subtract(7, 'day'))
const end = ref<Dayjs>(dayjs())
const dates = ref<Dayjs[]>()
const tempPeriod = ref<Dayjs[]>()
const workloadData = ref<WorkloadData | undefined>()

const formattedPeriod = computed<Period | any>(() => {
  return {
    start: studyPeriod.value?.at(-2)?.format('YYYY-MM-DD') ?? start.value.format('YYYY-MM-DD'),
    end: studyPeriod.value?.at(-1)?.format('YYYY-MM-DD') ?? end.value.format('YYYY-MM-DD')
  }
})

watch(() => formattedPeriod.value, period => {
  setWorkloadData()
})

function disabledDate(current: Dayjs) {
  const endDate = dayjs().endOf('day')
  const baseCondition = current > endDate
  if (!dates.value || dates.value.length === 0) {
    return baseCondition
  }
  const tooEarlyFromStart = dates.value[0] && current.diff(dates.value[0], 'days') < 7
  const tooEarlyFromEnd = dates.value[1] && dates.value[1].diff(current, 'days') < 7
  return tooEarlyFromStart || tooEarlyFromEnd || baseCondition
}
async function setWorkloadData(): Promise<void> {
  const rawData: WorkloadData = await getWorkloadData<WorkloadData>(props.roomId, formattedPeriod.value)
  workloadData.value = {
    ...rawData,
    workload: rawData.workload.map((item: Record<string, number>) => {
      const key = Object.keys(item)[0]
      return {
        x: key,
        y: item[key]
      }
    })
  }
}
const onChange = (datesValue: Dayjs[]) => {
  studyPeriod.value = datesValue
}
const onCalendarChange = (datesValue: Dayjs[]) => {
  dates.value = datesValue
}
const onOpenChange = (open: boolean) => {
  if (open) {
    dates.value = []
    tempPeriod.value = []
  } else {
    tempPeriod.value = undefined
  }
};

onMounted(() => {
  studyPeriod.value.push(start.value, end.value) 
})
</script>

<template>
  <eos-card
  class="room-workload"
  :title="t('studyWorkload')"
  >
    <template #extra>
      <div class="room-workload__extra">
        <eos-range-picker
          :value="tempPeriod || studyPeriod"
          :disabledDate="disabledDate"
          size="medium"
          style="width: 242px"
          @change="onChange"
          @openChange="onOpenChange"
          @calendarChange="onCalendarChange"
        />
        <eos-button type="default" class="download-btn">
          {{ t('download') }}
        </eos-button>
      </div>
    </template>
    <div class="room-workload__content">
      <div class="room-workload__content__chart">
        <workload-chart :workload-data="workloadData?.workload ?? []" />
      </div>
      <div class="room-workload__content__avg-workload">
        <info-icon color="#999" />
        <span class="workload-text">
          {{ t('avgWorkload') }} {{ workloadData?.average_hours_per_day }} {{ t('hoursPerDay') }}
        </span>
      </div>
    </div>
  </eos-card>
</template>

<style lang="scss">
.room-workload {
  &__extra {
    display: flex;
    align-items: center;
    gap: 14px;
    .download-btn {
      span {
        color: var(--sc-base-7);
      }
    }
  }
  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    width: 100%;

    &__chart {
      flex: 1;
      height: 100%;
      width: 100%;
    }

    &__avg-workload {
      display: flex;
      align-items: center;
      gap: 6px;

      .workload-text {
        color: var(--sc-base-9);
        font-size: 13px;
        font-weight: 500;
        line-height: 20px;
      }
    }
  }
}
</style>