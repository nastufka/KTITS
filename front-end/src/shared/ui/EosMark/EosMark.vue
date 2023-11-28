<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(defineProps<{
  outerColor?: string
  innerColor?: string
}>(), {
  outerColor: '#FFF',
  innerColor: '#ED542F'
})
const outerColor = computed<string>(() => props.outerColor)
const innerColor = computed<string>(() => props.innerColor)
</script>

<template>
  <div class="eos-mark">
    <div class="eos-mark-outer" :style="{ background: outerColor }">
      <div class="eos-mark-inner" :style="{ background: innerColor }">
      </div>
    </div>
  </div>
  <!-- <svg width="50" height="50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#a)">
      <rect x="16.349" y="4.039" width="17.172" height="17.151" rx="8.575" :fill="outerColor"/>
      <ellipse cx="24.934" cy="12.614" rx="4.416" ry="4.41" :fill="innerColor"/>
    </g>
    
  </svg> -->
</template>

<style lang="scss">
.eos-mark {
  width: 18px;
  height: 18px;
  &-outer {
    position: relative;
    // display: flex;
    // justify-content: center;
    // align-items: center;
    border-radius: 50%;
    height: 100%;
    width: 100%;
  }
  &-inner {
    position: absolute;
    top: 25%;
    left: 25%;
    height: 50%;
    width: 50%;
    border-radius: 50%;
  }
}
</style>