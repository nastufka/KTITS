<script setup lang="ts">
import { ref } from 'vue'

export interface EosSliderProps {
  range?: boolean
  modelValue?: number | [number, number]
}

const props = defineProps<EosSliderProps>()

const handleStyle = ref<object>({
  color: 'var(--sc-base-6)',
  width: '16.266px',
  height: '16.266px',
})

const trackStyle = ref<object>({
  height: '8.371px',
  background: 'var(--sc-base-7)',
  borderRadius: '33px'
})
</script>

<template>
  <div class="eos-slider" :class="{ 'eos-slider_range': range }">
    <a-slider
      v-bind="{...$attrs, ...props}"
      :range="range"
      :trackStyle="trackStyle"
      :handleStyle="handleStyle"
    />
  </div>
</template>

<style lang="scss">
.eos-slider {
  display: flex;
  //justify-content: center;
  align-items: center;
  height: 56px;
  //width: 312px;
  padding: 0 24px;
  border-radius: 12px;
  border: 1px solid var(--sc-base-4);

  .ant-slider {
    width: 100%;
    &-handle::before {
      //box-shadow: 0 3px 6px var(--sc-base-4);;
      width: 16.266px;
      height: 16.266px;
    }
    &-handle::after {
      box-shadow: 0 3px 6px var(--sc-base-4) !important;
      width: 16.266px !important;
      height: 16.266px !important;
      background: var(--sc-base-6);
      inset-block-start: -2px !important;
      inset-inline-start: -2px !important;
    }
    &-handle:hover::after {
      box-shadow: 0 3px 6px var(--sc-base-4);
      width: 16.266px;
      height: 16.266px;
      background: var(--sc-base-6);
      inset-block-start: -2px;
      inset-inline-start: -2px;
    }
    &-handle:focus::after {
      box-shadow: 0 3px 6px var(--sc-base-4);;
      width: 16.266px;
      height: 16.266px;
      background: var(--sc-base-6);
    }
    &-rail {
      height: 8.371px;
      background-color: var(--sc-base-4);
      border-radius: 33px;
    }
  }

  &_range {
    border: 0;
    padding: 0;

    .ant-slider {
      &-rail {
        height: 4px;
      }

      &-track {
        background: var(--sc-base-7);
      }

      &-handle {
        &::before,
        &::after {
          height: 20px !important;
          width: 20px !important;
          inset-block-start: -4px !important;
          inset-inline-start: -4px !important;
        }

        &::after {
          border: 3px solid var(--sc-base-7);
        }
      }
    }
  }
}
</style>