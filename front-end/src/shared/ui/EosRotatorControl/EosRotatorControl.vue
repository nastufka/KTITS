<script setup lang="ts">
import { ref } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue'

const emit = defineEmits(['ptzControlStart', 'ptzControlStop'])

interface controlProps {
  disabled?: boolean
}
const props = withDefaults(defineProps<controlProps>(), {
  disabled: false
})

const callEv = (direction: number = 0) => {
  if (!props.disabled)
    emit(direction ? 'ptzControlStart' : 'ptzControlStop', direction)
}

</script>

<template>
  <div class="eos-rotator-control">
    <div class="outer-circle" :class="{ 'disabled-circle': props.disabled }">
      <div class="inner-circle" :class="{ 'disabled-circle': props.disabled }">
        <down-outlined :rotate="135" @mousedown="() => callEv(1)" @mouseup="() => callEv()" /> <!-- up -->
        <down-outlined :rotate="225" @mousedown="() => callEv(4)" @mouseup="() => callEv()" /> <!-- right -->
        <down-outlined :rotate="45" @mousedown="() => callEv(3)" @mouseup="() => callEv()" /> <!-- left -->
        <down-outlined :rotate="315" @mousedown="() => callEv(2)" @mouseup="() => callEv()" /> <!-- down -->
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.eos-rotator-control {
  .outer-circle {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 208px;
    height: 208px;
    border: 1px solid var(--sc-base-5);
    border-radius: 50%;
    .inner-circle {
      display: grid;
      grid-template-columns: auto auto;
      justify-content: space-between;
      align-content: space-between;
      transform: rotate(45deg);
      padding: 36px;
      width: 192px;
      height: 192px;
      border: 1px solid var(--sc-base-5);
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.10);

      svg {
        cursor: pointer;
        fill: var(--sc-base-9);
        font-size: 18px;
      }
    }
  }
  .disabled-circle {
    background: var(--sc-base-5);
    cursor: not-allowed;
    svg {
      cursor: not-allowed !important;
    }
  }
}
</style>