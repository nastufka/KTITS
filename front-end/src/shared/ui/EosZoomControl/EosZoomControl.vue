<script setup lang="ts">
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import { MinusCircleOutlined } from '@ant-design/icons-vue'

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
  <div class="eos-zoom-control">
    <div class="outer-oval" :class="{ 'disabled-oval': props.disabled }">
      <div class="inner-oval" :class="{ 'disabled-oval': props.disabled }">
        <PlusCircleOutlined @mousedown="() => callEv(10)" @mouseup="() => callEv()" />
        <MinusCircleOutlined @mousedown="() => callEv(11)" @mouseup="() => callEv()" />
      </div>
    </div>
  </div>  
</template>

<style lang="scss">
.eos-zoom-control {
  .outer-oval {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 82px;
    height: 208px;
    border: 1px solid var(--sc-base-5);
    border-radius: 69px;
    .inner-oval {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      width: 65px;
      height: 192px;
      border-radius: 85px;
      border: 1px solid var(--sc-base-4);
      box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.10);

      svg {
        cursor: pointer;
        fill: var(--sc-base-9);
        font-size: 22px;
      }
    }
  }
  .disabled-oval {
    background: var(--sc-base-5);
    cursor: not-allowed;
    svg {
      cursor: not-allowed !important;
    }
  }
}
</style>