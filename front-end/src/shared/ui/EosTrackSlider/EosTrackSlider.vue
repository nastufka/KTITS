<script setup lang="ts">
import type { VNode } from 'vue'
import type { SliderProps } from 'ant-design-vue'
import { ref, computed, h, onMounted, watch } from 'vue'
import { dayjs } from '@/shared/api/common'
import InfoIcon from '@/shared/icons/InfoIcon.vue'
import PlusIcon from '@/shared/icons/PlusIcon.vue'
import MinusIcon from '@/shared/icons/MinusIcon.vue'
import MessageIcon from '@/shared/icons/MessageIcon.vue'
import FatalErrorIcon from '@/shared/icons/FatalErrorIcon.vue'
import type { AnnotationItem } from '@/features/annotations/model/types'

const props = defineProps<{
  annotations?: AnnotationItem[],
  max: number
}>()
const handleStyle = ref<object>({
  color: 'var(--sc-base-7)',
  width: '22px',
  height: '22px',
})
const trackStyle = ref<object>({
  height: '10px',
  background: 'var(--sc-base-7)',
  borderRadius: '8px'
})
const marks = ref<Record<number, any>>({})

watch(() => props.max, (max, prevMax) => {
  if (max) {
    setMarks()
  } else {
    marks.value = {}
  }
}, { deep: true })

function setMarks(): void {
  marks.value = {}
  if (props.max && props.annotations) {
    props.annotations.forEach(anno => {
      const key = anno.time / 1000
      const icon = getIcon(anno.icon)
      marks.value[key] = {
        label: icon,
        comment: anno.comment
      }
    })
  }
}

function getIcon(icon: string): VNode {
  switch (icon) {
    case 'info':
      return h(InfoIcon)
    case 'plus':
      return h(PlusIcon)
    case 'minus':
      return h(MinusIcon)
    case 'message':
      return h(MessageIcon)
    case 'error':
      return h(FatalErrorIcon)
    default: 
      return h(MessageIcon)
  }
}

</script>

<template>
  <div class="eos-track-slider">
    <a-slider v-bind="{...$attrs, ...props}" :handleStyle="handleStyle" :trackStyle="trackStyle" :marks="marks">
      <template #mark="{ label, point }">
        <a-tooltip>
          <template #title>{{ dayjs(point * 1000).format('mm:ss') }} {{ marks[point].comment }}</template>
          <component :is="label" />
        </a-tooltip>
      </template>
    </a-slider>
  </div>
</template>

<style lang="scss">
.eos-track-slider {
  .ant-slider {
    width: 100%;
    &-handle::before {
      width: 22px;
      height: 22px;
    }
    &-handle::after {
      box-shadow: unset;
      width: 22px !important;
      height: 22px !important;
      background: var(--sc-base-7);
      inset-block-start: -2px !important;
      inset-inline-start: -2px !important;
    }
    &-handle:hover::after {
      box-shadow: unset;
      width: 22px;
      height: 22px;
      background: var(--sc-base-7);
      inset-block-start: -2px;
      inset-inline-start: -2px;
    }
    &-handle:focus::after {
      box-shadow: unset;
      width: 22px;
      height: 22px;
      background: var(--sc-base-7);
    }
    &-rail {
      height: 10px;
      background-color: var(--sc-base-4);
      border-radius: 8px;
    }
    &-mark-text {
      top: 14px;
      svg {
        width: 18px;
        height: 18px;
      }
    }
    &-dot {
      display: none !important;
    }
  }
}
</style>