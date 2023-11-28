<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { dayjs } from '@/shared/api/common'
import type { ApexOptions } from 'apexcharts'

import EosChart from '@/shared/ui/EosChart'

interface WorkloadItem {
  x: string,
  y: number
}
const props = defineProps<{
  workloadData: WorkloadItem[]
}>()
const { t } = useI18n({})

const baseOptions = ref<ApexOptions>({
  chart: {
    id: 'workLoadChart',
    toolbar: {
      show: false
    },
    type: 'area',
    zoom: {
      enabled: false
    }
  },
  colors: ['#33BD41'],
  grid: {
    xaxis: { lines: { show: false } },

  },
  legend: {
    show: false
  },
  xaxis: {
    type: 'datetime',
    tooltip: {
      enabled: false
    }
  },
  yaxis: {
    title: {
      text: t('hours', 2)
    },
    labels: {
      //formatter: (val) => val
    }
  },
  tooltip: {
    y: {
      formatter: (val) => {
        let hourDuration = null
        let minutesDuration = null
        let minutes = null
        let hours = null
        if (val < 1) {
          minutes = Math.floor((val % 1) * 60)
          //minutesDuration = dayjs.duration(minutes, 'minutes').humanize()
        } else {
          hours = Math.floor(val)
          minutes = Math.floor((val % 1) * 60)
          // hourDuration = `${val < 2 ? '1 ' : ''}${dayjs.duration(val, 'hours').humanize()}`
          // if (val % 1 && val > 2) {
          //   minutes = Math.floor((val % 1) * 60)
          //   minutesDuration = dayjs.duration(minutes, 'minutes').humanize()
          // }
        }
        return val < 1 
          ? `${minutes} мин.` 
          : `${hours} ч. ${minutes ? minutes + ' мин.' : ''}`
      }
    },
  },
})

const chartOptions = computed<ApexOptions>(() => {
  return {
    ...baseOptions.value,
  }
})

const series = computed(() => {
  return [{ 
      name: t('workload'),
      data: props.workloadData
    }]
})



</script>

<template>
  <eos-chart 
    :options="chartOptions" 
    :series="series" 
    height="100%"
  />
</template>