<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { VNode } from "vue"
import { ref, h, toRefs } from "vue"
import type { Dayjs } from 'dayjs'
import { dayjs } from '@/shared/api/common'
import InfoIcon from '@/shared/icons/InfoIcon.vue'
import PlusIcon from '@/shared/icons/PlusIcon.vue'
import MinusIcon from '@/shared/icons/MinusIcon.vue'
import MessageIcon from '@/shared/icons/MessageIcon.vue'
import FatalErrorIcon from '@/shared/icons/FatalErrorIcon.vue'
import type { AnnotationItem } from '@/features/annotations/model/types'


interface AnnotationItemProps {
  idx: number,
  annotation: AnnotationItem
}
const { t } = useI18n({})
const props = defineProps<AnnotationItemProps>()
const { time, icon, comment } = toRefs(props.annotation)

const getTime = (time: number): string => {
  return dayjs(time).format('mm:ss')
}
const getIcon = (icon: string): VNode => {
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
  <div class="eos-annotation-item">
    <span class="eos-annotation-item-idx" style="width: 32px">#{{ props.idx }}</span>
    <span class="eos-annotation-item-time">{{ getTime(time) }}</span>
    <a-tooltip>
      <template #title>{{ t(`${icon}AnnoStatus`) }}</template>
      <component class="eos-annotation-item-icon" :is="getIcon(icon)" />
    </a-tooltip>
    <!-- <a-tooltip> -->
      <!-- <template #title>{{ comment }}</template> -->
      <span class="eos-annotation-item-comment">{{ comment }}</span>
    <!-- </a-tooltip> -->
  </div>
</template>

<style lang="scss">
.eos-annotation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 48px;
  padding: 12px;
  background: var(--sc-base-6);
  border-radius: 12px;
  &-idx, &-time {
    font-size: 13px;
    font-weight: 800;
    color: var(--sc-base-2);
  }
  &-time {
    width: 42px;
    color: var(--sc-base-1);
  }
  &-icon {
    width: 24px !important;
    height: 24px !important;
    font-size: 24px !important;
    &:focus {
      outline: unset;
    }
  }
  &-comment {
    font-size: 15px;
    font-weight: 500;
    color: var(--sc-base-2);
    max-width: 244px;
    word-break: break-all;
  }
}
</style>