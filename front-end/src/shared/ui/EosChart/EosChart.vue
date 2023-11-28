<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import ru from 'apexcharts/dist/locales/ru.json'
import en from 'apexcharts/dist/locales/en.json'
import { ref, computed } from 'vue'

interface EosChartProps {
  options: ApexOptions
}
const props = defineProps<EosChartProps>()

const labelsStyle = ref<Record<string, string | number>>({
  colors: '#999',
  fontFamily: 'Roboto',
  fontSize: '12px !important',
  fontWeight: '400 !important'
})

const customOptions = computed<ApexOptions>(() => {
  return {
    dataLabels: {
      enabled: false
    },
    ...props.options,
    chart: {
      ...props.options?.chart,
      defaultLocale: 'ru',
      locales: [ ru, en ],
    },
    xaxis: {
      ...props.options?.xaxis,
      labels: {
        ...props.options?.xaxis?.labels,
        style: labelsStyle.value
      }
    },
    yaxis: {
      ...props.options?.yaxis,
      labels: {
        //@ts-ignore 
        ...props.options?.yaxis?.labels,
        style: labelsStyle.value
      }
    },
  }
})
</script>

<template>
  <vue-apex-charts
    v-bind="{ ...$attrs, ...props }"
    :options="customOptions"
  />
</template>

<style lang="scss">
.apexcharts-text, .apexcharts-text tspan {
  fill: #999;
  color: #999;
  font-family: 'Roboto' !important;
  font-size: 12px !important;
  font-weight: 400 !important;
} 
</style>>