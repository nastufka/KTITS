<script setup lang="ts">
import { computed } from 'vue'
import EosButton from '../EosButton'
import type { StyleValue } from 'vue'

interface EosButtonSelectorProps {
  selectedIdx?: number
  max?: number
  length?: number
  editing?: boolean
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
}
interface EosButtonSelectorEmits {
  (e: 'add'): void
  (e: 'select', idx: number): void
}

const props = withDefaults(defineProps<EosButtonSelectorProps>(), {
  selectedIdx: 0,
  max: 99,
  length: 1,
  editing: false,
  direction: 'row'
})
const emit = defineEmits<EosButtonSelectorEmits>()

const styles = computed<StyleValue>(() => {
  return {
    flexDirection: props.direction,
    gap: '4px'
  }
})

function select(idx: number): void {
  emit('select', idx)
}
function add(): void {
  emit('add')
}
</script>

<template>
  <div 
    class="eos-button-selector"
    :style="styles"
  >
    <template v-for="(num, idx) in length" :key="num">
      <eos-button 
        :type="idx === props.selectedIdx ? 'primary' : 'default'"
        @click="select(idx)"
      >
        {{ num }}
      </eos-button>
    </template>
    <eos-button 
      v-if="max > length && editing"
      :type="length === props.selectedIdx ? 'primary' : 'default'"
      @click="add"
    >
        +
    </eos-button>
  </div>
</template>

<style lang="scss">
.eos-button-selector {
  display: flex;
}
</style>